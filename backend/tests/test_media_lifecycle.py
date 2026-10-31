import os
import pytest
from unittest.mock import patch
from app.services.storage_service import LocalStorageProvider, get_storage_provider
from app.core.config import settings

@pytest.mark.anyio
async def test_local_storage_provider_namespaces_and_safety(tmp_path):
    storage = LocalStorageProvider(base_dir=str(tmp_path))

    # 1. Save in uploads namespace
    content = b"original outfit bytes"
    key = await storage.save_bytes(content, extension="jpg", kind="uploads")
    assert key.startswith("uploads/")
    assert key.endswith(".jpg")
    assert await storage.exists(key) is True

    # Read back
    read_data = await storage.get_bytes(key)
    assert read_data == content

    # 2. Save in thumbnails namespace
    thumb_content = b"thumbnail outfit bytes"
    thumb_key = await storage.save_bytes(thumb_content, extension="jpg", kind="thumbnails")
    assert thumb_key.startswith("thumbnails/")
    assert await storage.exists(thumb_key) is True
    assert await storage.get_bytes(thumb_key) == thumb_content

    # 3. Invalid namespace rejection
    with pytest.raises(ValueError, match="Invalid storage kind"):
        await storage.save_bytes(b"data", extension="jpg", kind="malicious")

    # 4. Path traversal defense
    traversal_keys = [
        "../secret.txt",
        "..\\secret.txt",
        "uploads/../../etc/passwd",
        "uploads/..\\..\\windows\\win.ini",
        "/etc/shadow",
        "C:\\Windows\\system32\\cmd.exe",
        "uploads/test\0evil.jpg",
        "uploads/c:stream.jpg",
    ]
    for bad_key in traversal_keys:
        with pytest.raises(ValueError):
            storage._safe_path(bad_key)
        assert await storage.get_bytes(bad_key) is None

    # 5. Legacy key fallback (UUID keys without namespace prefix)
    legacy_file = tmp_path / "uploads" / "legacy-uuid-123.jpg"
    legacy_file.write_bytes(b"legacy bytes")
    assert await storage.exists("legacy-uuid-123.jpg") is True
    assert await storage.get_bytes("legacy-uuid-123.jpg") == b"legacy bytes"

    # 6. Idempotent deletion
    assert await storage.delete(key) is True
    assert await storage.delete(key) is True  # Second delete succeeds idempotently
    assert await storage.exists(key) is False


def test_storage_provider_unsupported_type(monkeypatch):
    monkeypatch.setattr(settings, "STORAGE_TYPE", "unsupported_cloud")
    with pytest.raises(ValueError, match="Unsupported STORAGE_TYPE"):
        get_storage_provider()


@pytest.mark.anyio
async def test_upload_compensating_cleanup_on_error(client, sample_image_bytes, tmp_path, monkeypatch):
    storage = LocalStorageProvider(base_dir=str(tmp_path))
    monkeypatch.setattr("app.api.v1.routes.uploads.get_storage_provider", lambda: storage)

    # Simulate error after saving bytes
    with patch("app.api.v1.routes.uploads.ImageUpload", side_effect=RuntimeError("Simulated DB entity failure")):
        files = {"file": ("test.jpg", sample_image_bytes, "image/jpeg")}
        res = await client.post("/api/v1/uploads", files=files)
        assert res.status_code == 500

    # Ensure no leftover files in uploads/ or thumbnails/
    uploads_dir = tmp_path / "uploads"
    thumbnails_dir = tmp_path / "thumbnails"
    uploads_files = list(uploads_dir.iterdir()) if uploads_dir.exists() else []
    thumbnails_files = list(thumbnails_dir.iterdir()) if thumbnails_dir.exists() else []
    assert len(uploads_files) == 0, f"Expected no orphan upload files, found {uploads_files}"
    assert len(thumbnails_files) == 0, f"Expected no orphan thumbnail files, found {thumbnails_files}"


@pytest.mark.anyio
async def test_media_authorization_and_privacy(client, sample_image_bytes):
    user_a_headers = {"X-User-Id": "user-a-123"}
    user_b_headers = {"X-User-Id": "user-b-456"}

    # 1. User A uploads image
    files = {"file": ("fit_a.jpg", sample_image_bytes, "image/jpeg")}
    upload_res = await client.post("/api/v1/uploads", files=files, headers=user_a_headers)
    assert upload_res.status_code == 201
    upload_data = upload_res.json()
    image_id = upload_data["id"]
    assert "preview_url" in upload_data
    assert "thumbnail_url" in upload_data

    # 2. User A can access metadata, original file, and thumbnail
    meta_res = await client.get(f"/api/v1/uploads/{image_id}", headers=user_a_headers)
    assert meta_res.status_code == 200

    file_res = await client.get(f"/api/v1/uploads/{image_id}/file", headers=user_a_headers)
    assert file_res.status_code == 200
    assert file_res.headers["Content-Type"] == "image/jpeg"
    assert file_res.headers["X-Content-Type-Options"] == "nosniff"
    assert "private" in file_res.headers["Cache-Control"]

    thumb_res = await client.get(f"/api/v1/uploads/{image_id}/thumbnail", headers=user_a_headers)
    assert thumb_res.status_code == 200
    assert "image" in thumb_res.headers["Content-Type"]

    # 3. User A can access file via query token (for direct <img> rendering)
    token_res = await client.get(f"/api/v1/uploads/{image_id}/file?token=user-a-123")
    assert token_res.status_code == 200

    # 4. User B receives 404 for all User A's media endpoints
    assert (await client.get(f"/api/v1/uploads/{image_id}", headers=user_b_headers)).status_code == 404
    assert (await client.get(f"/api/v1/uploads/{image_id}/file", headers=user_b_headers)).status_code == 404
    assert (await client.get(f"/api/v1/uploads/{image_id}/thumbnail", headers=user_b_headers)).status_code == 404
    assert (await client.delete(f"/api/v1/uploads/{image_id}", headers=user_b_headers)).status_code == 404


@pytest.mark.anyio
async def test_thumbnail_fallback_to_original(client, db_session, sample_image_bytes):
    headers = {"X-User-Id": "thumb-fallback-user"}
    files = {"file": ("fit_thumb.jpg", sample_image_bytes, "image/jpeg")}
    upload_res = await client.post("/api/v1/uploads", files=files, headers=headers)
    assert upload_res.status_code == 201
    image_id = upload_res.json()["id"]

    # Delete the thumbnail object directly from storage to force fallback
    from app.services.storage_service import get_storage_provider
    storage = get_storage_provider()
    from app.models.image import ImageUpload
    from sqlalchemy import select

    stmt = select(ImageUpload).where(ImageUpload.id == image_id)
    res = await db_session.execute(stmt)
    img = res.scalar_one()
    if img.thumbnail_key:
        await storage.delete(img.thumbnail_key)

    # Calling thumbnail endpoint should now seamlessly return the original bytes
    thumb_res = await client.get(f"/api/v1/uploads/{image_id}/thumbnail", headers=headers)
    assert thumb_res.status_code == 200
    assert len(thumb_res.content) > 0


@pytest.mark.anyio
async def test_media_reference_protection_and_user_wipe(client, sample_image_bytes):
    user_headers = {"X-User-Id": "wipe-test-user"}

    # 1. Upload photo
    files = {"file": ("fit.jpg", sample_image_bytes, "image/jpeg")}
    upload_res = await client.post("/api/v1/uploads", files=files, headers=user_headers)
    assert upload_res.status_code == 201
    image_id = upload_res.json()["id"]

    # 2. Run analysis
    analysis_payload = {
        "image_id": image_id,
        "occasion": "Casual",
        "target_style": "Minimalist",
    }
    analysis_res = await client.post("/api/v1/analyses", json=analysis_payload, headers=user_headers)
    assert analysis_res.status_code == 201
    report_id = analysis_res.json()["report"]["id"]

    # 3. Attempt to delete upload while referenced by analysis & report -> Expect 409 Conflict
    del_upload_res = await client.delete(f"/api/v1/uploads/{image_id}", headers=user_headers)
    assert del_upload_res.status_code == 409
    assert "referenced" in del_upload_res.json()["error"]["message"]

    # 4. Delete the report -> Image stays retained because analysis job exists
    del_report_res = await client.delete(f"/api/v1/reports/{report_id}", headers=user_headers)
    assert del_report_res.status_code == 200

    # Image is still accessible by user
    file_res = await client.get(f"/api/v1/uploads/{image_id}/file", headers=user_headers)
    assert file_res.status_code == 200

    # 5. User wipe removes all user data, jobs, reports, and storage files
    wipe_res = await client.delete("/api/v1/me", headers=user_headers)
    assert wipe_res.status_code == 200

    # Media should now be gone
    assert (await client.get(f"/api/v1/uploads/{image_id}/file", headers=user_headers)).status_code == 404

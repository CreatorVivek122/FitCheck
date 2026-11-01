import pytest
import io
from PIL import Image

@pytest.fixture
def test_outfit_image():
    img = Image.new("RGB", (300, 450), color=(80, 120, 190))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

@pytest.mark.anyio
async def test_all_api_routes_end_to_end(client, test_outfit_image):
    user_headers = {"X-User-Id": "api-tester-007"}

    # 1. Health checks
    live_res = await client.get("/api/v1/health/live")
    assert live_res.status_code == 200
    assert live_res.json()["status"] == "ok"

    ready_res = await client.get("/api/v1/health/ready")
    assert ready_res.status_code == 200
    assert ready_res.json()["status"] == "ready"

    # 2. Uploads: POST upload outfit
    upload_res = await client.post(
        "/api/v1/uploads",
        files={"file": ("outfit.jpg", test_outfit_image, "image/jpeg")},
        headers=user_headers
    )
    assert upload_res.status_code == 201
    upload_data = upload_res.json()
    image_id = upload_data["id"]
    assert "preview_url" in upload_data
    assert "thumbnail_url" in upload_data

    # 3. Uploads: GET metadata
    meta_res = await client.get(f"/api/v1/uploads/{image_id}", headers=user_headers)
    assert meta_res.status_code == 200
    assert meta_res.json()["id"] == image_id

    # 4. Uploads: GET file bytes
    file_res = await client.get(f"/api/v1/uploads/{image_id}/file", headers=user_headers)
    assert file_res.status_code == 200
    assert file_res.headers["Content-Type"] == "image/jpeg"
    assert len(file_res.content) > 0

    # 5. Uploads: GET thumbnail bytes
    thumb_res = await client.get(f"/api/v1/uploads/{image_id}/thumbnail", headers=user_headers)
    assert thumb_res.status_code == 200
    assert len(thumb_res.content) > 0

    # 6. Analyses: POST create and run analysis
    analysis_res = await client.post(
        "/api/v1/analyses",
        json={
            "image_id": image_id,
            "occasion": "Casual Night Out",
            "target_style": "Streetwear",
            "feedback_tone": "Honest and direct"
        },
        headers=user_headers
    )
    assert analysis_res.status_code == 201
    analysis_data = analysis_res.json()
    analysis_id = analysis_data["id"]
    assert analysis_data["status"] == "succeeded"
    assert analysis_data.get("report") is not None
    report_id = analysis_data["report"]["id"]

    # 7. Analyses: GET analysis status
    status_res = await client.get(f"/api/v1/analyses/{analysis_id}", headers=user_headers)
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "succeeded"

    # 8. Reports: GET single report
    report_res = await client.get(f"/api/v1/reports/{report_id}", headers=user_headers)
    assert report_res.status_code == 200
    report_data = report_res.json()
    assert report_data["id"] == report_id
    assert "overall_score" in report_data
    assert "scores" in report_data

    # 9. Reports: GET list reports
    list_res = await client.get("/api/v1/reports", headers=user_headers)
    assert list_res.status_code == 200
    assert list_res.json()["total"] >= 1

    # 10. Reports: PATCH update note & favorite
    patch_res = await client.patch(
        f"/api/v1/reports/{report_id}",
        json={"user_note": "Great styling idea for friday!", "is_favorite": True},
        headers=user_headers
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["user_note"] == "Great styling idea for friday!"
    assert patch_res.json()["is_favorite"] is True

    # 11. Reports: GET export report text
    export_res = await client.get(f"/api/v1/reports/{report_id}/export", headers=user_headers)
    assert export_res.status_code == 200
    assert "FITCHECK STYLE REPORT" in export_res.text

    # 12. User: GET profile
    me_res = await client.get("/api/v1/me", headers=user_headers)
    assert me_res.status_code == 200
    assert me_res.json()["id"] == "api-tester-007"
    assert me_res.json()["total_fits"] >= 1

    # 13. User: PATCH profile preferences
    update_me_res = await client.patch(
        "/api/v1/me",
        json={"preferred_style": "Minimalist Chic", "privacy_mode": False},
        headers=user_headers
    )
    assert update_me_res.status_code == 200
    assert update_me_res.json()["preferred_style"] == "Minimalist Chic"
    assert update_me_res.json()["privacy_mode"] is False

    # 14. User: POST export archive
    user_archive_res = await client.post("/api/v1/me/export", headers=user_headers)
    assert user_archive_res.status_code == 200
    assert "reports" in user_archive_res.json()

    # 15. User: DELETE wipe user data
    wipe_res = await client.delete("/api/v1/me", headers=user_headers)
    assert wipe_res.status_code == 200
    assert wipe_res.json()["status"] == "success"

    # Verify wipe clean
    after_me_res = await client.get("/api/v1/me", headers=user_headers)
    assert after_me_res.status_code == 200
    assert after_me_res.json()["total_fits"] == 0

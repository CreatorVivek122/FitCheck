import pytest

@pytest.mark.anyio
async def test_health_live(client):
    res = await client.get("/api/v1/health/live")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"

@pytest.mark.anyio
async def test_health_ready(client):
    res = await client.get("/api/v1/health/ready")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ready"

@pytest.mark.anyio
async def test_upload_and_analyze_flow(client, sample_image_bytes):
    # 1. Upload outfit photo
    files = {"file": ("outfit.jpg", sample_image_bytes, "image/jpeg")}
    upload_res = await client.post("/api/v1/uploads", files=files)
    assert upload_res.status_code == 201
    upload_data = upload_res.json()
    assert "id" in upload_data
    image_id = upload_data["id"]

    # 2. Trigger analysis
    analysis_payload = {
        "image_id": image_id,
        "occasion": "Date Night",
        "target_style": "Minimalist",
        "feedback_tone": "Honest and direct"
    }
    analysis_res = await client.post("/api/v1/analyses", json=analysis_payload)
    assert analysis_res.status_code == 201
    analysis_data = analysis_res.json()
    assert analysis_data["status"] == "succeeded"
    assert analysis_data["report"] is not None

    report = analysis_data["report"]
    assert report["overall_score"] is not None
    assert 0 <= report["overall_score"] <= 100
    assert "color_coordination" in report["scores"]
    assert "styling" in report["scores"]
    assert "fit_proportion" in report["scores"]
    assert "occasion_match" in report["scores"]
    assert len(report["what_works"]) > 0

    # 3. Retrieve report from reports list
    list_res = await client.get("/api/v1/reports")
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert list_data["total"] >= 1
    assert list_data["items"][0]["id"] == report["id"]

    # 4. Export report
    export_res = await client.get(f"/api/v1/reports/{report['id']}/export")
    assert export_res.status_code == 200
    assert "FITCHECK STYLE REPORT" in export_res.text

    # 5. Delete report
    del_res = await client.delete(f"/api/v1/reports/{report['id']}")
    assert del_res.status_code == 200


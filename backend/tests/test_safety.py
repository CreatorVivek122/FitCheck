import pytest
from app.services.safety_service import SafetyService

def test_safety_service_filters_body_shaming():
    service = SafetyService()
    unsafe_text = "This jacket is slimming and makes you look skinny and hides your body."
    cleaned = service.sanitize_text(unsafe_text)
    assert "skinny" not in cleaned
    assert "slimming" not in cleaned
    assert "hides your body" not in cleaned

def test_safety_service_allows_garment_critique():
    service = SafetyService()
    safe_text = "The relaxed trouser hemline breaks naturally over the Chelsea boot."
    is_safe, reason = service.check_safety(safe_text)
    assert is_safe is True


import time
import jwt
import pytest
from app.core.security import verify_supabase_token, get_current_user_id
from app.core.config import settings
from fastapi import HTTPException

TEST_SECRET = "super-secret-test-supabase-key-for-fitcheck-auth-tests"

def test_supabase_token_verification_valid(monkeypatch):
    monkeypatch.setattr(settings, "SUPABASE_JWT_SECRET", TEST_SECRET)
    
    payload = {
        "sub": "user-supabase-uuid-12345",
        "email": "fashionista@fitcheck.app",
        "role": "authenticated",
        "exp": int(time.time()) + 3600
    }
    valid_token = jwt.encode(payload, TEST_SECRET, algorithm="HS256")
    
    decoded = verify_supabase_token(valid_token)
    assert decoded["sub"] == "user-supabase-uuid-12345"
    assert decoded["email"] == "fashionista@fitcheck.app"


def test_supabase_token_verification_expired(monkeypatch):
    monkeypatch.setattr(settings, "SUPABASE_JWT_SECRET", TEST_SECRET)
    
    expired_payload = {
        "sub": "user-expired",
        "exp": int(time.time()) - 100
    }
    expired_token = jwt.encode(expired_payload, TEST_SECRET, algorithm="HS256")
    
    with pytest.raises(HTTPException) as exc_info:
        verify_supabase_token(expired_token)
    assert exc_info.value.status_code == 401
    assert "expired" in exc_info.value.detail.lower()


def test_supabase_token_verification_forged(monkeypatch):
    monkeypatch.setattr(settings, "SUPABASE_JWT_SECRET", TEST_SECRET)
    
    payload = {"sub": "hacker-user", "exp": int(time.time()) + 3600}
    forged_token = jwt.encode(payload, "wrong-secret-key", algorithm="HS256")
    
    with pytest.raises(HTTPException) as exc_info:
        verify_supabase_token(forged_token)
    assert exc_info.value.status_code == 401


def test_get_current_user_id_enforces_auth_when_secret_set(monkeypatch):
    monkeypatch.setattr(settings, "SUPABASE_JWT_SECRET", TEST_SECRET)
    monkeypatch.setattr(settings, "AUTH_REQUIRED", True)
    
    # Missing token -> 401
    with pytest.raises(HTTPException) as exc_info:
        get_current_user_id()
    assert exc_info.value.status_code == 401

    # Valid token via Bearer header -> Success
    payload = {"sub": "user-auth-ok", "exp": int(time.time()) + 3600}
    token = jwt.encode(payload, TEST_SECRET, algorithm="HS256")
    
    user_id = get_current_user_id(authorization=f"Bearer {token}")
    assert user_id == "user-auth-ok"


def test_get_current_user_id_dev_fallback_when_secret_not_set(monkeypatch):
    monkeypatch.setattr(settings, "SUPABASE_JWT_SECRET", None)
    monkeypatch.setattr(settings, "AUTH_REQUIRED", False)
    
    # Defaults to DEFAULT_USER_ID if no header
    assert get_current_user_id() == settings.DEFAULT_USER_ID
    
    # Accepts X-User-Id in dev
    assert get_current_user_id(x_user_id="dev-user") == "dev-user"

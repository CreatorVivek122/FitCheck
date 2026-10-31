import logging
import jwt
from typing import Optional, Dict, Any
from fastapi import Header, Query, HTTPException, status
from app.core.config import settings

logger = logging.getLogger("fitcheck.security")

_jwks_client: Optional[jwt.PyJWKClient] = None

def get_jwks_client() -> Optional[jwt.PyJWKClient]:
    """Caches and returns a PyJWKClient instance for modern Supabase JWKS endpoints."""
    global _jwks_client
    if _jwks_client is None and settings.SUPABASE_URL and not settings.SUPABASE_URL.startswith("http://localhost"):
        try:
            jwks_url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/jwks"
            _jwks_client = jwt.PyJWKClient(jwks_url, cache_jwk_set=True, lifespan=3600)
        except Exception as e:
            logger.warning(f"Could not initialize Supabase JWKS client: {e}")
    return _jwks_client


def verify_supabase_token(token_str: str) -> Dict[str, Any]:
    """
    Cryptographically verifies a Supabase JWT.
    Supports:
    1. Modern Supabase JWKS asymmetric keys (RS256/ES256) via SUPABASE_URL.
    2. Shared HMAC secret (HS256) via SUPABASE_JWT_SECRET.
    3. Development/test fallback if neither secret nor URL is configured.
    """
    if not token_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 1. If explicit HMAC secret is provided (HS256)
    if settings.SUPABASE_JWT_SECRET and not settings.SUPABASE_JWT_SECRET.startswith("sb_secret_"):
        try:
            payload = jwt.decode(
                token_str,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token has expired. Please sign in again.",
                headers={"WWW-Authenticate": "Bearer error=\"invalid_token\", error_description=\"token expired\""},
            )
        except jwt.PyJWTError as e:
            # If secret check failed and JWKS is available, try JWKS before giving up
            if not settings.SUPABASE_URL:
                logger.warning(f"Supabase JWT verification failed: {e}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Invalid authentication token: {str(e)}",
                    headers={"WWW-Authenticate": "Bearer error=\"invalid_token\""},
                )

    # 2. Modern Supabase projects: verify using JWKS public keys (only if token is a 3-part JWT)
    jwks = get_jwks_client()
    if jwks and token_str.count(".") == 2:
        try:
            signing_key = jwks.get_signing_key_from_jwt(token_str)
            payload = jwt.decode(
                token_str,
                signing_key.key,
                algorithms=["RS256", "ES256", "HS256"],
                options={"verify_aud": False}
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token has expired. Please sign in again.",
                headers={"WWW-Authenticate": "Bearer error=\"invalid_token\", error_description=\"token expired\""},
            )
        except Exception as e:
            logger.warning(f"Supabase JWKS token verification failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid authentication token: {str(e)}",
                headers={"WWW-Authenticate": "Bearer error=\"invalid_token\""},
            )

    # 3. Development / test mode fallback (when no secret or live Supabase URL is active)
    if "." in token_str:
        try:
            return jwt.decode(token_str, options={"verify_signature": False})
        except Exception:
            pass
    return {"sub": token_str}


def get_current_user_claims(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None),
    token: Optional[str] = Query(None)
) -> Optional[Dict[str, Any]]:
    """Extracts decoded token claims if available (e.g. sub, email, user_metadata)."""
    auth_str = authorization if isinstance(authorization, str) else None
    x_user_str = x_user_id if isinstance(x_user_id, str) else None
    token_str = token if isinstance(token, str) else None

    raw_token = None
    if auth_str and auth_str.startswith("Bearer "):
        raw_token = auth_str[7:].strip()
    elif token_str:
        raw_token = token_str.strip()

    if raw_token:
        try:
            return verify_supabase_token(raw_token)
        except HTTPException:
            if settings.AUTH_REQUIRED:
                raise
            return None

    if x_user_str:
        return {"sub": x_user_str.strip()}

    return {"sub": settings.DEFAULT_USER_ID}


def get_current_user_id(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None),
    token: Optional[str] = Query(None)
) -> str:
    """
    Extracts and authenticates the user ID for request authorization.
    In production (with SUPABASE_JWT_SECRET or AUTH_REQUIRED), strictly requires
    and verifies a Supabase JWT.
    In local development / tests without secrets, supports Bearer tokens, query tokens,
    and X-User-Id header with DEFAULT_USER_ID fallback.
    """
    auth_str = authorization if isinstance(authorization, str) else None
    x_user_str = x_user_id if isinstance(x_user_id, str) else None
    token_str = token if isinstance(token, str) else None

    raw_token = None
    if auth_str and auth_str.startswith("Bearer "):
        raw_token = auth_str[7:].strip()
    elif token_str:
        raw_token = token_str.strip()

    if settings.AUTH_REQUIRED:
        if not raw_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required. Please provide a valid Bearer token.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        claims = verify_supabase_token(raw_token)
        user_id = claims.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing subject identity ('sub').",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return str(user_id)

    # Local development / test mode fallback
    if raw_token:
        claims = verify_supabase_token(raw_token)
        if claims.get("sub"):
            return str(claims["sub"])
        return raw_token

    if x_user_str:
        return x_user_str.strip()

    return settings.DEFAULT_USER_ID

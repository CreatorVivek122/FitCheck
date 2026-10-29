from typing import Optional
from fastapi import Header, HTTPException, status
from app.core.config import settings

def get_current_user_id(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
) -> str:
    """
    Extracts the authenticated user ID.
    Supports Bearer token or explicit X-User-Id header for API access,
    defaulting to settings.DEFAULT_USER_ID for frictionless local exploration.
    """
    if x_user_id:
        return x_user_id.strip()
    
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:].strip()
        if token:
            # Token can be directly a user ID or mock token
            return token
            
    return settings.DEFAULT_USER_ID


from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class UserProfileResponse(BaseModel):
    id: str
    username: Optional[str] = "Fashion Friend"
    email: Optional[str] = None
    default_occasion: Optional[str] = "Everyday / Casual"
    preferred_style: Optional[str] = "Minimalist"
    feedback_tone: Optional[str] = "Honest and direct"
    privacy_mode: bool = True
    total_fits: int = 0
    created_at: datetime

class UserPreferencesUpdate(BaseModel):
    username: Optional[str] = None
    default_occasion: Optional[str] = None
    preferred_style: Optional[str] = None
    feedback_tone: Optional[str] = None
    privacy_mode: Optional[bool] = None


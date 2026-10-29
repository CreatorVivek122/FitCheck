from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
from app.schemas.report import FitReportResponse

class AnalysisCreateRequest(BaseModel):
    image_id: str
    occasion: Optional[str] = Field("Everyday / Casual", description="Context occasion (e.g. College, Office, Date Night)")
    target_style: Optional[str] = Field("Let AI decide", description="Target style aesthetic (e.g. Minimalist, Streetwear)")
    feedback_tone: Optional[str] = Field("Honest and direct", description="Feedback preference tone")
    idempotency_key: Optional[str] = None

class AnalysisStatusResponse(BaseModel):
    id: str
    user_id: str
    image_id: str
    status: str # queued, processing, succeeded, failed, cancelled
    occasion: Optional[str]
    target_style: Optional[str]
    feedback_tone: Optional[str]
    attempt_count: int
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    model_provider: Optional[str] = None
    rubric_version: str
    created_at: datetime
    updated_at: datetime
    report: Optional[FitReportResponse] = None


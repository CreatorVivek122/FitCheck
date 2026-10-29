from typing import Optional, List, Dict
from pydantic import BaseModel, Field
from datetime import datetime

class CategoryScoreDetail(BaseModel):
    score: Optional[int] = Field(None, ge=0, le=100, description="Score 0-100, or null if insufficient visible evidence")
    confidence: str = Field("medium", description="high, medium, or low")
    visibility: str = Field("sufficient", description="sufficient, partial, or insufficient")
    rationale: str

class ColorPaletteItem(BaseModel):
    hex: str
    name: str
    prominence: float

class FitReportResponse(BaseModel):
    id: str
    analysis_id: str
    image_id: Optional[str] = None
    style_title: str
    style_description: str
    overall_score: Optional[int] = None
    overall_confidence: str
    scores: Dict[str, CategoryScoreDetail]
    what_works: List[str]
    improvements: List[str]
    styling_ideas: List[str]
    limitations: List[str]
    extracted_palette: List[ColorPaletteItem] = []
    user_note: Optional[str] = None
    is_favorite: bool = False
    rubric_version: str
    model_id: str
    created_at: datetime
    image_url: Optional[str] = None

class ReportUpdateRequest(BaseModel):
    user_note: Optional[str] = None
    is_favorite: Optional[bool] = None

class ReportCompareRequest(BaseModel):
    report_a_id: str
    report_b_id: str
    target_occasion: Optional[str] = None

class ReportCompareResponse(BaseModel):
    report_a: FitReportResponse
    report_b: FitReportResponse
    score_delta: int
    winning_report_id: Optional[str]
    verdict: str
    occasion_advice: str
    pillar_comparisons: Dict[str, str]


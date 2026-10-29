from abc import ABC, abstractmethod
from typing import Dict, List, Optional
from pydantic import BaseModel
from app.schemas.report import CategoryScoreDetail, ColorPaletteItem

class VisionAnalysisResult(BaseModel):
    style_title: str
    style_description: str
    category_scores: Dict[str, CategoryScoreDetail]
    what_works: List[str]
    improvements: List[str]
    styling_ideas: List[str]
    limitations: List[str]
    extracted_palette: List[ColorPaletteItem]
    model_id: str

class VisionAnalysisProvider(ABC):
    @abstractmethod
    async def analyze(
        self,
        image_bytes: bytes,
        occasion: str,
        target_style: str,
        tone: str
    ) -> VisionAnalysisResult:
        """Analyzes an outfit image and returns structured styling evaluation."""
        pass


from app.ai.base import VisionAnalysisProvider, VisionAnalysisResult
from app.ai.providers.local_vlm import LocalHeuristicVisionProvider
from app.ai.providers.gemini_vlm import GeminiVisionProvider
from app.core.config import settings

def get_vision_provider() -> VisionAnalysisProvider:
    if settings.GEMINI_API_KEY and not settings.PREFER_LOCAL_CV:
        return GeminiVisionProvider()
    return LocalHeuristicVisionProvider()

__all__ = ["VisionAnalysisProvider", "VisionAnalysisResult", "get_vision_provider"]


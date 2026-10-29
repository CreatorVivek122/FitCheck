import json
import logging
from typing import Optional
from app.core.config import settings
from app.ai.base import VisionAnalysisProvider, VisionAnalysisResult
from app.ai.providers.local_vlm import LocalHeuristicVisionProvider
from app.schemas.report import CategoryScoreDetail, ColorPaletteItem

logger = logging.getLogger("fitcheck.ai.gemini")

GEMINI_PROMPT_SYSTEM = """
You are FitCheck's senior editorial fashion stylist and vision analyst.
Analyze the user's uploaded outfit image with aesthetic rigor and respectful precision.

CRITICAL RULES:
1. FOCUS EXCLUSIVELY ON CLOTHING, COLOR COORDINATION, DRAPE, ACCESSORIES, AND OCCASION FIT.
2. ABSOLUTELY NO BODY SHAMING, WEIGHT EVALUATIONS, OR PHYSICAL APPEARANCE JUDGMENTS.
3. If garment fit or hemline cannot be seen due to crop or angle, set fit_proportion score to null and visibility to "insufficient" or "partial".
4. Return ONLY a valid JSON object matching the requested schema.

JSON Schema:
{
  "style_title": "String (e.g. Modern Minimalist Prep)",
  "style_description": "String summarizing the aesthetic and tonal mood",
  "category_scores": {
    "color_coordination": {"score": int (0-100), "confidence": "high|medium|low", "visibility": "sufficient|partial|insufficient", "rationale": "String"},
    "styling": {"score": int (0-100), "confidence": "high|medium|low", "visibility": "sufficient|partial|insufficient", "rationale": "String"},
    "fit_proportion": {"score": int (0-100) or null, "confidence": "high|medium|low", "visibility": "sufficient|partial|insufficient", "rationale": "String"},
    "occasion_match": {"score": int (0-100), "confidence": "high|medium|low", "visibility": "sufficient|partial|insufficient", "rationale": "String"}
  },
  "what_works": ["String 1", "String 2", "String 3"],
  "improvements": ["String 1", "String 2", "String 3"],
  "styling_ideas": ["Upgrade 1", "Upgrade 2", "Upgrade 3"],
  "limitations": ["Honest caveats about lighting, crop, or camera perspective"],
  "extracted_palette": [
    {"hex": "#1A1A1A", "name": "Obsidian Black", "prominence": 0.4},
    {"hex": "#F5F2EB", "name": "Alabaster Cream", "prominence": 0.3}
  ]
}
"""

class GeminiVisionProvider(VisionAnalysisProvider):
    def __init__(self):
        self.fallback = LocalHeuristicVisionProvider()

    async def analyze(
        self,
        image_bytes: bytes,
        occasion: str,
        target_style: str,
        tone: str
    ) -> VisionAnalysisResult:
        api_key = settings.GEMINI_API_KEY
        if not api_key or settings.PREFER_LOCAL_CV:
            logger.info("Using local CV heuristics provider (no GEMINI_API_KEY or PREFER_LOCAL_CV active)")
            return await self.fallback.analyze(image_bytes, occasion, target_style, tone)

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=api_key)
            prompt = (
                f"{GEMINI_PROMPT_SYSTEM}\n\n"
                f"Context for this analysis:\n"
                f"- Selected Occasion: {occasion or 'Everyday / Casual'}\n"
                f"- Preferred Style Vibe: {target_style or 'Let AI decide'}\n"
                f"- Feedback Tone: {tone or 'Honest and direct'}\n"
            )

            # Build image part
            image_part = types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg")

            logger.info(f"✨ Sending outfit image to Gemini ({settings.GEMINI_MODEL}) for multimodal fashion analysis...")
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=[image_part, prompt],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.3
                )
            )

            text_resp = response.text.strip()
            data = json.loads(text_resp)
            logger.info(f"✅ Gemini multimodal response received: '{data.get('style_title')}'")

            # Map category scores
            cat_scores = {}
            for key in ["color_coordination", "styling", "fit_proportion", "occasion_match"]:
                raw = data.get("category_scores", {}).get(key, {})
                cat_scores[key] = CategoryScoreDetail(
                    score=raw.get("score"),
                    confidence=raw.get("confidence", "medium"),
                    visibility=raw.get("visibility", "sufficient"),
                    rationale=raw.get("rationale", "Grounded visual observation.")
                )

            palette_items = [
                ColorPaletteItem(**item)
                for item in data.get("extracted_palette", [])
            ]

            return VisionAnalysisResult(
                style_title=data.get("style_title", "Contemporary Ensemble"),
                style_description=data.get("style_description", "Harmonious outfit coordination."),
                category_scores=cat_scores,
                what_works=data.get("what_works", []),
                improvements=data.get("improvements", []),
                styling_ideas=data.get("styling_ideas", []),
                limitations=data.get("limitations", ["Fashion is subjective; score represents guidance."]),
                extracted_palette=palette_items,
                model_id=f"gemini/{settings.GEMINI_MODEL}"
            )
        except Exception as e:
            logger.warning(f"Gemini API inference encountered exception: {e}. Falling back safely to local CV analyzer.")
            return await self.fallback.analyze(image_bytes, occasion, target_style, tone)


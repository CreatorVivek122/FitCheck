import io
import math
from typing import List, Tuple, Dict
from PIL import Image
from app.ai.base import VisionAnalysisProvider, VisionAnalysisResult
from app.schemas.report import CategoryScoreDetail, ColorPaletteItem

# Named color reference for luxury fashion palettes
PALETTE_NAMES = [
    ((26, 26, 26), "#1A1A1A", "Obsidian Black"),
    ((245, 242, 235), "#F5F2EB", "Alabaster Ivory"),
    ((109, 31, 47), "#6D1F2F", "Burgundy Oxblood"),
    ((63, 91, 69), "#3F5B45", "Forest Olive"),
    ((44, 62, 80), "#2C3E50", "Midnight Navy"),
    ((180, 150, 120), "#B49678", "Warm Camel"),
    ((110, 104, 96), "#6E6860", "Heather Slate"),
    ((210, 180, 140), "#D2B48C", "Oatmeal Beige"),
    ((200, 200, 200), "#C8C8C8", "Dove Grey"),
    ((140, 40, 40), "#8C2828", "Rich Terracotta"),
    ((190, 160, 110), "#BEA06E", "Vintage Ochre"),
    ((240, 230, 220), "#F0E6DC", "Cashmere Bone"),
]

def closest_color_name(r: int, g: int, b: int) -> Tuple[str, str]:
    best_dist = float("inf")
    best_hex = f"#{r:02x}{g:02x}{b:02x}".upper()
    best_name = "Custom Shade"
    for ref_rgb, ref_hex, name in PALETTE_NAMES:
        dist = (r - ref_rgb[0]) ** 2 + (g - ref_rgb[1]) ** 2 + (b - ref_rgb[2]) ** 2
        if dist < best_dist:
            best_dist = dist
            best_hex = f"#{r:02x}{g:02x}{b:02x}".upper()
            best_name = name
    return best_hex, best_name

class LocalHeuristicVisionProvider(VisionAnalysisProvider):
    async def analyze(
        self,
        image_bytes: bytes,
        occasion: str,
        target_style: str,
        tone: str
    ) -> VisionAnalysisResult:
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        w, h = pil_img.size
        aspect_ratio = h / max(1, w)

        # 1. Color Palette Extraction using quantization
        quantized = pil_img.quantize(colors=6, method=Image.Quantize.MEDIANCUT)
        palette = quantized.getpalette()[:18]
        counts = quantized.getcolors() or []
        counts.sort(key=lambda x: x[0], reverse=True)
        total_pixels = sum(c[0] for c in counts) or 1

        extracted_palette: List[ColorPaletteItem] = []
        color_details = []

        for count, idx in counts[:4]:
            r, g, b = palette[idx * 3 : idx * 3 + 3]
            prominence = round(count / total_pixels, 2)
            hex_code, name = closest_color_name(r, g, b)
            extracted_palette.append(
                ColorPaletteItem(hex=hex_code, name=name, prominence=prominence)
            )
            # Calculate saturation & luminance
            max_c = max(r, g, b) / 255.0
            min_c = min(r, g, b) / 255.0
            sat = 0.0 if max_c == 0 else (max_c - min_c) / max_c
            lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0
            color_details.append({"sat": sat, "lum": lum, "weight": prominence})

        # 2. Palette Harmony Analysis
        avg_sat = sum(c["sat"] * c["weight"] for c in color_details)
        lum_variance = max(c["lum"] for c in color_details) - min(c["lum"] for c in color_details)
        is_neutral_palette = avg_sat < 0.28
        is_high_contrast = lum_variance > 0.45

        # 3. Calculate Color Coordination
        if is_neutral_palette and is_high_contrast:
            color_score = 86
            color_rationale = (
                "Sophisticated interplay of high-contrast neutral foundations, creating depth without visual friction."
            )
        elif is_neutral_palette:
            color_score = 83
            color_rationale = (
                "Cohesive tonal monochrome palette with understated, calm transitions between pieces."
            )
        elif is_high_contrast:
            color_score = 79
            color_rationale = (
                "Expressive color presence with defined tonal anchors providing clear contrast."
            )
        else:
            color_score = 75
            color_rationale = (
                "Balanced color layout; introducing a single deliberate accent piece would heighten visual impact."
            )

        # 4. Fit & Proportion (checking full body vs partial)
        is_full_body = aspect_ratio >= 1.35 and h >= 400
        if is_full_body:
            fit_score = 81
            fit_vis = "sufficient"
            fit_conf = "high"
            fit_rationale = (
                "Vertical silhouette lines read clear and balanced from top to hemline."
            )
        else:
            fit_score = 73
            fit_vis = "partial"
            fit_conf = "medium"
            fit_rationale = (
                "Garment drape appears proportionate in visible frame; full length crop prevents ankle/footwear ratio check."
            )

        # 5. Occasion Matching
        occ_lower = (occasion or "Everyday / Casual").lower()
        if "office" in occ_lower or "business" in occ_lower:
            occ_score = 84 if is_neutral_palette else 74
            occ_rationale = (
                f"Tailored aesthetic suits a professional setting with balanced formality."
            )
        elif "date" in occ_lower:
            occ_score = 85
            occ_rationale = (
                "Subtle, polished detailing makes this look approachable and intentional for an evening out."
            )
        elif "streetwear" in occ_lower:
            occ_score = 88 if is_high_contrast else 80
            occ_rationale = (
                "Silhouette dynamics and tonal balance capture authentic modern streetwear sensibilities."
            )
        else:
            occ_score = 82
            occ_rationale = (
                f"Versatile, relaxed execution well-attuned to {occasion or 'daily casual wear'}."
            )

        # 6. Styling Cohesion
        style_score = int(round((color_score * 0.4 + occ_score * 0.4 + (fit_score or 75) * 0.2)))
        styling_rationale = (
            f"Intentional garment pairing that communicates a cohesive {target_style or 'contemporary'} point of view."
        )

        category_scores = {
            "color_coordination": CategoryScoreDetail(
                score=color_score,
                confidence="high",
                visibility="sufficient",
                rationale=color_rationale
            ),
            "styling": CategoryScoreDetail(
                score=style_score,
                confidence="high",
                visibility="sufficient",
                rationale=styling_rationale
            ),
            "fit_proportion": CategoryScoreDetail(
                score=fit_score,
                confidence=fit_conf,
                visibility=fit_vis,
                rationale=fit_rationale
            ),
            "occasion_match": CategoryScoreDetail(
                score=occ_score,
                confidence="medium",
                visibility="sufficient",
                rationale=occ_rationale
            )
        }

        # 7. Style Title & Description
        if is_neutral_palette:
            title = "Refined Minimalist Tonal" if is_full_body else "Tailored Quiet Luxury"
            desc = "Clean, low-saturation composition with harmonious textures and composed proportions."
        else:
            title = "Dynamic Contemporary Chic"
            desc = "Lively color balance with high visual interest and bold modern styling cadence."

        what_works = [
            f"The primary {extracted_palette[0].name} baseline grounds the entire silhouette effortlessly.",
            "Visual balance between upper and lower pieces keeps the eye moving naturally.",
            f"Occasion alignment feels organic and well-suited for {occasion or 'casual everyday wear'}."
        ]

        improvements = [
            "Consider anchoring the outfit with footwear in a complementary leather or suede texture.",
            "Add a structured accessory—like a minimalist leather watch or tote—to accentuate the focal point.",
            "Ensure outerwear sleeves break cleanly at the wrist bone for an elevated drape."
        ]

        styling_ideas = [
            "Layer with an unbuttoned knit cardigan or neutral trench to add dimensional depth.",
            "Swap sneakers for minimalist leather loafers or Chelsea boots to instantly dress up the look.",
            "Roll cuffs slightly to highlight wrist accessories and create effortless ease."
        ]

        limitations = [
            "AI estimates evaluate visible styling aesthetics, not personal worth or physical attractiveness.",
            "Lighting and camera angle can alter perceived garment texture and exact saturation."
        ]
        if not is_full_body:
            limitations.append("Full garment hem-to-shoe proportion could not be fully assessed due to camera framing.")

        return VisionAnalysisResult(
            style_title=title,
            style_description=desc,
            category_scores=category_scores,
            what_works=what_works,
            improvements=improvements,
            styling_ideas=styling_ideas,
            limitations=limitations,
            extracted_palette=extracted_palette,
            model_id="fitcheck-local-cv-heuristics-v1"
        )


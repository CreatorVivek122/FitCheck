from typing import Dict, Any, Optional, Tuple
from app.schemas.report import CategoryScoreDetail

class ScoringService:
    RUBRIC_VERSION = "1.0"
    
    DEFAULT_WEIGHTS = {
        "color_coordination": 0.25,
        "styling": 0.30,
        "fit_proportion": 0.20,
        "occasion_match": 0.25
    }

    def compute_overall_score(self, scores: Dict[str, CategoryScoreDetail]) -> Tuple[Optional[int], str]:
        """
        Calculates the overall FitScore from category scores deterministically.
        - Ignores null / insufficient evidence categories rather than treating them as 0.
        - Re-normalizes weights across available assessable categories.
        - Calculates an honest overall confidence level.
        """
        valid_items = []
        total_weight = 0.0
        weighted_sum = 0.0
        confidence_points = 0

        for key, weight in self.DEFAULT_WEIGHTS.items():
            cat = scores.get(key)
            if not cat or cat.score is None:
                continue
            
            # Clamp category score strictly between 0 and 100
            clamped_score = max(0, min(100, int(cat.score)))
            weighted_sum += clamped_score * weight
            total_weight += weight
            valid_items.append(clamped_score)

            if cat.confidence == "high":
                confidence_points += 3
            elif cat.confidence == "medium":
                confidence_points += 2
            else:
                confidence_points += 1

        if not valid_items or total_weight == 0.0:
            return None, "low"

        overall = int(round(weighted_sum / total_weight))
        overall = max(0, min(100, overall))

        # Overall confidence estimation
        avg_conf = confidence_points / len(valid_items)
        if len(valid_items) >= 3 and avg_conf >= 2.4:
            overall_confidence = "high"
        elif len(valid_items) >= 2 and avg_conf >= 1.6:
            overall_confidence = "medium"
        else:
            overall_confidence = "low"

        return overall, overall_confidence


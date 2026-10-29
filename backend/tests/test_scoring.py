import pytest
from app.services.scoring_service import ScoringService
from app.schemas.report import CategoryScoreDetail

def test_deterministic_scoring_all_categories():
    service = ScoringService()
    scores = {
        "color_coordination": CategoryScoreDetail(score=80, confidence="high", visibility="sufficient", rationale="Harmonious"),
        "styling": CategoryScoreDetail(score=70, confidence="high", visibility="sufficient", rationale="Good"),
        "fit_proportion": CategoryScoreDetail(score=90, confidence="medium", visibility="sufficient", rationale="Great drape"),
        "occasion_match": CategoryScoreDetail(score=85, confidence="high", visibility="sufficient", rationale="Appropriate"),
    }
    # Expected weighted sum:
    # 80*0.25 (20) + 70*0.30 (21) + 90*0.20 (18) + 85*0.25 (21.25) = 80.25 -> 80
    overall, conf = service.compute_overall_score(scores)
    assert overall == 80
    assert conf == "high"

def test_scoring_with_missing_category_does_not_count_as_zero():
    service = ScoringService()
    scores = {
        "color_coordination": CategoryScoreDetail(score=80, confidence="medium", visibility="sufficient", rationale="Harmonious"),
        "styling": CategoryScoreDetail(score=80, confidence="medium", visibility="sufficient", rationale="Good"),
        "fit_proportion": CategoryScoreDetail(score=None, confidence="low", visibility="insufficient", rationale="Obscured"),
        "occasion_match": CategoryScoreDetail(score=80, confidence="medium", visibility="sufficient", rationale="Appropriate"),
    }
    # Available weights: 0.25 + 0.30 + 0.25 = 0.80
    # Weighted avg: (20 + 24 + 20) / 0.80 = 80
    overall, conf = service.compute_overall_score(scores)
    assert overall == 80
    assert conf == "medium"

def test_scoring_all_null():
    service = ScoringService()
    scores = {
        "color_coordination": CategoryScoreDetail(score=None, confidence="low", visibility="insufficient", rationale="Dark"),
    }
    overall, conf = service.compute_overall_score(scores)
    assert overall is None
    assert conf == "low"


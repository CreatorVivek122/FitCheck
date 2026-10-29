import uuid
from sqlalchemy import Column, String, Integer, ForeignKey, JSON, Text, Float
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.base import TimestampMixin

class FitReport(Base, TimestampMixin):
    __tablename__ = "fit_reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_id = Column(String(36), ForeignKey("analysis_jobs.id", ondelete="CASCADE"), unique=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    image_id = Column(String(36), ForeignKey("image_uploads.id", ondelete="SET NULL"), nullable=True)
    
    style_title = Column(String(128), nullable=False)
    style_description = Column(Text, nullable=False)
    overall_score = Column(Integer, nullable=True)
    overall_confidence = Column(String(32), default="medium", nullable=False)
    
    # Pillar category scores and rationales (stored as structured JSON)
    # schema: {
    #   "color_coordination": {"score": int, "confidence": str, "visibility": str, "rationale": str, "palette": list},
    #   "styling": {"score": int, "confidence": str, "visibility": str, "rationale": str},
    #   "fit_proportion": {"score": int|None, "confidence": str, "visibility": str, "rationale": str},
    #   "occasion_match": {"score": int, "confidence": str, "visibility": str, "rationale": str}
    # }
    scores = Column(JSON, nullable=False)
    
    what_works = Column(JSON, nullable=False)      # list of string insights
    improvements = Column(JSON, nullable=False)    # list of constructive suggestions
    styling_ideas = Column(JSON, nullable=False)   # list of upgrades / variations
    limitations = Column(JSON, nullable=False)     # list of honest caveats / visibility limitations
    
    extracted_palette = Column(JSON, nullable=True) # list of hex colors [{"hex": "#...", "name": "...", "prominence": float}]
    user_note = Column(Text, nullable=True)         # personal note in My Fits
    is_favorite = Column(Integer, default=0)        # 1 for favorite
    
    rubric_version = Column(String(16), default="1.0", nullable=False)
    model_id = Column(String(64), nullable=False)

    # Relationships
    analysis = relationship("AnalysisJob", back_populates="report")
    user = relationship("User", back_populates="reports")


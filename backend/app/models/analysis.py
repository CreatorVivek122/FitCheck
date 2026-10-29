import uuid
from sqlalchemy import Column, String, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.base import TimestampMixin

class AnalysisJob(Base, TimestampMixin):
    __tablename__ = "analysis_jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    image_id = Column(String(36), ForeignKey("image_uploads.id", ondelete="CASCADE"), nullable=False, index=True)
    
    occasion = Column(String(64), nullable=True)
    target_style = Column(String(64), nullable=True)
    feedback_tone = Column(String(64), nullable=True)
    
    # State machine: queued -> processing -> succeeded | failed | cancelled
    status = Column(String(32), default="queued", nullable=False, index=True)
    attempt_count = Column(Integer, default=0, nullable=False)
    error_code = Column(String(64), nullable=True)
    error_message = Column(Text, nullable=True)
    
    idempotency_key = Column(String(128), nullable=True, index=True)
    model_provider = Column(String(64), nullable=True) # gemini-2.5-flash or local-cv-heuristics
    rubric_version = Column(String(16), default="1.0", nullable=False)

    # Relationships
    user = relationship("User", back_populates="analyses")
    image = relationship("ImageUpload", back_populates="analyses")
    report = relationship("FitReport", back_populates="analysis", uselist=False, cascade="all, delete-orphan")


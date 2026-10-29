import uuid
from sqlalchemy import Column, String, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.base import TimestampMixin

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(64), nullable=True)
    email = Column(String(255), unique=True, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Preferences
    default_occasion = Column(String(64), nullable=True, default="Everyday / Casual")
    preferred_style = Column(String(64), nullable=True, default="Minimalist")
    feedback_tone = Column(String(64), nullable=True, default="Honest and direct")
    privacy_mode = Column(Boolean, default=True, nullable=False) # True = private by default

    # Relationships
    uploads = relationship("ImageUpload", back_populates="user", cascade="all, delete-orphan")
    analyses = relationship("AnalysisJob", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("FitReport", back_populates="user", cascade="all, delete-orphan")


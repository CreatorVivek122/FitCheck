import uuid
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.base import TimestampMixin

class ImageUpload(Base, TimestampMixin):
    __tablename__ = "image_uploads"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    storage_key = Column(String(255), nullable=False) # Internal secure file path or S3 key
    thumbnail_key = Column(String(255), nullable=True) # Normalized thumbnail
    mime_type = Column(String(64), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    width = Column(Integer, nullable=False)
    height = Column(Integer, nullable=False)
    checksum_sha256 = Column(String(64), nullable=False)
    status = Column(String(32), default="active", nullable=False) # active, deleted

    # Relationships
    user = relationship("User", back_populates="uploads")
    analyses = relationship("AnalysisJob", back_populates="image", cascade="all, delete-orphan")


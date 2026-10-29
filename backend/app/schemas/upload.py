from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class UploadResponse(BaseModel):
    id: str
    mime_type: str
    file_size_bytes: int
    width: int
    height: int
    created_at: datetime
    preview_url: str

class ImageMetadataResponse(BaseModel):
    id: str
    user_id: str
    mime_type: str
    file_size_bytes: int
    width: int
    height: int
    checksum_sha256: str
    created_at: datetime
    preview_url: str


import logging
from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.image import ImageUpload
from app.models.report import FitReport
from app.models.analysis import AnalysisJob
from app.services.storage_service import StorageProvider
from app.core.errors import NotFoundError, ValidationError, ConflictError

logger = logging.getLogger("fitcheck.media")

class MediaService:
    def __init__(self, db: AsyncSession, storage: StorageProvider):
        self.db = db
        self.storage = storage

    async def get_image_for_user(self, image_id: str, user_id: str) -> ImageUpload:
        """Resolves an active image upload row owned by user_id."""
        stmt = select(ImageUpload).where(
            ImageUpload.id == image_id,
            ImageUpload.user_id == user_id,
            ImageUpload.status == "active"
        )
        res = await self.db.execute(stmt)
        img = res.scalar_one_or_none()
        if not img:
            raise NotFoundError("Image not found.")
        return img

    async def get_image_bytes(self, image_id: str, user_id: str) -> Tuple[bytes, str]:
        """Returns (content_bytes, mime_type) for the original normalized image."""
        img = await self.get_image_for_user(image_id, user_id)
        data = await self.storage.get_bytes(img.storage_key)
        if not data:
            raise NotFoundError("Image file content is missing or could not be read.")
        return data, img.mime_type

    async def get_thumbnail_bytes(self, image_id: str, user_id: str) -> Tuple[bytes, str]:
        """
        Returns (content_bytes, mime_type) for the thumbnail.
        Falls back to original image bytes if thumbnail is missing or unreadable.
        """
        img = await self.get_image_for_user(image_id, user_id)
        if img.thumbnail_key:
            data = await self.storage.get_bytes(img.thumbnail_key)
            if data:
                return data, "image/jpeg"

        # Fallback to normalized original
        data = await self.storage.get_bytes(img.storage_key)
        if not data:
            raise NotFoundError("Thumbnail content could not be retrieved.")
        return data, img.mime_type

    async def is_image_referenced(self, image_id: str, exclude_report_id: Optional[str] = None) -> bool:
        """Checks if an image is referenced by any report or analysis job."""
        rep_stmt = select(FitReport.id).where(FitReport.image_id == image_id)
        if exclude_report_id:
            rep_stmt = rep_stmt.where(FitReport.id != exclude_report_id)
        rep_res = await self.db.execute(rep_stmt)
        if rep_res.first() is not None:
            return True

        job_stmt = select(AnalysisJob.id).where(AnalysisJob.image_id == image_id)
        job_res = await self.db.execute(job_stmt)
        if job_res.first() is not None:
            return True

        return False

    async def delete_image_files(self, upload: ImageUpload) -> bool:
        """Deletes original and thumbnail storage objects idempotently."""
        success = True
        if upload.storage_key:
            ok = await self.storage.delete(upload.storage_key)
            if not ok:
                success = False
        if upload.thumbnail_key:
            ok = await self.storage.delete(upload.thumbnail_key)
            if not ok:
                success = False
        return success

    async def delete_upload(self, image_id: str, user_id: str) -> None:
        """
        Explicit deletion of an upload by the user.
        Fails if the image is still actively referenced by styling reports or analyses.
        """
        img = await self.get_image_for_user(image_id, user_id)
        referenced = await self.is_image_referenced(image_id)
        if referenced:
            raise ConflictError("Cannot delete image: it is currently referenced by one or more styling reports or analyses.")

        await self.delete_image_files(img)
        await self.db.delete(img)
        await self.db.commit()

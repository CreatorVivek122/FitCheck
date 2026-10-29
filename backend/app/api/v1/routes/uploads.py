from fastapi import APIRouter, Depends, UploadFile, File, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.core.security import get_current_user_id
from app.models.user import User
from app.models.image import ImageUpload
from app.schemas.upload import UploadResponse, ImageMetadataResponse
from app.services.storage_service import get_storage_provider, StorageProvider
from app.services.upload_service import UploadService
from app.core.errors import NotFoundError, ValidationError

router = APIRouter(prefix="/uploads", tags=["uploads"])

@router.post("", response_model=UploadResponse, status_code=201)
async def upload_image(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
    storage: StorageProvider = Depends(get_storage_provider)
):
    if not file or not file.filename:
        raise ValidationError("No image file provided.")

    raw_bytes = await file.read()
    upload_service = UploadService(storage)
    (
        normalized_bytes,
        thumb_bytes,
        width,
        height,
        mime_type,
        checksum
    ) = upload_service.validate_and_process(raw_bytes, file.filename)

    # Save to storage provider
    storage_key = await storage.save_bytes(normalized_bytes, "jpg")
    thumb_key = await storage.save_bytes(thumb_bytes, "jpg")

    # Ensure user exists
    user_res = await db.execute(select(User).where(User.id == user_id))
    user = user_res.scalar_one_or_none()
    if not user:
        user = User(id=user_id, username="Fashion Friend")
        db.add(user)
        await db.flush()

    upload_record = ImageUpload(
        user_id=user_id,
        storage_key=storage_key,
        thumbnail_key=thumb_key,
        mime_type=mime_type,
        file_size_bytes=len(normalized_bytes),
        width=width,
        height=height,
        checksum_sha256=checksum,
        status="active"
    )
    db.add(upload_record)
    await db.commit()
    await db.refresh(upload_record)

    return UploadResponse(
        id=upload_record.id,
        mime_type=upload_record.mime_type,
        file_size_bytes=upload_record.file_size_bytes,
        width=upload_record.width,
        height=upload_record.height,
        created_at=upload_record.created_at,
        preview_url=f"/api/v1/uploads/{upload_record.id}/file"
    )

@router.get("/{image_id}", response_model=ImageMetadataResponse)
async def get_image_metadata(
    image_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(ImageUpload).where(
        ImageUpload.id == image_id,
        ImageUpload.user_id == user_id,
        ImageUpload.status == "active"
    )
    res = await db.execute(stmt)
    img = res.scalar_one_or_none()
    if not img:
        raise NotFoundError("Image not found.")

    return ImageMetadataResponse(
        id=img.id,
        user_id=img.user_id,
        mime_type=img.mime_type,
        file_size_bytes=img.file_size_bytes,
        width=img.width,
        height=img.height,
        checksum_sha256=img.checksum_sha256,
        created_at=img.created_at,
        preview_url=f"/api/v1/uploads/{img.id}/file"
    )

@router.get("/{image_id}/file")
async def get_image_file(
    image_id: str,
    db: AsyncSession = Depends(get_db),
    storage: StorageProvider = Depends(get_storage_provider)
):
    stmt = select(ImageUpload).where(
        ImageUpload.id == image_id,
        ImageUpload.status == "active"
    )
    res = await db.execute(stmt)
    img = res.scalar_one_or_none()
    if not img:
        raise NotFoundError("Image file not found.")

    data = await storage.get_bytes(img.storage_key)
    if not data:
        raise NotFoundError("Image data could not be retrieved.")

    return Response(content=data, media_type=img.mime_type, headers={"Cache-Control": "private, max-age=86400"})

@router.delete("/{image_id}")
async def delete_image(
    image_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
    storage: StorageProvider = Depends(get_storage_provider)
):
    stmt = select(ImageUpload).where(
        ImageUpload.id == image_id,
        ImageUpload.user_id == user_id
    )
    res = await db.execute(stmt)
    img = res.scalar_one_or_none()
    if not img:
        raise NotFoundError("Image not found.")

    await storage.delete(img.storage_key)
    if img.thumbnail_key:
        await storage.delete(img.thumbnail_key)

    await db.delete(img)
    await db.commit()
    return {"status": "deleted", "image_id": image_id}


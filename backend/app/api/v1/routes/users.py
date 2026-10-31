from typing import Optional
from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from app.db.session import get_db
from app.core.security import get_current_user_id, get_current_user_claims
from app.models.user import User
from app.models.report import FitReport
from app.models.image import ImageUpload
from app.models.analysis import AnalysisJob
from app.schemas.user import UserProfileResponse, UserPreferencesUpdate
from app.services.storage_service import get_storage_provider, StorageProvider
from app.services.report_service import ReportService
from app.services.media_service import MediaService
import json

router = APIRouter(prefix="/me", tags=["user"])

@router.get("", response_model=UserProfileResponse)
async def get_profile(
    user_id: str = Depends(get_current_user_id),
    claims: Optional[dict] = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        email = claims.get("email") if claims else None
        meta = claims.get("user_metadata", {}) if claims else {}
        username = meta.get("full_name") or meta.get("name") or (email.split("@")[0] if email else "Fashion Friend")
        user = User(id=user_id, username=username, email=email)
        db.add(user)
        await db.commit()
        await db.refresh(user)
    elif claims and not user.email and claims.get("email"):
        user.email = claims.get("email")
        await db.commit()
        await db.refresh(user)

    count_stmt = select(func.count(FitReport.id)).where(FitReport.user_id == user_id)
    count_res = await db.execute(count_stmt)
    total_fits = count_res.scalar_one() or 0

    return UserProfileResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        default_occasion=user.default_occasion,
        preferred_style=user.preferred_style,
        feedback_tone=user.feedback_tone,
        privacy_mode=user.privacy_mode,
        total_fits=total_fits,
        created_at=user.created_at
    )

@router.patch("", response_model=UserProfileResponse)
async def update_profile(
    req: UserPreferencesUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        user = User(id=user_id)
        db.add(user)

    if req.username is not None:
        user.username = req.username.strip()
    if req.default_occasion is not None:
        user.default_occasion = req.default_occasion
    if req.preferred_style is not None:
        user.preferred_style = req.preferred_style
    if req.feedback_tone is not None:
        user.feedback_tone = req.feedback_tone
    if req.privacy_mode is not None:
        user.privacy_mode = req.privacy_mode

    await db.commit()
    await db.refresh(user)

    count_stmt = select(func.count(FitReport.id)).where(FitReport.user_id == user_id)
    count_res = await db.execute(count_stmt)
    total_fits = count_res.scalar_one() or 0

    return UserProfileResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        default_occasion=user.default_occasion,
        preferred_style=user.preferred_style,
        feedback_tone=user.feedback_tone,
        privacy_mode=user.privacy_mode,
        total_fits=total_fits,
        created_at=user.created_at
    )

@router.post("/export")
async def export_user_data(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
    storage: StorageProvider = Depends(get_storage_provider)
):
    report_service = ReportService(db, storage)
    reports_paged = await report_service.list_reports(user_id=user_id, limit=500)
    
    export_payload = {
        "user_id": user_id,
        "export_date": "2026-10-28",
        "total_reports": reports_paged.total,
        "reports": [r.model_dump(mode="json") for r in reports_paged.items]
    }
    
    return Response(
        content=json.dumps(export_payload, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=fitcheck-archive.json"}
    )

@router.delete("")
async def wipe_user_data(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
    storage: StorageProvider = Depends(get_storage_provider)
):
    media_service = MediaService(db, storage)
    # Find all images and delete storage files
    img_stmt = select(ImageUpload).where(ImageUpload.user_id == user_id)
    img_res = await db.execute(img_stmt)
    for img in img_res.scalars().all():
        await media_service.delete_image_files(img)

    # Delete from DB
    await db.execute(delete(FitReport).where(FitReport.user_id == user_id))
    await db.execute(delete(AnalysisJob).where(AnalysisJob.user_id == user_id))
    await db.execute(delete(ImageUpload).where(ImageUpload.user_id == user_id))
    await db.execute(delete(User).where(User.id == user_id))
    await db.commit()

    return {"status": "success", "message": "All user data, images, and reports have been permanently removed."}


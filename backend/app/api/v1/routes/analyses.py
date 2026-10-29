from fastapi import APIRouter, Depends, Header
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.security import get_current_user_id
from app.schemas.analysis import AnalysisCreateRequest, AnalysisStatusResponse
from app.services.storage_service import get_storage_provider, StorageProvider
from app.services.analysis_service import AnalysisService

router = APIRouter(prefix="/analyses", tags=["analyses"])

@router.post("", response_model=AnalysisStatusResponse, status_code=201)
async def create_analysis(
    req: AnalysisCreateRequest,
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
    storage: StorageProvider = Depends(get_storage_provider)
):
    if idempotency_key:
        req.idempotency_key = idempotency_key

    service = AnalysisService(db, storage)
    return await service.create_and_run_analysis(user_id, req)

@router.get("/{analysis_id}", response_model=AnalysisStatusResponse)
async def get_analysis(
    analysis_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
    storage: StorageProvider = Depends(get_storage_provider)
):
    service = AnalysisService(db, storage)
    return await service.get_analysis_status(user_id, analysis_id)


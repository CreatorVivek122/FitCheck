import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.models.image import ImageUpload
from app.models.analysis import AnalysisJob
from app.models.report import FitReport
from app.schemas.analysis import AnalysisCreateRequest, AnalysisStatusResponse
from app.schemas.report import FitReportResponse, CategoryScoreDetail, ColorPaletteItem
from app.services.storage_service import StorageProvider
from app.services.scoring_service import ScoringService
from app.services.safety_service import SafetyService
from app.ai import get_vision_provider
from app.core.errors import NotFoundError, AIInferenceError
from app.core.config import settings

class AnalysisService:
    def __init__(self, db: AsyncSession, storage: StorageProvider):
        self.db = db
        self.storage = storage
        self.scoring_service = ScoringService()
        self.safety_service = SafetyService()
        self.vision_provider = get_vision_provider()

    async def _ensure_user_exists(self, user_id: str):
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            user = User(id=user_id, username="Fashion Friend")
            self.db.add(user)
            await self.db.flush()

    async def create_and_run_analysis(
        self,
        user_id: str,
        req: AnalysisCreateRequest
    ) -> AnalysisStatusResponse:
        await self._ensure_user_exists(user_id)

        # 1. Check idempotency if key provided
        if req.idempotency_key:
            stmt = select(AnalysisJob).where(
                AnalysisJob.user_id == user_id,
                AnalysisJob.idempotency_key == req.idempotency_key
            )
            res = await self.db.execute(stmt)
            existing = res.scalar_one_or_none()
            if existing:
                return await self.get_analysis_status(user_id, existing.id)

        # 2. Verify image belongs to user and is active
        img_stmt = select(ImageUpload).where(
            ImageUpload.id == req.image_id,
            ImageUpload.user_id == user_id,
            ImageUpload.status == "active"
        )
        img_res = await self.db.execute(img_stmt)
        image = img_res.scalar_one_or_none()
        if not image:
            raise NotFoundError("Uploaded image not found or unauthorized.")

        # 3. Create job record
        job = AnalysisJob(
            user_id=user_id,
            image_id=image.id,
            occasion=req.occasion,
            target_style=req.target_style,
            feedback_tone=req.feedback_tone,
            status="processing",
            idempotency_key=req.idempotency_key,
            attempt_count=1,
            rubric_version=ScoringService.RUBRIC_VERSION
        )
        self.db.add(job)
        await self.db.flush()

        # 4. Fetch image bytes from storage
        image_bytes = await self.storage.get_bytes(image.storage_key)
        if not image_bytes:
            job.status = "failed"
            job.error_code = "IMAGE_NOT_FOUND_IN_STORAGE"
            job.error_message = "Stored image bytes could not be retrieved."
            await self.db.commit()
            raise AIInferenceError("Could not retrieve image data for analysis.")

        try:
            # 5. Run vision analysis
            raw_result = await self.vision_provider.analyze(
                image_bytes=image_bytes,
                occasion=req.occasion or "Everyday / Casual",
                target_style=req.target_style or "Let AI decide",
                tone=req.feedback_tone or "Honest and direct"
            )

            # 6. Safety check & sanitation
            what_works = self.safety_service.validate_report_content(raw_result.what_works)
            improvements = self.safety_service.validate_report_content(raw_result.improvements)
            styling_ideas = self.safety_service.validate_report_content(raw_result.styling_ideas)
            limitations = self.safety_service.validate_report_content(raw_result.limitations)

            # 7. Deterministic overall score calculation
            overall_score, overall_conf = self.scoring_service.compute_overall_score(
                raw_result.category_scores
            )

            # Convert scores to serializable dict
            scores_dict = {
                k: v.model_dump() for k, v in raw_result.category_scores.items()
            }
            palette_dict = [p.model_dump() for p in raw_result.extracted_palette]

            # 8. Create FitReport
            report = FitReport(
                analysis_id=job.id,
                user_id=user_id,
                image_id=image.id,
                style_title=raw_result.style_title,
                style_description=raw_result.style_description,
                overall_score=overall_score,
                overall_confidence=overall_conf,
                scores=scores_dict,
                what_works=what_works,
                improvements=improvements,
                styling_ideas=styling_ideas,
                limitations=limitations,
                extracted_palette=palette_dict,
                rubric_version=ScoringService.RUBRIC_VERSION,
                model_id=raw_result.model_id
            )
            self.db.add(report)

            job.status = "succeeded"
            job.model_provider = raw_result.model_id
            await self.db.commit()

            return await self.get_analysis_status(user_id, job.id)

        except Exception as e:
            job.status = "failed"
            job.error_code = "ANALYSIS_EXECUTION_ERROR"
            job.error_message = str(e)
            await self.db.commit()
            raise AIInferenceError(f"Analysis failed: {str(e)}")

    async def get_analysis_status(self, user_id: str, analysis_id: str) -> AnalysisStatusResponse:
        stmt = select(AnalysisJob).where(
            AnalysisJob.id == analysis_id,
            AnalysisJob.user_id == user_id
        )
        res = await self.db.execute(stmt)
        job = res.scalar_one_or_none()
        if not job:
            raise NotFoundError("Analysis job not found.")

        # Check for report
        rep_stmt = select(FitReport).where(FitReport.analysis_id == job.id)
        rep_res = await self.db.execute(rep_stmt)
        report_model = rep_res.scalar_one_or_none()

        report_dto = None
        if report_model:
            cat_scores = {
                k: CategoryScoreDetail(**v) for k, v in report_model.scores.items()
            }
            palette_items = [
                ColorPaletteItem(**p) for p in (report_model.extracted_palette or [])
            ]
            report_dto = FitReportResponse(
                id=report_model.id,
                analysis_id=report_model.analysis_id,
                image_id=report_model.image_id,
                style_title=report_model.style_title,
                style_description=report_model.style_description,
                overall_score=report_model.overall_score,
                overall_confidence=report_model.overall_confidence,
                scores=cat_scores,
                what_works=report_model.what_works,
                improvements=report_model.improvements,
                styling_ideas=report_model.styling_ideas,
                limitations=report_model.limitations,
                extracted_palette=palette_items,
                user_note=report_model.user_note,
                is_favorite=bool(report_model.is_favorite),
                rubric_version=report_model.rubric_version,
                model_id=report_model.model_id,
                created_at=report_model.created_at,
                image_url=(f"{settings.API_BASE_URL.rstrip('/')}/api/v1/uploads/{report_model.image_id}/file" if settings.API_BASE_URL else f"/api/v1/uploads/{report_model.image_id}/file") if report_model.image_id else None
            )

        return AnalysisStatusResponse(
            id=job.id,
            user_id=job.user_id,
            image_id=job.image_id,
            status=job.status,
            occasion=job.occasion,
            target_style=job.target_style,
            feedback_tone=job.feedback_tone,
            attempt_count=job.attempt_count,
            error_code=job.error_code,
            error_message=job.error_message,
            model_provider=job.model_provider,
            rubric_version=job.rubric_version,
            created_at=job.created_at,
            updated_at=job.updated_at,
            report=report_dto
        )


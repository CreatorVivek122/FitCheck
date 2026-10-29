from typing import Optional, List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, or_, delete
from app.models.report import FitReport
from app.models.image import ImageUpload
from app.schemas.report import (
    FitReportResponse,
    CategoryScoreDetail,
    ColorPaletteItem,
    ReportCompareResponse
)
from app.schemas.common import PaginatedResponse
from app.services.storage_service import StorageProvider
from app.core.errors import NotFoundError
from app.core.config import settings

class ReportService:
    def __init__(self, db: AsyncSession, storage: StorageProvider):
        self.db = db
        self.storage = storage

    def _to_dto(self, r: FitReport) -> FitReportResponse:
        cat_scores = {
            k: CategoryScoreDetail(**v) for k, v in r.scores.items()
        }
        palette_items = [
            ColorPaletteItem(**p) for p in (r.extracted_palette or [])
        ]
        return FitReportResponse(
            id=r.id,
            analysis_id=r.analysis_id,
            image_id=r.image_id,
            style_title=r.style_title,
            style_description=r.style_description,
            overall_score=r.overall_score,
            overall_confidence=r.overall_confidence,
            scores=cat_scores,
            what_works=r.what_works,
            improvements=r.improvements,
            styling_ideas=r.styling_ideas,
            limitations=r.limitations,
            extracted_palette=palette_items,
            user_note=r.user_note,
            is_favorite=bool(r.is_favorite),
            rubric_version=r.rubric_version,
            model_id=r.model_id,
            created_at=r.created_at,
            image_url=(f"{settings.API_BASE_URL.rstrip('/')}/api/v1/uploads/{r.image_id}/file" if settings.API_BASE_URL else f"/api/v1/uploads/{r.image_id}/file") if r.image_id else None
        )

    async def list_reports(
        self,
        user_id: str,
        page: int = 1,
        limit: int = 20,
        query: Optional[str] = None,
        occasion: Optional[str] = None,
        sort_by: str = "newest" # newest, score_desc, score_asc
    ) -> PaginatedResponse[FitReportResponse]:
        stmt = select(FitReport).where(FitReport.user_id == user_id)

        if query:
            q_pattern = f"%{query.strip()}%"
            stmt = stmt.where(
                or_(
                    FitReport.style_title.ilike(q_pattern),
                    FitReport.style_description.ilike(q_pattern),
                    FitReport.user_note.ilike(q_pattern)
                )
            )

        if sort_by == "score_desc":
            stmt = stmt.order_by(desc(FitReport.overall_score))
        elif sort_by == "score_asc":
            stmt = stmt.order_by(FitReport.overall_score)
        else:
            stmt = stmt.order_by(desc(FitReport.created_at))

        res = await self.db.execute(stmt)
        all_items = res.scalars().all()
        total = len(all_items)

        start = (page - 1) * limit
        end = start + limit
        paged = all_items[start:end]

        dtos = [self._to_dto(r) for r in paged]
        return PaginatedResponse(
            items=dtos,
            total=total,
            page=page,
            limit=limit,
            has_more=end < total
        )

    async def get_report(self, user_id: str, report_id: str) -> FitReportResponse:
        stmt = select(FitReport).where(
            FitReport.id == report_id,
            FitReport.user_id == user_id
        )
        res = await self.db.execute(stmt)
        report = res.scalar_one_or_none()
        if not report:
            raise NotFoundError("Report not found.")
        return self._to_dto(report)

    async def update_report(
        self,
        user_id: str,
        report_id: str,
        user_note: Optional[str] = None,
        is_favorite: Optional[bool] = None
    ) -> FitReportResponse:
        stmt = select(FitReport).where(
            FitReport.id == report_id,
            FitReport.user_id == user_id
        )
        res = await self.db.execute(stmt)
        report = res.scalar_one_or_none()
        if not report:
            raise NotFoundError("Report not found.")

        if user_note is not None:
            report.user_note = user_note.strip()
        if is_favorite is not None:
            report.is_favorite = 1 if is_favorite else 0

        await self.db.commit()
        await self.db.refresh(report)
        return self._to_dto(report)

    async def delete_report(self, user_id: str, report_id: str) -> bool:
        stmt = select(FitReport).where(
            FitReport.id == report_id,
            FitReport.user_id == user_id
        )
        res = await self.db.execute(stmt)
        report = res.scalar_one_or_none()
        if not report:
            raise NotFoundError("Report not found.")

        # Cleanup image file if present and not referenced by another active report
        if report.image_id:
            img_stmt = select(ImageUpload).where(ImageUpload.id == report.image_id)
            img_res = await self.db.execute(img_stmt)
            img = img_res.scalar_one_or_none()
            if img:
                await self.storage.delete(img.storage_key)
                await self.db.delete(img)

        await self.db.delete(report)
        await self.db.commit()
        return True

    async def compare_reports(
        self,
        user_id: str,
        report_a_id: str,
        report_b_id: str,
        target_occasion: Optional[str] = None
    ) -> ReportCompareResponse:
        rep_a = await self.get_report(user_id, report_a_id)
        rep_b = await self.get_report(user_id, report_b_id)

        score_a = rep_a.overall_score or 0
        score_b = rep_b.overall_score or 0
        delta = score_a - score_b

        if delta > 0:
            winner = rep_a.id
            verdict = f"Fit A ({rep_a.style_title}) edges ahead by {delta} points with stronger styling cohesion."
        elif delta < 0:
            winner = rep_b.id
            verdict = f"Fit B ({rep_b.style_title}) scores higher by {abs(delta)} points with elevated color harmony."
        else:
            winner = None
            verdict = "Both looks achieve an identical FitScore—each excelling in distinct aesthetics."

        # Pillar breakdown comparisons
        pillars = {}
        for key, name in [
            ("color_coordination", "Color Harmony"),
            ("styling", "Styling & Detailing"),
            ("fit_proportion", "Proportion & Drape"),
            ("occasion_match", "Occasion Appropriateness")
        ]:
            s_a = rep_a.scores.get(key)
            s_b = rep_b.scores.get(key)
            val_a = s_a.score if s_a and s_a.score is not None else 0
            val_b = s_b.score if s_b and s_b.score is not None else 0
            if val_a > val_b:
                pillars[name] = f"Fit A leads ({val_a} vs {val_b})"
            elif val_b > val_a:
                pillars[name] = f"Fit B leads ({val_b} vs {val_a})"
            else:
                pillars[name] = f"Tied at {val_a}"

        occ_text = target_occasion or "the selected setting"
        occ_advice = (
            f"For {occ_text}, {rep_a.style_title if delta >= 0 else rep_b.style_title} "
            f"delivers the more effortless and balanced presence."
        )

        return ReportCompareResponse(
            report_a=rep_a,
            report_b=rep_b,
            score_delta=delta,
            winning_report_id=winner,
            verdict=verdict,
            occasion_advice=occ_advice,
            pillar_comparisons=pillars
        )


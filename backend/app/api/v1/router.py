from fastapi import APIRouter
from app.api.v1.routes.health import router as health_router
from app.api.v1.routes.uploads import router as uploads_router
from app.api.v1.routes.analyses import router as analyses_router
from app.api.v1.routes.reports import router as reports_router
from app.api.v1.routes.users import router as users_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(health_router)
api_router.include_router(uploads_router)
api_router.include_router(analyses_router)
api_router.include_router(reports_router)
api_router.include_router(users_router)


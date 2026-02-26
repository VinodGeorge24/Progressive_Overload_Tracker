"""
API v1 router.

Aggregates all v1 subrouters. No prefix here — main.py adds prefix="/api/v1".
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth

router = APIRouter()
router.include_router(auth.router)
# router.include_router(exercises.router, prefix="/exercises", tags=["exercises"])
# router.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
# router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
# router.include_router(templates.router, prefix="/templates", tags=["templates"])

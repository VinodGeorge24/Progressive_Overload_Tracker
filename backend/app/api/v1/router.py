"""
API v1 router.

Aggregates all v1 subrouters. No prefix here — main.py adds prefix="/api/v1".
"""

from fastapi import APIRouter

# TODO: Import and include routers as they are created
# from app.api.v1.endpoints import auth, exercises, sessions, analytics, templates
# router.include_router(auth.router, prefix="/auth", tags=["authentication"])
# router.include_router(exercises.router, prefix="/exercises", tags=["exercises"])
# router.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
# router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
# router.include_router(templates.router, prefix="/templates", tags=["templates"])

router = APIRouter()

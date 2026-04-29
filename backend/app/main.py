"""
FastAPI application entry point.

This module initializes the FastAPI application, configures middleware,
and registers all route handlers.
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import router as v1_router
from app.core.config import settings

logger = logging.getLogger(__name__)

# Warn if production and SECRET_KEY is still the default placeholder
if settings.ENVIRONMENT.lower() == "production" and settings.SECRET_KEY == "change-this-secret-key-in-production":
    logger.warning(
        "SECRET_KEY should be changed in production. Set a strong random value in your environment."
    )

app = FastAPI(
    title="Progressive Overload Tracker API",
    description="Backend API for tracking workouts and progressive overload",
    version="0.1.0",
)

# Configure CORS
# In development, allow any origin to avoid port mismatch (e.g. Vite on 5174).
# allow_credentials=False is fine: we use Bearer token in the Authorization header, not cookies.
_origins: list[str] = list(settings.CORS_ORIGINS)
if settings.ENVIRONMENT.lower() == "development":
    _origins = ["*"]  # Always allow any origin in dev so CORS never blocks localhost:5174, etc.
_credentials = "*" not in _origins
logger.debug("CORS: env=%s allow_origins=%s allow_credentials=%s", settings.ENVIRONMENT, _origins, _credentials)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=_credentials,  # Must be False when using "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(v1_router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint for health check."""
    return {"message": "Progressive Overload Tracker API", "version": "0.1.0"}


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


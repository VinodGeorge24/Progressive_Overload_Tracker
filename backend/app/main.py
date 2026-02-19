"""
FastAPI application entry point.

This module initializes the FastAPI application, configures middleware,
and registers all route handlers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

app = FastAPI(
    title="Progressive Overload Tracker API",
    description="Backend API for tracking workouts and progressive overload",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route handlers (Pattern B: prefix in main.py)
from app.api.v1.router import router as v1_router

app.include_router(v1_router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint for health check."""
    return {"message": "Progressive Overload Tracker API", "version": "0.1.0"}


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


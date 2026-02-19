"""
Application configuration.

Loads settings from environment variables with sensible defaults.
See plan/coding_plan.md Slice 0 and root .env.example (or backend/.env.example).
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    Required for Slice 0: DATABASE_URL, SECRET_KEY, CORS_ORIGINS.
    """

    # Database — use PostgreSQL URL when using infra/docker-compose (Slice 0)
    DATABASE_URL: str = "sqlite:///./workout_tracker.db"

    # Security — override SECRET_KEY in production (see API_CONTRACT, PRD)
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS — allow frontend dev server origins (Vite default 5173)
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Application
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # API
    API_V1_PREFIX: str = "/api/v1"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()


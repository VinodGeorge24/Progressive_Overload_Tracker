"""
export.py

Pydantic schema for the user data export payload.
"""

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.auth import UserOut
from app.schemas.exercises import ExerciseOut
from app.schemas.sessions import SessionOut
from app.schemas.templates import WorkoutTemplateOut


class ExportOut(BaseModel):
    """Full user-owned data export payload."""

    exported_at: datetime
    user: UserOut
    exercises: list[ExerciseOut] = Field(default_factory=list)
    sessions: list[SessionOut] = Field(default_factory=list)
    templates: list[WorkoutTemplateOut] = Field(default_factory=list)

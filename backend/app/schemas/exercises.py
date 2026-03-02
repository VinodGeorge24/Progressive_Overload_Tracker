"""
exercises.py

Pydantic schemas for Exercise CRUD.
"""

from datetime import datetime

from pydantic import BaseModel, Field


class ExerciseBase(BaseModel):
    """Shared fields for Exercise create/update."""

    name: str = Field(..., min_length=1, max_length=255)
    muscle_group: str | None = Field(default=None, max_length=255)


class ExerciseCreate(ExerciseBase):
    """Request body for POST /exercises."""

    pass


class ExerciseUpdate(BaseModel):
    """Request body for PUT /exercises/{exercise_id}."""

    name: str | None = Field(default=None, min_length=1, max_length=255)
    muscle_group: str | None = Field(default=None, max_length=255)


class ExerciseOut(BaseModel):
    """Exercise returned in API responses."""

    id: int
    name: str
    muscle_group: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}



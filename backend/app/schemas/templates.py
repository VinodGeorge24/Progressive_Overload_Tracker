"""
templates.py

Pydantic schemas for WorkoutTemplate CRUD and template-apply prefill payloads.
"""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import List

from pydantic import BaseModel, Field, field_validator


class TemplateExerciseIn(BaseModel):
    """Exercise row inside a template request."""

    exercise_id: int = Field(..., gt=0)
    target_sets: int = Field(..., gt=0)
    target_reps: int = Field(..., gt=0)


class TemplateExerciseOut(BaseModel):
    """Exercise row as returned in template responses."""

    exercise_id: int
    exercise_name: str
    target_sets: int
    target_reps: int


class TemplateCreate(BaseModel):
    """Request body for POST /templates."""

    name: str = Field(..., min_length=1, max_length=255)
    exercises: List[TemplateExerciseIn] = Field(default_factory=list)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, a_value: str) -> str:
        """Trim the template name and reject blank values."""
        name = a_value.strip()
        if not name:
            raise ValueError("Template name is required")
        return name


class TemplateUpdate(BaseModel):
    """Request body for PUT /templates/{template_id}."""

    name: str | None = Field(default=None, min_length=1, max_length=255)
    exercises: List[TemplateExerciseIn] | None = None

    @field_validator("name")
    @classmethod
    def normalize_name(cls, a_value: str | None) -> str | None:
        """Trim the template name and reject blank values."""
        if a_value is None:
            return None
        name = a_value.strip()
        if not name:
            raise ValueError("Template name is required")
        return name


class WorkoutTemplateOut(BaseModel):
    """Template as returned by list/get/create/update."""

    id: int
    name: str
    created_at: datetime | None = None
    updated_at: datetime | None = None
    exercises: List[TemplateExerciseOut] = Field(default_factory=list)


class TemplateApplySetOut(BaseModel):
    """One placeholder set returned when applying a template."""

    set_number: int
    reps: int
    weight: Decimal = Decimal("0")


class TemplateApplyExerciseOut(BaseModel):
    """Exercise with placeholder sets returned by the apply endpoint."""

    exercise_id: int
    exercise_name: str
    sets: List[TemplateApplySetOut] = Field(default_factory=list)
    notes: str | None = None


class TemplateApplyOut(BaseModel):
    """Prefill payload returned by GET /templates/{template_id}/apply."""

    template_id: int
    template_name: str
    exercises: List[TemplateApplyExerciseOut] = Field(default_factory=list)

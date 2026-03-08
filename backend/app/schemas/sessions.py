"""
sessions.py

Pydantic schemas for WorkoutSession CRUD and nested exercises/sets.
Per DATA_MODEL: reps > 0, weight >= 0, set_number > 0. Exercise order = array index.
"""

from __future__ import annotations

from datetime import date as date_type, datetime
from decimal import Decimal
from typing import List

from pydantic import BaseModel, Field


# --- Set ---


class SetIn(BaseModel):
    """One set in a session exercise (create/update)."""

    set_number: int = Field(..., gt=0, description="Set number within the exercise (1, 2, ...)")
    reps: int = Field(..., gt=0, description="Repetitions in this set")
    weight: Decimal = Field(..., ge=0, description="Weight in lbs")
    rest_seconds: int | None = Field(default=None, ge=0)
    notes: str | None = None


class SetOut(BaseModel):
    """Set as returned in API responses."""

    id: int
    set_number: int
    reps: int
    weight: Decimal
    rest_seconds: int | None = None
    notes: str | None = None

    model_config = {"from_attributes": True}


# --- Workout exercise (nested in session) ---


class WorkoutExerciseIn(BaseModel):
    """Exercise + sets in a session (create/update). Order = array index."""

    exercise_id: int = Field(..., gt=0)
    sets: List[SetIn] = Field(default_factory=list)
    notes: str | None = None


class WorkoutExerciseOut(BaseModel):
    """Exercise with sets as returned in session responses."""

    exercise_id: int
    exercise_name: str
    sets: List[SetOut] = Field(default_factory=list)
    notes: str | None = None

    model_config = {"from_attributes": True}


# --- Session ---


class SessionCreate(BaseModel):
    """Request body for POST /sessions."""

    date: date_type
    notes: str | None = None
    exercises: List[WorkoutExerciseIn] = Field(default_factory=list)


class SessionUpdate(BaseModel):
    """Request body for PUT /sessions/{session_id}."""

    date: date_type | None = None
    notes: str | None = None
    exercises: List[WorkoutExerciseIn] | None = None


class SessionOut(BaseModel):
    """Session as returned in get/list (with nested exercises and sets)."""

    id: int
    date: date_type
    notes: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    exercises: List[WorkoutExerciseOut] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class SessionListResponse(BaseModel):
    """Response for GET /sessions: sessions and total count."""

    sessions: List[SessionOut] = Field(default_factory=list)
    total: int = 0


class LastSetPoint(BaseModel):
    """One set from a previous session (for pre-fill)."""

    set_number: int
    weight: Decimal
    reps: int


class LastSetsOut(BaseModel):
    """Last time this exercise was logged: date and sets (for pre-fill)."""

    date: date_type
    sets: List[LastSetPoint] = Field(default_factory=list)

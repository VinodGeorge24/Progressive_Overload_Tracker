"""
analytics.py

Pydantic schemas for exercise progress analytics and chart filters.
"""

from __future__ import annotations

from datetime import date as date_type
from typing import Literal

from pydantic import BaseModel, Field


ProgressMetric = Literal["weight", "reps", "volume"]


class ProgressPoint(BaseModel):
    """One recorded point for an exercise set on a given date."""

    date: date_type
    weight: float = Field(..., ge=0)
    reps: int = Field(..., ge=0)
    volume: float = Field(..., ge=0)


class ProgressSeries(BaseModel):
    """Progress points for a single set number across workout dates."""

    set_number: int = Field(..., gt=0)
    points: list[ProgressPoint] = Field(default_factory=list)


class ExerciseProgressOut(BaseModel):
    """Analytics response for one exercise with one or more set-number series."""

    exercise_id: int
    exercise_name: str
    series: list[ProgressSeries] = Field(default_factory=list)

"""
Database models package.

Import all models here so they can be discovered by Alembic.
"""

from app.models.user import User  # noqa: F401
from app.models.exercise import Exercise  # noqa: F401
from app.models.template_exercise import TemplateExercise  # noqa: F401
from app.models.workout_session import WorkoutSession  # noqa: F401
from app.models.workout_template import WorkoutTemplate  # noqa: F401
from app.models.workout_exercise import WorkoutExercise  # noqa: F401
from app.models.set import Set  # noqa: F401

__all__ = [
    "User",
    "Exercise",
    "WorkoutSession",
    "WorkoutExercise",
    "Set",
    "WorkoutTemplate",
    "TemplateExercise",
]


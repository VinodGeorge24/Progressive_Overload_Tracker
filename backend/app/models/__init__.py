"""
Database models package.

Import all models here so they can be discovered by Alembic.
"""

from app.models.user import User  # noqa: F401
from app.models.exercise import Exercise  # noqa: F401
# from app.models.workout_session import WorkoutSession
# from app.models.workout_exercise import WorkoutExercise
# from app.models.set import Set
# from app.models.workout_template import WorkoutTemplate
# from app.models.template_exercise import TemplateExercise

__all__ = ["User", "Exercise"]


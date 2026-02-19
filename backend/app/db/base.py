"""
Base model registry for SQLAlchemy and Alembic.

This module provides the declarative base that all models inherit from.
Alembic uses this to discover models for migrations (plan/coding_plan.md Slice 0;
see DATA_MODEL.md for schema). All app models must be imported below so
Base.metadata includes them for autogenerate.
"""

from sqlalchemy.orm import declarative_base

# Single declarative base for all models; Alembic env.py uses Base.metadata
Base = declarative_base()

# Import all models here so Alembic can discover them (uncomment as each is added)
# from app.models.user import User
# from app.models.exercise import Exercise
# from app.models.workout_session import WorkoutSession
# from app.models.workout_exercise import WorkoutExercise
# from app.models.set import Set
# from app.models.workout_template import WorkoutTemplate
# from app.models.template_exercise import TemplateExercise


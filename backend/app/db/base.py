"""
Base model registry for SQLAlchemy and Alembic.

This module provides the declarative base that all models inherit from.
Alembic uses this to discover models for migrations.
"""

from sqlalchemy.orm import declarative_base

# Create declarative base
Base = declarative_base()

# Import all models here so Alembic can discover them
# TODO: Uncomment as models are created
# from app.models.user import User
# from app.models.exercise import Exercise
# from app.models.workout_session import WorkoutSession
# from app.models.workout_exercise import WorkoutExercise
# from app.models.set import Set
# from app.models.workout_template import WorkoutTemplate
# from app.models.template_exercise import TemplateExercise


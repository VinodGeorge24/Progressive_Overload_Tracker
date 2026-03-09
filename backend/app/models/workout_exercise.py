"""
workout_exercise.py

Defines the WorkoutExercise SQLAlchemy model (session–exercise junction).

Per DATA_MODEL.md: id, session_id (FK), exercise_id (FK), order, notes (optional).
"""

from typing import List

from sqlalchemy import ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class WorkoutExercise(Base):
    """
    Junction: exercise performed in a workout session.

    Table: workout_exercises. order = display order within session.
    """

    __tablename__ = "workout_exercises"
    __table_args__ = {"sqlite_autoincrement": True}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("workout_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    exercise_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("exercises.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    session: Mapped["WorkoutSession"] = relationship(
        "WorkoutSession",
        back_populates="workout_exercises",
        passive_deletes=True,
    )
    exercise: Mapped["Exercise"] = relationship(
        "Exercise",
        back_populates="workout_exercises",
        passive_deletes=True,
    )
    sets: Mapped[List["Set"]] = relationship(
        "Set",
        back_populates="workout_exercise",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

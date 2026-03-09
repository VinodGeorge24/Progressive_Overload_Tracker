"""
exercise.py

Defines the Exercise SQLAlchemy model.

Per DATA_MODEL.md: id, user_id (FK), name, muscle_group, created_at, updated_at.
"""

from datetime import datetime
from typing import TYPE_CHECKING, List

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.workout_exercise import WorkoutExercise


class Exercise(Base):
    """
    User-owned exercise that can appear in workout sessions and templates.

    Table: exercises.
    """

    __tablename__ = "exercises"
    __table_args__ = {"sqlite_autoincrement": True}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    muscle_group: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # Relationship to User
    user: Mapped["User"] = relationship(
        "User",
        back_populates="exercises",
        passive_deletes=True,
    )
    # Sessions/templates that include this exercise (optional reverse ref)
    workout_exercises: Mapped[List["WorkoutExercise"]] = relationship(
        "WorkoutExercise",
        back_populates="exercise",
        passive_deletes=True,
    )


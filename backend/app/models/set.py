"""
set.py

Defines the Set SQLAlchemy model (one set of an exercise within a session).

Per DATA_MODEL.md: id, workout_exercise_id (FK), set_number, reps, weight (Decimal),
rest_seconds (optional), notes (optional). reps > 0, weight >= 0, set_number > 0.
"""

from decimal import Decimal
from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, Integer, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.workout_exercise import WorkoutExercise


class Set(Base):
    """
    One set within a workout exercise (set_number, weight, reps).

    Table: sets. weight in lbs; reps and set_number positive.
    """

    __tablename__ = "sets"
    __table_args__ = {"sqlite_autoincrement": True}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    workout_exercise_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("workout_exercises.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    set_number: Mapped[int] = mapped_column(Integer, nullable=False)
    reps: Mapped[int] = mapped_column(Integer, nullable=False)
    weight: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    rest_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    workout_exercise: Mapped["WorkoutExercise"] = relationship(
        "WorkoutExercise",
        back_populates="sets",
        passive_deletes=True,
    )

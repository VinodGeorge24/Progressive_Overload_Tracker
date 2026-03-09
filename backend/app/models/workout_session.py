"""
workout_session.py

Defines the WorkoutSession SQLAlchemy model.

Per DATA_MODEL.md: id, user_id (FK), date, notes (optional), created_at, updated_at.
Unique (user_id, date). One session per user per calendar day.
"""

from datetime import date, datetime
from typing import List

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class WorkoutSession(Base):
    """
    One workout session per user per calendar day.

    Table: workout_sessions. Unique on (user_id, date).
    """

    __tablename__ = "workout_sessions"
    __table_args__ = (
        UniqueConstraint("user_id", "date", name="uq_workout_sessions_user_date"),
        {"sqlite_autoincrement": True},
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    date: Mapped[date] = mapped_column(Date, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="workout_sessions",
        passive_deletes=True,
    )
    workout_exercises: Mapped[List["WorkoutExercise"]] = relationship(
        "WorkoutExercise",
        back_populates="session",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

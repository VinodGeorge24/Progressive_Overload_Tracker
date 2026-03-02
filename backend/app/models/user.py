"""
user.py

Defines the User SQLAlchemy model for authentication and profile.
Per DATA_MODEL.md: id, email (unique), username (unique), hashed_password,
created_at, updated_at, is_active.
"""

from datetime import datetime

from typing import List

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    """
    User account: authentication and profile.

    Table: users. Login by email; username is display-only.
    """

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    username: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Exercises owned by this user
    exercises: Mapped[List["Exercise"]] = relationship(
        "Exercise",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

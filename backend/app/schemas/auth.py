"""
auth.py

Pydantic schemas for authentication: register, login, token, user out.
"""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class RegisterIn(BaseModel):
    """Request body for POST /auth/register."""

    email: EmailStr
    username: str = Field(..., min_length=1, max_length=255)
    password: str = Field(..., min_length=8, max_length=255)


class LoginIn(BaseModel):
    """Request body for POST /auth/login. Login by email only."""

    email: EmailStr
    password: str = Field(..., min_length=1)


class Token(BaseModel):
    """JWT token response."""

    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    """Public user fields returned in API responses."""

    id: int
    email: str
    username: str
    is_active: bool = True
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class TokenWithUser(BaseModel):
    """Login response: token plus current user."""

    access_token: str
    token_type: str = "bearer"
    user: UserOut

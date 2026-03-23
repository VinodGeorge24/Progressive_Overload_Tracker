"""
auth.py

Pydantic schemas for authentication: register, login, token, user out.
"""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, model_validator


class RegisterIn(BaseModel):
    """Request body for POST /auth/register."""

    email: EmailStr
    username: str = Field(..., min_length=1, max_length=255)
    password: str = Field(..., min_length=8, max_length=255)


class LoginIn(BaseModel):
    """Request body for POST /auth/login. Login by email only."""

    email: EmailStr
    password: str = Field(..., min_length=1)


class ProfileUpdateIn(BaseModel):
    """Request body for PATCH /auth/me."""

    username: str | None = Field(default=None, min_length=1, max_length=255)
    current_password: str | None = Field(default=None, min_length=1, max_length=255)
    new_password: str | None = Field(default=None, min_length=8, max_length=255)

    @model_validator(mode="after")
    def validate_profile_update(self) -> "ProfileUpdateIn":
        """Require at least one change and keep password updates explicit."""
        if self.username is None and self.new_password is None:
            raise ValueError("At least one profile field must be provided")
        if self.new_password is not None and not self.current_password:
            raise ValueError("Current password is required to set a new password")
        if self.current_password is not None and self.new_password is None:
            raise ValueError("New password is required when current password is provided")
        return self


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

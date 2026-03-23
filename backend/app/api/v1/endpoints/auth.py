"""
auth.py

Endpoints: POST /register, POST /login, POST /logout, GET /me, PATCH /me.
Slice 1 Auth. Logout returns 200; client discards token (no server-side invalidation).
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core import security
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginIn, ProfileUpdateIn, RegisterIn, TokenWithUser, UserOut
from app.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(
    a_body: RegisterIn,
    a_db: Annotated[Session, Depends(get_db)],
):
    """Create a new user. Returns user (no token); client should then call login."""
    existing = a_db.query(User).filter(
        (User.email == a_body.email) | (User.username == a_body.username)
    ).first()
    if existing:
        if existing.email == a_body.email:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")
    user = auth_service.register_user(a_db, a_body)
    return auth_service.user_to_out(user)


@router.post("/login", response_model=TokenWithUser)
def login(
    a_body: LoginIn,
    a_db: Annotated[Session, Depends(get_db)],
):
    """Authenticate by email and password; return JWT and user. Login by email only."""
    user = auth_service.authenticate_user(a_db, a_body.email, a_body.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    access_token = security.create_access_token(data={"sub": str(user.id)})
    return TokenWithUser(
        access_token=access_token,
        token_type="bearer",
        user=auth_service.user_to_out(user),
    )


@router.post("/logout")
def logout():
    """Client should discard the token. No server-side invalidation in MVP."""
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserOut)
def me(a_current_user: Annotated[User, Depends(get_current_user)]):
    """Return the currently authenticated user. Requires Bearer token."""
    return auth_service.user_to_out(a_current_user)


@router.patch("/me", response_model=UserOut)
def update_me(
    a_body: ProfileUpdateIn,
    a_db: Annotated[Session, Depends(get_db)],
    a_current_user: Annotated[User, Depends(get_current_user)],
):
    """Update the current user's username and optionally password."""
    try:
        user = auth_service.update_user_profile(a_db, a_current_user, a_body)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return auth_service.user_to_out(user)

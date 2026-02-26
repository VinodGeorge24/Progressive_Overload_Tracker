"""
auth.py

Auth business logic: register (hash password, create user), login (verify, create token).
Uses app.core.security for hashing and JWT. Login by email only.
"""

from app.core import security
from app.models.user import User
from app.schemas.auth import RegisterIn, UserOut


def register_user(a_db, a_register: RegisterIn) -> User:
    """
    Create a new user with hashed password.

    SYNOPSIS
        register_user(a_db, a_register)
            a_db       --> SQLAlchemy session
            a_register --> RegisterIn (email, username, password)

    DESCRIPTION
        Hashes the password and creates a User. Caller must commit.
        Raises if email or username already exists (integrity error from DB).
    """
    hashed = security.get_password_hash(a_register.password)
    user = User(
        email=a_register.email,
        username=a_register.username,
        hashed_password=hashed,
    )
    a_db.add(user)
    a_db.commit()
    a_db.refresh(user)
    return user


def authenticate_user(a_db, a_email: str, a_password: str) -> User | None:
    """
    Find user by email and verify password.

    SYNOPSIS
        authenticate_user(a_db, a_email, a_password)
            a_db       --> SQLAlchemy session
            a_email    --> email string
            a_password --> plain password

    DESCRIPTION
        Returns User if found and password matches; otherwise None.
    """
    user = a_db.query(User).filter(User.email == a_email).first()
    if user is None:
        return None
    if not security.verify_password(a_password, user.hashed_password):
        return None
    return user


def user_to_out(a_user: User) -> UserOut:
    """Map User model to UserOut schema."""
    return UserOut(
        id=a_user.id,
        email=a_user.email,
        username=a_user.username,
        is_active=a_user.is_active,
        created_at=a_user.created_at,
        updated_at=a_user.updated_at,
    )

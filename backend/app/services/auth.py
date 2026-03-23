"""
auth.py

Auth business logic: register (hash password, create user), login (verify, create token).
Uses app.core.security for hashing and JWT. Login by email only.
"""

from app.core import security
from app.models.user import User
from app.schemas.auth import ProfileUpdateIn, RegisterIn, UserOut


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


def update_user_profile(a_db, a_user: User, a_profile: ProfileUpdateIn) -> User:
    """
    Update profile fields for the current user.

    SYNOPSIS
        update_user_profile(a_db, a_user, a_profile)
            a_db      --> SQLAlchemy session
            a_user    --> current User model
            a_profile --> ProfileUpdateIn

    DESCRIPTION
        Updates username and optionally password. Raises ValueError for user-facing
        validation issues such as duplicate usernames or wrong current password.
    """
    if a_profile.username is not None and a_profile.username != a_user.username:
        existing_user = (
            a_db.query(User)
            .filter(User.username == a_profile.username, User.id != a_user.id)
            .first()
        )
        if existing_user is not None:
            raise ValueError("Username already taken")
        a_user.username = a_profile.username

    if a_profile.new_password is not None:
        if not security.verify_password(a_profile.current_password or "", a_user.hashed_password):
            raise ValueError("Current password is incorrect")
        a_user.hashed_password = security.get_password_hash(a_profile.new_password)

    a_db.add(a_user)
    a_db.commit()
    a_db.refresh(a_user)
    return a_user


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

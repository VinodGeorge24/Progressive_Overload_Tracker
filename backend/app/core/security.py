"""
Security utilities for authentication and password hashing.

This module handles:
- Password hashing and verification (using bcrypt directly; passlib is not used
  to avoid passlib/bcrypt 4.1+ compatibility issues that cause 500 on register)
- JWT token creation and verification
"""

from datetime import datetime, timedelta
from typing import Optional

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings

# Bcrypt truncates at 72 bytes; we truncate before hashing to avoid surprises
_BCRYPT_MAX_PASSWORD_BYTES = 72


def _password_bytes(password: str) -> bytes:
    """Encode password to UTF-8 and truncate to bcrypt's 72-byte limit."""
    raw = password.encode("utf-8")
    return raw[:_BCRYPT_MAX_PASSWORD_BYTES] if len(raw) > _BCRYPT_MAX_PASSWORD_BYTES else raw


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password (bcrypt)."""
    try:
        return bcrypt.checkpw(
            _password_bytes(plain_password),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt. Returns string suitable for DB storage."""
    hashed = bcrypt.hashpw(_password_bytes(password), bcrypt.gensalt())
    return hashed.decode("utf-8")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.

    Args:
        data: Dictionary containing claims (typically user ID or email)
        expires_delta: Optional custom expiration time

    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """
    Decode and verify a JWT access token.

    Args:
        token: JWT token string

    Returns:
        Decoded token payload if valid, None otherwise
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None


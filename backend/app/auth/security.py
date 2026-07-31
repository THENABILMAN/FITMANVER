import re
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

USERNAME_PATTERN = re.compile(r"^[a-zA-Z0-9_]{3,30}$")
PASSWORD_MIN_LENGTH = 8


def validate_username(username: str) -> tuple[bool, str]:
    if not username:
        return False, "Username is required"
    if not USERNAME_PATTERN.match(username):
        return False, "Username must be 3-30 characters (letters, numbers, underscore only)"
    return True, ""


def validate_password(password: str) -> tuple[bool, str]:
    if len(password) < PASSWORD_MIN_LENGTH:
        return False, f"Password must be at least {PASSWORD_MIN_LENGTH} characters"
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r"\d", password):
        return False, "Password must contain at least one number"
    return True, ""


def username_to_auth_email(username: str) -> str:
    """Map username to internal Supabase auth email."""
    return f"{username.lower()}@users.fitman.internal"

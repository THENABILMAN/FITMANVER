from fastapi import Depends, HTTPException, Header
from app.auth.service import AuthService


async def get_current_user(authorization: str | None = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail={"code": "UNAUTHORIZED", "message": "Authentication required"},
        )
    token = authorization.replace("Bearer ", "")
    service = AuthService()
    result = service.get_user_from_token(token)
    profile = result["profile"]
    return {
        "id": profile["user_id"],
        "user_id": profile["user_id"],
        "username": profile["username"],
        "email": profile.get("email"),
        "display_name": profile.get("display_name"),
        "onboarding_completed": profile.get("onboarding_completed", False),
        "profile": profile,
        "access_token": token,
    }

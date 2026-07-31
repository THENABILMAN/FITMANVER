from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_current_user
from app.database import get_supabase_admin
from app.users.schemas import ProfileUpdate, OnboardingStep
from app.common.responses import success_response

router = APIRouter(prefix="/api/profile", tags=["profile"])


def _normalize_profile_update(update_data: dict) -> dict:
    normalized = dict(update_data)

    if "days_per_week" in normalized and "preferred_workout_days" not in normalized:
        normalized["preferred_workout_days"] = str(normalized.pop("days_per_week"))
    if "session_duration" in normalized and "preferred_workout_duration" not in normalized:
        normalized["preferred_workout_duration"] = normalized.pop("session_duration")

    if "preferred_workout_days" in normalized and normalized["preferred_workout_days"] is not None:
        normalized["preferred_workout_days"] = str(normalized["preferred_workout_days"])

    return normalized


@router.get("")
async def get_profile(user=Depends(get_current_user)):
    return success_response(user["profile"])


@router.put("")
async def update_profile(body: ProfileUpdate, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    update_data = _normalize_profile_update(body.model_dump(exclude_none=True))
    if not update_data:
        raise HTTPException(status_code=400, detail={"code": "NO_DATA", "message": "No data to update"})
    result = (
        admin.table("profiles")
        .update(update_data)
        .eq("user_id", user["user_id"])
        .execute()
    )
    return success_response(result.data[0] if result.data else None, "Profile updated successfully")


@router.post("/onboarding")
async def save_onboarding(body: OnboardingStep, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    update_data = _normalize_profile_update(body.data.copy())
    if body.step == 5:
        update_data["onboarding_completed"] = True
    result = (
        admin.table("profiles")
        .update(update_data)
        .eq("user_id", user["user_id"])
        .execute()
    )
    return success_response(result.data[0] if result.data else None)


@router.delete("")
async def delete_profile(user=Depends(get_current_user)):
    from app.auth.service import AuthService
    AuthService().delete_account(user["user_id"])
    return success_response(message="Profile and account deleted")

from pydantic import BaseModel, Field
from typing import Any


class ProfileUpdate(BaseModel):
    display_name: str | None = None
    email: str | None = None
    date_of_birth: str | None = None
    age: int | None = None
    gender: str | None = None
    height_cm: float | None = None
    current_weight_kg: float | None = None
    target_weight_kg: float | None = None
    goal: str | None = None
    activity_level: str | None = None
    gym_experience: str | None = None
    dietary_preferences: str | None = None
    food_allergies: str | None = None
    foods_disliked: str | None = None
    injuries: str | None = None
    physical_limitations: str | None = None
    typical_gym_schedule: str | None = None
    days_per_week: int | None = None
    session_duration: int | None = None
    preferred_workout_days: str | None = None
    preferred_workout_duration: int | None = None
    preferred_units: str | None = None
    timezone: str | None = None
    onboarding_completed: bool | None = None
    memory_enabled: bool | None = None
    ai_response_style: str | None = None
    theme_preference: str | None = None
    notification_preferences: dict[str, Any] | None = None


class OnboardingStep(BaseModel):
    step: int
    data: dict[str, Any]

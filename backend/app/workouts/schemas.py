from pydantic import BaseModel
from typing import Any


class WorkoutPlanCreate(BaseModel):
    name: str
    description: str | None = None
    goal: str | None = None
    experience_level: str | None = None
    days_per_week: int | None = None
    duration_weeks: int | None = 8
    is_active: bool = True


class WorkoutGenerateRequest(BaseModel):
    goal: str | None = None
    experience_level: str | None = None
    days_per_week: int = 4
    session_duration: int = 60
    equipment: str = "full gym"
    injuries: str | None = None
    limitations: str | None = None


class SplitGenerateRequest(BaseModel):
    split: str | None = None
    goal: str | None = None
    experience_level: str | None = None
    days_per_week: int | None = None
    session_duration: int | None = None
    equipment: str | None = None
    injuries: str | None = None
    limitations: str | None = None


class ExerciseCreateRequest(BaseModel):
    exercise_name: str
    sets: int = 3
    target_reps: str = "10"
    rest_seconds: int = 60
    muscle_group: str | None = None
    notes: str | None = None


class ExerciseUpdateRequest(BaseModel):
    exercise_name: str | None = None
    sets: int | None = None
    target_reps: str | None = None
    rest_seconds: int | None = None
    muscle_group: str | None = None
    notes: str | None = None
    suggested_weight: float | None = None


class SessionCreate(BaseModel):
    workout_plan_id: str | None = None
    workout_day_id: str | None = None
    session_date: str | None = None


class SessionUpdate(BaseModel):
    status: str | None = None
    session_rating: int | None = None
    energy_level: int | None = None
    pain_or_discomfort: str | None = None
    notes: str | None = None
    duration_minutes: int | None = None


class ExerciseLogCreate(BaseModel):
    workout_exercise_id: str | None = None
    exercise_name: str
    set_number: int
    reps_completed: int | None = None
    weight_used: float | None = None
    rpe: float | None = None
    rir: int | None = None
    is_warmup: bool = False
    notes: str | None = None

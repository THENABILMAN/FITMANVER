from pydantic import BaseModel


class WeightLogCreate(BaseModel):
    weight_kg: float
    logged_at: str | None = None
    notes: str | None = None


class MeasurementCreate(BaseModel):
    measurement_date: str | None = None
    neck_cm: float | None = None
    chest_cm: float | None = None
    waist_cm: float | None = None
    hips_cm: float | None = None
    left_arm_cm: float | None = None
    right_arm_cm: float | None = None
    body_fat_percentage: float | None = None
    notes: str | None = None

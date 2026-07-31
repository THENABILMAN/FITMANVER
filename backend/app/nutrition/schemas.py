from pydantic import BaseModel


class NutritionTargetUpdate(BaseModel):
    calorie_target: int | None = None
    protein_target_g: int | None = None
    carbohydrate_target_g: int | None = None
    fat_target_g: int | None = None
    fiber_target_g: int | None = None
    water_target_ml: int | None = None


class FoodLogCreate(BaseModel):
    logged_date: str | None = None
    meal_type: str
    food_name: str
    quantity: float | None = None
    unit: str | None = None
    calories: float | None = None
    protein_g: float | None = None
    carbohydrates_g: float | None = None
    fat_g: float | None = None
    fiber_g: float | None = None
    notes: str | None = None
    source: str = "Manual"


class FoodLogUpdate(BaseModel):
    meal_type: str | None = None
    food_name: str | None = None
    quantity: float | None = None
    unit: str | None = None
    calories: float | None = None
    protein_g: float | None = None
    carbohydrates_g: float | None = None
    fat_g: float | None = None
    fiber_g: float | None = None
    notes: str | None = None

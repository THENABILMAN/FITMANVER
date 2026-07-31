from datetime import date
from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
from app.database import get_supabase_admin
from app.nutrition.schemas import NutritionTargetUpdate, FoodLogCreate, FoodLogUpdate
from app.workouts.service import calculate_nutrition_targets
from app.common.responses import success_response

router = APIRouter(prefix="/api/nutrition", tags=["nutrition"])


@router.get("/targets")
async def get_targets(user=Depends(get_current_user)):
    admin = get_supabase_admin()
    result = admin.table("nutrition_targets").select("*").eq("user_id", user["user_id"]).order("created_at", desc=True).limit(1).execute()
    if not result.data:
        targets = calculate_nutrition_targets(user["profile"])
        targets["user_id"] = user["user_id"]
        created = admin.table("nutrition_targets").insert(targets).execute()
        return success_response(created.data[0])
    return success_response(result.data[0])


@router.put("/targets")
async def update_targets(body: NutritionTargetUpdate, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    update_data = body.model_dump(exclude_none=True)
    existing = admin.table("nutrition_targets").select("id").eq("user_id", user["user_id"]).order("created_at", desc=True).limit(1).execute()
    if existing.data:
        result = admin.table("nutrition_targets").update(update_data).eq("id", existing.data[0]["id"]).execute()
    else:
        update_data["user_id"] = user["user_id"]
        result = admin.table("nutrition_targets").insert(update_data).execute()
    return success_response(result.data[0] if result.data else None, "Targets updated")


@router.get("/logs")
async def get_logs(user=Depends(get_current_user), logged_date: str | None = None):
    admin = get_supabase_admin()
    target_date = logged_date or str(date.today())
    result = admin.table("food_logs").select("*").eq("user_id", user["user_id"]).eq("logged_date", target_date).order("created_at").execute()
    totals = {"calories": 0, "protein_g": 0, "carbohydrates_g": 0, "fat_g": 0, "fiber_g": 0}
    for log in result.data:
        for key in totals:
            totals[key] += float(log.get(key) or 0)
    return success_response({"logs": result.data, "totals": totals, "date": target_date})


@router.post("/logs")
async def create_log(body: FoodLogCreate, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    data = body.model_dump()
    data["user_id"] = user["user_id"]
    if not data.get("logged_date"):
        data["logged_date"] = str(date.today())
    result = admin.table("food_logs").insert(data).execute()
    return success_response(result.data[0], "Food logged")


@router.put("/logs/{log_id}")
async def update_log(log_id: str, body: FoodLogUpdate, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    update_data = body.model_dump(exclude_none=True)
    result = admin.table("food_logs").update(update_data).eq("id", log_id).eq("user_id", user["user_id"]).execute()
    return success_response(result.data[0] if result.data else None)


@router.delete("/logs/{log_id}")
async def delete_log(log_id: str, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    admin.table("food_logs").delete().eq("id", log_id).eq("user_id", user["user_id"]).execute()
    return success_response(message="Food log deleted")


@router.post("/meal-plans/generate")
async def generate_meal_plan(user=Depends(get_current_user)):
    return success_response(
        {"status": "coming_soon"},
        "Meal plan generation coming soon in Phase 2",
    )


@router.post("/analyze-meal-photo")
async def analyze_meal_photo(user=Depends(get_current_user)):
    return success_response(
        {"status": "coming_soon"},
        "Meal photo analysis coming soon in Phase 2",
    )

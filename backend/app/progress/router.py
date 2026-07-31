from datetime import date, timedelta
from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
from app.database import get_supabase_admin
from app.progress.schemas import WeightLogCreate, MeasurementCreate
from app.common.responses import success_response

router = APIRouter(prefix="/api/progress", tags=["progress"])


@router.get("/summary")
async def progress_summary(user=Depends(get_current_user)):
    admin = get_supabase_admin()
    uid = user["user_id"]

    weights = admin.table("weight_logs").select("*").eq("user_id", uid).order("logged_at", desc=True).limit(2).execute()
    sessions = admin.table("workout_sessions").select("status").eq("user_id", uid).execute()
    prs = admin.table("personal_records").select("*").eq("user_id", uid).order("created_at", desc=True).limit(1).execute()
    food = admin.table("food_logs").select("calories, protein_g").eq("user_id", uid).eq("logged_date", str(date.today())).execute()

    completed = sum(1 for s in sessions.data if s["status"] == "Completed")
    missed = sum(1 for s in sessions.data if s["status"] in ("Missed", "Skipped"))
    today_cals = sum(float(f.get("calories") or 0) for f in food.data)
    today_protein = sum(float(f.get("protein_g") or 0) for f in food.data)

    weight_change = None
    if len(weights.data) >= 2:
        weight_change = float(weights.data[0]["weight_kg"]) - float(weights.data[1]["weight_kg"])

    return success_response({
        "current_weight": weights.data[0]["weight_kg"] if weights.data else user["profile"].get("current_weight_kg"),
        "weight_change_weekly": weight_change,
        "workouts_completed": completed,
        "workouts_missed": missed,
        "latest_pr": prs.data[0] if prs.data else None,
        "today_calories": today_cals,
        "today_protein": today_protein,
    })


@router.get("/weight")
async def get_weight_logs(user=Depends(get_current_user)):
    admin = get_supabase_admin()
    result = admin.table("weight_logs").select("*").eq("user_id", user["user_id"]).order("logged_at").execute()
    return success_response(result.data)


@router.post("/weight")
async def log_weight(body: WeightLogCreate, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    data = {"user_id": user["user_id"], "weight_kg": body.weight_kg, "notes": body.notes}
    if body.logged_at:
        data["logged_at"] = body.logged_at
    result = admin.table("weight_logs").insert(data).execute()
    admin.table("profiles").update({"current_weight_kg": body.weight_kg}).eq("user_id", user["user_id"]).execute()
    return success_response(result.data[0], "Weight logged")


@router.get("/measurements")
async def get_measurements(user=Depends(get_current_user)):
    admin = get_supabase_admin()
    result = admin.table("body_measurements").select("*").eq("user_id", user["user_id"]).order("measurement_date").execute()
    return success_response(result.data)


@router.post("/measurements")
async def log_measurement(body: MeasurementCreate, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    data = body.model_dump(exclude_none=True)
    data["user_id"] = user["user_id"]
    if not data.get("measurement_date"):
        data["measurement_date"] = str(date.today())
    result = admin.table("body_measurements").insert(data).execute()
    return success_response(result.data[0], "Measurement logged")


@router.get("/personal-records")
async def get_prs(user=Depends(get_current_user)):
    admin = get_supabase_admin()
    result = admin.table("personal_records").select("*").eq("user_id", user["user_id"]).order("created_at", desc=True).execute()
    return success_response(result.data)


@router.get("/photos")
async def get_photos(user=Depends(get_current_user)):
    admin = get_supabase_admin()
    result = admin.table("progress_photos").select("*").eq("user_id", user["user_id"]).order("photo_date", desc=True).execute()
    return success_response(result.data)


@router.post("/photos/compare")
async def compare_photos(user=Depends(get_current_user)):
    return success_response({"status": "coming_soon"}, "Photo comparison coming soon in Phase 2")


@router.get("/prediction")
async def goal_prediction(user=Depends(get_current_user)):
    admin = get_supabase_admin()
    weights = admin.table("weight_logs").select("*").eq("user_id", user["user_id"]).order("logged_at").execute()
    profile = user["profile"]
    target = profile.get("target_weight_kg")
    current = profile.get("current_weight_kg")

    prediction = None
    if weights.data and len(weights.data) >= 2 and target and current:
        first = float(weights.data[0]["weight_kg"])
        last = float(weights.data[-1]["weight_kg"])
        weeks = max(len(weights.data) / 7, 0.5)
        rate = (last - first) / weeks
        if rate != 0:
            weeks_remaining = abs(float(target) - last) / abs(rate)
            prediction = {
                "estimated_weeks": round(weeks_remaining, 1),
                "weekly_rate_kg": round(rate, 2),
                "disclaimer": "This is an estimate based on recent trends, not a guarantee.",
            }

    return success_response({"prediction": prediction})


@router.get("/weekly-report")
async def weekly_report(user=Depends(get_current_user)):
    admin = get_supabase_admin()
    uid = user["user_id"]
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)

    sessions = admin.table("workout_sessions").select("status").eq("user_id", uid).gte("session_date", str(week_start)).lte("session_date", str(week_end)).execute()
    food = admin.table("food_logs").select("calories, protein_g").eq("user_id", uid).gte("logged_date", str(week_start)).lte("logged_date", str(week_end)).execute()
    weights = admin.table("weight_logs").select("weight_kg").eq("user_id", uid).order("logged_at").execute()

    completed = sum(1 for s in sessions.data if s["status"] == "Completed")
    missed = sum(1 for s in sessions.data if s["status"] in ("Missed", "Skipped"))
    avg_cals = sum(float(f.get("calories") or 0) for f in food.data) / max(len(food.data), 1)
    avg_protein = sum(float(f.get("protein_g") or 0) for f in food.data) / max(len(food.data), 1)

    weight_change = None
    if len(weights.data) >= 2:
        weight_change = float(weights.data[-1]["weight_kg"]) - float(weights.data[0]["weight_kg"])

    report = {
        "week_start": str(week_start),
        "week_end": str(week_end),
        "workouts_completed": completed,
        "workouts_missed": missed,
        "average_calories": round(avg_cals, 1),
        "average_protein_g": round(avg_protein, 1),
        "weight_change_kg": weight_change,
        "report_summary": f"You completed {completed} workouts this week.",
        "recommendations": "Focus on consistency and protein intake next week.",
    }
    return success_response(report)

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_current_user
from app.database import get_supabase_admin
from app.workouts.schemas import (
    WorkoutPlanCreate,
    WorkoutGenerateRequest,
    SplitGenerateRequest,
    ExerciseCreateRequest,
    ExerciseUpdateRequest,
    SessionCreate,
    SessionUpdate,
    ExerciseLogCreate,
)
from app.workouts.service import generate_workout_plan, generate_split_workout, calculate_nutrition_targets, get_workout_day_for_date
from app.common.responses import success_response

router = APIRouter(prefix="/api/workouts", tags=["workouts"])


@router.get("/plans")
async def list_plans(user=Depends(get_current_user)):
    admin = get_supabase_admin()
    plans = admin.table("workout_plans").select("*").eq("user_id", user["user_id"]).order("created_at", desc=True).execute()
    return success_response(plans.data)


@router.get("/plans/{plan_id}")
async def get_plan(plan_id: str, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    plan = admin.table("workout_plans").select("*").eq("id", plan_id).eq("user_id", user["user_id"]).single().execute()
    days = admin.table("workout_days").select("*").eq("workout_plan_id", plan_id).order("day_number").execute()
    result = plan.data
    result["days"] = []
    for day in days.data:
        exercises = admin.table("workout_exercises").select("*").eq("workout_day_id", day["id"]).order("sort_order").execute()
        day["exercises"] = exercises.data
        result["days"].append(day)
    return success_response(result)


@router.post("/plans")
async def create_plan(body: WorkoutPlanCreate, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    data = body.model_dump()
    data["user_id"] = user["user_id"]
    result = admin.table("workout_plans").insert(data).execute()
    return success_response(result.data[0], "Workout plan created")


@router.post("/generate")
async def generate_plan(body: WorkoutGenerateRequest, user=Depends(get_current_user)):
    plan = generate_workout_plan(user["user_id"], user["profile"], body.model_dump())
    targets = calculate_nutrition_targets(user["profile"])
    admin = get_supabase_admin()
    admin.table("nutrition_targets").insert({**targets, "user_id": user["user_id"]}).execute()
    return success_response({"plan": plan, "nutrition_targets": targets}, "Plan generated successfully")


@router.post("/generate-split")
async def generate_split(body: SplitGenerateRequest, user=Depends(get_current_user)):
    plan = generate_split_workout(user["user_id"], user["profile"], body.model_dump())
    return success_response({"plan": plan}, "Split workout generated")


@router.get("/today")
async def get_today_workout(user=Depends(get_current_user)):
    admin = get_supabase_admin()
    plans = admin.table("workout_plans").select("*").eq("user_id", user["user_id"]).order("created_at", desc=True).execute()
    if not plans.data:
        return success_response({"workout": None}, "No workout generated today")

    today = datetime.now(timezone.utc).date()
    active_plan = None
    for plan in plans.data:
        created_at = plan.get("created_at")
        if not created_at:
            continue
        try:
            created_date = datetime.fromisoformat(created_at.replace("Z", "+00:00")).date()
        except Exception:
            created_date = today
        if created_date == today:
            active_plan = plan
            break

    if not active_plan:
        active_plan = plans.data[0]

    days = admin.table("workout_days").select("*").eq("workout_plan_id", active_plan["id"]).order("day_number").execute()
    if not days.data:
        return success_response({"workout": None}, "No workout day available")

    day = days.data[0]
    exercises = admin.table("workout_exercises").select("*").eq("workout_day_id", day["id"]).order("sort_order").execute()
    workout = {
        "plan_id": active_plan["id"],
        "plan_name": active_plan.get("name"),
        "day_name": day.get("day_name"),
        "focus_area": day.get("focus_area"),
        "split": active_plan.get("name", "").split(" Day", 1)[0] if active_plan.get("name") else None,
        "date": str(today),
        "exercises": [
            {
                "id": ex.get("id"),
                "name": ex.get("exercise_name"),
                "sets": ex.get("sets"),
                "target_reps": ex.get("target_reps"),
                "rest_seconds": ex.get("rest_seconds"),
                "muscle_group": ex.get("muscle_group"),
                "suggested_weight": ex.get("target_weight"),
                "notes": ex.get("instructions"),
                "completed": False,
                "custom": False,
            }
            for ex in exercises.data
        ],
    }
    return success_response({"workout": workout}, "Today's workout loaded")


@router.post("/today/exercises")
async def add_exercise(body: ExerciseCreateRequest, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    plans = admin.table("workout_plans").select("*").eq("user_id", user["user_id"]).order("created_at", desc=True).execute()
    if not plans.data:
        raise HTTPException(status_code=404, detail={"code": "NO_WORKOUT", "message": "No workout exists for today"})
    today = datetime.now(timezone.utc).date()
    active_plan = None
    for plan in plans.data:
        created_at = plan.get("created_at")
        if not created_at:
            continue
        try:
            created_date = datetime.fromisoformat(created_at.replace("Z", "+00:00")).date()
        except Exception:
            created_date = today
        if created_date == today:
            active_plan = plan
            break
    if not active_plan:
        active_plan = plans.data[0]
    day = admin.table("workout_days").select("*").eq("workout_plan_id", active_plan["id"]).order("day_number").limit(1).execute()
    if not plan.data:
        raise HTTPException(status_code=404, detail={"code": "NO_WORKOUT", "message": "No workout exists for today"})
    day = admin.table("workout_days").select("*").eq("workout_plan_id", plan.data[0]["id"]).order("day_number").limit(1).execute()
    if not day.data:
        raise HTTPException(status_code=404, detail={"code": "NO_WORKOUT_DAY", "message": "No workout day exists for today"})
    exercise_data = body.model_dump()
    exercise_data.update({"user_id": user["user_id"], "workout_day_id": day.data[0]["id"], "sort_order": 999, "exercise_category": "custom", "is_custom": True})
    result = admin.table("workout_exercises").insert(exercise_data).execute()
    return success_response(result.data[0], "Exercise added")


@router.put("/today/exercises/{exercise_id}")
async def update_exercise(exercise_id: str, body: ExerciseUpdateRequest, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    update_data = body.model_dump(exclude_none=True)
    result = admin.table("workout_exercises").update(update_data).eq("id", exercise_id).eq("user_id", user["user_id"]).execute()
    return success_response(result.data[0] if result.data else None, "Exercise updated")


@router.delete("/today/exercises/{exercise_id}")
async def delete_exercise(exercise_id: str, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    admin.table("workout_exercises").delete().eq("id", exercise_id).eq("user_id", user["user_id"]).execute()
    return success_response(message="Exercise removed")


@router.delete("/plans/{plan_id}")
async def delete_plan(plan_id: str, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    admin.table("workout_plans").delete().eq("id", plan_id).eq("user_id", user["user_id"]).execute()
    return success_response(message="Plan deleted")


@router.get("/sessions")
async def list_sessions(user=Depends(get_current_user), status: str | None = None):
    admin = get_supabase_admin()
    query = admin.table("workout_sessions").select("*").eq("user_id", user["user_id"]).order("session_date", desc=True)
    if status:
        query = query.eq("status", status)
    result = query.limit(50).execute()
    return success_response(result.data)


@router.get("/sessions/{session_id}")
async def get_session(session_id: str, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    session = admin.table("workout_sessions").select("*").eq("id", session_id).eq("user_id", user["user_id"]).single().execute()
    logs = admin.table("exercise_logs").select("*").eq("workout_session_id", session_id).order("set_number").execute()
    data = session.data
    data["exercise_logs"] = logs.data
    return success_response(data)


@router.post("/sessions")
async def create_session(body: SessionCreate, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    data = {
        "user_id": user["user_id"],
        "workout_plan_id": body.workout_plan_id,
        "workout_day_id": body.workout_day_id,
        "session_date": body.session_date or str(datetime.now(timezone.utc).date()),
        "status": "In progress",
        "started_at": datetime.now(timezone.utc).isoformat(),
    }
    result = admin.table("workout_sessions").insert(data).execute()
    return success_response(result.data[0], "Workout started")


@router.put("/sessions/{session_id}")
async def update_session(session_id: str, body: SessionUpdate, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    update_data = body.model_dump(exclude_none=True)
    result = admin.table("workout_sessions").update(update_data).eq("id", session_id).eq("user_id", user["user_id"]).execute()
    return success_response(result.data[0] if result.data else None)


@router.post("/sessions/{session_id}/complete")
async def complete_session(session_id: str, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    now = datetime.now(timezone.utc).isoformat()
    result = admin.table("workout_sessions").update({
        "status": "Completed",
        "completed_at": now,
    }).eq("id", session_id).eq("user_id", user["user_id"]).execute()
    return success_response(result.data[0] if result.data else None, "Workout completed")


@router.post("/sessions/{session_id}/exercises")
async def log_exercise(session_id: str, body: ExerciseLogCreate, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    data = body.model_dump()
    data["user_id"] = user["user_id"]
    data["workout_session_id"] = session_id
    result = admin.table("exercise_logs").insert(data).execute()

    if body.weight_used and body.reps_completed and not body.is_warmup:
        pr_check = admin.table("exercise_logs").select("weight_used").eq(
            "user_id", user["user_id"]
        ).eq("exercise_name", body.exercise_name).eq("is_warmup", False).order("weight_used", desc=True).limit(1).execute()
        is_pr = not pr_check.data or (body.weight_used or 0) > (pr_check.data[0].get("weight_used") or 0)
        if is_pr:
            admin.table("personal_records").insert({
                "user_id": user["user_id"],
                "exercise_name": body.exercise_name,
                "record_type": "Maximum weight",
                "record_value": body.weight_used,
                "unit": "kg",
                "workout_session_id": session_id,
            }).execute()
            admin.table("exercise_logs").update({"is_personal_record": True}).eq("id", result.data[0]["id"]).execute()

    return success_response(result.data[0], "Set logged")


@router.get("/progressive-overload")
async def progressive_overload(user=Depends(get_current_user), exercise: str | None = None):
    admin = get_supabase_admin()
    query = admin.table("exercise_logs").select("*").eq("user_id", user["user_id"]).eq("is_warmup", False).order("created_at", desc=True).limit(20)
    if exercise:
        query = query.eq("exercise_name", exercise)
    logs = query.execute()
    suggestions = []
    if logs.data:
        latest = logs.data[0]
        rpe = latest.get("rpe")
        if rpe and rpe < 7:
            suggestions.append({"action": "Increase weight", "reason": "RPE below 7 — room to progress"})
        elif rpe and rpe >= 9:
            suggestions.append({"action": "Maintain load", "reason": "High RPE — focus on form and recovery"})
        else:
            suggestions.append({"action": "Increase repetitions", "reason": "Moderate RPE — add reps before weight"})
    return success_response({"suggestions": suggestions, "recent_logs": logs.data[:5]})


@router.get("/deload-recommendation")
async def deload_recommendation(user=Depends(get_current_user)):
    admin = get_supabase_admin()
    sessions = admin.table("workout_sessions").select("status").eq("user_id", user["user_id"]).order("session_date", desc=True).limit(14).execute()
    missed = sum(1 for s in sessions.data if s["status"] in ("Missed", "Skipped"))
    recommend = missed >= 3
    return success_response({
        "recommend_deload": recommend,
        "missed_workouts": missed,
        "reason": "Multiple missed workouts detected" if recommend else "Training load appears manageable",
    })

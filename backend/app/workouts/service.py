from datetime import date, datetime, timezone, timedelta
from app.database import get_supabase_admin


def get_workout_day_for_date(plan: dict, day: date) -> dict:
    days = plan.get("days") or []
    if not days:
        return {}
    week_start = day - timedelta(days=day.weekday())
    offset = (day - week_start).days
    index = offset % len(days)
    return days[index]


def get_latest_plan_for_today(admin, user_id: str, split: str | None = None) -> dict | None:
    plans_result = admin.table("workout_plans").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    plans = plans_result.data or []
    if not plans:
        return None

    today = date.today()
    if split:
        split_prefix = f"{split} Day"
        for plan in plans:
            created_at = plan.get("created_at")
            if not created_at:
                continue
            try:
                created_date = datetime.fromisoformat(created_at.replace("Z", "+00:00")).date()
            except Exception:
                created_date = today
            if created_date == today and str(plan.get("name", "")).startswith(split_prefix):
                return plan
        for plan in plans:
            if str(plan.get("name", "")).startswith(split_prefix):
                return plan

    for plan in plans:
        created_at = plan.get("created_at")
        if not created_at:
            continue
        try:
            created_date = datetime.fromisoformat(created_at.replace("Z", "+00:00")).date()
        except Exception:
            created_date = today
        if created_date == today:
            return plan

    return plans[0]


WORKOUT_TEMPLATES = {
    3: {
        "name": "Full Body 3-Day",
        "days": [
            {"day_name": "Day A - Push Focus", "focus_area": "Chest, Shoulders, Triceps", "exercises": [
                ("Barbell Bench Press", "Chest", 4, "6-8", 90),
                ("Overhead Press", "Shoulders", 3, "8-10", 90),
                ("Incline Dumbbell Press", "Chest", 3, "10-12", 60),
                ("Lateral Raises", "Shoulders", 3, "12-15", 45),
                ("Tricep Pushdowns", "Triceps", 3, "12-15", 45),
            ]},
            {"day_name": "Day B - Pull Focus", "focus_area": "Back, Biceps", "exercises": [
                ("Barbell Rows", "Back", 4, "6-8", 90),
                ("Pull-ups", "Back", 3, "6-10", 90),
                ("Face Pulls", "Rear Delts", 3, "15-20", 45),
                ("Barbell Curls", "Biceps", 3, "10-12", 60),
                ("Hammer Curls", "Biceps", 3, "12-15", 45),
            ]},
            {"day_name": "Day C - Legs", "focus_area": "Quads, Hamstrings, Glutes", "exercises": [
                ("Barbell Squat", "Quads", 4, "6-8", 120),
                ("Romanian Deadlift", "Hamstrings", 3, "8-10", 90),
                ("Leg Press", "Quads", 3, "10-12", 90),
                ("Leg Curls", "Hamstrings", 3, "12-15", 60),
                ("Calf Raises", "Calves", 4, "15-20", 45),
            ]},
        ],
    },
    4: {
        "name": "Upper/Lower 4-Day",
        "days": [
            {"day_name": "Upper A", "focus_area": "Chest, Back, Shoulders, Arms", "exercises": [
                ("Barbell Bench Press", "Chest", 4, "6-8", 90),
                ("Barbell Rows", "Back", 4, "6-8", 90),
                ("Overhead Press", "Shoulders", 3, "8-10", 90),
                ("Lat Pulldown", "Back", 3, "10-12", 60),
                ("Dumbbell Curls", "Biceps", 3, "10-12", 45),
                ("Tricep Dips", "Triceps", 3, "10-12", 45),
            ]},
            {"day_name": "Lower A", "focus_area": "Quads, Hamstrings, Glutes", "exercises": [
                ("Barbell Squat", "Quads", 4, "6-8", 120),
                ("Romanian Deadlift", "Hamstrings", 3, "8-10", 90),
                ("Bulgarian Split Squat", "Quads", 3, "10-12", 60),
                ("Leg Curls", "Hamstrings", 3, "12-15", 60),
                ("Calf Raises", "Calves", 4, "15-20", 45),
            ]},
            {"day_name": "Upper B", "focus_area": "Chest, Back, Shoulders, Arms", "exercises": [
                ("Incline Dumbbell Press", "Chest", 4, "8-10", 90),
                ("Cable Rows", "Back", 4, "8-10", 90),
                ("Lateral Raises", "Shoulders", 3, "12-15", 45),
                ("Face Pulls", "Rear Delts", 3, "15-20", 45),
                ("Hammer Curls", "Biceps", 3, "12-15", 45),
                ("Overhead Tricep Extension", "Triceps", 3, "12-15", 45),
            ]},
            {"day_name": "Lower B", "focus_area": "Quads, Hamstrings, Glutes", "exercises": [
                ("Deadlift", "Hamstrings", 4, "5-6", 120),
                ("Leg Press", "Quads", 3, "10-12", 90),
                ("Walking Lunges", "Quads", 3, "12/leg", 60),
                ("Hip Thrust", "Glutes", 3, "10-12", 60),
                ("Seated Calf Raises", "Calves", 4, "15-20", 45),
            ]},
        ],
    },
}


SPLIT_TEMPLATES = {
    "Push": [
        {"name": "Barbell Bench Press", "category": "compound", "sets": 4, "reps": "6-8", "suggested_weight": 70, "rest_seconds": 90, "muscle_group": "Chest", "notes": "Drive through the floor and keep the shoulder blades tight."},
        {"name": "Incline Dumbbell Press", "category": "compound", "sets": 3, "reps": "8-10", "suggested_weight": 30, "rest_seconds": 75, "muscle_group": "Chest", "notes": "Control the lowering phase to keep tension on the chest."},
        {"name": "Seated Shoulder Press", "category": "compound", "sets": 3, "reps": "8-10", "suggested_weight": 40, "rest_seconds": 75, "muscle_group": "Shoulders", "notes": "Pause briefly at the top for stability."},
        {"name": "Lateral Raise", "category": "accessory", "sets": 4, "reps": "12-15", "suggested_weight": 12, "rest_seconds": 45, "muscle_group": "Shoulders", "notes": "Use a slow tempo to feel the delts."},
        {"name": "Triceps Pushdown", "category": "accessory", "sets": 3, "reps": "10-12", "suggested_weight": 25, "rest_seconds": 45, "muscle_group": "Triceps", "notes": "Keep your elbows pinned to your sides."},
    ],
    "Pull": [
        {"name": "Barbell Row", "category": "compound", "sets": 4, "reps": "6-8", "suggested_weight": 70, "rest_seconds": 90, "muscle_group": "Back", "notes": "Lead with your elbows and avoid shrugging."},
        {"name": "Lat Pulldown", "category": "compound", "sets": 3, "reps": "10-12", "suggested_weight": 55, "rest_seconds": 75, "muscle_group": "Back", "notes": "Pull to the upper chest and control the return."},
        {"name": "Face Pull", "category": "accessory", "sets": 3, "reps": "12-15", "suggested_weight": 20, "rest_seconds": 45, "muscle_group": "Rear Delts", "notes": "Focus on external rotation and posture."},
        {"name": "Hammer Curl", "category": "accessory", "sets": 3, "reps": "10-12", "suggested_weight": 15, "rest_seconds": 45, "muscle_group": "Biceps", "notes": "Keep the wrists neutral for comfort."},
        {"name": "Rear Delt Fly", "category": "accessory", "sets": 3, "reps": "12-15", "suggested_weight": 10, "rest_seconds": 45, "muscle_group": "Rear Delts", "notes": "Use a light load and squeeze the upper back."},
    ],
    "Legs": [
        {"name": "Back Squat", "category": "compound", "sets": 4, "reps": "6-8", "suggested_weight": 80, "rest_seconds": 120, "muscle_group": "Quads", "notes": "Brace your core and sit until your depth feels strong."},
        {"name": "Romanian Deadlift", "category": "compound", "sets": 3, "reps": "8-10", "suggested_weight": 70, "rest_seconds": 90, "muscle_group": "Hamstrings", "notes": "Hinge through the hips and keep the spine neutral."},
        {"name": "Leg Press", "category": "compound", "sets": 3, "reps": "10-12", "suggested_weight": 120, "rest_seconds": 75, "muscle_group": "Quads", "notes": "Use a full range of motion and control the eccentric."},
        {"name": "Walking Lunge", "category": "accessory", "sets": 3, "reps": "10/leg", "suggested_weight": 20, "rest_seconds": 60, "muscle_group": "Glutes", "notes": "Stay balanced and keep the torso upright."},
        {"name": "Standing Calf Raise", "category": "accessory", "sets": 4, "reps": "15-20", "suggested_weight": 25, "rest_seconds": 45, "muscle_group": "Calves", "notes": "Pause at the top for a full stretch."},
    ],
    "Upper": [
        {"name": "Incline Dumbbell Press", "category": "compound", "sets": 4, "reps": "8-10", "suggested_weight": 30, "rest_seconds": 90, "muscle_group": "Chest", "notes": "Keep the movement smooth and controlled."},
        {"name": "Pull-Up", "category": "compound", "sets": 3, "reps": "6-10", "suggested_weight": None, "rest_seconds": 75, "muscle_group": "Back", "notes": "Use a full stretch and squeeze the lats."},
        {"name": "Seated Shoulder Press", "category": "compound", "sets": 3, "reps": "8-10", "suggested_weight": 40, "rest_seconds": 75, "muscle_group": "Shoulders", "notes": "Stay tall and avoid excessive arching."},
        {"name": "Cable Row", "category": "accessory", "sets": 3, "reps": "10-12", "suggested_weight": 45, "rest_seconds": 60, "muscle_group": "Back", "notes": "Pull the elbows back rather than just the hands."},
        {"name": "Triceps Pushdown", "category": "accessory", "sets": 3, "reps": "10-12", "suggested_weight": 25, "rest_seconds": 45, "muscle_group": "Triceps", "notes": "Keep the elbows tucked and move slowly."},
    ],
    "Lower": [
        {"name": "Goblet Squat", "category": "compound", "sets": 4, "reps": "8-10", "suggested_weight": 20, "rest_seconds": 90, "muscle_group": "Quads", "notes": "Use the dumbbell close to your chest for balance."},
        {"name": "Hip Thrust", "category": "compound", "sets": 3, "reps": "10-12", "suggested_weight": 60, "rest_seconds": 75, "muscle_group": "Glutes", "notes": "Drive through the heels and keep the ribs down."},
        {"name": "Romanian Deadlift", "category": "compound", "sets": 3, "reps": "8-10", "suggested_weight": 70, "rest_seconds": 90, "muscle_group": "Hamstrings", "notes": "Keep the bar close and hinge from the hips."},
        {"name": "Seated Calf Raise", "category": "accessory", "sets": 4, "reps": "15-20", "suggested_weight": 20, "rest_seconds": 45, "muscle_group": "Calves", "notes": "Pause on every rep for a fuller stretch."},
        {"name": "Glute Bridge", "category": "accessory", "sets": 3, "reps": "12-15", "suggested_weight": 20, "rest_seconds": 45, "muscle_group": "Glutes", "notes": "Squeeze hard at the top for a strong finish."},
    ],
}


def _normalize_split_name(split: str | None) -> str:
    if not split:
        return "Push"
    mapping = {
        "push": "Push",
        "pull": "Pull",
        "legs": "Legs",
        "upper": "Upper",
        "lower": "Lower",
    }
    return mapping.get(split.strip().lower(), split.title())


def _build_split_exercises(split: str, profile: dict, params: dict) -> list[dict]:
    exercises = list(SPLIT_TEMPLATES.get(split, SPLIT_TEMPLATES["Push"]))
    goal = (params.get("goal") or profile.get("goal") or "General fitness").lower()
    experience = (params.get("experience_level") or profile.get("gym_experience") or "Intermediate").lower()
    injuries = str(profile.get("injuries") or "").lower()
    limitations = str(profile.get("physical_limitations") or "").lower()

    for exercise in exercises:
        if experience == "beginner":
            exercise["sets"] = max(2, exercise["sets"] - 1)
            exercise["reps"] = "10-12" if exercise["reps"].endswith("-8") else exercise["reps"]
        elif experience == "advanced":
            exercise["sets"] = min(5, exercise["sets"] + 1)

        if goal in {"cut", "recomposition", "general fitness"}:
            exercise["reps"] = "12-15" if exercise["reps"].startswith("6") else exercise["reps"]

        if split == "Push" and ("shoulder" in injuries or "rotator" in limitations):
            if exercise["name"] == "Seated Shoulder Press":
                exercise["name"] = "Machine Shoulder Press"
                exercise["notes"] = "Use a neutral grip and stop if pain appears."
        if split == "Legs" and ("knee" in injuries or "back" in limitations):
            if exercise["name"] == "Back Squat":
                exercise["name"] = "Leg Press"
                exercise["notes"] = "Use a controlled tempo and avoid deep knee flexion if it irritates the joint."

    return exercises


def generate_split_workout(user_id: str, profile: dict, params: dict) -> dict:
    admin = get_supabase_admin()
    split = _normalize_split_name(params.get("split") or params.get("name"))
    goal = params.get("goal") or profile.get("goal") or "General fitness"
    experience = params.get("experience_level") or profile.get("gym_experience") or "Intermediate"
    today = str(date.today())
    exercises = _build_split_exercises(split, profile, params)

    existing_plan = get_latest_plan_for_today(admin, user_id, split)
    plan_id = existing_plan["id"] if existing_plan else None

    if plan_id:
        existing_days = admin.table("workout_days").select("id").eq("workout_plan_id", plan_id).execute()
        for day in existing_days.data:
            admin.table("workout_exercises").delete().eq("workout_day_id", day["id"]).execute()
        admin.table("workout_days").delete().eq("workout_plan_id", plan_id).execute()
        admin.table("workout_plans").update({
            "name": f"{split} Day • {goal}",
            "description": f"AI-generated {split} workout for {goal}",
            "goal": goal,
            "experience_level": experience,
            "generated_by_ai": True,
            "is_active": True,
        }).eq("id", plan_id).execute()
        plan = {"id": plan_id}
    else:
        plan_result = admin.table("workout_plans").insert({
            "user_id": user_id,
            "name": f"{split} Day • {goal}",
            "description": f"AI-generated {split} workout for {goal}",
            "goal": goal,
            "experience_level": experience,
            "days_per_week": 1,
            "duration_weeks": 1,
            "is_active": True,
            "generated_by_ai": True,
            "start_date": today,
        }).execute()
        plan = plan_result.data[0]
        plan_id = plan["id"]

    day_result = admin.table("workout_days").insert({
        "user_id": user_id,
        "workout_plan_id": plan_id,
        "day_number": 1,
        "day_name": f"{split} Day",
        "focus_area": f"{split} focused training",
    }).execute()
    day_id = day_result.data[0]["id"]

    for index, exercise in enumerate(exercises):
        admin.table("workout_exercises").insert({
            "user_id": user_id,
            "workout_day_id": day_id,
            "exercise_name": exercise["name"],
            "exercise_category": exercise.get("category", "compound"),
            "muscle_group": exercise.get("muscle_group"),
            "sets": exercise.get("sets", 3),
            "target_reps": exercise.get("reps", "10"),
            "target_weight": exercise.get("suggested_weight"),
            "rest_seconds": exercise.get("rest_seconds", 60),
            "instructions": exercise.get("notes"),
            "sort_order": index,
        }).execute()

    plan["day_id"] = day_id
    plan["split_name"] = split
    return plan


def generate_workout_plan(user_id: str, profile: dict, params: dict) -> dict:
    admin = get_supabase_admin()
    days_per_week = params.get("days_per_week", 4)
    template_key = 4 if days_per_week >= 4 else 3
    template = WORKOUT_TEMPLATES[template_key]

    goal = params.get("goal") or profile.get("goal") or "General fitness"
    experience = params.get("experience_level") or profile.get("gym_experience") or "Intermediate"

    plan_result = admin.table("workout_plans").insert({
        "user_id": user_id,
        "name": f"{template['name']} - {goal}",
        "description": f"AI-generated {template['name']} plan for {goal} goal",
        "goal": goal,
        "experience_level": experience,
        "days_per_week": template_key,
        "duration_weeks": 8,
        "is_active": True,
        "generated_by_ai": True,
        "start_date": str(date.today()),
    }).execute()

    plan = plan_result.data[0]
    plan_id = plan["id"]

    for i, day in enumerate(template["days"], 1):
        day_result = admin.table("workout_days").insert({
            "user_id": user_id,
            "workout_plan_id": plan_id,
            "day_number": i,
            "day_name": day["day_name"],
            "focus_area": day["focus_area"],
        }).execute()
        day_id = day_result.data[0]["id"]

        for j, (name, muscle, sets, reps, rest) in enumerate(day["exercises"]):
            admin.table("workout_exercises").insert({
                "user_id": user_id,
                "workout_day_id": day_id,
                "exercise_name": name,
                "muscle_group": muscle,
                "sets": sets,
                "target_reps": reps,
                "rest_seconds": rest,
                "sort_order": j,
            }).execute()

    return plan


def calculate_nutrition_targets(profile: dict) -> dict:
    weight = float(profile.get("current_weight_kg") or 75)
    height = float(profile.get("height_cm") or 175)
    age = int(profile.get("age") or 30)
    gender = (profile.get("gender") or "male").lower()
    activity = profile.get("activity_level") or "Moderately active"
    goal = profile.get("goal") or "Maintain"

    activity_multipliers = {
        "Sedentary": 1.2,
        "Lightly active": 1.375,
        "Moderately active": 1.55,
        "Very active": 1.725,
        "Extremely active": 1.9,
    }
    multiplier = activity_multipliers.get(activity, 1.55)

    if gender in ("female", "f"):
        bmr = 10 * weight + 6.25 * height - 5 * age - 161
    else:
        bmr = 10 * weight + 6.25 * height - 5 * age + 5

    tdee = bmr * multiplier

    if goal == "Cut":
        calories = int(tdee - 500)
        protein = int(weight * 2.2)
    elif goal == "Bulk":
        calories = int(tdee + 300)
        protein = int(weight * 2.0)
    elif goal == "Strength":
        calories = int(tdee + 200)
        protein = int(weight * 2.2)
    else:
        calories = int(tdee)
        protein = int(weight * 1.8)

    fat = int(calories * 0.25 / 9)
    carbs = int((calories - protein * 4 - fat * 9) / 4)

    return {
        "calorie_target": max(calories, 1200),
        "protein_target_g": protein,
        "carbohydrate_target_g": max(carbs, 50),
        "fat_target_g": fat,
        "fiber_target_g": 30,
        "water_target_ml": int(weight * 35),
        "target_type": "daily",
        "effective_from": str(date.today()),
    }

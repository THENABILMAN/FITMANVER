"""FITMAN demo seed script — development only."""
import os
import sys
from datetime import date, timedelta
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.database import get_supabase_admin
from app.auth.service import AuthService

DEMO_USERNAME = "demo_fitness"
DEMO_PASSWORD = "Demo1234!"


def seed():
    admin = get_supabase_admin()
    auth = AuthService()

    # Skip if demo user exists
    existing = admin.table("profiles").select("user_id").ilike("username", DEMO_USERNAME).execute()
    if existing.data:
        print(f"Demo user '{DEMO_USERNAME}' already exists. Skipping seed.")
        return

    print("Creating demo user...")
    result = auth.register(DEMO_USERNAME, DEMO_PASSWORD, DEMO_PASSWORD, "demo@fitman.dev")
    user_id = result["user"]["id"]

    admin.table("profiles").update({
        "display_name": "Demo Athlete",
        "age": 28,
        "gender": "male",
        "height_cm": 178,
        "current_weight_kg": 82,
        "target_weight_kg": 78,
        "goal": "Cut",
        "activity_level": "Moderately active",
        "gym_experience": "Intermediate",
        "dietary_preferences": "High protein",
        "onboarding_completed": True,
    }).eq("user_id", user_id).execute()

    from app.workouts.service import generate_workout_plan, calculate_nutrition_targets
    profile = admin.table("profiles").select("*").eq("user_id", user_id).single().execute().data
    generate_workout_plan(user_id, profile, {"days_per_week": 4, "goal": "Cut"})
    targets = calculate_nutrition_targets(profile)
    admin.table("nutrition_targets").insert({**targets, "user_id": user_id}).execute()

    # Weight logs over 8 weeks
    for i in range(8):
        admin.table("weight_logs").insert({
            "user_id": user_id,
            "weight_kg": 82 - i * 0.4,
            "logged_at": (date.today() - timedelta(weeks=8 - i)).isoformat(),
        }).execute()

    # Food logs
    foods = [
        ("Breakfast", "Oatmeal with protein", 450, 35, 55, 10),
        ("Lunch", "Chicken rice bowl", 650, 45, 70, 15),
        ("Dinner", "Salmon and vegetables", 550, 40, 30, 25),
    ]
    for meal, name, cal, prot, carb, fat in foods:
        admin.table("food_logs").insert({
            "user_id": user_id,
            "logged_date": str(date.today()),
            "meal_type": meal,
            "food_name": name,
            "calories": cal,
            "protein_g": prot,
            "carbohydrates_g": carb,
            "fat_g": fat,
        }).execute()

    # Coach conversation
    conv = admin.table("coach_conversations").insert({
        "user_id": user_id,
        "title": "Adjusting my program",
    }).execute()
    conv_id = conv.data[0]["id"]
    admin.table("coach_messages").insert([
        {"user_id": user_id, "conversation_id": conv_id, "role": "User", "content": "How should I adjust after missing workouts?"},
        {"user_id": user_id, "conversation_id": conv_id, "role": "Assistant", "content": "Focus on consistency this week. Reduce volume by 10% and prioritize compound movements."},
    ]).execute()

    # Memory
    admin.table("user_memories").insert({
        "user_id": user_id,
        "memory_type": "workout_habit",
        "memory_key": "schedule",
        "memory_value": "Usually trains Mon/Wed/Fri mornings",
        "importance_score": 0.8,
    }).execute()

    print(f"Demo seed complete. Login: {DEMO_USERNAME} / {DEMO_PASSWORD}")


if __name__ == "__main__":
    seed()

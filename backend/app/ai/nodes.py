from datetime import date
from app.database import get_supabase_admin
from app.ai.prompts import INTENT_KEYWORDS
from app.ai.safety import check_safety, validate_no_diagnosis
from app.config import get_settings


def classify_intent(message: str) -> str:
    lower = message.lower()
    for intent, keywords in INTENT_KEYWORDS.items():
        if any(kw in lower for kw in keywords):
            return intent
    return "general_coaching"


def fetch_user_context(user_id: str, profile: dict) -> dict:
    admin = get_supabase_admin()
    workouts = admin.table("workout_plans").select("name, goal, is_active").eq("user_id", user_id).eq("is_active", True).limit(1).execute()
    sessions = admin.table("workout_sessions").select("status, session_date").eq("user_id", user_id).order("session_date", desc=True).limit(10).execute()
    targets = admin.table("nutrition_targets").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
    food = admin.table("food_logs").select("food_name, calories, protein_g, meal_type").eq("user_id", user_id).eq("logged_date", str(date.today())).execute()
    weights = admin.table("weight_logs").select("weight_kg, logged_at").eq("user_id", user_id).order("logged_at", desc=True).limit(5).execute()
    memories = admin.table("user_memories").select("*").eq("user_id", user_id).order("importance_score", desc=True).limit(10).execute()

    return {
        "profile": profile,
        "workout_context": {
            "active_plan": workouts.data[0] if workouts.data else None,
            "recent_sessions": sessions.data,
        },
        "nutrition_context": {
            "targets": targets.data[0] if targets.data else None,
            "today_food": food.data,
        },
        "progress_context": {
            "recent_weights": weights.data,
        },
        "memory_context": memories.data,
    }


def extract_memories(user_id: str, message: str, response: str) -> None:
    """Extract useful memories from conversation."""
    if not message:
        return
    admin = get_supabase_admin()
    profile = admin.table("profiles").select("memory_enabled").eq("user_id", user_id).single().execute()
    if not profile.data or not profile.data.get("memory_enabled", True):
        return

    lower = message.lower()
    memories_to_store = []

    preference_patterns = [
        ("food preference", ["i love", "i like", "my favorite food", "i enjoy eating"]),
        ("food dislike", ["i hate", "i dislike", "can't eat", "allergic to", "allergy"]),
        ("injury", ["injured", "pain in", " hurts", "sore ", "can't do"]),
        ("schedule", ["i usually train", "i work out on", "my schedule", "i gym on"]),
    ]

    for mem_type, patterns in preference_patterns:
        if any(p in lower for p in patterns):
            memories_to_store.append({
                "user_id": user_id,
                "memory_type": mem_type.replace(" ", "_"),
                "memory_key": mem_type,
                "memory_value": message[:500],
                "importance_score": 0.7,
                "source": "conversation",
            })
            break

    for mem in memories_to_store:
        admin.table("user_memories").insert(mem).execute()


async def run_coach(user_id: str, profile: dict, message: str, conversation_id: str) -> str:
    settings = get_settings()
    context = fetch_user_context(user_id, profile)
    intent = classify_intent(message)

    system_prompt = f"""You are FITMAN, an expert AI fitness and nutrition coach.

IMPORTANT: FITMAN is not a medical professional. All nutrition values are estimates.

User Profile: {context['profile']}
Active Workout Plan: {context['workout_context']}
Nutrition Today: {context['nutrition_context']}
Recent Progress: {context['progress_context']}
Memories: {context['memory_context']}
Detected Intent: {intent}

Provide personalized, actionable coaching. Be motivating and specific."""

    try:
        from langchain_groq import ChatGroq
        from langchain_core.messages import SystemMessage, HumanMessage

        llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            api_key=settings.llm_api_key,
            temperature=0.7,
        )

        admin = get_supabase_admin()
        history = admin.table("coach_messages").select("role, content").eq(
            "conversation_id", conversation_id
        ).order("created_at").limit(20).execute()

        messages = [SystemMessage(content=system_prompt)]
        for msg in history.data:
            if msg["role"] == "User":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "Assistant":
                from langchain_core.messages import AIMessage
                messages.append(AIMessage(content=msg["content"]))
        messages.append(HumanMessage(content=message))

        result = await llm.ainvoke(messages)
        response = result.content
    except Exception as e:
        response = (
            f"I understand you're asking about: {message}\n\n"
            f"Based on your profile (Goal: {profile.get('goal', 'General fitness')}, "
            f"Experience: {profile.get('gym_experience', 'Intermediate')}), "
            f"I recommend focusing on consistency with your current plan. "
            f"Track your workouts and nutrition daily for the best results.\n\n"
            f"*Note: AI service temporarily limited. Error: {str(e)[:100]}*"
        )

    response = validate_no_diagnosis(response)
    response = check_safety(message, response)
    extract_memories(user_id, message, response)
    return response

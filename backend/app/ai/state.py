from typing import TypedDict


class CoachState(TypedDict, total=False):
    user_id: str
    message: str
    conversation_id: str
    intent: str
    profile: dict
    workout_context: dict
    nutrition_context: dict
    progress_context: dict
    memory_context: list
    document_context: list
    tool_results: list
    response: str
    messages: list

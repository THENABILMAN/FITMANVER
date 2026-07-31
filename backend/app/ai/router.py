from typing import AsyncGenerator
from pydantic import BaseModel
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from app.dependencies import get_current_user
from app.database import get_supabase_admin
from app.ai.nodes import run_coach
from app.common.responses import success_response
import json

router = APIRouter(prefix="/api/coach", tags=["coach"])


class ConversationCreate(BaseModel):
    title: str = "New Conversation"
    conversation_type: str = "general"


class MessageCreate(BaseModel):
    content: str


@router.get("/conversations")
async def list_conversations(user=Depends(get_current_user)):
    admin = get_supabase_admin()
    result = admin.table("coach_conversations").select("*").eq("user_id", user["user_id"]).order("updated_at", desc=True).execute()
    return success_response(result.data)


@router.post("/conversations")
async def create_conversation(body: ConversationCreate, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    result = admin.table("coach_conversations").insert({
        "user_id": user["user_id"],
        "title": body.title,
        "conversation_type": body.conversation_type,
    }).execute()
    return success_response(result.data[0])


@router.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    conv = admin.table("coach_conversations").select("*").eq("id", conversation_id).eq("user_id", user["user_id"]).single().execute()
    messages = admin.table("coach_messages").select("*").eq("conversation_id", conversation_id).order("created_at").execute()
    data = conv.data
    data["messages"] = messages.data
    return success_response(data)


@router.post("/conversations/{conversation_id}/messages")
async def send_message(conversation_id: str, body: MessageCreate, user=Depends(get_current_user)):
    admin = get_supabase_admin()

    admin.table("coach_messages").insert({
        "user_id": user["user_id"],
        "conversation_id": conversation_id,
        "role": "User",
        "content": body.content,
    }).execute()

    response = await run_coach(user["user_id"], user["profile"], body.content, conversation_id)

    admin.table("coach_messages").insert({
        "user_id": user["user_id"],
        "conversation_id": conversation_id,
        "role": "Assistant",
        "content": response,
    }).execute()

    if body.content:
        title = body.content[:50] + ("..." if len(body.content) > 50 else "")
        admin.table("coach_conversations").update({"title": title}).eq("id", conversation_id).execute()

    return success_response({"response": response})


@router.post("/conversations/{conversation_id}/messages/stream")
async def stream_message(conversation_id: str, body: MessageCreate, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    admin.table("coach_messages").insert({
        "user_id": user["user_id"],
        "conversation_id": conversation_id,
        "role": "User",
        "content": body.content,
    }).execute()

    response = await run_coach(user["user_id"], user["profile"], body.content, conversation_id)

    admin.table("coach_messages").insert({
        "user_id": user["user_id"],
        "conversation_id": conversation_id,
        "role": "Assistant",
        "content": response,
    }).execute()

    async def generate():
        words = response.split(" ")
        for i, word in enumerate(words):
            chunk = word + (" " if i < len(words) - 1 else "")
            yield f"data: {json.dumps({'content': chunk})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    admin.table("coach_messages").delete().eq("conversation_id", conversation_id).execute()
    admin.table("coach_conversations").delete().eq("id", conversation_id).eq("user_id", user["user_id"]).execute()
    return success_response(message="Conversation deleted")

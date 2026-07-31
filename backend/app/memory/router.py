from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
from app.database import get_supabase_admin
from app.memory.schemas import MemoryUpdate, MemorySettings
from app.common.responses import success_response

router = APIRouter(prefix="/api/memories", tags=["memories"])


@router.get("")
async def list_memories(user=Depends(get_current_user)):
    admin = get_supabase_admin()
    result = admin.table("user_memories").select("*").eq("user_id", user["user_id"]).order("importance_score", desc=True).execute()
    return success_response(result.data)


@router.put("/settings")
async def memory_settings(body: MemorySettings, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    admin.table("profiles").update({"memory_enabled": body.memory_enabled}).eq("user_id", user["user_id"]).execute()
    return success_response({"memory_enabled": body.memory_enabled})


@router.put("/{memory_id}")
async def update_memory(memory_id: str, body: MemoryUpdate, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    update_data = body.model_dump(exclude_none=True)
    result = admin.table("user_memories").update(update_data).eq("id", memory_id).eq("user_id", user["user_id"]).execute()
    return success_response(result.data[0] if result.data else None)


@router.delete("/{memory_id}")
async def delete_memory(memory_id: str, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    admin.table("user_memories").delete().eq("id", memory_id).eq("user_id", user["user_id"]).execute()
    return success_response(message="Memory deleted")


@router.delete("")
async def clear_memories(user=Depends(get_current_user)):
    admin = get_supabase_admin()
    admin.table("user_memories").delete().eq("user_id", user["user_id"]).execute()
    return success_response(message="All memories cleared")

from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
from app.common.responses import success_response

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.get("")
async def list_documents(user=Depends(get_current_user)):
    from app.database import get_supabase_admin
    admin = get_supabase_admin()
    result = admin.table("uploaded_documents").select("*").eq("user_id", user["user_id"]).order("created_at", desc=True).execute()
    return success_response(result.data)


@router.post("/upload")
async def upload_document(user=Depends(get_current_user)):
    return success_response({"status": "coming_soon"}, "Document upload and RAG coming soon in Phase 2")


@router.post("/query")
async def query_documents(user=Depends(get_current_user)):
    return success_response({"status": "coming_soon"}, "Document Q&A coming soon in Phase 2")


integrations_router = APIRouter(prefix="/api/integrations", tags=["integrations"])


@integrations_router.get("/google-calendar/connect")
async def google_calendar_connect(user=Depends(get_current_user)):
    return success_response({"status": "coming_soon"}, "Google Calendar integration coming soon")


@integrations_router.get("/status")
async def integration_status(user=Depends(get_current_user)):
    return success_response({
        "google_calendar": "coming_soon",
        "gmail": "coming_soon",
        "fitbit": "coming_soon",
        "garmin": "coming_soon",
        "apple_health": "coming_soon",
        "google_fit": "coming_soon",
    })

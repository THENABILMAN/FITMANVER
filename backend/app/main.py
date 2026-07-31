from fastapi import FastAPI, Request, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import get_settings
from app.auth.router import router as auth_router
from app.users.router import router as profile_router
from app.workouts.router import router as workouts_router
from app.nutrition.router import router as nutrition_router
from app.progress.router import router as progress_router
from app.memory.router import router as memory_router
from app.ai.router import router as coach_router
from app.documents.router import router as documents_router, integrations_router

settings = get_settings()
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="FITMAN API",
    description="AI Fitness and Nutrition Coaching Platform",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    if isinstance(exc.detail, dict):
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "error": exc.detail},
        )
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": {"code": "ERROR", "message": str(exc.detail)}},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    first_error = exc.errors()[0] if exc.errors() else None
    loc = first_error.get("loc", []) if first_error else []
    field = loc[-1] if loc else "body"
    message = first_error.get("msg", "Invalid request") if first_error else "Invalid request"
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {"code": "VALIDATION_ERROR", "message": f"{field}: {message}"},
        },
    )


@app.get("/api/health")
async def health():
    return {"success": True, "data": {"status": "healthy", "app": "FITMAN"}}


app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(workouts_router)
app.include_router(nutrition_router)
app.include_router(progress_router)
app.include_router(memory_router)
app.include_router(coach_router)
app.include_router(documents_router)
app.include_router(integrations_router)

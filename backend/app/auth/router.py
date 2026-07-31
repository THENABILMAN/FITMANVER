from fastapi import APIRouter, Depends, Header
from app.auth.schemas import (
    RegisterRequest,
    LoginRequest,
    RefreshRequest,
    ForgotPasswordRequest,
    ChangePasswordRequest,
)
from app.auth.service import AuthService
from app.common.responses import success_response
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register")
async def register(body: RegisterRequest):
    service = AuthService()
    data = service.register(body.username, body.password, body.confirm_password, body.email)
    return success_response(data, "Account created successfully")


@router.post("/login")
async def login(body: LoginRequest):
    service = AuthService()
    data = service.login(body.username, body.password)
    return success_response(data, "Logged in successfully")


@router.post("/logout")
async def logout(authorization: str = Header(...), user=Depends(get_current_user)):
    token = authorization.replace("Bearer ", "")
    AuthService().logout(token)
    return success_response(message="Logged out successfully")


@router.post("/refresh")
async def refresh(body: RefreshRequest):
    service = AuthService()
    data = service.refresh(body.refresh_token)
    return success_response(data)


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest):
    service = AuthService()
    data = service.forgot_password(body.username)
    return success_response(data)


@router.post("/change-password")
async def change_password(body: ChangePasswordRequest, user=Depends(get_current_user)):
    if body.new_password != body.confirm_password:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=400,
            detail={"code": "PASSWORD_MISMATCH", "message": "Passwords do not match"},
        )
    service = AuthService()
    service.change_password(
        user["user_id"], user["username"], body.current_password, body.new_password
    )
    return success_response(message="Password changed successfully")


@router.get("/me")
async def me(user=Depends(get_current_user)):
    return success_response(user)


@router.delete("/account")
async def delete_account(user=Depends(get_current_user)):
    AuthService().delete_account(user["user_id"])
    return success_response(message="Account deleted successfully")

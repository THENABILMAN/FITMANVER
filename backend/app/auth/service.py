from fastapi import HTTPException
from app.database import get_supabase_admin
from app.auth.security import (
    validate_username,
    validate_password,
    username_to_auth_email,
)


class AuthService:
    def __init__(self):
        self.admin = get_supabase_admin()

    def _username_exists(self, username: str) -> bool:
        result = (
            self.admin.table("profiles")
            .select("id")
            .ilike("username", username)
            .limit(1)
            .execute()
        )
        return len(result.data) > 0

    def register(
        self, username: str, password: str, confirm_password: str, email: str | None = None
    ) -> dict:
        valid, msg = validate_username(username)
        if not valid:
            raise HTTPException(status_code=400, detail={"code": "INVALID_USERNAME", "message": msg})

        valid, msg = validate_password(password)
        if not valid:
            raise HTTPException(status_code=400, detail={"code": "WEAK_PASSWORD", "message": msg})

        if password != confirm_password:
            raise HTTPException(
                status_code=400,
                detail={"code": "PASSWORD_MISMATCH", "message": "Passwords do not match"},
            )

        if self._username_exists(username):
            raise HTTPException(
                status_code=409,
                detail={"code": "USERNAME_ALREADY_EXISTS", "message": "This username is already in use"},
            )

        auth_email = username_to_auth_email(username)
        try:
            auth_response = self.admin.auth.admin.create_user(
                {
                    "email": auth_email,
                    "password": password,
                    "email_confirm": True,
                    "user_metadata": {"username": username.lower(), "display_username": username},
                }
            )
        except Exception as e:
            err = str(e)
            if "already" in err.lower():
                raise HTTPException(
                    status_code=409,
                    detail={"code": "USERNAME_ALREADY_EXISTS", "message": "This username is already in use"},
                )
            raise HTTPException(status_code=500, detail={"code": "REGISTRATION_FAILED", "message": err})

        user_id = auth_response.user.id

        profile_data = {
            "user_id": user_id,
            "username": username,
            "email": email,
            "display_name": username,
            "onboarding_completed": False,
        }
        self.admin.table("profiles").insert(profile_data).execute()

        session = self.admin.auth.sign_in_with_password({"email": auth_email, "password": password})
        return {
            "access_token": session.session.access_token,
            "refresh_token": session.session.refresh_token,
            "token_type": "bearer",
            "expires_in": session.session.expires_in,
            "user": {
                "id": user_id,
                "username": username,
                "email": email,
                "onboarding_completed": False,
            },
        }

    def login(self, username: str, password: str) -> dict:
        profile = (
            self.admin.table("profiles")
            .select("user_id, username, email, display_name, onboarding_completed")
            .ilike("username", username)
            .limit(1)
            .execute()
        )
        if not profile.data:
            raise HTTPException(
                status_code=401,
                detail={"code": "INVALID_CREDENTIALS", "message": "Invalid username or password"},
            )

        p = profile.data[0]
        auth_email = username_to_auth_email(p["username"])

        try:
            session = self.admin.auth.sign_in_with_password({"email": auth_email, "password": password})
        except Exception:
            raise HTTPException(
                status_code=401,
                detail={"code": "INVALID_CREDENTIALS", "message": "Invalid username or password"},
            )

        return {
            "access_token": session.session.access_token,
            "refresh_token": session.session.refresh_token,
            "token_type": "bearer",
            "expires_in": session.session.expires_in,
            "user": {
                "id": p["user_id"],
                "username": p["username"],
                "email": p.get("email"),
                "display_name": p.get("display_name"),
                "onboarding_completed": p.get("onboarding_completed", False),
            },
        }

    def refresh(self, refresh_token: str) -> dict:
        try:
            session = self.admin.auth.refresh_session(refresh_token)
            return {
                "access_token": session.session.access_token,
                "refresh_token": session.session.refresh_token,
                "token_type": "bearer",
                "expires_in": session.session.expires_in,
            }
        except Exception:
            raise HTTPException(
                status_code=401,
                detail={"code": "INVALID_TOKEN", "message": "Invalid or expired refresh token"},
            )

    def logout(self, access_token: str) -> None:
        try:
            self.admin.auth.sign_out(access_token)
        except Exception:
            pass

    def get_user_from_token(self, access_token: str) -> dict:
        try:
            user = self.admin.auth.get_user(access_token)
            profile = (
                self.admin.table("profiles")
                .select("*")
                .eq("user_id", user.user.id)
                .single()
                .execute()
            )
            return {"auth_user": user.user, "profile": profile.data}
        except Exception:
            raise HTTPException(
                status_code=401,
                detail={"code": "UNAUTHORIZED", "message": "Invalid or expired token"},
            )

    def change_password(self, user_id: str, username: str, current_password: str, new_password: str) -> None:
        auth_email = username_to_auth_email(username)
        try:
            self.admin.auth.sign_in_with_password({"email": auth_email, "password": current_password})
        except Exception:
            raise HTTPException(
                status_code=400,
                detail={"code": "INVALID_PASSWORD", "message": "Current password is incorrect"},
            )

        valid, msg = validate_password(new_password)
        if not valid:
            raise HTTPException(status_code=400, detail={"code": "WEAK_PASSWORD", "message": msg})

        self.admin.auth.admin.update_user_by_id(user_id, {"password": new_password})

    def delete_account(self, user_id: str) -> None:
        self.admin.auth.admin.delete_user(user_id)

    def forgot_password(self, username: str) -> dict:
        profile = (
            self.admin.table("profiles")
            .select("email, username")
            .ilike("username", username)
            .limit(1)
            .execute()
        )
        if not profile.data:
            return {"message": "If the account exists, reset instructions have been sent."}

        p = profile.data[0]
        recovery_email = p.get("email") or username_to_auth_email(p["username"])
        try:
            self.admin.auth.reset_password_email(recovery_email)
        except Exception:
            pass
        return {"message": "If the account exists, reset instructions have been sent."}

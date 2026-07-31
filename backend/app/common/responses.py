from typing import Any, Generic, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class ErrorDetail(BaseModel):
    code: str
    message: str


class ApiResponse(BaseModel, Generic[T]):
    success: bool
    data: T | None = None
    message: str | None = None
    error: ErrorDetail | None = None


def success_response(data: Any = None, message: str | None = None) -> dict:
    return {"success": True, "data": data, "message": message}


def error_response(code: str, message: str, status_code: int = 400) -> tuple[dict, int]:
    return {"success": False, "error": {"code": code, "message": message}}, status_code

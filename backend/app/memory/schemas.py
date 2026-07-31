from pydantic import BaseModel


class MemoryUpdate(BaseModel):
    memory_type: str | None = None
    memory_key: str | None = None
    memory_value: str | None = None
    importance_score: float | None = None


class MemorySettings(BaseModel):
    memory_enabled: bool

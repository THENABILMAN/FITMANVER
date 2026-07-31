from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    jwt_secret: str = ""
    supabase_jwt_secret: str = ""
    ai_api_key: str = ""
    groq_api_key: str = ""
    backend_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:5173"

    class Config:
        env_file = (".env", "../.env", "../../.env")
        env_file_encoding = "utf-8"
        extra = "ignore"

    @property
    def effective_jwt_secret(self) -> str:
        return self.jwt_secret or self.supabase_jwt_secret

    @property
    def llm_api_key(self) -> str:
        return self.groq_api_key or self.ai_api_key


@lru_cache
def get_settings() -> Settings:
    return Settings()

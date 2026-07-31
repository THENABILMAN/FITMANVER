from supabase import create_client, Client
from app.config import get_settings

_settings = get_settings()


def get_supabase_admin() -> Client:
    """Service-role client for backend-only operations."""
    return create_client(_settings.supabase_url, _settings.supabase_service_role_key)


def get_supabase_client(access_token: str | None = None) -> Client:
    """Anon client, optionally scoped to a user session."""
    client = create_client(_settings.supabase_url, _settings.supabase_anon_key)
    if access_token:
        client.postgrest.auth(access_token)
    return client

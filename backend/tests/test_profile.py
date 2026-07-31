from fastapi.testclient import TestClient

from app.main import app
import app.users.router as profile_router


class FakeAdmin:
    def __init__(self):
        self.updated_data = None
        self.user_id = None

    def table(self, name):
        return self

    def update(self, data):
        self.updated_data = data
        return self

    def eq(self, column, value):
        self.user_id = value
        return self

    def execute(self):
        return type("Result", (), {"data": [{**self.updated_data, "user_id": self.user_id}]})()


def test_profile_update_maps_alias_fields(monkeypatch):
    fake_admin = FakeAdmin()

    def override_get_current_user():
        return {
            "user_id": "11111111-1111-1111-1111-111111111111",
            "profile": {"user_id": "11111111-1111-1111-1111-111111111111", "username": "tester"},
        }

    monkeypatch.setattr(profile_router, "get_supabase_admin", lambda: fake_admin)
    app.dependency_overrides[profile_router.get_current_user] = override_get_current_user

    client = TestClient(app)
    response = client.put(
        "/api/profile",
        json={"days_per_week": 5, "session_duration": 75},
    )

    assert response.status_code == 200
    assert response.json()["success"] is True
    assert fake_admin.updated_data["preferred_workout_days"] == "5"
    assert fake_admin.updated_data["preferred_workout_duration"] == 75

    app.dependency_overrides.clear()


def test_onboarding_maps_alias_fields(monkeypatch):
    fake_admin = FakeAdmin()

    def override_get_current_user():
        return {
            "user_id": "11111111-1111-1111-1111-111111111111",
            "profile": {"user_id": "11111111-1111-1111-1111-111111111111", "username": "tester"},
        }

    monkeypatch.setattr(profile_router, "get_supabase_admin", lambda: fake_admin)
    app.dependency_overrides[profile_router.get_current_user] = override_get_current_user

    client = TestClient(app)
    response = client.post(
        "/api/profile/onboarding",
        json={"step": 5, "data": {"days_per_week": 4, "session_duration": 60}},
    )

    assert response.status_code == 200
    assert response.json()["success"] is True
    assert fake_admin.updated_data["preferred_workout_days"] == "4"
    assert fake_admin.updated_data["preferred_workout_duration"] == 60
    assert fake_admin.updated_data["onboarding_completed"] is True

    app.dependency_overrides.clear()

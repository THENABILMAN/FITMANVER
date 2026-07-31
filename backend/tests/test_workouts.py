from fastapi.testclient import TestClient

from app.main import app
import app.workouts.router as workout_router


def test_generate_split_accepts_alias_fields(monkeypatch):
    captured = {}

    def fake_generate_split(user_id, profile, params):
        captured["user_id"] = user_id
        captured["profile"] = profile
        captured["params"] = params
        return {"id": "plan-123"}

    def override_get_current_user():
        return {
            "user_id": "11111111-1111-1111-1111-111111111111",
            "profile": {"user_id": "11111111-1111-1111-1111-111111111111", "username": "tester"},
        }

    monkeypatch.setattr(workout_router, "generate_split_workout", fake_generate_split)
    app.dependency_overrides[workout_router.get_current_user] = override_get_current_user

    client = TestClient(app)
    response = client.post(
        "/api/workouts/generate-split",
        json={"split": "Push", "days_per_week": 5, "session_duration": 75},
    )

    assert response.status_code == 200
    assert response.json()["success"] is True
    assert captured["params"]["days_per_week"] == 5
    assert captured["params"]["session_duration"] == 75

    app.dependency_overrides.clear()

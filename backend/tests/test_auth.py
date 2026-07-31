import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["success"] is True


def test_register_validation():
    response = client.post("/api/auth/register", json={
        "username": "ab",
        "password": "weak",
        "confirm_password": "weak",
    })
    assert response.status_code in (400, 422)


def test_protected_route_unauthorized():
    response = client.get("/api/profile")
    assert response.status_code == 401


def test_duplicate_username():
    username = "testuser_fitman_unique"
    payload = {"username": username, "password": "Test1234!", "confirm_password": "Test1234!"}
    r1 = client.post("/api/auth/register", json=payload)
    if r1.status_code == 200:
        r2 = client.post("/api/auth/register", json=payload)
        assert r2.status_code == 409
        assert r2.json()["error"]["code"] == "USERNAME_ALREADY_EXISTS"


def test_login_invalid():
    response = client.post("/api/auth/login", json={
        "username": "nonexistent_user_xyz",
        "password": "Wrong1234!",
    })
    assert response.status_code == 401

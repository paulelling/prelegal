from fastapi.testclient import TestClient


def test_register_creates_user():
    from main import app
    with TestClient(app) as client:
        res = client.post(
            "/api/auth/register",
            json={"email": "alice@example.com", "password": "securepass123"},
        )
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "alice@example.com"
    assert "token" in data
    assert data["user_id"] > 0


def test_register_normalises_email():
    from main import app
    with TestClient(app) as client:
        res = client.post(
            "/api/auth/register",
            json={"email": "  Alice@Example.COM  ", "password": "securepass123"},
        )
    assert res.status_code == 201
    assert res.json()["email"] == "alice@example.com"


def test_register_rejects_duplicate_email():
    from main import app
    with TestClient(app) as client:
        client.post("/api/auth/register", json={"email": "dup@example.com", "password": "securepass123"})
        res = client.post("/api/auth/register", json={"email": "dup@example.com", "password": "otherpass123"})
    assert res.status_code == 409


def test_register_rejects_short_password():
    from main import app
    with TestClient(app) as client:
        res = client.post(
            "/api/auth/register",
            json={"email": "short@example.com", "password": "short"},
        )
    assert res.status_code == 422


def test_login_returns_token():
    from main import app
    with TestClient(app) as client:
        client.post("/api/auth/register", json={"email": "bob@example.com", "password": "mypassword99"})
        res = client.post("/api/auth/login", json={"email": "bob@example.com", "password": "mypassword99"})
    assert res.status_code == 200
    data = res.json()
    assert "token" in data
    assert data["email"] == "bob@example.com"


def test_login_rejects_wrong_password():
    from main import app
    with TestClient(app) as client:
        client.post("/api/auth/register", json={"email": "carol@example.com", "password": "rightpass99"})
        res = client.post("/api/auth/login", json={"email": "carol@example.com", "password": "wrongpass99"})
    assert res.status_code == 401


def test_login_rejects_unknown_email():
    from main import app
    with TestClient(app) as client:
        res = client.post("/api/auth/login", json={"email": "nobody@example.com", "password": "anypass123"})
    assert res.status_code == 401


def test_token_is_valid_jwt():
    from main import app, jwt, JWT_SECRET, JWT_ALGORITHM
    with TestClient(app) as client:
        res = client.post("/api/auth/register", json={"email": "dave@example.com", "password": "testpass123"})
    token = res.json()["token"]
    payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    assert payload["email"] == "dave@example.com"
    assert "sub" in payload
    assert "exp" in payload

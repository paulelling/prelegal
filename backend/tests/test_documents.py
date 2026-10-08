from fastapi.testclient import TestClient

NDA_FORM = {
    "purpose": "Evaluating a partnership",
    "effectiveDate": "2026-01-01",
    "mndaTermType": "expires",
    "mndaTermYears": 1,
    "confidentialityTermType": "years",
    "confidentialityTermYears": 3,
    "governingLaw": "Delaware",
    "jurisdiction": "Wilmington, Delaware",
    "modifications": "",
    "party1": {"name": "Alice", "title": "CEO", "company": "Acme Inc", "noticeAddress": "alice@acme.com", "date": "2026-01-01"},
    "party2": {"name": "Bob", "title": "CTO", "company": "Beta Corp", "noticeAddress": "bob@beta.com", "date": "2026-01-01"},
}

MESSAGES = [
    {"role": "assistant", "content": "Hello!"},
    {"role": "user", "content": "Let's get started"},
]


def _register_and_auth(client: TestClient, email: str = "user@example.com") -> str:
    res = client.post("/api/auth/register", json={"email": email, "password": "testpassword99"})
    return res.json()["token"]


def test_list_documents_empty():
    from main import app
    with TestClient(app) as client:
        token = _register_and_auth(client)
        res = client.get("/api/documents", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json() == []


def test_create_and_list_document():
    from main import app
    with TestClient(app) as client:
        token = _register_and_auth(client)
        headers = {"Authorization": f"Bearer {token}"}
        create_res = client.post(
            "/api/documents",
            json={"title": "Acme / Beta – NDA", "document_type": "mutual_nda", "form_data": NDA_FORM, "messages": MESSAGES},
            headers=headers,
        )
        assert create_res.status_code == 201
        doc_id = create_res.json()["id"]
        assert doc_id > 0

        list_res = client.get("/api/documents", headers=headers)
        docs = list_res.json()
        assert len(docs) == 1
        assert docs[0]["id"] == doc_id
        assert docs[0]["title"] == "Acme / Beta – NDA"


def test_get_document_by_id():
    from main import app
    with TestClient(app) as client:
        token = _register_and_auth(client)
        headers = {"Authorization": f"Bearer {token}"}
        doc_id = client.post(
            "/api/documents",
            json={"title": "My NDA", "document_type": "mutual_nda", "form_data": NDA_FORM, "messages": MESSAGES},
            headers=headers,
        ).json()["id"]

        res = client.get(f"/api/documents/{doc_id}", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["id"] == doc_id
        assert data["title"] == "My NDA"
        assert data["form_data"]["governingLaw"] == "Delaware"
        assert len(data["messages"]) == 2


def test_update_document():
    from main import app
    with TestClient(app) as client:
        token = _register_and_auth(client)
        headers = {"Authorization": f"Bearer {token}"}
        doc_id = client.post(
            "/api/documents",
            json={"title": "Old Title", "document_type": "mutual_nda", "form_data": NDA_FORM, "messages": []},
            headers=headers,
        ).json()["id"]

        update_res = client.put(
            f"/api/documents/{doc_id}",
            json={"title": "New Title"},
            headers=headers,
        )
        assert update_res.status_code == 200

        get_res = client.get(f"/api/documents/{doc_id}", headers=headers)
        assert get_res.json()["title"] == "New Title"


def test_document_isolation_between_users():
    from main import app
    with TestClient(app) as client:
        token_a = _register_and_auth(client, "user_a@example.com")
        token_b = _register_and_auth(client, "user_b@example.com")

        doc_id = client.post(
            "/api/documents",
            json={"title": "User A NDA", "document_type": "mutual_nda", "form_data": NDA_FORM, "messages": []},
            headers={"Authorization": f"Bearer {token_a}"},
        ).json()["id"]

        # User B should not see User A's document
        res_b = client.get(f"/api/documents/{doc_id}", headers={"Authorization": f"Bearer {token_b}"})
        assert res_b.status_code == 404

        # User B's list should be empty
        list_b = client.get("/api/documents", headers={"Authorization": f"Bearer {token_b}"})
        assert list_b.json() == []


def test_documents_require_auth():
    from main import app
    with TestClient(app) as client:
        assert client.get("/api/documents").status_code == 401
        assert client.post("/api/documents", json={}).status_code == 401
        assert client.get("/api/documents/1").status_code == 401
        assert client.put("/api/documents/1", json={}).status_code == 401

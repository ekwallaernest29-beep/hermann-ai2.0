from fastapi.testclient import TestClient

from app.config import settings
from app.main import app

client = TestClient(app)
MESSAGE = {"messages": [{"role": "user", "texte": "Bonjour"}]}


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"
    assert r.headers["x-content-type-options"] == "nosniff"
    assert "max-age" in r.headers["strict-transport-security"]


def test_chat_refuse_sans_code(monkeypatch):
    monkeypatch.setattr(settings, "access_code", "code-de-test-123")
    r = client.post("/api/chat", json=MESSAGE)
    assert r.status_code == 401


def test_acces_accepte_avec_bon_code(monkeypatch):
    monkeypatch.setattr(settings, "access_code", "code-de-test-123")
    r = client.get("/api/acces/verifier", headers={"X-Access-Code": "code-de-test-123"})
    assert r.status_code == 200
    assert r.json() == {"ok": True}


def test_acces_ferme_si_non_configure(monkeypatch):
    monkeypatch.setattr(settings, "access_code", "")
    r = client.post("/api/chat", json=MESSAGE, headers={"X-Access-Code": ""})
    assert r.status_code == 503

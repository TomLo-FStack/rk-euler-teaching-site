from __future__ import annotations

from fastapi.testclient import TestClient

from backend.main import app


client = TestClient(app)


def test_health_endpoint() -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_python_and_julia_engines_agree_on_rk4() -> None:
    python_response = client.get("/api/solve", params={"method": "rk4", "h": 0.2, "engine": "python"})
    julia_response = client.get("/api/solve", params={"method": "rk4", "h": 0.2, "engine": "julia"})

    assert python_response.status_code == 200
    assert julia_response.status_code == 200

    python_point = python_response.json()["points"][-1]
    julia_point = julia_response.json()["points"][-1]

    assert abs(python_point["y"] - julia_point["y"]) < 1e-12
    assert abs(python_point["error"] - julia_point["error"]) < 1e-12


def test_convergence_endpoint_exposes_all_methods() -> None:
    response = client.get("/api/convergence")
    assert response.status_code == 200
    rows = response.json()["rows"]
    assert {row["method"] for row in rows} == {"euler", "rk2", "rk4"}
    assert len(rows) == 15

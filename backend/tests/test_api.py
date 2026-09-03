"""API integration test for RecoverAI."""

import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_dashboard_endpoint(client):
    res = client.get("/api/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert "revenue_at_risk" in data
    assert "revenue_recovered" in data
    assert "recovery_rate" in data


def test_policies_endpoint(client):
    res = client.get("/api/policies")
    assert res.status_code == 200
    p = res.json()
    assert "max_automatic_retries" in p
    assert "high_value_threshold" in p


def test_run_recovery_and_get_cases(client):
    res = client.post("/api/recovery/run", json={"num_transactions": 5, "environment_type": "stable", "seed": 42})
    assert res.status_code == 200
    data = res.json()
    assert "summary" in data
    assert data["num_cases"] == 5

    # Test cases list
    cases_res = client.get("/api/recovery/cases")
    assert cases_res.status_code == 200
    cases = cases_res.json()
    assert len(cases) >= 5

    # Test case detail & audit trail
    tx_id = cases[0]["transaction_id"]
    detail_res = client.get(f"/api/recovery/cases/{tx_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["transaction_id"] == tx_id
    assert "steps" in detail

    audit_res = client.get(f"/api/audit/{tx_id}")
    assert audit_res.status_code == 200
    audit_data = audit_res.json()
    assert "timeline" in audit_data
    assert len(audit_data["timeline"]) > 0


def test_experiment_run(client):
    res = client.post(
        "/api/experiments/run",
        json={
            "environment_type": "stable",
            "num_transactions": 5,
            "seed": 42,
            "strategies": ["always_retry", "fixed_rules", "recoverai"]
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert "strategies" in data
    assert "incremental_revenue" in data

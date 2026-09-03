"""Tests for database persistence and audit LLM explanation."""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.db import SessionLocal
from app.database.models import RecoveryCase, LedgerEntry, AuditEntry, Customer, Transaction


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_database_persistence_and_endpoints(client):
    """Verify that batch recovery writes to SQLite DB and endpoints query it."""
    # 1. Trigger recovery batch
    res = client.post(
        "/api/recovery/run",
        json={"num_transactions": 5, "environment_type": "stable", "seed": 999}
    )
    assert res.status_code == 200

    # 2. Verify rows exist directly in database tables
    db = SessionLocal()
    try:
        cases_count = db.query(RecoveryCase).count()
        ledger_count = db.query(LedgerEntry).count()
        audit_count = db.query(AuditEntry).count()
        tx_count = db.query(Transaction).count()

        assert cases_count >= 5
        assert ledger_count >= 5
        assert audit_count >= 5
        assert tx_count >= 5

        # Inspect a case
        sample_case = db.query(RecoveryCase).first()
        assert sample_case.transaction_id.startswith("TX")
        assert sample_case.amount_at_risk > 0
        assert len(sample_case.steps) > 0
    finally:
        db.close()

    # 3. Test Ledger API returns source="database"
    ledger_res = client.get("/api/ledger")
    assert ledger_res.status_code == 200
    ledger_data = ledger_res.json()
    assert ledger_data.get("source") == "database"
    assert len(ledger_data["entries"]) >= 5
    assert ledger_data["aggregates"]["total_at_risk"] > 0

    # 4. Test Audit API returns source="database"
    cases_res = client.get("/api/recovery/cases")
    assert cases_res.status_code == 200
    first_tx = cases_res.json()[0]["transaction_id"]

    audit_res = client.get(f"/api/audit/{first_tx}")
    assert audit_res.status_code == 200
    audit_data = audit_res.json()
    assert audit_data.get("source") == "database"
    assert len(audit_data["timeline"]) > 0

    # 5. Test Audit API with ?explain=true
    audit_explain_res = client.get(f"/api/audit/{first_tx}?explain=true")
    assert audit_explain_res.status_code == 200
    explain_data = audit_explain_res.json()
    assert "llm_explanation" in explain_data
    assert len(explain_data["llm_explanation"]) > 0

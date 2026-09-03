"""Ledger API — revenue ledger entries and aggregates.

Reads from the LedgerEntry database table for persisted data.
Falls back to in-memory app_state if the DB has no entries.
"""

from fastapi import APIRouter
from app.core.state import app_state
from app.database.db import SessionLocal
from app.database.models import LedgerEntry

router = APIRouter()


def _build_ledger_from_db():
    """Query ledger entries from the database."""
    db = SessionLocal()
    try:
        db_entries = db.query(LedgerEntry).order_by(LedgerEntry.id.desc()).all()
        if not db_entries:
            return None

        entries = []
        for le in db_entries:
            entries.append({
                "transaction_id": le.transaction_id,
                "original_amount": le.original_amount,
                "recovered_amount": le.recovered_amount,
                "action_taken": le.action_taken or "NONE",
                "action_cost": le.action_cost,
                "estimated_future_value": le.estimated_future_value,
                "net_recovery_value": le.net_recovery_value,
                "status": le.status,
                "strategy": le.strategy,
                "environment_type": le.environment_type,
            })

        total_at_risk = sum(e["original_amount"] for e in entries)
        total_recovered = sum(e["recovered_amount"] for e in entries)
        total_cost = sum(e["action_cost"] for e in entries)
        recovered_count = sum(1 for e in entries if e["recovered_amount"] > 0)

        return {
            "entries": entries,
            "aggregates": {
                "total_at_risk": round(total_at_risk, 2),
                "total_recovered": round(total_recovered, 2),
                "recovery_rate": round(total_recovered / max(1, total_at_risk) * 100, 1),
                "total_cost": round(total_cost, 2),
                "net_recovery": round(total_recovered - total_cost, 2),
                "avg_recovery_value": round(
                    total_recovered / max(1, recovered_count), 2
                ),
            },
            "source": "database",
        }
    finally:
        db.close()


def _build_ledger_from_memory():
    """Fallback: reconstruct ledger from in-memory app_state."""
    cases = app_state.latest_demo_cases
    entries = []
    for c in cases:
        last_action = c["steps"][-1]["executed_action"] if c["steps"] else "NONE"
        entries.append({
            "transaction_id": c["transaction_id"],
            "original_amount": c["amount"],
            "recovered_amount": c["total_recovered"],
            "action_taken": last_action,
            "action_cost": c["total_cost"],
            "estimated_future_value": c["estimated_ltv"],
            "net_recovery_value": round(c["total_recovered"] - c["total_cost"], 2),
            "status": c["status"],
        })

    total_at_risk = sum(e["original_amount"] for e in entries)
    total_recovered = sum(e["recovered_amount"] for e in entries)
    total_cost = sum(e["action_cost"] for e in entries)

    return {
        "entries": entries,
        "aggregates": {
            "total_at_risk": round(total_at_risk, 2),
            "total_recovered": round(total_recovered, 2),
            "recovery_rate": round(total_recovered / max(1, total_at_risk) * 100, 1),
            "total_cost": round(total_cost, 2),
            "net_recovery": round(total_recovered - total_cost, 2),
            "avg_recovery_value": round(
                total_recovered / max(1, sum(1 for e in entries if e["recovered_amount"] > 0)), 2
            ),
        },
        "source": "memory",
    }


@router.get("/ledger")
async def get_ledger():
    """Get revenue ledger with entries and aggregates.

    Reads from the database first; falls back to in-memory state.
    """
    db_result = _build_ledger_from_db()
    if db_result:
        return db_result
    return _build_ledger_from_memory()

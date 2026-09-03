"""Audit API — transaction-level audit trail.

Reads from the AuditEntry database table for persisted data.
Falls back to in-memory reconstruction if DB has no entries for the transaction.
Supports optional LLM explanation via ?explain=true query parameter.
"""

from fastapi import APIRouter, Query
from typing import Optional
from app.core.state import app_state
from app.database.db import SessionLocal
from app.database.models import AuditEntry
from app.services.llm_service import explain_recovery_decision

router = APIRouter()


def _build_audit_from_db(transaction_id: str):
    """Query audit entries from the database."""
    db = SessionLocal()
    try:
        db_entries = (
            db.query(AuditEntry)
            .filter_by(transaction_id=transaction_id)
            .order_by(AuditEntry.id.asc())
            .all()
        )
        if not db_entries:
            return None

        timeline = []
        for entry in db_entries:
            event_data = entry.event_data or {}
            timeline.append({
                "event": entry.event_type,
                "description": event_data.get("description", f"{entry.event_type} event"),
                "data": {k: v for k, v in event_data.items() if k != "description"},
                "step_number": entry.step_number,
            })

        # Build summary from the data
        outcome_events = [e for e in timeline if e["event"] == "OUTCOME"]
        total_recovered = sum(e["data"].get("revenue", 0) for e in outcome_events)
        total_cost = sum(e["data"].get("cost", 0) for e in outcome_events)
        total_steps = len(set(e["step_number"] for e in timeline if e["step_number"] is not None))

        # Determine status from last outcome
        last_outcome = outcome_events[-1] if outcome_events else None
        status = last_outcome["data"].get("outcome", "UNKNOWN") if last_outcome else "UNKNOWN"
        if total_recovered > 0:
            status = "RECOVERED"

        return {
            "transaction_id": transaction_id,
            "timeline": timeline,
            "summary": {
                "status": status,
                "total_recovered": total_recovered,
                "total_cost": total_cost,
                "total_steps": total_steps,
            },
            "source": "database",
        }
    finally:
        db.close()


def _build_audit_from_memory(transaction_id: str):
    """Fallback: reconstruct audit trail from in-memory app_state."""
    for case in app_state.latest_demo_cases:
        if case["transaction_id"] == transaction_id:
            timeline = []

            # Detection event
            timeline.append({
                "event": "DETECTION",
                "description": f"Failed payment detected — ₹{case['amount']:,.0f}",
                "data": {
                    "transaction_id": case["transaction_id"],
                    "customer_id": case["customer_id"],
                    "amount": case["amount"],
                },
            })

            for step in case["steps"]:
                # Diagnosis
                timeline.append({
                    "event": "DIAGNOSIS",
                    "description": f"Diagnosed as {step['diagnosis']['label']} (confidence: {step['diagnosis']['confidence']:.0%})",
                    "data": step["diagnosis"],
                })

                # Prediction
                timeline.append({
                    "event": "PREDICTION",
                    "description": f"Predicted outcomes for {len(step['predictions'])} actions",
                    "data": step["predictions"],
                })

                # Economic evaluation
                timeline.append({
                    "event": "EVALUATION",
                    "description": f"Best immediate: {step['best_immediate_action']}, Best long-term: {step['best_longterm_action']}",
                    "data": step["economic_evaluation"],
                })

                # Decision
                timeline.append({
                    "event": "DECISION",
                    "description": f"Agent selected: {step['selected_action']}",
                    "data": {
                        "selected_action": step["selected_action"],
                        "reason": step["decision_reason"],
                    },
                })

                # Policy
                timeline.append({
                    "event": "POLICY",
                    "description": f"Policy: {step['policy_result']} — {step['policy_reason']}",
                    "data": {
                        "result": step["policy_result"],
                        "reason": step["policy_reason"],
                    },
                })

                # Execution
                timeline.append({
                    "event": "EXECUTION",
                    "description": f"Executed: {step['executed_action']}",
                    "data": {"action": step["executed_action"]},
                })

                # Outcome
                timeline.append({
                    "event": "OUTCOME",
                    "description": f"Outcome: {step['outcome']} — Revenue: ₹{step['revenue']:,.0f}",
                    "data": {
                        "outcome": step["outcome"],
                        "revenue": step["revenue"],
                        "cost": step["cost"],
                        "friction_delta": step["friction_delta"],
                    },
                })

                # Learning
                if step.get("learning_update"):
                    timeline.append({
                        "event": "LEARNING",
                        "description": f"Updated learning for {step['learning_update'].get('action', 'unknown')}",
                        "data": step["learning_update"],
                    })

            return {
                "transaction_id": transaction_id,
                "timeline": timeline,
                "summary": {
                    "status": case["status"],
                    "total_recovered": case["total_recovered"],
                    "total_cost": case["total_cost"],
                    "total_steps": len(case["steps"]),
                },
                "source": "memory",
            }

    return None


@router.get("/audit/{transaction_id}")
async def get_audit_trail(
    transaction_id: str,
    explain: Optional[bool] = Query(False, description="Include LLM-generated executive explanation"),
):
    """Get complete audit trail for a transaction.

    Reads from the database first; falls back to in-memory reconstruction.
    Pass ?explain=true to include an AI-generated executive explanation.
    """
    # Try database first
    result = _build_audit_from_db(transaction_id)
    if not result:
        result = _build_audit_from_memory(transaction_id)

    if not result:
        return {"error": "Transaction not found"}

    # Optional LLM explanation
    if explain:
        # Extract data from audit trail for the explanation
        diagnosis_events = [e for e in result["timeline"] if e["event"] == "DIAGNOSIS"]
        decision_events = [e for e in result["timeline"] if e["event"] == "DECISION"]
        policy_events = [e for e in result["timeline"] if e["event"] == "POLICY"]
        eval_events = [e for e in result["timeline"] if e["event"] == "EVALUATION"]
        outcome_events = [e for e in result["timeline"] if e["event"] == "OUTCOME"]

        if diagnosis_events and decision_events:
            diag_data = diagnosis_events[0].get("data", {})
            decision_data = decision_events[0].get("data", {})
            policy_data = policy_events[0].get("data", {}) if policy_events else {}
            eval_data = eval_events[0].get("data", {}) if eval_events else {}
            outcome_data = outcome_events[0].get("data", {}) if outcome_events else {}

            # Get amount from detection event
            detection = [e for e in result["timeline"] if e["event"] == "DETECTION"]
            amount = detection[0]["data"].get("amount", 0) if detection else 0

            try:
                explanation = explain_recovery_decision(
                    transaction_id=transaction_id,
                    amount=amount,
                    diagnosis_label=diag_data.get("label", "unknown"),
                    diagnosis_confidence=diag_data.get("confidence", 0),
                    evidence=diag_data.get("evidence", []),
                    selected_action=decision_data.get("selected_action", "UNKNOWN"),
                    best_immediate_action=eval_data.get("best_immediate_action", "UNKNOWN"),
                    best_longterm_action=eval_data.get("best_longterm_action", "UNKNOWN"),
                    policy_result=policy_data.get("result", "UNKNOWN"),
                    policy_reason=policy_data.get("reason", ""),
                    outcome=outcome_data.get("outcome", "UNKNOWN"),
                )
                result["llm_explanation"] = explanation
                result["llm_model"] = "openai/gpt-oss-120b"
            except Exception as e:
                result["llm_explanation"] = f"Could not generate explanation: {str(e)}"

    return result

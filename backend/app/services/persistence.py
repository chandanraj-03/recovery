"""Persistence Service — writes recovery results to the SQLAlchemy database.

Bridges the gap between the in-memory workflow results and the database models.
After every recovery run, this service persists:
- Transaction records
- RecoveryCase with diagnosis and financials
- RecoveryStep with full decision chain
- LedgerEntry for financial audit
- AuditEntry for compliance trail

Uses merge/upsert semantics so re-running with same IDs is safe.
"""

import datetime
import uuid
from typing import List, Dict, Any, Optional

from sqlalchemy.orm import Session

from app.database.db import SessionLocal
from app.database.models import (
    Customer, Transaction, RecoveryCase, RecoveryStep,
    LedgerEntry, AuditEntry,
)


def persist_recovery_results(
    cases: List[Dict[str, Any]],
    environment_type: str = "stable",
    experiment_id: Optional[str] = None,
) -> int:
    """Persist a batch of recovery case results to the database.

    Args:
        cases: List of case dicts (same format as app_state.latest_demo_cases)
        environment_type: Which simulation environment was used
        experiment_id: Optional experiment ID if run as part of an experiment

    Returns:
        Number of cases persisted
    """
    db = SessionLocal()
    persisted = 0

    try:
        for case in cases:
            transaction_id = case["transaction_id"]
            customer_id = case["customer_id"]

            # --- 0. Ensure Customer exists for foreign key constraint ---
            existing_cust = db.query(Customer).filter_by(id=customer_id).first()
            if not existing_cust:
                cust = Customer(
                    id=customer_id,
                    name=f"Merchant Customer {customer_id}",
                    segment=case.get("customer_segment", "standard"),
                    preferred_payment_method="UPI",
                )
                db.add(cust)
                db.flush()

            # --- 1. Transaction record ---
            existing_tx = db.query(Transaction).filter_by(id=transaction_id).first()
            if not existing_tx:
                tx = Transaction(
                    id=transaction_id,
                    customer_id=customer_id,
                    amount=case["amount"],
                    currency="INR",
                    payment_method="UPI",  # from simulation
                    status=case["status"],
                )
                db.add(tx)
            else:
                existing_tx.status = case["status"]

            # --- 2. RecoveryCase record ---
            case_id = f"RC-{transaction_id}"
            existing_case = db.query(RecoveryCase).filter_by(id=case_id).first()
            if existing_case:
                # Update existing
                existing_case.status = case["status"]
                existing_case.amount_recovered = case["total_recovered"]
                existing_case.total_action_cost = case["total_cost"]
                existing_case.estimated_ltv = case.get("estimated_ltv", 0.0)
                existing_case.total_steps = case["num_steps"]
                existing_case.updated_at = datetime.datetime.utcnow()
                if case["status"] in ("RECOVERED", "STOPPED", "ESCALATED", "ABANDONED"):
                    existing_case.closed_at = datetime.datetime.utcnow()
                rc = existing_case
            else:
                rc = RecoveryCase(
                    id=case_id,
                    transaction_id=transaction_id,
                    strategy="recoverai",
                    diagnosis=case.get("diagnosis", ""),
                    diagnosis_confidence=case.get("diagnosis_confidence", 0.0),
                    diagnosis_evidence=case.get("diagnosis_evidence", []),
                    status=case["status"],
                    current_step=case["num_steps"],
                    total_steps=case["num_steps"],
                    amount_at_risk=case["amount"],
                    amount_recovered=case["total_recovered"],
                    total_action_cost=case["total_cost"],
                    estimated_ltv=case.get("estimated_ltv", 0.0),
                    experiment_id=experiment_id,
                    environment_type=environment_type,
                )
                if case["status"] in ("RECOVERED", "STOPPED", "ESCALATED", "ABANDONED"):
                    rc.closed_at = datetime.datetime.utcnow()
                db.add(rc)

            # --- 3. RecoveryStep records ---
            # Delete old steps for this case to avoid duplicates on re-run
            db.query(RecoveryStep).filter_by(case_id=case_id).delete()

            for step in case.get("steps", []):
                rs = RecoveryStep(
                    case_id=case_id,
                    step_number=step["step_number"],
                    state_summary={
                        "predictions": step.get("predictions", {}),
                        "economic_evaluation": step.get("economic_evaluation", {}),
                    },
                    candidate_actions=step.get("predictions", {}),
                    selected_action=step.get("selected_action", ""),
                    decision_reason=step.get("decision_reason", ""),
                    policy_result=step.get("policy_result", ""),
                    policy_reason=step.get("policy_reason", ""),
                    executed_action=step.get("executed_action", ""),
                    outcome=step.get("outcome", ""),
                    outcome_revenue=step.get("revenue", 0.0),
                    outcome_cost=step.get("cost", 0.0),
                    outcome_friction=step.get("friction_delta", 0.0),
                    learning_update=step.get("learning_update"),
                )
                db.add(rs)

            # --- 4. LedgerEntry ---
            existing_ledger = db.query(LedgerEntry).filter_by(
                transaction_id=transaction_id, strategy="recoverai"
            ).first()
            last_action = case["steps"][-1]["executed_action"] if case["steps"] else "NONE"

            if existing_ledger:
                existing_ledger.recovered_amount = case["total_recovered"]
                existing_ledger.action_taken = last_action
                existing_ledger.action_cost = case["total_cost"]
                existing_ledger.estimated_future_value = case.get("estimated_ltv", 0.0)
                existing_ledger.net_recovery_value = round(
                    case["total_recovered"] - case["total_cost"], 2
                )
                existing_ledger.status = case["status"]
            else:
                le = LedgerEntry(
                    transaction_id=transaction_id,
                    case_id=case_id,
                    original_amount=case["amount"],
                    recovered_amount=case["total_recovered"],
                    action_taken=last_action,
                    action_cost=case["total_cost"],
                    estimated_future_value=case.get("estimated_ltv", 0.0),
                    net_recovery_value=round(
                        case["total_recovered"] - case["total_cost"], 2
                    ),
                    status=case["status"],
                    strategy="recoverai",
                    environment_type=environment_type,
                    experiment_id=experiment_id,
                )
                db.add(le)

            # --- 5. AuditEntry records ---
            # Delete old audit entries for this transaction to avoid duplicates
            db.query(AuditEntry).filter_by(transaction_id=transaction_id).delete()

            # Detection event
            db.add(AuditEntry(
                transaction_id=transaction_id,
                case_id=case_id,
                event_type="DETECTION",
                event_data={
                    "transaction_id": transaction_id,
                    "customer_id": customer_id,
                    "amount": case["amount"],
                    "description": f"Failed payment detected — ₹{case['amount']:,.0f}",
                },
            ))

            for step in case.get("steps", []):
                step_num = step["step_number"]

                # Diagnosis
                db.add(AuditEntry(
                    transaction_id=transaction_id,
                    case_id=case_id,
                    step_number=step_num,
                    event_type="DIAGNOSIS",
                    event_data={
                        "label": step["diagnosis"]["label"],
                        "confidence": step["diagnosis"]["confidence"],
                        "evidence": step["diagnosis"]["evidence"],
                        "description": (
                            f"Diagnosed as {step['diagnosis']['label']} "
                            f"(confidence: {step['diagnosis']['confidence']:.0%})"
                        ),
                    },
                ))

                # Prediction
                db.add(AuditEntry(
                    transaction_id=transaction_id,
                    case_id=case_id,
                    step_number=step_num,
                    event_type="PREDICTION",
                    event_data={
                        "predictions": step["predictions"],
                        "description": f"Predicted outcomes for {len(step['predictions'])} actions",
                    },
                ))

                # Economic evaluation
                db.add(AuditEntry(
                    transaction_id=transaction_id,
                    case_id=case_id,
                    step_number=step_num,
                    event_type="EVALUATION",
                    event_data={
                        "economic_evaluation": step["economic_evaluation"],
                        "best_immediate_action": step["best_immediate_action"],
                        "best_longterm_action": step["best_longterm_action"],
                        "description": (
                            f"Best immediate: {step['best_immediate_action']}, "
                            f"Best long-term: {step['best_longterm_action']}"
                        ),
                    },
                ))

                # Decision
                db.add(AuditEntry(
                    transaction_id=transaction_id,
                    case_id=case_id,
                    step_number=step_num,
                    event_type="DECISION",
                    event_data={
                        "selected_action": step["selected_action"],
                        "reason": step["decision_reason"],
                        "description": f"Agent selected: {step['selected_action']}",
                    },
                ))

                # Policy
                db.add(AuditEntry(
                    transaction_id=transaction_id,
                    case_id=case_id,
                    step_number=step_num,
                    event_type="POLICY",
                    event_data={
                        "result": step["policy_result"],
                        "reason": step["policy_reason"],
                        "description": (
                            f"Policy: {step['policy_result']} — {step['policy_reason']}"
                        ),
                    },
                ))

                # Execution
                db.add(AuditEntry(
                    transaction_id=transaction_id,
                    case_id=case_id,
                    step_number=step_num,
                    event_type="EXECUTION",
                    event_data={
                        "action": step["executed_action"],
                        "description": f"Executed: {step['executed_action']}",
                    },
                ))

                # Outcome
                db.add(AuditEntry(
                    transaction_id=transaction_id,
                    case_id=case_id,
                    step_number=step_num,
                    event_type="OUTCOME",
                    event_data={
                        "outcome": step["outcome"],
                        "revenue": step["revenue"],
                        "cost": step["cost"],
                        "friction_delta": step["friction_delta"],
                        "description": (
                            f"Outcome: {step['outcome']} — Revenue: ₹{step['revenue']:,.0f}"
                        ),
                    },
                ))

                # Learning
                if step.get("learning_update"):
                    db.add(AuditEntry(
                        transaction_id=transaction_id,
                        case_id=case_id,
                        step_number=step_num,
                        event_type="LEARNING",
                        event_data={
                            **step["learning_update"],
                            "description": (
                                f"Updated learning for {step['learning_update'].get('action', 'unknown')}"
                            ),
                        },
                    ))

            persisted += 1

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Persistence failed: {e}")
        raise
    finally:
        db.close()

    return persisted

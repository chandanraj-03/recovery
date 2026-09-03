"""Recovery API — run recovery, list cases, get case details."""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from copy import deepcopy

from app.core.state import app_state
from app.database.db import SessionLocal
from app.database.models import RecoveryCase, RecoveryStep, Transaction
from app.services.persistence import persist_recovery_results
from app.simulation.environments import create_environment
from app.simulation.transaction_generator import generate_transaction_batch
from app.services.recovery_workflow import RecoveryWorkflow
from app.agents.recovery_agent import RecoveryAgent
from app.policies.policy_engine import PolicyConfig
from app.learning.contextual_bandit import ContextualBandit

router = APIRouter()


class RunRecoveryRequest(BaseModel):
    num_transactions: int = 100
    environment_type: str = "stable"
    seed: int = 42


@router.post("/recovery/run")
async def run_recovery(req: RunRecoveryRequest):
    """Run RecoverAI on a batch of failed transactions.

    Generates transactions, runs the full sequential recovery workflow,
    and stores results for dashboard display.
    """
    env = create_environment(req.environment_type, req.seed)
    transactions = generate_transaction_batch(env, req.num_transactions, req.seed)

    agent = RecoveryAgent()

    workflow = RecoveryWorkflow(
        environment=env,
        agent=agent,
        memory=app_state.recovery_memory,
        bandit=app_state.bandit,
        policy=PolicyConfig(),
        max_steps=5,
        use_adaptive=True,
        include_future_value=True,
    )

    cases = []
    total_at_risk = 0
    total_recovered = 0
    total_cost = 0
    total_stops = 0
    total_escalations = 0
    total_actions = 0

    for tx in transactions:
        tx_copy = deepcopy(tx)
        result = workflow.run_case(tx_copy)
        total_at_risk += result.amount
        total_recovered += result.total_recovered
        total_cost += result.total_cost

        if result.status == "STOPPED":
            total_stops += 1
        elif result.status == "ESCALATED":
            total_escalations += 1

        total_actions += len(result.steps)

        case_data = {
            "transaction_id": result.transaction_id,
            "customer_id": result.customer_id,
            "amount": result.amount,
            "diagnosis": result.diagnosis,
            "diagnosis_confidence": result.diagnosis_confidence,
            "diagnosis_evidence": result.diagnosis_evidence,
            "status": result.status,
            "total_recovered": result.total_recovered,
            "total_cost": result.total_cost,
            "estimated_ltv": round(result.estimated_ltv, 2),
            "num_steps": len(result.steps),
            "environment": req.environment_type,
            "steps": [
                {
                    "step_number": s.step_number,
                    "diagnosis": {"label": s.diagnosis.label, "confidence": s.diagnosis.confidence, "evidence": s.diagnosis.evidence},
                    "predictions": s.predictions,
                    "economic_evaluation": s.economic_evaluation,
                    "best_immediate_action": s.best_immediate_action,
                    "best_longterm_action": s.best_longterm_action,
                    "selected_action": s.selected_action,
                    "decision_reason": s.decision_reason,
                    "policy_result": s.policy_result,
                    "policy_reason": s.policy_reason,
                    "executed_action": s.executed_action,
                    "outcome": s.outcome,
                    "revenue": s.revenue,
                    "cost": s.cost,
                    "friction_delta": s.friction_delta,
                    "learning_update": s.learning_update,
                }
                for s in result.steps
            ],
        }
        cases.append(case_data)

    # Store results
    app_state.latest_demo_cases = cases

    recovered_cases = sum(1 for c in cases if c["status"] == "RECOVERED")
    app_state.latest_demo_summary = {
        "revenue_at_risk": round(total_at_risk, 2),
        "revenue_recovered": round(total_recovered, 2),
        "recovery_rate": round(total_recovered / max(1, total_at_risk) * 100, 1),
        "incremental_revenue": 0,  # updated when baselines run
        "active_cases": 0,
        "policy_stops": total_stops,
        "escalations": total_escalations,
        "total_cases": len(cases),
        "recovered_cases": recovered_cases,
        "net_recovery_value": round(total_recovered - total_cost, 2),
        "avg_recovery_value": round(total_recovered / max(1, recovered_cases), 2),
        "recovery_cost": round(total_cost, 2),
        "total_actions": total_actions,
        "avg_actions_per_case": round(total_actions / max(1, len(cases)), 2),
        "environment": req.environment_type,
    }

    # Persist to database
    try:
        persisted = persist_recovery_results(cases, environment_type=req.environment_type)
        print(f"[DB] Persisted {persisted} recovery cases to database")
    except Exception as e:
        print(f"[DB] Persistence warning (non-blocking): {e}")

    return {
        "summary": app_state.latest_demo_summary,
        "num_cases": len(cases),
    }


@router.get("/recovery/cases")
async def get_recovery_cases():
    """Get list of recovery cases from database (with in-memory fallback)."""
    db = SessionLocal()
    try:
        db_cases = (
            db.query(RecoveryCase)
            .order_by(RecoveryCase.created_at.desc())
            .all()
        )
        if db_cases:
            return [{
                "transaction_id": c.transaction_id,
                "customer_id": c.transaction.customer_id if c.transaction else "UNKNOWN",
                "amount": c.amount_at_risk,
                "diagnosis": c.diagnosis,
                "diagnosis_confidence": c.diagnosis_confidence,
                "status": c.status,
                "total_recovered": c.amount_recovered,
                "estimated_ltv": c.estimated_ltv,
                "num_steps": c.total_steps,
            } for c in db_cases]
    except Exception as e:
        print(f"[DB] Error fetching recovery cases: {e}")
    finally:
        db.close()

    return [{
        "transaction_id": c["transaction_id"],
        "customer_id": c["customer_id"],
        "amount": c["amount"],
        "diagnosis": c["diagnosis"],
        "diagnosis_confidence": c["diagnosis_confidence"],
        "status": c["status"],
        "total_recovered": c["total_recovered"],
        "estimated_ltv": c["estimated_ltv"],
        "num_steps": c["num_steps"],
    } for c in app_state.latest_demo_cases]


@router.get("/recovery/cases/{transaction_id}")
async def get_recovery_case_detail(transaction_id: str):
    """Get full detail for a single recovery case including audit trail."""
    # Check in-memory first for richer live step states
    for case in app_state.latest_demo_cases:
        if case["transaction_id"] == transaction_id:
            return case

    # Fallback to database lookup
    db = SessionLocal()
    try:
        case = (
            db.query(RecoveryCase)
            .filter_by(transaction_id=transaction_id)
            .first()
        )
        if case:
            steps_data = []
            for s in case.steps:
                state_summary = s.state_summary or {}
                steps_data.append({
                    "step_number": s.step_number,
                    "diagnosis": {
                        "label": case.diagnosis,
                        "confidence": case.diagnosis_confidence,
                        "evidence": case.diagnosis_evidence or [],
                    },
                    "predictions": s.candidate_actions or {},
                    "economic_evaluation": state_summary.get("economic_evaluation", {}),
                    "best_immediate_action": "RETRY_NOW",
                    "best_longterm_action": s.selected_action,
                    "selected_action": s.selected_action,
                    "decision_reason": s.decision_reason,
                    "policy_result": s.policy_result,
                    "policy_reason": s.policy_reason,
                    "executed_action": s.executed_action,
                    "outcome": s.outcome,
                    "revenue": s.outcome_revenue,
                    "cost": s.outcome_cost,
                    "friction_delta": s.outcome_friction,
                    "learning_update": s.learning_update,
                })

            return {
                "transaction_id": case.transaction_id,
                "customer_id": case.transaction.customer_id if case.transaction else "UNKNOWN",
                "amount": case.amount_at_risk,
                "diagnosis": case.diagnosis,
                "diagnosis_confidence": case.diagnosis_confidence,
                "diagnosis_evidence": case.diagnosis_evidence or [],
                "status": case.status,
                "total_recovered": case.amount_recovered,
                "total_cost": case.total_action_cost,
                "estimated_ltv": case.estimated_ltv,
                "num_steps": case.total_steps,
                "environment": case.environment_type or "stable",
                "steps": steps_data,
            }
    except Exception as e:
        print(f"[DB] Error fetching recovery case detail: {e}")
    finally:
        db.close()

    return {"error": "Case not found"}

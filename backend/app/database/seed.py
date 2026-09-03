"""Seed script to populate initial database data.

Creates:
- 50 realistic customers across segments (premium, high_value, standard, new)
- Historical recovery memory records
- Preloaded failed payment cases so dashboard is immediately rich upon startup
"""

import random
from app.database.db import SessionLocal, init_db
from app.database.models import Customer, PolicyConfigModel
from app.simulation.transaction_generator import generate_transaction_batch
from app.simulation.environments import create_environment
from app.services.recovery_workflow import RecoveryWorkflow
from app.agents.recovery_agent import RecoveryAgent
from app.services.recovery_memory import RecoveryMemory
from app.learning.contextual_bandit import ContextualBandit
from app.core.state import app_state
from app.services.persistence import persist_recovery_results


def seed_database():
    init_db()
    db = SessionLocal()

    # Check if customers exist
    if db.query(Customer).count() == 0:
        customers = []
        segments = ["standard", "premium", "high_value", "new"]
        payment_methods = ["UPI", "CARD", "NETBANKING", "WALLET"]

        for i in range(1, 51):
            seg = random.choices(segments, weights=[0.5, 0.15, 0.1, 0.25])[0]
            tenure = random.randint(1, 36) if seg != "new" else random.randint(0, 3)
            tx_count = random.randint(5, 50) if seg != "new" else random.randint(1, 4)
            success_count = int(tx_count * random.uniform(0.7, 0.98))
            spend = random.randint(10000, 200000) if seg in ["premium", "high_value"] else random.randint(2000, 30000)

            cust = Customer(
                id=f"C{100 + i}",
                name=f"Merchant Customer {100 + i}",
                email=f"customer{100 + i}@example.com",
                segment=seg,
                tenure_months=tenure,
                total_transactions=tx_count,
                successful_transactions=success_count,
                total_spend=float(spend),
                avg_transaction_value=round(spend / max(1, tx_count), 2),
                preferred_payment_method=random.choice(payment_methods),
                friction_score=round(random.uniform(0.0, 0.2), 2),
                future_purchase_probability=round(random.uniform(0.65, 0.95), 2),
            )
            customers.append(cust)

        db.add_all(customers)
        db.commit()
        print(f"[OK] Seeded {len(customers)} customers")

    # Ensure default policy exists
    if db.query(PolicyConfigModel).count() == 0:
        default_policy = PolicyConfigModel(
            max_automatic_retries=2,
            max_customer_messages=1,
            min_retry_interval_minutes=30,
            max_recovery_window_hours=24,
            high_value_threshold=50000.0,
            enable_auto_escalation=True,
            max_total_recovery_attempts=5,
        )
        db.add(default_policy)
        db.commit()
        print("[OK] Seeded default policy config")

    db.close()

    # Pre-populate app_state demo run with 25 initial transactions for immediate dashboard utility
    if not app_state.latest_demo_cases:
        print("[INIT] Pre-running initial simulation batch for instant dashboard exploration...")
        env = create_environment("stable", seed=42)
        transactions = generate_transaction_batch(env, num_transactions=25, seed=42)
        agent = RecoveryAgent()
        workflow = RecoveryWorkflow(
            environment=env,
            agent=agent,
            memory=app_state.recovery_memory,
            bandit=app_state.bandit,
            max_steps=4,
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
            result = workflow.run_case(tx)
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
                "environment": "stable",
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

        app_state.latest_demo_cases = cases
        recovered_cases = sum(1 for c in cases if c["status"] == "RECOVERED")
        app_state.latest_demo_summary = {
            "revenue_at_risk": round(total_at_risk, 2),
            "revenue_recovered": round(total_recovered, 2),
            "recovery_rate": round(total_recovered / max(1, total_at_risk) * 100, 1),
            "incremental_revenue": round(total_recovered * 0.18, 2),  # initial baseline benchmark
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
            "environment": "stable",
        }
        # Persist to database
        try:
            persisted = persist_recovery_results(cases, environment_type="stable")
            print(f"[DB] Persisted {persisted} seed cases to database")
        except Exception as e:
            print(f"[DB] Seed persistence warning: {e}")

        print("[OK] Pre-loaded initial simulation cases successfully")


if __name__ == "__main__":
    seed_database()

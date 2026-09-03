"""Experiments API — run experiments, compare strategies."""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

from app.core.state import app_state
from app.policies.policy_engine import PolicyConfig

router = APIRouter()


class RunExperimentRequest(BaseModel):
    environment_type: str = "stable"
    num_transactions: int = 100
    seed: int = 42
    strategies: List[str] = ["always_retry", "fixed_rules", "immediate_optimizer", "recoverai"]


@router.post("/experiments/run")
async def run_experiment(req: RunExperimentRequest):
    """Run an experiment comparing strategies under the same conditions."""
    result = app_state.experiment_engine.run_experiment(
        environment_type=req.environment_type,
        num_transactions=req.num_transactions,
        seed=req.seed,
        strategies=req.strategies,
        policy=PolicyConfig(),
    )

    # Format results for frontend
    strategies = {}
    for name, sr in result.strategies.items():
        strategies[name] = {
            "strategy": sr.strategy,
            "total_at_risk": round(sr.total_at_risk, 2),
            "total_recovered": round(sr.total_recovered, 2),
            "recovery_rate": sr.recovery_rate,
            "total_cost": round(sr.total_cost, 2),
            "net_recovery": round(sr.net_recovery, 2),
            "estimated_future_value": round(sr.estimated_future_value, 2),
            "total_actions": sr.total_actions,
            "total_stops": sr.total_stops,
            "total_escalations": sr.total_escalations,
            "avg_actions_per_case": sr.avg_actions_per_case,
            "action_breakdown": sr.action_breakdown,
            "cumulative_data": sr.cumulative_data,
        }

    # Calculate incremental revenue vs best baseline
    recoverai_recovered = strategies.get("recoverai", {}).get("total_recovered", 0)
    baseline_best = max(
        strategies.get(s, {}).get("total_recovered", 0)
        for s in ["always_retry", "fixed_rules", "immediate_optimizer"]
        if s in strategies
    ) if len(strategies) > 1 else 0
    incremental = round(recoverai_recovered - baseline_best, 2)

    # Update dashboard incremental
    if app_state.latest_demo_summary:
        app_state.latest_demo_summary["incremental_revenue"] = incremental

    return {
        "experiment_id": result.experiment_id,
        "environment_type": result.environment_type,
        "num_transactions": result.num_transactions,
        "seed": result.seed,
        "strategies": strategies,
        "incremental_revenue": incremental,
        "timestamp": result.timestamp,
    }


@router.post("/experiments/cross-environment")
async def run_cross_environment(req: RunExperimentRequest):
    """Run experiments across all 4 environments for comparison."""
    environments = ["stable", "changing", "friction", "cost_sensitive"]
    all_results = {}

    for env_type in environments:
        result = app_state.experiment_engine.run_experiment(
            environment_type=env_type,
            num_transactions=req.num_transactions,
            seed=req.seed,
            strategies=req.strategies,
            policy=PolicyConfig(),
        )

        env_strategies = {}
        for name, sr in result.strategies.items():
            env_strategies[name] = {
                "total_recovered": round(sr.total_recovered, 2),
                "recovery_rate": sr.recovery_rate,
                "net_recovery": round(sr.net_recovery, 2),
                "total_stops": sr.total_stops,
                "total_escalations": sr.total_escalations,
                "avg_actions_per_case": sr.avg_actions_per_case,
                "cumulative_data": sr.cumulative_data,
            }
        all_results[env_type] = env_strategies

    return {
        "environments": all_results,
        "num_transactions": req.num_transactions,
        "seed": req.seed,
    }


@router.get("/experiments/results")
async def get_experiment_results():
    """Get all stored experiment results."""
    results = app_state.experiment_engine.get_all_results()
    return [{
        "experiment_id": r.experiment_id,
        "environment_type": r.environment_type,
        "num_transactions": r.num_transactions,
        "timestamp": r.timestamp,
    } for r in results]

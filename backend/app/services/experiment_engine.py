"""Experiment Engine — runs controlled experiments comparing strategies.

Generates identical transaction batches, runs each strategy through
identical environment copies, and collects fair comparison results.

Supports:
- Single experiment runs
- Multiple trials with averaging
- Cross-environment comparison
- Deterministic seeding for reproducibility
"""

import time
import uuid
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from copy import deepcopy

from app.simulation.environments import create_environment, BaseEnvironment
from app.simulation.transaction_generator import generate_transaction_batch
from app.services.recovery_workflow import RecoveryWorkflow, RecoveryCaseResult
from app.services.recovery_memory import RecoveryMemory
from app.agents.baselines import create_agent
from app.learning.contextual_bandit import ContextualBandit
from app.policies.policy_engine import PolicyConfig


@dataclass
class StrategyResult:
    """Results for one strategy in an experiment."""
    strategy: str
    total_at_risk: float = 0.0
    total_recovered: float = 0.0
    recovery_rate: float = 0.0
    total_cost: float = 0.0
    net_recovery: float = 0.0
    estimated_future_value: float = 0.0
    total_actions: int = 0
    total_stops: int = 0
    total_escalations: int = 0
    avg_actions_per_case: float = 0.0
    action_breakdown: Dict[str, int] = field(default_factory=dict)
    cumulative_data: List[Dict] = field(default_factory=list)
    cases: List[Dict] = field(default_factory=list)  # summary of each case


@dataclass
class ExperimentResultData:
    """Complete experiment results."""
    experiment_id: str
    environment_type: str
    num_transactions: int
    seed: int
    strategies: Dict[str, StrategyResult] = field(default_factory=dict)
    timestamp: str = ""


class ExperimentEngine:
    """Runs experiments comparing recovery strategies."""

    def __init__(self):
        self.results_store: Dict[str, ExperimentResultData] = {}

    def run_experiment(
        self,
        environment_type: str = "stable",
        num_transactions: int = 100,
        seed: int = 42,
        strategies: List[str] = None,
        policy: PolicyConfig = None,
    ) -> ExperimentResultData:
        """Run an experiment comparing strategies.

        All strategies receive the SAME transactions and environment parameters.
        Each strategy gets its own environment COPY to ensure independence.
        """
        if strategies is None:
            strategies = ["always_retry", "fixed_rules", "immediate_optimizer", "recoverai"]

        experiment_id = f"EXP-{uuid.uuid4().hex[:8]}"

        # Create base environment for transaction generation
        base_env = create_environment(environment_type, seed)
        transactions = generate_transaction_batch(base_env, num_transactions, seed)

        total_at_risk = sum(t.amount for t in transactions)

        result_data = ExperimentResultData(
            experiment_id=experiment_id,
            environment_type=environment_type,
            num_transactions=num_transactions,
            seed=seed,
            timestamp=time.strftime("%Y-%m-%d %H:%M:%S"),
        )

        for strategy_name in strategies:
            # Each strategy gets fresh copies of everything
            env_copy = create_environment(environment_type, seed)
            agent = create_agent(strategy_name)
            memory = RecoveryMemory()
            bandit = ContextualBandit(seed=seed) if strategy_name == "recoverai" else None

            # Determine strategy-specific settings
            use_adaptive = strategy_name == "recoverai"
            include_future = strategy_name in ["recoverai"]

            workflow = RecoveryWorkflow(
                environment=env_copy,
                agent=agent,
                memory=memory,
                bandit=bandit,
                policy=policy or PolicyConfig(),
                max_steps=5,
                use_adaptive=use_adaptive,
                include_future_value=include_future,
            )

            strategy_result = StrategyResult(
                strategy=strategy_name,
                total_at_risk=total_at_risk,
            )

            cumulative_recovered = 0.0
            cumulative_cost = 0.0
            action_counts = {}

            # Run each transaction through the strategy
            for i, tx_state in enumerate(transactions):
                # Deep copy so each strategy gets fresh transaction state
                tx_copy = deepcopy(tx_state)
                case_result = workflow.run_case(tx_copy)

                # Accumulate results
                strategy_result.total_recovered += case_result.total_recovered
                strategy_result.total_cost += case_result.total_cost
                strategy_result.estimated_future_value += case_result.estimated_ltv

                # Count actions
                for step in case_result.steps:
                    strategy_result.total_actions += 1
                    action = step.executed_action
                    action_counts[action] = action_counts.get(action, 0) + 1
                    if action == "STOP":
                        strategy_result.total_stops += 1
                    elif action == "ESCALATE":
                        strategy_result.total_escalations += 1

                # Cumulative data for charts
                cumulative_recovered += case_result.total_recovered
                cumulative_cost += case_result.total_cost
                if (i + 1) % max(1, num_transactions // 20) == 0 or i == len(transactions) - 1:
                    strategy_result.cumulative_data.append({
                        "transaction_index": i + 1,
                        "cumulative_recovered": round(cumulative_recovered, 2),
                        "cumulative_cost": round(cumulative_cost, 2),
                        "cumulative_net": round(cumulative_recovered - cumulative_cost, 2),
                        "running_recovery_rate": round(
                            cumulative_recovered / sum(t.amount for t in transactions[:i+1]) * 100
                            if sum(t.amount for t in transactions[:i+1]) > 0 else 0, 1
                        ),
                    })

                # Store case summary
                strategy_result.cases.append({
                    "transaction_id": case_result.transaction_id,
                    "amount": case_result.amount,
                    "status": case_result.status,
                    "recovered": case_result.total_recovered,
                    "cost": case_result.total_cost,
                    "steps": len(case_result.steps),
                    "diagnosis": case_result.diagnosis,
                    "final_action": case_result.steps[-1].executed_action if case_result.steps else "NONE",
                })

            # Calculate summary metrics
            strategy_result.recovery_rate = round(
                strategy_result.total_recovered / max(1, total_at_risk) * 100, 1
            )
            strategy_result.net_recovery = round(
                strategy_result.total_recovered - strategy_result.total_cost, 2
            )
            strategy_result.avg_actions_per_case = round(
                strategy_result.total_actions / max(1, num_transactions), 2
            )
            strategy_result.action_breakdown = action_counts

            result_data.strategies[strategy_name] = strategy_result

        # Store results
        self.results_store[experiment_id] = result_data
        return result_data

    def get_results(self, experiment_id: str) -> Optional[ExperimentResultData]:
        """Retrieve stored experiment results."""
        return self.results_store.get(experiment_id)

    def get_all_results(self) -> List[ExperimentResultData]:
        """Get all stored experiment results."""
        return list(self.results_store.values())

    def clear_results(self):
        """Clear all stored results."""
        self.results_store.clear()

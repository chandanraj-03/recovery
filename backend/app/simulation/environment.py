"""Simulation Environment for RecoverAI.

The environment independently determines outcomes.
The agent does NOT control whether an action succeeds.

This is the core separation required by the mentor feedback:
- Agent selects action
- Environment determines outcome
- Agent observes and learns

Each environment models:
- Action effectiveness probabilities
- Action costs
- Customer friction effects
- Future purchase probability changes
- Outcome generation with controlled randomness
"""

import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from enum import Enum
from copy import deepcopy


class Action(str, Enum):
    RETRY_NOW = "RETRY_NOW"
    RETRY_LATER = "RETRY_LATER"
    ALTERNATIVE_PAYMENT = "ALTERNATIVE_PAYMENT"
    RECOVERY_MESSAGE = "RECOVERY_MESSAGE"
    ESCALATE = "ESCALATE"
    STOP = "STOP"


class DiagnosisType(str, Enum):
    TRANSIENT = "transient"
    EXPIRED_CREDENTIAL = "expired_credential"
    INSUFFICIENT_FUNDS = "insufficient_funds"
    REPEATED_FAILURE = "repeated_failure"
    FRAUD_RISK = "fraud_risk"
    UNKNOWN = "unknown"


GATEWAY_CODES = {
    "transient": [
        ("E001", "Connection timeout"),
        ("E002", "Gateway temporarily unavailable"),
        ("E003", "Network error during processing"),
        ("E010", "Service temporarily down"),
    ],
    "expired_credential": [
        ("E101", "Card expired"),
        ("E102", "Invalid card number"),
        ("E103", "Payment method no longer valid"),
        ("E104", "Token expired"),
    ],
    "insufficient_funds": [
        ("E201", "Insufficient balance"),
        ("E202", "Transaction limit exceeded"),
        ("E203", "Daily limit reached"),
    ],
    "repeated_failure": [
        ("E301", "Multiple failed attempts detected"),
        ("E302", "Account temporarily blocked"),
        ("E303", "Velocity check failed"),
    ],
    "fraud_risk": [
        ("E401", "Transaction flagged for review"),
        ("E402", "Unusual transaction pattern"),
        ("E403", "Geographic anomaly detected"),
    ],
}


@dataclass
class TransactionState:
    """Full state of a transaction for the environment."""
    transaction_id: str
    customer_id: str
    amount: float
    payment_method: str
    # True underlying failure type (hidden from agent — agent must infer)
    true_failure_type: str
    # Evidence signals (what the agent actually sees)
    gateway_response_code: str
    gateway_response_message: str
    attempt_count: int = 1
    previous_success_rate: float = 0.9
    recent_failure_count: int = 1
    time_since_failure_minutes: float = 0.0
    customer_tenure_months: int = 6
    customer_total_spend: float = 10000.0
    customer_segment: str = "standard"
    is_recurring: bool = False
    hour_of_day: int = 14
    # Recovery history for this case
    previous_actions: List[str] = field(default_factory=list)
    previous_outcomes: List[str] = field(default_factory=list)
    # Customer state
    friction_score: float = 0.0
    future_purchase_prob: float = 0.8


@dataclass
class EnvironmentOutcome:
    """Result of an action as determined by the environment."""
    success: bool
    revenue: float  # 0 if failed, transaction amount if succeeded
    cost: float  # action cost
    friction_delta: float  # change in customer friction
    future_prob_delta: float  # change in future purchase probability
    message: str = ""


class BaseEnvironment:
    """Base simulation environment.

    Subclasses define different action effectiveness profiles to test
    whether the adaptive agent can respond to different conditions.
    """

    def __init__(self, seed: int = 42):
        self.rng = np.random.RandomState(seed)
        self.step_count = 0
        self.name = "base"
        self.description = "Base environment"

    def get_success_probability(
        self, state: TransactionState, action: Action
    ) -> float:
        """Get probability of success for an action given current state.

        Must be overridden by subclasses.
        """
        raise NotImplementedError

    def get_action_cost(self, action: Action) -> float:
        """Get the cost of executing an action."""
        costs = {
            Action.RETRY_NOW: 5.0,
            Action.RETRY_LATER: 3.0,
            Action.ALTERNATIVE_PAYMENT: 15.0,
            Action.RECOVERY_MESSAGE: 8.0,
            Action.ESCALATE: 50.0,
            Action.STOP: 0.0,
        }
        return costs.get(action, 0.0)

    def get_friction_impact(self, action: Action, current_friction: float) -> float:
        """How much friction does this action add."""
        base_friction = {
            Action.RETRY_NOW: 0.05,
            Action.RETRY_LATER: 0.02,
            Action.ALTERNATIVE_PAYMENT: 0.03,
            Action.RECOVERY_MESSAGE: 0.08,
            Action.ESCALATE: 0.01,
            Action.STOP: -0.02,  # stopping reduces friction slightly
        }
        return base_friction.get(action, 0.0)

    def get_future_prob_impact(self, action: Action, friction_delta: float) -> float:
        """How does this action affect future purchase probability."""
        # Higher friction reduces future probability
        return -friction_delta * 0.5

    def execute_action(
        self, state: TransactionState, action: Action
    ) -> EnvironmentOutcome:
        """Execute an action and return the environment-determined outcome.

        The agent does NOT control this outcome.
        """
        self.step_count += 1

        if action == Action.STOP:
            return EnvironmentOutcome(
                success=False, revenue=0.0, cost=0.0,
                friction_delta=-0.02, future_prob_delta=0.01,
                message="Recovery stopped by agent"
            )

        if action == Action.ESCALATE:
            # Escalation has a fixed moderate success rate
            p_success = 0.4
            success = self.rng.random() < p_success
            return EnvironmentOutcome(
                success=success,
                revenue=state.amount if success else 0.0,
                cost=self.get_action_cost(action),
                friction_delta=0.01,
                future_prob_delta=-0.005,
                message="Escalated to human review" + (" — resolved" if success else " — pending")
            )

        # Get success probability from environment model
        p_success = self.get_success_probability(state, action)

        # Diminishing returns for repeated actions
        same_action_count = sum(1 for a in state.previous_actions if a == action.value)
        if same_action_count > 0:
            p_success *= (0.7 ** same_action_count)

        # Total attempts penalty
        total_attempts = len(state.previous_actions)
        if total_attempts > 2:
            p_success *= 0.85 ** (total_attempts - 2)

        p_success = max(0.01, min(0.99, p_success))

        # Environment determines outcome
        success = self.rng.random() < p_success

        friction_delta = self.get_friction_impact(action, state.friction_score)
        future_prob_delta = self.get_future_prob_impact(action, friction_delta)
        cost = self.get_action_cost(action)

        return EnvironmentOutcome(
            success=success,
            revenue=state.amount if success else 0.0,
            cost=cost,
            friction_delta=friction_delta,
            future_prob_delta=future_prob_delta,
            message=f"{'Payment recovered' if success else 'Recovery attempt failed'} via {action.value}"
        )

    def generate_failure_evidence(
        self, true_failure_type: str
    ) -> Tuple[str, str]:
        """Generate realistic gateway evidence for a failure type.

        The agent receives THIS, not the true_failure_type directly.
        Sometimes evidence is ambiguous — that's intentional.
        """
        # 85% of the time, evidence matches the true type
        # 15% of the time, evidence is slightly misleading
        if self.rng.random() < 0.85:
            codes = GATEWAY_CODES.get(true_failure_type, GATEWAY_CODES["unknown"] if "unknown" in GATEWAY_CODES else GATEWAY_CODES["transient"])
        else:
            # Slightly misleading evidence
            other_types = [t for t in GATEWAY_CODES.keys() if t != true_failure_type]
            misleading_type = self.rng.choice(other_types)
            codes = GATEWAY_CODES[misleading_type]

        code, message = codes[self.rng.randint(0, len(codes))]
        return code, message

    def reset(self, seed: Optional[int] = None):
        """Reset environment state."""
        if seed is not None:
            self.rng = np.random.RandomState(seed)
        self.step_count = 0

    def copy(self, seed: Optional[int] = None) -> 'BaseEnvironment':
        """Create a copy of this environment with optional new seed."""
        new_env = deepcopy(self)
        if seed is not None:
            new_env.rng = np.random.RandomState(seed)
        new_env.step_count = 0
        return new_env

"""Context Builder — assembles full recovery context for decision-making.

Gathers: transaction data, customer history, failure evidence,
recovery history, previous actions + outcomes.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional
from app.simulation.environment import TransactionState


@dataclass
class RecoveryContext:
    """Complete context for an AI recovery decision."""

    # Transaction info
    transaction_id: str
    customer_id: str
    amount: float
    currency: str = "INR"
    payment_method: str = "UPI"

    # Raw evidence (what the agent sees — NOT the true failure type)
    gateway_response_code: str = ""
    gateway_response_message: str = ""
    attempt_count: int = 1
    previous_success_rate: float = 0.9
    recent_failure_count: int = 1
    time_since_failure_minutes: float = 0.0
    is_recurring: bool = False
    hour_of_day: int = 12

    # Customer context
    customer_segment: str = "standard"
    customer_tenure_months: int = 6
    customer_total_spend: float = 10000.0
    friction_score: float = 0.0
    future_purchase_probability: float = 0.8

    # Recovery history for this case (sequential decisions)
    previous_actions: List[str] = field(default_factory=list)
    previous_outcomes: List[str] = field(default_factory=list)
    total_recovery_attempts: int = 0

    # Recovery memory (from past similar cases)
    memory_hints: Dict[str, Dict] = field(default_factory=dict)
    # Format: {"RETRY_NOW": {"attempts": 5, "successes": 3, "avg_friction": 0.05}, ...}


def build_context_from_state(
    state: TransactionState,
    memory_hints: Optional[Dict] = None,
) -> RecoveryContext:
    """Build a RecoveryContext from a TransactionState.

    Note: We do NOT pass true_failure_type — the agent must infer it.
    """
    return RecoveryContext(
        transaction_id=state.transaction_id,
        customer_id=state.customer_id,
        amount=state.amount,
        payment_method=state.payment_method,
        gateway_response_code=state.gateway_response_code,
        gateway_response_message=state.gateway_response_message,
        attempt_count=state.attempt_count,
        previous_success_rate=state.previous_success_rate,
        recent_failure_count=state.recent_failure_count,
        time_since_failure_minutes=state.time_since_failure_minutes,
        is_recurring=state.is_recurring,
        hour_of_day=state.hour_of_day,
        customer_segment=state.customer_segment,
        customer_tenure_months=state.customer_tenure_months,
        customer_total_spend=state.customer_total_spend,
        friction_score=state.friction_score,
        future_purchase_probability=state.future_purchase_prob,
        previous_actions=list(state.previous_actions),
        previous_outcomes=list(state.previous_outcomes),
        total_recovery_attempts=len(state.previous_actions),
        memory_hints=memory_hints or {},
    )

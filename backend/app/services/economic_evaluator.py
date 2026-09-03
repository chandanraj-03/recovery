"""Economic Evaluator — calculates expected value for each candidate action.

For each action:
    LongTermValue = P(recovery) * txn_value + future_customer_value - action_cost - friction_penalty

All calculations are deterministic and inspectable.
This is the key differentiator from immediate-only optimization.
"""

from dataclasses import dataclass
from typing import Dict, List
from app.services.context_builder import RecoveryContext
from app.simulation.environment import Action


@dataclass
class ActionEvaluation:
    """Complete economic evaluation of a single action."""
    action: str
    p_success: float
    expected_immediate_recovery: float
    expected_future_value: float
    action_cost: float
    friction_penalty: float
    expected_long_term_value: float  # the decision metric
    breakdown: Dict[str, float]  # inspectable calculation


@dataclass
class EconomicEvaluation:
    """Economic evaluation of all candidate actions."""
    evaluations: List[ActionEvaluation]
    best_immediate_action: str  # highest immediate value
    best_longterm_action: str  # highest long-term value (may differ!)
    transaction_value: float


# Action costs (default — environments may override)
DEFAULT_ACTION_COSTS = {
    Action.RETRY_NOW: 5.0,
    Action.RETRY_LATER: 3.0,
    Action.ALTERNATIVE_PAYMENT: 15.0,
    Action.RECOVERY_MESSAGE: 8.0,
    Action.ESCALATE: 50.0,
    Action.STOP: 0.0,
}

# Friction penalties per action
FRICTION_PENALTIES = {
    Action.RETRY_NOW: 0.05,
    Action.RETRY_LATER: 0.02,
    Action.ALTERNATIVE_PAYMENT: 0.03,
    Action.RECOVERY_MESSAGE: 0.08,
    Action.ESCALATE: 0.01,
    Action.STOP: -0.02,
}


def evaluate_economics(
    context: RecoveryContext,
    predictions: Dict[str, float],
    action_costs: Dict[str, float] = None,
    include_future_value: bool = True,
) -> EconomicEvaluation:
    """Evaluate economic value of each candidate action.

    Args:
        context: Recovery context
        predictions: P(success | state, action) for each action
        action_costs: Optional custom costs (from environment)
        include_future_value: Whether to include long-term value (disabled for immediate-only baseline)

    Returns:
        Complete economic evaluation with rankings
    """
    costs = action_costs or {a.value: DEFAULT_ACTION_COSTS[a] for a in Action}
    evaluations = []

    # Estimate future customer value based on context
    estimated_annual_spend = context.customer_total_spend / max(1, context.customer_tenure_months) * 12
    future_customer_value = estimated_annual_spend * context.future_purchase_probability * 0.3  # 30% of annual as NPV proxy

    for action in Action:
        action_name = action.value
        p_success = predictions.get(action_name, 0.0)
        cost = costs.get(action_name, 0.0)
        friction_rate = FRICTION_PENALTIES.get(action, 0.0)

        # Immediate expected recovery
        expected_immediate = p_success * context.amount

        # Friction penalty (in monetary terms)
        # Friction reduces future customer value
        friction_monetary = friction_rate * future_customer_value * 0.5

        # Compounding friction from previous actions
        if context.total_recovery_attempts > 0:
            friction_monetary *= (1 + context.friction_score * 0.5)

        # Expected future value change
        if include_future_value:
            # If we recover successfully, customer relationship preserved
            # If we fail but were gentle, relationship still ok
            # If we were aggressive and failed, relationship damaged
            future_value_if_success = future_customer_value * (1 - friction_rate * 0.3)
            future_value_if_failure = future_customer_value * (1 - friction_rate * 1.5)
            expected_future = p_success * future_value_if_success + (1 - p_success) * future_value_if_failure
            expected_future -= future_customer_value  # Delta from current baseline
        else:
            expected_future = 0.0

        # STOP has special economics
        if action == Action.STOP:
            # Stopping preserves customer relationship
            expected_immediate = 0.0
            expected_future = future_customer_value * 0.02 if include_future_value else 0.0  # small positive for stopping gracefully
            friction_monetary = 0.0
            cost = 0.0

        # Long-term value = immediate + future - cost - friction
        ltv = expected_immediate + expected_future - cost - friction_monetary

        evaluation = ActionEvaluation(
            action=action_name,
            p_success=round(p_success, 3),
            expected_immediate_recovery=round(expected_immediate, 2),
            expected_future_value=round(expected_future, 2),
            action_cost=round(cost, 2),
            friction_penalty=round(friction_monetary, 2),
            expected_long_term_value=round(ltv, 2),
            breakdown={
                "p_success": round(p_success, 3),
                "transaction_value": context.amount,
                "immediate_recovery": round(expected_immediate, 2),
                "future_customer_value": round(future_customer_value, 2),
                "future_value_delta": round(expected_future, 2),
                "action_cost": round(cost, 2),
                "friction_rate": round(friction_rate, 3),
                "friction_monetary": round(friction_monetary, 2),
                "long_term_value": round(ltv, 2),
            }
        )
        evaluations.append(evaluation)

    # Sort by LTV
    evaluations.sort(key=lambda e: e.expected_long_term_value, reverse=True)

    # Find best immediate vs best long-term
    best_immediate = max(evaluations, key=lambda e: e.expected_immediate_recovery)
    best_longterm = evaluations[0]  # already sorted

    return EconomicEvaluation(
        evaluations=evaluations,
        best_immediate_action=best_immediate.action,
        best_longterm_action=best_longterm.action,
        transaction_value=context.amount,
    )

"""Recovery Predictor — estimates P(success | state, action) for each action.

Uses a lightweight model combining:
1. Prior probabilities from diagnosis type
2. Customer context modifiers
3. Recovery memory (historical outcomes for similar cases)
4. Adaptive learning estimates (from contextual bandit)

The predictor does NOT use the simulator's internal decision rules directly.
Instead, it builds estimates from observable features and past outcomes.
"""

from typing import Dict, Optional
from app.services.context_builder import RecoveryContext
from app.services.diagnosis import Diagnosis
from app.simulation.environment import Action


# Prior success probabilities by diagnosis (initial beliefs before learning)
PRIOR_RATES = {
    "transient": {
        Action.RETRY_NOW: 0.65,
        Action.RETRY_LATER: 0.70,
        Action.ALTERNATIVE_PAYMENT: 0.45,
        Action.RECOVERY_MESSAGE: 0.15,
        Action.ESCALATE: 0.35,
        Action.STOP: 0.0,
    },
    "expired_credential": {
        Action.RETRY_NOW: 0.08,
        Action.RETRY_LATER: 0.10,
        Action.ALTERNATIVE_PAYMENT: 0.60,
        Action.RECOVERY_MESSAGE: 0.20,
        Action.ESCALATE: 0.40,
        Action.STOP: 0.0,
    },
    "insufficient_funds": {
        Action.RETRY_NOW: 0.15,
        Action.RETRY_LATER: 0.50,
        Action.ALTERNATIVE_PAYMENT: 0.30,
        Action.RECOVERY_MESSAGE: 0.35,
        Action.ESCALATE: 0.30,
        Action.STOP: 0.0,
    },
    "repeated_failure": {
        Action.RETRY_NOW: 0.05,
        Action.RETRY_LATER: 0.10,
        Action.ALTERNATIVE_PAYMENT: 0.15,
        Action.RECOVERY_MESSAGE: 0.20,
        Action.ESCALATE: 0.35,
        Action.STOP: 0.0,
    },
    "fraud_risk": {
        Action.RETRY_NOW: 0.03,
        Action.RETRY_LATER: 0.05,
        Action.ALTERNATIVE_PAYMENT: 0.08,
        Action.RECOVERY_MESSAGE: 0.06,
        Action.ESCALATE: 0.45,
        Action.STOP: 0.0,
    },
}


def predict_outcomes(
    context: RecoveryContext,
    diagnosis: Diagnosis,
    bandit_estimates: Optional[Dict[str, float]] = None,
) -> Dict[str, float]:
    """Predict P(success | state, action) for each available action.

    Combines priors with context modifiers and learning.

    Args:
        context: Full recovery context
        diagnosis: Inferred diagnosis
        bandit_estimates: Optional Thompson Sampling estimates from adaptive learning

    Returns:
        Dict mapping action name to predicted success probability
    """
    priors = PRIOR_RATES.get(diagnosis.label, PRIOR_RATES["transient"])
    predictions = {}

    for action in Action:
        base_prob = priors.get(action, 0.1)

        if action == Action.STOP:
            predictions[action.value] = 0.0
            continue

        # ----- Context modifiers -----

        # 1. Diagnosis confidence affects prediction quality
        # Lower confidence → regress toward uniform prior
        confidence_factor = 0.5 + 0.5 * diagnosis.confidence
        base_prob = base_prob * confidence_factor + 0.2 * (1 - confidence_factor)

        # 2. Customer quality modifier
        if context.previous_success_rate > 0.85:
            base_prob *= 1.12
        elif context.previous_success_rate < 0.4:
            base_prob *= 0.75

        # 3. Friction penalty — higher friction reduces recovery probability
        base_prob *= (1.0 - context.friction_score * 0.25)

        # 4. Previous attempts penalty (diminishing returns)
        same_action_count = sum(1 for a in context.previous_actions if a == action.value)
        if same_action_count > 0:
            base_prob *= (0.65 ** same_action_count)

        # Total attempts penalty
        if context.total_recovery_attempts > 2:
            base_prob *= 0.82 ** (context.total_recovery_attempts - 2)

        # 5. Recovery memory hints
        if action.value in context.memory_hints:
            mem = context.memory_hints[action.value]
            if mem.get("attempts", 0) >= 3:
                # We have enough data to trust memory
                mem_rate = mem.get("successes", 0) / max(1, mem["attempts"])
                # Blend: 60% memory, 40% prior
                base_prob = 0.6 * mem_rate + 0.4 * base_prob

        # 6. Bandit estimates (from adaptive learning)
        if bandit_estimates and action.value in bandit_estimates:
            bandit_est = bandit_estimates[action.value]
            # Blend: 50% bandit, 50% model
            base_prob = 0.5 * bandit_est + 0.5 * base_prob

        predictions[action.value] = round(max(0.01, min(0.95, base_prob)), 3)

    return predictions

"""Four concrete simulation environments for RecoverAI experiments.

Environment A — Stable: Action effectiveness stays consistent
Environment B — Changing: Effectiveness shifts over time (tests adaptive learning)
Environment C — Friction: Aggressive recovery hurts future value (tests long-term optimization)
Environment D — Cost Sensitive: Action costs vary; optimal ≠ highest P(success)

Each environment produces genuinely different optimal strategies,
so baseline comparisons are meaningful.
"""

from app.simulation.environment import (
    BaseEnvironment, TransactionState, Action, EnvironmentOutcome
)


class StableEnvironment(BaseEnvironment):
    """Environment A — Stable action effectiveness.

    Action probabilities remain consistent throughout.
    Tests whether the agent can learn stable patterns.
    """

    def __init__(self, seed: int = 42):
        super().__init__(seed)
        self.name = "stable"
        self.description = "Stable environment — consistent action effectiveness"

        # Base success rates by failure type and action
        self.success_rates = {
            "transient": {
                Action.RETRY_NOW: 0.72,
                Action.RETRY_LATER: 0.78,
                Action.ALTERNATIVE_PAYMENT: 0.50,
                Action.RECOVERY_MESSAGE: 0.15,
            },
            "expired_credential": {
                Action.RETRY_NOW: 0.05,
                Action.RETRY_LATER: 0.08,
                Action.ALTERNATIVE_PAYMENT: 0.68,
                Action.RECOVERY_MESSAGE: 0.22,
            },
            "insufficient_funds": {
                Action.RETRY_NOW: 0.18,
                Action.RETRY_LATER: 0.58,
                Action.ALTERNATIVE_PAYMENT: 0.35,
                Action.RECOVERY_MESSAGE: 0.42,
            },
            "repeated_failure": {
                Action.RETRY_NOW: 0.03,
                Action.RETRY_LATER: 0.12,
                Action.ALTERNATIVE_PAYMENT: 0.18,
                Action.RECOVERY_MESSAGE: 0.25,
            },
            "fraud_risk": {
                Action.RETRY_NOW: 0.02,
                Action.RETRY_LATER: 0.05,
                Action.ALTERNATIVE_PAYMENT: 0.10,
                Action.RECOVERY_MESSAGE: 0.08,
            },
        }

    def get_success_probability(
        self, state: TransactionState, action: Action
    ) -> float:
        failure_type = state.true_failure_type
        rates = self.success_rates.get(failure_type, self.success_rates["transient"])
        base_rate = rates.get(action, 0.1)

        # Modify by customer quality
        if state.previous_success_rate > 0.8:
            base_rate *= 1.1
        elif state.previous_success_rate < 0.4:
            base_rate *= 0.7

        # High friction customers are harder to recover
        base_rate *= (1.0 - state.friction_score * 0.3)

        return max(0.01, min(0.95, base_rate))


class ChangingEnvironment(BaseEnvironment):
    """Environment B — Action effectiveness changes over time.

    Early: RETRY_NOW works best
    Later: ALTERNATIVE_PAYMENT becomes best
    This tests whether adaptive learning detects and responds to shifts.
    """

    def __init__(self, seed: int = 42):
        super().__init__(seed)
        self.name = "changing"
        self.description = "Changing environment — effectiveness shifts over time"
        self.shift_point = 50  # After 50 actions, environment shifts

    def get_success_probability(
        self, state: TransactionState, action: Action
    ) -> float:
        failure_type = state.true_failure_type

        # Phase detection based on step count
        phase_progress = min(1.0, self.step_count / self.shift_point)

        # Early phase rates
        early_rates = {
            "transient": {
                Action.RETRY_NOW: 0.80,
                Action.RETRY_LATER: 0.65,
                Action.ALTERNATIVE_PAYMENT: 0.30,
                Action.RECOVERY_MESSAGE: 0.15,
            },
            "expired_credential": {
                Action.RETRY_NOW: 0.10,
                Action.RETRY_LATER: 0.15,
                Action.ALTERNATIVE_PAYMENT: 0.55,
                Action.RECOVERY_MESSAGE: 0.20,
            },
            "insufficient_funds": {
                Action.RETRY_NOW: 0.30,
                Action.RETRY_LATER: 0.50,
                Action.ALTERNATIVE_PAYMENT: 0.25,
                Action.RECOVERY_MESSAGE: 0.35,
            },
            "repeated_failure": {
                Action.RETRY_NOW: 0.08,
                Action.RETRY_LATER: 0.15,
                Action.ALTERNATIVE_PAYMENT: 0.12,
                Action.RECOVERY_MESSAGE: 0.20,
            },
            "fraud_risk": {
                Action.RETRY_NOW: 0.03,
                Action.RETRY_LATER: 0.05,
                Action.ALTERNATIVE_PAYMENT: 0.08,
                Action.RECOVERY_MESSAGE: 0.06,
            },
        }

        # Late phase rates — retry becomes less effective, alt payment more effective
        late_rates = {
            "transient": {
                Action.RETRY_NOW: 0.35,
                Action.RETRY_LATER: 0.40,
                Action.ALTERNATIVE_PAYMENT: 0.75,
                Action.RECOVERY_MESSAGE: 0.20,
            },
            "expired_credential": {
                Action.RETRY_NOW: 0.03,
                Action.RETRY_LATER: 0.05,
                Action.ALTERNATIVE_PAYMENT: 0.80,
                Action.RECOVERY_MESSAGE: 0.30,
            },
            "insufficient_funds": {
                Action.RETRY_NOW: 0.10,
                Action.RETRY_LATER: 0.25,
                Action.ALTERNATIVE_PAYMENT: 0.60,
                Action.RECOVERY_MESSAGE: 0.45,
            },
            "repeated_failure": {
                Action.RETRY_NOW: 0.02,
                Action.RETRY_LATER: 0.08,
                Action.ALTERNATIVE_PAYMENT: 0.30,
                Action.RECOVERY_MESSAGE: 0.28,
            },
            "fraud_risk": {
                Action.RETRY_NOW: 0.01,
                Action.RETRY_LATER: 0.03,
                Action.ALTERNATIVE_PAYMENT: 0.12,
                Action.RECOVERY_MESSAGE: 0.10,
            },
        }

        early = early_rates.get(failure_type, early_rates["transient"])
        late = late_rates.get(failure_type, late_rates["transient"])

        early_rate = early.get(action, 0.1)
        late_rate = late.get(action, 0.1)

        # Smooth interpolation
        base_rate = early_rate * (1 - phase_progress) + late_rate * phase_progress

        base_rate *= (1.0 - state.friction_score * 0.3)
        if state.previous_success_rate > 0.8:
            base_rate *= 1.1

        return max(0.01, min(0.95, base_rate))


class FrictionEnvironment(BaseEnvironment):
    """Environment C — Customer friction matters.

    Aggressive recovery increases friction, which:
    - Reduces future purchase probability
    - Makes subsequent recovery harder
    - Penalizes strategies that over-contact customers

    This tests whether the agent optimizes for long-term value,
    not just immediate recovery.
    """

    def __init__(self, seed: int = 42):
        super().__init__(seed)
        self.name = "friction"
        self.description = "Friction environment — aggressive recovery hurts long-term value"

    def get_success_probability(
        self, state: TransactionState, action: Action
    ) -> float:
        failure_type = state.true_failure_type

        base_rates = {
            "transient": {
                Action.RETRY_NOW: 0.70,
                Action.RETRY_LATER: 0.75,
                Action.ALTERNATIVE_PAYMENT: 0.55,
                Action.RECOVERY_MESSAGE: 0.20,
            },
            "expired_credential": {
                Action.RETRY_NOW: 0.06,
                Action.RETRY_LATER: 0.10,
                Action.ALTERNATIVE_PAYMENT: 0.65,
                Action.RECOVERY_MESSAGE: 0.25,
            },
            "insufficient_funds": {
                Action.RETRY_NOW: 0.15,
                Action.RETRY_LATER: 0.55,
                Action.ALTERNATIVE_PAYMENT: 0.30,
                Action.RECOVERY_MESSAGE: 0.40,
            },
            "repeated_failure": {
                Action.RETRY_NOW: 0.04,
                Action.RETRY_LATER: 0.10,
                Action.ALTERNATIVE_PAYMENT: 0.15,
                Action.RECOVERY_MESSAGE: 0.22,
            },
            "fraud_risk": {
                Action.RETRY_NOW: 0.02,
                Action.RETRY_LATER: 0.04,
                Action.ALTERNATIVE_PAYMENT: 0.08,
                Action.RECOVERY_MESSAGE: 0.06,
            },
        }

        rates = base_rates.get(failure_type, base_rates["transient"])
        base_rate = rates.get(action, 0.1)

        # HEAVY friction penalty — this is the key differentiator
        friction_penalty = state.friction_score * 0.6  # much stronger than stable
        base_rate *= (1.0 - friction_penalty)

        return max(0.01, min(0.95, base_rate))

    def get_friction_impact(self, action: Action, current_friction: float) -> float:
        """Much higher friction impacts than other environments."""
        impacts = {
            Action.RETRY_NOW: 0.12,
            Action.RETRY_LATER: 0.04,
            Action.ALTERNATIVE_PAYMENT: 0.06,
            Action.RECOVERY_MESSAGE: 0.18,  # messages are very friction-heavy
            Action.ESCALATE: 0.02,
            Action.STOP: -0.05,
        }
        # Friction compounds — more friction when already high
        base = impacts.get(action, 0.05)
        return base * (1 + current_friction * 0.5)

    def get_future_prob_impact(self, action: Action, friction_delta: float) -> float:
        """Aggressive recovery severely impacts future purchases."""
        return -friction_delta * 1.5  # 3x stronger than base


class CostSensitiveEnvironment(BaseEnvironment):
    """Environment D — Action costs vary significantly.

    The best action is NOT simply the one with highest P(success).
    Economic value must account for action costs.

    This tests whether the agent optimizes value, not just probability.
    """

    def __init__(self, seed: int = 42):
        super().__init__(seed)
        self.name = "cost_sensitive"
        self.description = "Cost-sensitive environment — action costs matter for optimal strategy"

    def get_success_probability(
        self, state: TransactionState, action: Action
    ) -> float:
        failure_type = state.true_failure_type

        # Success rates are somewhat uniform — the difference is in cost
        base_rates = {
            "transient": {
                Action.RETRY_NOW: 0.68,
                Action.RETRY_LATER: 0.72,
                Action.ALTERNATIVE_PAYMENT: 0.70,
                Action.RECOVERY_MESSAGE: 0.30,
            },
            "expired_credential": {
                Action.RETRY_NOW: 0.08,
                Action.RETRY_LATER: 0.10,
                Action.ALTERNATIVE_PAYMENT: 0.72,
                Action.RECOVERY_MESSAGE: 0.28,
            },
            "insufficient_funds": {
                Action.RETRY_NOW: 0.20,
                Action.RETRY_LATER: 0.55,
                Action.ALTERNATIVE_PAYMENT: 0.50,
                Action.RECOVERY_MESSAGE: 0.45,
            },
            "repeated_failure": {
                Action.RETRY_NOW: 0.05,
                Action.RETRY_LATER: 0.12,
                Action.ALTERNATIVE_PAYMENT: 0.20,
                Action.RECOVERY_MESSAGE: 0.22,
            },
            "fraud_risk": {
                Action.RETRY_NOW: 0.02,
                Action.RETRY_LATER: 0.05,
                Action.ALTERNATIVE_PAYMENT: 0.10,
                Action.RECOVERY_MESSAGE: 0.08,
            },
        }

        rates = base_rates.get(failure_type, base_rates["transient"])
        base_rate = rates.get(action, 0.1)
        base_rate *= (1.0 - state.friction_score * 0.3)
        return max(0.01, min(0.95, base_rate))

    def get_action_cost(self, action: Action) -> float:
        """Significantly higher and varied costs."""
        costs = {
            Action.RETRY_NOW: 8.0,
            Action.RETRY_LATER: 5.0,
            Action.ALTERNATIVE_PAYMENT: 80.0,  # expensive gateway integration
            Action.RECOVERY_MESSAGE: 25.0,  # SMS/notification cost
            Action.ESCALATE: 200.0,  # human agent time
            Action.STOP: 0.0,
        }
        return costs.get(action, 0.0)


# Registry of available environments
ENVIRONMENTS = {
    "stable": StableEnvironment,
    "changing": ChangingEnvironment,
    "friction": FrictionEnvironment,
    "cost_sensitive": CostSensitiveEnvironment,
}


def create_environment(env_type: str, seed: int = 42) -> BaseEnvironment:
    """Factory to create an environment by name."""
    env_class = ENVIRONMENTS.get(env_type, StableEnvironment)
    return env_class(seed=seed)

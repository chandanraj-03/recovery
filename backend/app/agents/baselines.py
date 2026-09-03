"""Baseline strategies — fully implemented, not just described.

Three baselines for fair comparison:
1. AlwaysRetry — every eligible failure → RETRY_NOW
2. FixedRules — deterministic rules based on failure type
3. ImmediateOptimizer — highest P(success)*value, ignores long-term value

Each baseline uses the SAME workflow infrastructure (context, diagnosis,
policy engine) but makes decisions differently.
"""

from typing import Tuple
from app.services.context_builder import RecoveryContext
from app.services.diagnosis import Diagnosis
from app.services.economic_evaluator import EconomicEvaluation
from app.simulation.environment import Action


class AlwaysRetryAgent:
    """Baseline 1: Always retry every failure.

    No intelligence. Just retries until policy stops it.
    """
    name = "always_retry"
    decisions_made = 0

    def select_action(
        self, context: RecoveryContext, diagnosis: Diagnosis,
        evaluation: EconomicEvaluation,
    ) -> Tuple[str, str]:
        self.decisions_made += 1
        return Action.RETRY_NOW.value, "Always retry strategy — retrying payment"

    def reset(self):
        self.decisions_made = 0


class FixedRulesAgent:
    """Baseline 2: Fixed rules based on diagnosed failure type.

    transient → retry now
    expired_credential → alternative payment
    insufficient_funds → retry later
    repeated_failure → stop
    fraud_risk → escalate
    """
    name = "fixed_rules"
    decisions_made = 0

    RULES = {
        "transient": Action.RETRY_NOW.value,
        "expired_credential": Action.ALTERNATIVE_PAYMENT.value,
        "insufficient_funds": Action.RETRY_LATER.value,
        "repeated_failure": Action.STOP.value,
        "fraud_risk": Action.ESCALATE.value,
    }

    def select_action(
        self, context: RecoveryContext, diagnosis: Diagnosis,
        evaluation: EconomicEvaluation,
    ) -> Tuple[str, str]:
        self.decisions_made += 1
        action = self.RULES.get(diagnosis.label, Action.RETRY_NOW.value)

        # If we've already tried this action and failed, try next in sequence
        if action in context.previous_actions and action not in [Action.STOP.value, Action.ESCALATE.value]:
            failed_for_action = sum(
                1 for a, o in zip(context.previous_actions, context.previous_outcomes)
                if a == action and o == "FAILED"
            )
            if failed_for_action > 0:
                # Try alternative
                if action == Action.RETRY_NOW.value:
                    action = Action.RETRY_LATER.value
                elif action == Action.RETRY_LATER.value:
                    action = Action.ALTERNATIVE_PAYMENT.value
                elif action == Action.ALTERNATIVE_PAYMENT.value:
                    action = Action.STOP.value

        return action, f"Fixed rule for {diagnosis.label}: {action}"

    def reset(self):
        self.decisions_made = 0


class ImmediateOptimizerAgent:
    """Baseline 3: Maximize immediate recovery value only.

    Picks the action with highest P(success) * transaction_value.
    Does NOT consider long-term customer value, costs, or friction.

    This is a strong baseline — it uses predictions but ignores future value.
    """
    name = "immediate_optimizer"
    decisions_made = 0

    def select_action(
        self, context: RecoveryContext, diagnosis: Diagnosis,
        evaluation: EconomicEvaluation,
    ) -> Tuple[str, str]:
        self.decisions_made += 1

        # Pick action with highest expected immediate recovery
        best_action = None
        best_immediate = -1

        for ev in evaluation.evaluations:
            if ev.action == Action.STOP.value:
                continue
            if ev.expected_immediate_recovery > best_immediate:
                best_immediate = ev.expected_immediate_recovery
                best_action = ev.action

        if best_action is None or best_immediate < 10:
            return Action.STOP.value, "No action has meaningful immediate recovery value"

        return best_action, (
            f"Immediate optimizer: {best_action} has highest expected immediate "
            f"recovery ₹{best_immediate:.0f}"
        )

    def reset(self):
        self.decisions_made = 0


# Registry
BASELINE_AGENTS = {
    "always_retry": AlwaysRetryAgent,
    "fixed_rules": FixedRulesAgent,
    "immediate_optimizer": ImmediateOptimizerAgent,
}


def create_agent(strategy: str):
    """Create an agent by strategy name."""
    from app.agents.recovery_agent import RecoveryAgent

    if strategy == "recoverai":
        return RecoveryAgent()

    agent_class = BASELINE_AGENTS.get(strategy)
    if agent_class:
        return agent_class()

    raise ValueError(f"Unknown strategy: {strategy}")

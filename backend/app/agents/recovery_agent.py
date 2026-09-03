"""Recovery Agent — the core AI decision maker.

Selects the next action based on:
- Diagnosis (inferred from evidence)
- Predicted outcomes
- Economic evaluation (immediate + long-term)
- Recovery memory
- Policy constraints
- Customer context

The agent makes CONTEXT-DEPENDENT decisions:
same failure type → different actions for different customers.

The agent can choose STOP when further recovery hurts more than it helps.
"""

from typing import Dict, List, Optional, Tuple
from app.services.context_builder import RecoveryContext
from app.services.diagnosis import Diagnosis
from app.services.economic_evaluator import EconomicEvaluation, ActionEvaluation
from app.simulation.environment import Action


class RecoveryAgent:
    """Adaptive recovery agent that selects optimal recovery actions.

    This is not a simple argmax optimizer. The agent considers:
    1. Economic value (long-term, not just immediate)
    2. Whether to STOP (when expected value of continuing is negative)
    3. Context from recovery memory
    4. Sequential state (what has been tried before)
    """

    def __init__(self):
        self.name = "recoverai"
        self.decisions_made = 0

    def select_action(
        self,
        context: RecoveryContext,
        diagnosis: Diagnosis,
        evaluation: EconomicEvaluation,
    ) -> Tuple[str, str]:
        """Select the best recovery action.

        Returns:
            (action_name, decision_reason)
        """
        self.decisions_made += 1

        # Get all evaluations sorted by LTV
        evals = {e.action: e for e in evaluation.evaluations}

        # ----- Decision logic -----

        # 1. Check if STOP is the best option
        stop_eval = evals.get(Action.STOP.value)
        best_non_stop = [e for e in evaluation.evaluations if e.action != Action.STOP.value]

        if not best_non_stop:
            return Action.STOP.value, "No viable actions available"

        best = best_non_stop[0]

        # If the best non-stop action has negative or near-zero LTV, STOP
        if best.expected_long_term_value < 10 and context.total_recovery_attempts > 0:
            return Action.STOP.value, (
                f"Best available action ({best.action}) has LTV of ₹{best.expected_long_term_value:.0f}, "
                f"below threshold after {context.total_recovery_attempts} attempts. Stopping to preserve customer relationship."
            )

        # 2. Check for repeated failures — should we escalate or stop?
        if context.total_recovery_attempts >= 3:
            failed_count = sum(1 for o in context.previous_outcomes if o == "FAILED")
            if failed_count >= 2:
                # Consider escalation
                escalate_eval = evals.get(Action.ESCALATE.value)
                if escalate_eval and escalate_eval.expected_long_term_value > stop_eval.expected_long_term_value:
                    return Action.ESCALATE.value, (
                        f"After {context.total_recovery_attempts} attempts with {failed_count} failures, "
                        f"escalating to human review (LTV: ₹{escalate_eval.expected_long_term_value:.0f})"
                    )
                else:
                    return Action.STOP.value, (
                        f"After {context.total_recovery_attempts} attempts with {failed_count} failures, "
                        f"stopping recovery to prevent further customer friction."
                    )

        # 3. Consider diagnosis-specific intelligence
        reason_parts = []

        # If diagnosis is fraud_risk, prefer escalation
        if diagnosis.label == "fraud_risk" and diagnosis.confidence > 0.5:
            escalate_eval = evals.get(Action.ESCALATE.value)
            if escalate_eval:
                return Action.ESCALATE.value, (
                    f"Fraud risk detected (confidence: {diagnosis.confidence:.0%}). "
                    f"Escalating to human review for safety."
                )

        # 4. Check for high-value transactions — be more conservative
        if context.amount > 25000:
            reason_parts.append(f"High-value transaction (₹{context.amount:,.0f})")
            # For high value, weight LTV more heavily
            if best.action in [Action.RETRY_NOW.value, Action.RECOVERY_MESSAGE.value]:
                # Check if a gentler approach has comparable LTV
                gentle_actions = [
                    e for e in best_non_stop
                    if e.action in [Action.RETRY_LATER.value, Action.ALTERNATIVE_PAYMENT.value]
                    and e.expected_long_term_value > best.expected_long_term_value * 0.85
                ]
                if gentle_actions:
                    best = gentle_actions[0]
                    reason_parts.append("Chose gentler approach to protect high-value relationship")

        # 5. Recovery memory influence
        if context.memory_hints:
            best_memory_action = None
            best_memory_rate = 0
            for action_name, mem in context.memory_hints.items():
                if mem.get("attempts", 0) >= 3:
                    rate = mem.get("successes", 0) / mem["attempts"]
                    if rate > best_memory_rate:
                        best_memory_rate = rate
                        best_memory_action = action_name

            if best_memory_action and best_memory_rate > 0.6:
                memory_eval = evals.get(best_memory_action)
                if memory_eval and memory_eval.expected_long_term_value > best.expected_long_term_value * 0.9:
                    best = memory_eval
                    reason_parts.append(
                        f"Recovery memory: {best_memory_action} has {best_memory_rate:.0%} success "
                        f"rate for similar cases"
                    )

        # 6. Default: select highest LTV action
        if not reason_parts:
            reason_parts.append(f"Highest expected long-term value among {len(best_non_stop)} candidates")

        # Build reason string
        reason = (
            f"Selected {best.action} — "
            f"P(success)={best.p_success:.0%}, "
            f"immediate=₹{best.expected_immediate_recovery:.0f}, "
            f"LTV=₹{best.expected_long_term_value:.0f}. "
            + " | ".join(reason_parts)
        )

        # Highlight when best immediate ≠ best long-term
        if evaluation.best_immediate_action != evaluation.best_longterm_action:
            if best.action == evaluation.best_longterm_action:
                reason += (
                    f" | Note: Best immediate action would be {evaluation.best_immediate_action}, "
                    f"but {best.action} is better for long-term value."
                )

        return best.action, reason

    def reset(self):
        """Reset agent state."""
        self.decisions_made = 0

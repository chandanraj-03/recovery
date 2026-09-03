"""Policy Engine — deterministic, merchant-configurable constraints.

The AI CANNOT override policies. All actions must pass through this engine.

Policy decisions:
- ALLOW: Action may proceed
- REVIEW: Requires human approval (queued)
- STOP: Action blocked, recovery stopped

This is a critical safety boundary between AI decisions and execution.
"""

from dataclasses import dataclass
from typing import Tuple
from app.services.context_builder import RecoveryContext


@dataclass
class PolicyConfig:
    """Merchant-configurable policy settings."""
    max_automatic_retries: int = 2
    max_customer_messages: int = 1
    min_retry_interval_minutes: int = 30
    max_recovery_window_hours: int = 24
    high_value_threshold: float = 50000.0
    enable_auto_escalation: bool = True
    max_total_recovery_attempts: int = 5


@dataclass
class PolicyResult:
    """Result of policy evaluation."""
    decision: str  # ALLOW, REVIEW, STOP
    reason: str
    rule_triggered: str = ""  # which policy rule was triggered


# Default policy
DEFAULT_POLICY = PolicyConfig()


def evaluate_policy(
    context: RecoveryContext,
    proposed_action: str,
    policy: PolicyConfig = None,
) -> PolicyResult:
    """Evaluate whether a proposed action is permitted by merchant policy.

    This is DETERMINISTIC. The AI cannot influence, override, or bypass these rules.

    Args:
        context: Recovery context
        proposed_action: The action the agent wants to take
        policy: Merchant policy configuration

    Returns:
        PolicyResult with decision, reason, and triggered rule
    """
    if policy is None:
        policy = DEFAULT_POLICY

    # ----- Rule 1: Payment already succeeded → STOP -----
    if any(o == "SUCCESS" for o in context.previous_outcomes):
        return PolicyResult(
            decision="STOP",
            reason="Payment already recovered successfully",
            rule_triggered="payment_success"
        )

    # ----- Rule 2: STOP action is always allowed -----
    if proposed_action == "STOP":
        return PolicyResult(
            decision="ALLOW",
            reason="Agent chose to stop recovery — always permitted",
            rule_triggered="stop_always_allowed"
        )

    # ----- Rule 3: Max total recovery attempts -----
    if context.total_recovery_attempts >= policy.max_total_recovery_attempts:
        return PolicyResult(
            decision="STOP",
            reason=f"Maximum total recovery attempts ({policy.max_total_recovery_attempts}) reached",
            rule_triggered="max_total_attempts"
        )

    # ----- Rule 4: High-value transaction → REVIEW -----
    if context.amount > policy.high_value_threshold:
        if proposed_action not in ["STOP", "ESCALATE"]:
            return PolicyResult(
                decision="REVIEW",
                reason=f"Transaction amount ₹{context.amount:,.0f} exceeds threshold ₹{policy.high_value_threshold:,.0f} — requires human review",
                rule_triggered="high_value_threshold"
            )

    # ----- Rule 5: Max automatic retries -----
    retry_actions = ["RETRY_NOW", "RETRY_LATER"]
    retry_count = sum(1 for a in context.previous_actions if a in retry_actions)
    if proposed_action in retry_actions and retry_count >= policy.max_automatic_retries:
        return PolicyResult(
            decision="STOP",
            reason=f"Maximum automatic retries ({policy.max_automatic_retries}) reached ({retry_count} used)",
            rule_triggered="max_retries"
        )

    # ----- Rule 6: Max customer messages -----
    message_count = sum(1 for a in context.previous_actions if a == "RECOVERY_MESSAGE")
    if proposed_action == "RECOVERY_MESSAGE" and message_count >= policy.max_customer_messages:
        return PolicyResult(
            decision="STOP",
            reason=f"Maximum customer messages ({policy.max_customer_messages}) reached",
            rule_triggered="max_messages"
        )

    # ----- Rule 7: Min retry interval -----
    if proposed_action in retry_actions and context.time_since_failure_minutes < policy.min_retry_interval_minutes:
        if context.total_recovery_attempts > 0:  # Only enforce after first attempt
            return PolicyResult(
                decision="STOP",
                reason=f"Minimum retry interval ({policy.min_retry_interval_minutes} min) not met — {context.time_since_failure_minutes:.0f} min elapsed",
                rule_triggered="min_retry_interval"
            )

    # ----- Rule 8: Repeated unsuccessful recovery → ESCALATE recommendation -----
    consecutive_failures = 0
    for outcome in reversed(context.previous_outcomes):
        if outcome == "FAILED":
            consecutive_failures += 1
        else:
            break

    if consecutive_failures >= 3 and proposed_action not in ["ESCALATE", "STOP"]:
        if policy.enable_auto_escalation:
            return PolicyResult(
                decision="STOP",
                reason=f"{consecutive_failures} consecutive failed recovery attempts — should escalate or stop",
                rule_triggered="repeated_failures"
            )

    # ----- All checks passed -----
    return PolicyResult(
        decision="ALLOW",
        reason=f"Action {proposed_action} permitted by all policy rules",
        rule_triggered="none"
    )

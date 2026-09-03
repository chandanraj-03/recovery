"""Recovery Diagnosis Engine — infers failure cause from evidence.

The agent does NOT receive a perfect failure_type label.
Instead, it receives raw evidence (gateway codes, history, timing)
and must INFER a diagnosis with confidence and supporting evidence.

This addresses the mentor's key criticism:
"What exactly did your AI discover?"

Uses a Bayesian-style rule-based classifier that weighs multiple
evidence signals to produce a diagnosis with calibrated confidence.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Tuple
from app.services.context_builder import RecoveryContext
from app.simulation.environment import GATEWAY_CODES


@dataclass
class Diagnosis:
    """Recovery diagnosis with confidence and evidence."""
    label: str  # transient, expired_credential, insufficient_funds, repeated_failure, fraud_risk
    confidence: float  # 0.0 to 1.0
    evidence: List[str]  # human-readable evidence statements
    all_scores: Dict[str, float] = field(default_factory=dict)  # scores for all diagnoses


# Map gateway codes to diagnosis categories
GATEWAY_CODE_MAP = {}
for diagnosis_type, codes in GATEWAY_CODES.items():
    for code, message in codes:
        GATEWAY_CODE_MAP[code] = diagnosis_type


def diagnose(context: RecoveryContext) -> Diagnosis:
    """Infer a recovery diagnosis from observable evidence.

    The diagnosis engine weighs multiple signals:
    1. Gateway response code (strongest signal, but can be misleading)
    2. Historical payment success rate
    3. Number of recent failures
    4. Time since failure
    5. Payment method
    6. Customer tenure and segment
    7. Previous recovery outcomes

    Returns a diagnosis with confidence and evidence list.
    """

    scores = {
        "transient": 0.0,
        "expired_credential": 0.0,
        "insufficient_funds": 0.0,
        "repeated_failure": 0.0,
        "fraud_risk": 0.0,
    }
    evidence = []

    # ----- Signal 1: Gateway code (weight: 3.0) -----
    gateway_diagnosis = GATEWAY_CODE_MAP.get(context.gateway_response_code)
    if gateway_diagnosis:
        scores[gateway_diagnosis] += 3.0
        evidence.append(f"Gateway code {context.gateway_response_code} suggests {gateway_diagnosis.replace('_', ' ')}")
    else:
        # Unknown code — spread probability
        for k in scores:
            scores[k] += 0.5
        evidence.append(f"Gateway code {context.gateway_response_code} is ambiguous")

    # ----- Signal 2: Gateway message keywords -----
    msg = context.gateway_response_message.lower()
    if any(w in msg for w in ["timeout", "temporary", "unavailable", "network"]):
        scores["transient"] += 1.5
        evidence.append(f"Gateway message indicates transient behavior: '{context.gateway_response_message}'")
    if any(w in msg for w in ["expired", "invalid", "no longer valid", "token"]):
        scores["expired_credential"] += 1.5
        evidence.append(f"Gateway message suggests credential issue: '{context.gateway_response_message}'")
    if any(w in msg for w in ["insufficient", "balance", "limit"]):
        scores["insufficient_funds"] += 1.5
        evidence.append(f"Gateway message suggests funding issue: '{context.gateway_response_message}'")
    if any(w in msg for w in ["blocked", "velocity", "multiple"]):
        scores["repeated_failure"] += 1.5
        evidence.append(f"Gateway message suggests repeated issues: '{context.gateway_response_message}'")
    if any(w in msg for w in ["flagged", "unusual", "anomaly", "review"]):
        scores["fraud_risk"] += 1.5
        evidence.append(f"Gateway message suggests risk concern: '{context.gateway_response_message}'")

    # ----- Signal 3: Historical success rate (weight: 2.0) -----
    if context.previous_success_rate >= 0.85:
        scores["transient"] += 2.0
        evidence.append(f"{int(context.previous_success_rate * 100)}% historical payment success — likely transient issue")
    elif context.previous_success_rate >= 0.6:
        scores["transient"] += 1.0
        scores["insufficient_funds"] += 0.5
    elif context.previous_success_rate >= 0.3:
        scores["repeated_failure"] += 1.0
        scores["insufficient_funds"] += 0.8
        evidence.append(f"Only {int(context.previous_success_rate * 100)}% historical success rate — potential recurring issue")
    else:
        scores["repeated_failure"] += 2.0
        scores["fraud_risk"] += 0.5
        evidence.append(f"Very low {int(context.previous_success_rate * 100)}% historical success — significant concern")

    # ----- Signal 4: Recent failure count (weight: 1.5) -----
    if context.recent_failure_count >= 3:
        scores["repeated_failure"] += 2.0
        evidence.append(f"{context.recent_failure_count} recent failures indicate pattern")
    elif context.recent_failure_count == 2:
        scores["repeated_failure"] += 1.0
    elif context.recent_failure_count == 1 and context.previous_success_rate > 0.8:
        scores["transient"] += 1.0
        evidence.append("Single failure with strong history — supports transient diagnosis")

    # ----- Signal 5: Time since failure -----
    if context.time_since_failure_minutes < 5:
        scores["transient"] += 0.5  # very recent, might still be transient
    elif context.time_since_failure_minutes > 120:
        scores["insufficient_funds"] += 0.3
        scores["expired_credential"] += 0.3

    # ----- Signal 6: Payment method -----
    if context.payment_method == "CARD":
        scores["expired_credential"] += 0.5  # cards can expire
    elif context.payment_method == "UPI":
        scores["transient"] += 0.3  # UPI often has transient issues
    elif context.payment_method == "WALLET":
        scores["insufficient_funds"] += 0.5  # wallets can have low balance

    # ----- Signal 7: Amount -----
    if context.amount > 50000:
        scores["fraud_risk"] += 0.5  # large amounts trigger fraud checks
    if context.amount > context.customer_total_spend * 0.3:
        scores["insufficient_funds"] += 0.3

    # ----- Signal 8: Previous recovery outcomes -----
    if context.previous_actions:
        num_failed = sum(1 for o in context.previous_outcomes if o == "FAILED")
        if num_failed >= 2:
            scores["repeated_failure"] += 1.5
            evidence.append(f"{num_failed} previous recovery attempts failed — escalating concern")

    # ----- Normalize to probabilities -----
    total = sum(scores.values())
    if total > 0:
        for k in scores:
            scores[k] = round(scores[k] / total, 3)

    # Pick best diagnosis
    best_label = max(scores, key=scores.get)
    confidence = scores[best_label]

    # Add summary evidence
    if not any("historical" in e.lower() for e in evidence):
        evidence.append(f"Customer success rate: {int(context.previous_success_rate * 100)}%")

    return Diagnosis(
        label=best_label,
        confidence=round(confidence, 2),
        evidence=evidence,
        all_scores=scores,
    )

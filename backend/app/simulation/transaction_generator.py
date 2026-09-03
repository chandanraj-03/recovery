"""Transaction generator for simulation.

Generates batches of failed transactions with realistic evidence.
Does NOT provide perfect failure labels — provides raw evidence signals
that the diagnosis engine must reason from.
"""

import numpy as np
from typing import List
from app.simulation.environment import (
    BaseEnvironment, TransactionState, GATEWAY_CODES
)


# Customer profiles for realistic generation
CUSTOMER_SEGMENTS = {
    "premium": {
        "weight": 0.15,
        "avg_amount": 15000,
        "amount_std": 8000,
        "success_rate_range": (0.85, 0.98),
        "tenure_range": (12, 60),
        "spend_range": (50000, 500000),
        "payment_methods": ["CARD", "UPI", "NETBANKING"],
        "friction_range": (0.0, 0.1),
    },
    "high_value": {
        "weight": 0.10,
        "avg_amount": 35000,
        "amount_std": 20000,
        "success_rate_range": (0.80, 0.95),
        "tenure_range": (6, 48),
        "spend_range": (100000, 1000000),
        "payment_methods": ["CARD", "NETBANKING"],
        "friction_range": (0.0, 0.15),
    },
    "standard": {
        "weight": 0.50,
        "avg_amount": 5000,
        "amount_std": 3000,
        "success_rate_range": (0.70, 0.95),
        "tenure_range": (3, 36),
        "spend_range": (5000, 80000),
        "payment_methods": ["UPI", "CARD", "WALLET"],
        "friction_range": (0.0, 0.2),
    },
    "new": {
        "weight": 0.25,
        "avg_amount": 2500,
        "amount_std": 2000,
        "success_rate_range": (0.50, 0.85),
        "tenure_range": (0, 6),
        "spend_range": (0, 10000),
        "payment_methods": ["UPI", "WALLET"],
        "friction_range": (0.0, 0.3),
    },
}

# Failure type distribution
FAILURE_TYPES = {
    "transient": 0.35,
    "expired_credential": 0.20,
    "insufficient_funds": 0.25,
    "repeated_failure": 0.12,
    "fraud_risk": 0.08,
}


def generate_transaction_batch(
    environment: BaseEnvironment,
    num_transactions: int = 100,
    seed: int = 42,
) -> List[TransactionState]:
    """Generate a batch of failed transactions with realistic evidence.

    Each transaction has:
    - A true failure type (hidden from agent)
    - Observable evidence signals (what agent actually sees)
    - Customer context
    """
    rng = np.random.RandomState(seed)
    transactions = []

    # Generate customer pool
    segments = list(CUSTOMER_SEGMENTS.keys())
    segment_weights = [CUSTOMER_SEGMENTS[s]["weight"] for s in segments]

    for i in range(num_transactions):
        # Pick segment
        segment = rng.choice(segments, p=segment_weights)
        profile = CUSTOMER_SEGMENTS[segment]

        # Generate customer attributes
        customer_id = f"C{rng.randint(100, 999)}"
        success_rate = rng.uniform(*profile["success_rate_range"])
        tenure = rng.randint(*profile["tenure_range"])
        total_spend = rng.uniform(*profile["spend_range"])
        payment_method = rng.choice(profile["payment_methods"])
        friction = rng.uniform(*profile["friction_range"])

        # Generate transaction
        amount = max(100, rng.normal(profile["avg_amount"], profile["amount_std"]))
        amount = round(amount, 0)

        # Pick true failure type
        failure_types = list(FAILURE_TYPES.keys())
        failure_weights = list(FAILURE_TYPES.values())
        true_failure = rng.choice(failure_types, p=failure_weights)

        # Generate gateway evidence (possibly misleading)
        gateway_code, gateway_message = environment.generate_failure_evidence(true_failure)

        # Additional evidence
        attempt_count = rng.choice([1, 1, 1, 2, 2, 3])
        recent_failures = rng.choice([1, 1, 2, 2, 3]) if true_failure == "repeated_failure" else rng.choice([1, 1, 1, 2])
        time_since = rng.exponential(30)  # minutes
        hour = rng.randint(0, 24)
        is_recurring = rng.random() < 0.25

        future_prob = max(0.1, min(0.95, 0.8 - friction * 0.3 + (success_rate - 0.7) * 0.2))

        tx_state = TransactionState(
            transaction_id=f"TX{10000 + i}",
            customer_id=customer_id,
            amount=amount,
            payment_method=payment_method,
            true_failure_type=true_failure,
            gateway_response_code=gateway_code,
            gateway_response_message=gateway_message,
            attempt_count=attempt_count,
            previous_success_rate=round(success_rate, 2),
            recent_failure_count=recent_failures,
            time_since_failure_minutes=round(time_since, 1),
            customer_tenure_months=tenure,
            customer_total_spend=round(total_spend, 0),
            customer_segment=segment,
            is_recurring=is_recurring,
            hour_of_day=hour,
            friction_score=round(friction, 2),
            future_purchase_prob=round(future_prob, 2),
        )
        transactions.append(tx_state)

    return transactions

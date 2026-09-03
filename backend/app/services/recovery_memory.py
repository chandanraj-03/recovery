"""Recovery Memory — what the agent has learned from past outcomes.

Stores per-customer and per-segment learning about which
recovery strategies work best for which failure patterns.

Used by the agent to inform future decisions.
"""

from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from collections import defaultdict


@dataclass
class MemoryRecord:
    """One entry in recovery memory."""
    customer_id: str
    segment: str
    failure_pattern: str
    action: str
    attempts: int = 0
    successes: int = 0
    total_revenue: float = 0.0
    total_friction: float = 0.0
    # Thompson Sampling parameters
    alpha: float = 1.0  # Beta dist alpha (prior + successes)
    beta_param: float = 1.0  # Beta dist beta (prior + failures)


class RecoveryMemory:
    """In-memory recovery memory store.

    Tracks what works for whom, enabling the agent to make
    better decisions for similar future cases.
    """

    def __init__(self):
        # Key: (customer_id_or_segment, failure_pattern, action)
        self._memory: Dict[Tuple[str, str, str], MemoryRecord] = {}
        # Segment-level aggregation
        self._segment_memory: Dict[Tuple[str, str, str], MemoryRecord] = {}

    def record_outcome(
        self,
        customer_id: str,
        segment: str,
        failure_pattern: str,
        action: str,
        success: bool,
        revenue: float = 0.0,
        friction_delta: float = 0.0,
    ):
        """Record a recovery outcome in memory."""
        # Customer-level
        key = (customer_id, failure_pattern, action)
        if key not in self._memory:
            self._memory[key] = MemoryRecord(
                customer_id=customer_id,
                segment=segment,
                failure_pattern=failure_pattern,
                action=action,
            )
        record = self._memory[key]
        record.attempts += 1
        if success:
            record.successes += 1
            record.alpha += 1
        else:
            record.beta_param += 1
        record.total_revenue += revenue
        record.total_friction += friction_delta

        # Segment-level
        seg_key = (segment, failure_pattern, action)
        if seg_key not in self._segment_memory:
            self._segment_memory[seg_key] = MemoryRecord(
                customer_id="__segment__",
                segment=segment,
                failure_pattern=failure_pattern,
                action=action,
            )
        seg_record = self._segment_memory[seg_key]
        seg_record.attempts += 1
        if success:
            seg_record.successes += 1
            seg_record.alpha += 1
        else:
            seg_record.beta_param += 1
        seg_record.total_revenue += revenue
        seg_record.total_friction += friction_delta

    def get_hints(
        self, customer_id: str, segment: str, failure_pattern: str
    ) -> Dict[str, Dict]:
        """Get recovery memory hints for a given customer/failure pattern.

        Returns dict: action -> {attempts, successes, avg_friction, success_rate}
        """
        hints = {}

        # Check customer-level first
        for (cid, fp, action), record in self._memory.items():
            if cid == customer_id and fp == failure_pattern:
                hints[action] = {
                    "attempts": record.attempts,
                    "successes": record.successes,
                    "success_rate": record.successes / max(1, record.attempts),
                    "avg_friction": record.total_friction / max(1, record.attempts),
                    "source": "customer",
                }

        # Fill in from segment-level
        for (seg, fp, action), record in self._segment_memory.items():
            if seg == segment and fp == failure_pattern and action not in hints:
                hints[action] = {
                    "attempts": record.attempts,
                    "successes": record.successes,
                    "success_rate": record.successes / max(1, record.attempts),
                    "avg_friction": record.total_friction / max(1, record.attempts),
                    "source": "segment",
                }

        return hints

    def get_all_records(self) -> List[Dict]:
        """Get all memory records for display."""
        records = []
        for key, record in self._segment_memory.items():
            records.append({
                "segment": record.segment,
                "failure_pattern": record.failure_pattern,
                "action": record.action,
                "attempts": record.attempts,
                "successes": record.successes,
                "success_rate": round(record.successes / max(1, record.attempts), 3),
                "total_revenue": round(record.total_revenue, 2),
                "avg_friction": round(record.total_friction / max(1, record.attempts), 3),
            })
        return sorted(records, key=lambda r: r["attempts"], reverse=True)

    def clear(self):
        """Clear all memory."""
        self._memory.clear()
        self._segment_memory.clear()

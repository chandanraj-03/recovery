"""Contextual Bandit with Thompson Sampling — adaptive learning engine.

Maintains Beta distribution parameters per (context_bucket, action) pair.
Updates from observed outcomes to provide exploration/exploitation balance.

Learning loop:
    State → Action → Outcome → Revenue → Update → Better Future Action
"""

import numpy as np
from typing import Dict, Optional, Tuple
from collections import defaultdict


class ContextualBandit:
    """Contextual bandit with Thompson Sampling for action selection.

    Groups transactions into context buckets based on diagnosis and segment,
    then learns action effectiveness within each bucket.
    """

    def __init__(self, seed: int = 42):
        self.rng = np.random.RandomState(seed)
        # Key: (context_bucket, action) → (alpha, beta) for Beta distribution
        self._params: Dict[Tuple[str, str], Tuple[float, float]] = defaultdict(
            lambda: (1.0, 1.0)  # Uniform prior
        )
        self.total_updates = 0

    def get_context_bucket(
        self, diagnosis: str, segment: str, attempt_number: int
    ) -> str:
        """Create a context bucket for the bandit.

        Groups similar situations together for learning.
        """
        attempt_group = "first" if attempt_number <= 1 else "retry"
        return f"{diagnosis}_{segment}_{attempt_group}"

    def sample_estimates(
        self, context_bucket: str, actions: list
    ) -> Dict[str, float]:
        """Sample from posterior distributions for each action.

        Returns estimated success probability for each action
        via Thompson Sampling.
        """
        estimates = {}
        for action in actions:
            key = (context_bucket, action)
            alpha, beta = self._params[key]
            # Sample from Beta distribution
            sample = self.rng.beta(alpha, beta)
            estimates[action] = round(float(sample), 3)
        return estimates

    def get_mean_estimates(
        self, context_bucket: str, actions: list
    ) -> Dict[str, float]:
        """Get mean estimates (without sampling) for display."""
        estimates = {}
        for action in actions:
            key = (context_bucket, action)
            alpha, beta = self._params[key]
            mean = alpha / (alpha + beta)
            estimates[action] = round(float(mean), 3)
        return estimates

    def update(
        self,
        context_bucket: str,
        action: str,
        success: bool,
        reward: float = 0.0,
    ) -> Dict[str, float]:
        """Update posterior after observing an outcome.

        Args:
            context_bucket: The context bucket
            action: Action that was taken
            success: Whether the action succeeded
            reward: Monetary reward (for logging)

        Returns:
            Updated parameters for this (context, action) pair
        """
        key = (context_bucket, action)
        alpha, beta = self._params[key]

        if success:
            alpha += 1.0
        else:
            beta += 1.0

        self._params[key] = (alpha, beta)
        self.total_updates += 1

        return {
            "context_bucket": context_bucket,
            "action": action,
            "alpha": alpha,
            "beta": beta,
            "mean": round(alpha / (alpha + beta), 3),
            "updates": self.total_updates,
        }

    def get_all_params(self) -> list:
        """Get all learned parameters for display."""
        results = []
        for (bucket, action), (alpha, beta) in self._params.items():
            if alpha > 1.0 or beta > 1.0:  # Only show learned params
                results.append({
                    "context_bucket": bucket,
                    "action": action,
                    "alpha": alpha,
                    "beta": beta,
                    "mean": round(alpha / (alpha + beta), 3),
                    "observations": int(alpha + beta - 2),
                })
        return sorted(results, key=lambda r: r["observations"], reverse=True)

    def reset(self, seed: Optional[int] = None):
        """Reset all learned parameters."""
        self._params.clear()
        self.total_updates = 0
        if seed is not None:
            self.rng = np.random.RandomState(seed)

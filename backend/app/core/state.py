"""Global application state for RecoverAI.

Decoupled from main.py to prevent circular imports with API routers.
"""

from app.services.experiment_engine import ExperimentEngine
from app.services.recovery_memory import RecoveryMemory
from app.learning.contextual_bandit import ContextualBandit


class AppState:
    experiment_engine: ExperimentEngine = ExperimentEngine()
    recovery_memory: RecoveryMemory = RecoveryMemory()
    bandit: ContextualBandit = ContextualBandit(seed=42)
    # Store latest demo run results
    latest_demo_cases: list = []
    latest_demo_summary: dict = {}


app_state = AppState()

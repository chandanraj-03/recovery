"""Action Executor — dispatches actions to the environment.

The executor sends an action to the environment and receives an EXTERNAL outcome.
The agent does NOT control whether the action succeeds.

Uses an adapter pattern:
    PaymentProvider
       ├── SimulationProvider (default)
       └── RazorpayTestProvider (optional)
"""

from typing import Dict, Optional
from app.simulation.environment import (
    BaseEnvironment, TransactionState, Action, EnvironmentOutcome
)


class ActionExecutor:
    """Executes recovery actions against the environment.

    The environment determines the outcome, not the agent.
    """

    def __init__(self, environment: BaseEnvironment):
        self.environment = environment

    def execute(
        self, state: TransactionState, action_name: str
    ) -> EnvironmentOutcome:
        """Execute an action and return the environment's outcome.

        Args:
            state: Current transaction state
            action_name: Action to execute (e.g., "RETRY_NOW")

        Returns:
            EnvironmentOutcome with success, revenue, cost, friction changes
        """
        action = Action(action_name)
        outcome = self.environment.execute_action(state, action)
        return outcome

    def get_action_costs(self) -> Dict[str, float]:
        """Get current action costs from the environment."""
        return {
            action.value: self.environment.get_action_cost(action)
            for action in Action
        }

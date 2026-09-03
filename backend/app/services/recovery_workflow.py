"""Sequential Recovery Workflow — the master orchestrator.

Manages the full recovery loop:
    Detect → Context → Diagnose → Predict → Evaluate → Decide →
    Policy → Execute → Observe → Reassess → Continue/Stop/Escalate

This is NOT a single-decision system.
Each transaction can go through multiple recovery steps.
The next decision has access to all previous actions and outcomes.
"""

from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from app.simulation.environment import BaseEnvironment, TransactionState, Action
from app.services.context_builder import RecoveryContext, build_context_from_state
from app.services.diagnosis import Diagnosis, diagnose
from app.services.predictor import predict_outcomes
from app.services.economic_evaluator import evaluate_economics, EconomicEvaluation
from app.services.action_executor import ActionExecutor
from app.services.recovery_memory import RecoveryMemory
from app.agents.recovery_agent import RecoveryAgent
from app.policies.policy_engine import evaluate_policy, PolicyConfig, PolicyResult
from app.learning.contextual_bandit import ContextualBandit


@dataclass
class RecoveryStepResult:
    """Result of one step in the recovery workflow."""
    step_number: int
    # Diagnosis
    diagnosis: Diagnosis
    # Predictions
    predictions: Dict[str, float]
    # Economic evaluation
    economic_evaluation: Dict  # serializable form
    best_immediate_action: str
    best_longterm_action: str
    # Agent decision
    selected_action: str
    decision_reason: str
    # Policy
    policy_result: str
    policy_reason: str
    # Execution
    executed_action: str
    # Outcome
    outcome: str  # SUCCESS, FAILED, STOPPED, ESCALATED
    revenue: float
    cost: float
    friction_delta: float
    # Learning
    learning_update: Optional[Dict] = None
    # State
    is_terminal: bool = False


@dataclass
class RecoveryCaseResult:
    """Complete result of a sequential recovery workflow."""
    transaction_id: str
    customer_id: str
    amount: float
    strategy: str
    # Final state
    status: str  # RECOVERED, STOPPED, ESCALATED, ABANDONED
    total_recovered: float
    total_cost: float
    total_friction: float
    estimated_ltv: float
    # Steps
    steps: List[RecoveryStepResult] = field(default_factory=list)
    # Diagnosis
    diagnosis: str = ""
    diagnosis_confidence: float = 0.0
    diagnosis_evidence: List[str] = field(default_factory=list)


class RecoveryWorkflow:
    """Orchestrates the complete sequential recovery workflow.

    For each transaction, runs multiple recovery steps until:
    - Payment is recovered (SUCCESS)
    - Agent decides to STOP
    - Policy enforces STOP
    - Agent/policy decides to ESCALATE
    - Max steps reached
    """

    def __init__(
        self,
        environment: BaseEnvironment,
        agent: RecoveryAgent,
        memory: RecoveryMemory,
        bandit: Optional[ContextualBandit] = None,
        policy: Optional[PolicyConfig] = None,
        max_steps: int = 5,
        use_adaptive: bool = True,
        include_future_value: bool = True,
    ):
        self.executor = ActionExecutor(environment)
        self.environment = environment
        self.agent = agent
        self.memory = memory
        self.bandit = bandit
        self.policy = policy or PolicyConfig()
        self.max_steps = max_steps
        self.use_adaptive = use_adaptive and bandit is not None
        self.include_future_value = include_future_value

    def run_case(self, state: TransactionState) -> RecoveryCaseResult:
        """Run the complete sequential recovery workflow for one transaction.

        Returns:
            RecoveryCaseResult with all steps and final outcome
        """
        result = RecoveryCaseResult(
            transaction_id=state.transaction_id,
            customer_id=state.customer_id,
            amount=state.amount,
            strategy=self.agent.name,
            status="OPEN",
            total_recovered=0.0,
            total_cost=0.0,
            total_friction=0.0,
            estimated_ltv=0.0,
        )

        for step_num in range(self.max_steps):
            step_result = self._run_step(state, step_num)
            result.steps.append(step_result)

            # Update running totals
            result.total_recovered += step_result.revenue
            result.total_cost += step_result.cost
            result.total_friction += step_result.friction_delta

            # Update state for next step
            state.previous_actions.append(step_result.executed_action)
            state.previous_outcomes.append(step_result.outcome)
            state.friction_score = min(1.0, state.friction_score + step_result.friction_delta)
            state.future_purchase_prob = max(0.0, state.future_purchase_prob + step_result.friction_delta * -0.5)

            # Store first diagnosis
            if step_num == 0:
                result.diagnosis = step_result.diagnosis.label
                result.diagnosis_confidence = step_result.diagnosis.confidence
                result.diagnosis_evidence = step_result.diagnosis.evidence

            # Check if terminal
            if step_result.is_terminal:
                break

        # Determine final status
        if result.total_recovered > 0:
            result.status = "RECOVERED"
        elif any(s.executed_action == "ESCALATE" for s in result.steps):
            result.status = "ESCALATED"
        elif any(s.executed_action == "STOP" for s in result.steps):
            result.status = "STOPPED"
        else:
            result.status = "ABANDONED"

        # Calculate estimated LTV
        estimated_annual = state.customer_total_spend / max(1, state.customer_tenure_months) * 12
        result.estimated_ltv = estimated_annual * state.future_purchase_prob * 0.3

        return result

    def _run_step(
        self, state: TransactionState, step_number: int
    ) -> RecoveryStepResult:
        """Run one step of the recovery workflow."""

        # 1. Build context
        memory_hints = self.memory.get_hints(
            state.customer_id, state.customer_segment,
            state.true_failure_type  # Note: in real system, would use diagnosed type
        )
        context = build_context_from_state(state, memory_hints)

        # 2. Diagnose
        diagnosis = diagnose(context)

        # 3. Get bandit estimates if adaptive
        bandit_estimates = None
        context_bucket = None
        if self.use_adaptive and self.bandit:
            context_bucket = self.bandit.get_context_bucket(
                diagnosis.label, state.customer_segment, len(state.previous_actions)
            )
            bandit_estimates = self.bandit.sample_estimates(
                context_bucket,
                [a.value for a in Action if a != Action.STOP]
            )

        # 4. Predict outcomes
        predictions = predict_outcomes(context, diagnosis, bandit_estimates)

        # 5. Economic evaluation
        action_costs = self.executor.get_action_costs()
        evaluation = evaluate_economics(
            context, predictions,
            action_costs={k: action_costs.get(k, 0) for k in predictions},
            include_future_value=self.include_future_value,
        )

        # 6. Agent decision
        selected_action, decision_reason = self.agent.select_action(
            context, diagnosis, evaluation
        )

        # 7. Policy check
        policy_result = evaluate_policy(context, selected_action, self.policy)

        # 8. Determine executed action
        executed_action = selected_action
        if policy_result.decision == "STOP":
            executed_action = "STOP"
        elif policy_result.decision == "REVIEW":
            # In simulation, auto-approve reviews for non-STOP actions
            # In production, would queue for human review
            executed_action = selected_action

        # 9. Execute action
        from app.simulation.environment import EnvironmentOutcome
        if executed_action == "STOP":
            outcome = EnvironmentOutcome(
                success=False, revenue=0.0, cost=0.0,
                friction_delta=-0.02, future_prob_delta=0.01,
                message="Recovery stopped"
            )
            outcome_str = "STOPPED"
        elif executed_action == "ESCALATE":
            outcome = self.executor.execute(state, executed_action)
            outcome_str = "SUCCESS" if outcome.success else "ESCALATED"
        else:
            outcome = self.executor.execute(state, executed_action)
            outcome_str = "SUCCESS" if outcome.success else "FAILED"

        # 10. Update memory and learning
        learning_update = None
        if executed_action not in ["STOP"]:
            # Update recovery memory
            self.memory.record_outcome(
                customer_id=state.customer_id,
                segment=state.customer_segment,
                failure_pattern=diagnosis.label,
                action=executed_action,
                success=outcome.success,
                revenue=outcome.revenue,
                friction_delta=outcome.friction_delta,
            )

            # Update bandit
            if self.use_adaptive and self.bandit and context_bucket:
                learning_update = self.bandit.update(
                    context_bucket=context_bucket,
                    action=executed_action,
                    success=outcome.success,
                    reward=outcome.revenue,
                )

        # Is this step terminal?
        is_terminal = (
            outcome_str == "SUCCESS" or
            outcome_str == "STOPPED" or
            executed_action == "STOP" or
            (executed_action == "ESCALATE" and not outcome.success) or
            policy_result.decision == "STOP"
        )

        # Serialize economic evaluation
        econ_dict = {
            "evaluations": [
                {
                    "action": e.action,
                    "p_success": e.p_success,
                    "expected_immediate_recovery": e.expected_immediate_recovery,
                    "expected_future_value": e.expected_future_value,
                    "action_cost": e.action_cost,
                    "friction_penalty": e.friction_penalty,
                    "expected_long_term_value": e.expected_long_term_value,
                }
                for e in evaluation.evaluations
            ],
            "best_immediate_action": evaluation.best_immediate_action,
            "best_longterm_action": evaluation.best_longterm_action,
        }

        return RecoveryStepResult(
            step_number=step_number,
            diagnosis=diagnosis,
            predictions=predictions,
            economic_evaluation=econ_dict,
            best_immediate_action=evaluation.best_immediate_action,
            best_longterm_action=evaluation.best_longterm_action,
            selected_action=selected_action,
            decision_reason=decision_reason,
            policy_result=policy_result.decision,
            policy_reason=policy_result.reason,
            executed_action=executed_action,
            outcome=outcome_str,
            revenue=outcome.revenue,
            cost=outcome.cost,
            friction_delta=outcome.friction_delta,
            learning_update=learning_update,
            is_terminal=is_terminal,
        )

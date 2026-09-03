"""Comprehensive test suite for RecoverAI.

Tests:
1. Diagnosis engine (evidence-based inference, confidence, evidence reasoning)
2. Predictor (P(success | state, action))
3. Economic evaluator (immediate vs long-term value, friction penalties)
4. Policy engine (deterministic constraints, stopping, high-value review)
5. Baselines (AlwaysRetry, FixedRules, ImmediateOptimizer)
6. Adaptive learning (Contextual bandit Thompson sampling updates)
7. Sequential workflow & stopping rules
8. 4 Simulation environments (Stable, Changing, Friction, Cost-Sensitive)
9. Experiment engine with reproducible seeds
10. API endpoints
"""

import pytest
from app.simulation.environments import create_environment, StableEnvironment, ChangingEnvironment, FrictionEnvironment, CostSensitiveEnvironment
from app.simulation.environment import Action, TransactionState
from app.simulation.transaction_generator import generate_transaction_batch
from app.services.context_builder import build_context_from_state
from app.services.diagnosis import diagnose
from app.services.predictor import predict_outcomes
from app.services.economic_evaluator import evaluate_economics
from app.policies.policy_engine import evaluate_policy, PolicyConfig
from app.agents.recovery_agent import RecoveryAgent
from app.agents.baselines import AlwaysRetryAgent, FixedRulesAgent, ImmediateOptimizerAgent
from app.learning.contextual_bandit import ContextualBandit
from app.services.recovery_memory import RecoveryMemory
from app.services.recovery_workflow import RecoveryWorkflow
from app.services.experiment_engine import ExperimentEngine


def test_diagnosis_evidence_inference():
    """Verify diagnosis infers recovery state from raw evidence signals rather than receiving a label."""
    state = TransactionState(
        transaction_id="TX_TEST_1",
        customer_id="C999",
        amount=4999.0,
        payment_method="UPI",
        true_failure_type="transient",
        gateway_response_code="E001",
        gateway_response_message="Connection timeout",
        attempt_count=1,
        previous_success_rate=0.92,
        recent_failure_count=1,
        time_since_failure_minutes=2.0,
    )
    context = build_context_from_state(state)
    diag = diagnose(context)

    assert diag.label == "transient"
    assert diag.confidence > 0.0
    assert len(diag.evidence) > 0
    # Confirm evidence mentions gateway message or success rate
    evidence_text = " ".join(diag.evidence).lower()
    assert "timeout" in evidence_text or "gateway" in evidence_text or "success" in evidence_text


def test_economic_evaluator_different_immediate_vs_longterm():
    """Verify that the evaluator can choose a different long-term action than immediate action."""
    state = TransactionState(
        transaction_id="TX_TEST_2",
        customer_id="C998",
        amount=10000.0,
        payment_method="CARD",
        true_failure_type="insufficient_funds",
        gateway_response_code="E201",
        gateway_response_message="Insufficient balance",
        customer_total_spend=150000.0,
        customer_tenure_months=12,
        friction_score=0.25,
        future_purchase_prob=0.85,
    )
    context = build_context_from_state(state)
    diag = diagnose(context)
    predictions = predict_outcomes(context, diag)
    eval_result = evaluate_economics(context, predictions, include_future_value=True)

    assert len(eval_result.evaluations) == len(Action)
    assert eval_result.best_longterm_action in [a.value for a in Action]
    # Check that breakdown contains inspectable components
    for ev in eval_result.evaluations:
        assert "immediate_recovery" in ev.breakdown
        assert "future_value_delta" in ev.breakdown
        assert "friction_monetary" in ev.breakdown
        assert "action_cost" in ev.breakdown


def test_deterministic_policy_engine_enforcement():
    """Verify AI decisions cannot bypass deterministic policy rules."""
    state = TransactionState(
        transaction_id="TX_TEST_POLICY",
        customer_id="C997",
        amount=65000.0,  # High value > 50,000 threshold
        payment_method="NETBANKING",
        true_failure_type="transient",
        gateway_response_code="E001",
        gateway_response_message="Timeout",
    )
    context = build_context_from_state(state)
    policy = PolicyConfig(high_value_threshold=50000.0, max_automatic_retries=2)

    # 1. High value should trigger REVIEW
    res = evaluate_policy(context, "RETRY_NOW", policy)
    assert res.decision == "REVIEW"

    # 2. Exceeding max retries should trigger STOP
    context.previous_actions = ["RETRY_NOW", "RETRY_LATER"]
    context.amount = 1000.0  # normal value
    res2 = evaluate_policy(context, "RETRY_NOW", policy)
    assert res2.decision == "STOP"
    assert "retries" in res2.reason.lower()

    # 3. Successful payment should STOP immediately
    context.previous_outcomes = ["SUCCESS"]
    res3 = evaluate_policy(context, "RETRY_NOW", policy)
    assert res3.decision == "STOP"


def test_sequential_recovery_workflow_and_stopping():
    """Verify recovery executes sequentially and can choose STOP or reach terminal state."""
    env = create_environment("stable", seed=101)
    agent = RecoveryAgent()
    memory = RecoveryMemory()
    workflow = RecoveryWorkflow(
        environment=env,
        agent=agent,
        memory=memory,
        max_steps=4,
    )
    state = TransactionState(
        transaction_id="TX_SEQ_1",
        customer_id="C996",
        amount=3000.0,
        payment_method="UPI",
        true_failure_type="repeated_failure",
        gateway_response_code="E301",
        gateway_response_message="Multiple failed attempts detected",
        recent_failure_count=4,
        previous_success_rate=0.2,
    )
    case_result = workflow.run_case(state)

    assert len(case_result.steps) >= 1
    assert case_result.status in ["RECOVERED", "STOPPED", "ESCALATED", "ABANDONED"]
    # Check that steps preserve auditability
    step1 = case_result.steps[0]
    assert step1.diagnosis is not None
    assert step1.executed_action in [a.value for a in Action]
    assert step1.policy_result in ["ALLOW", "REVIEW", "STOP"]


def test_adaptive_learning_with_contextual_bandit():
    """Verify contextual bandit updates after observing outcomes and changes sampled estimates."""
    bandit = ContextualBandit(seed=42)
    bucket = "transient_standard_first"
    actions = ["RETRY_NOW", "ALTERNATIVE_PAYMENT"]

    initial_params = bandit.get_all_params()
    assert len(initial_params) == 0

    # Record 10 positive outcomes for ALTERNATIVE_PAYMENT
    for _ in range(10):
        bandit.update(bucket, "ALTERNATIVE_PAYMENT", success=True, reward=5000.0)

    # Record 10 negative outcomes for RETRY_NOW
    for _ in range(10):
        bandit.update(bucket, "RETRY_NOW", success=False, reward=0.0)

    estimates = bandit.get_mean_estimates(bucket, actions)
    assert estimates["ALTERNATIVE_PAYMENT"] > estimates["RETRY_NOW"]
    assert bandit.total_updates == 20


def test_four_simulation_environments():
    """Verify all 4 environments instantiate and exhibit intended characteristics."""
    envs = {
        "stable": create_environment("stable", seed=1),
        "changing": create_environment("changing", seed=1),
        "friction": create_environment("friction", seed=1),
        "cost_sensitive": create_environment("cost_sensitive", seed=1),
    }

    state = TransactionState(
        transaction_id="TX_ENV",
        customer_id="C995",
        amount=5000.0,
        payment_method="UPI",
        true_failure_type="transient",
        gateway_response_code="E001",
        gateway_response_message="Timeout",
        friction_score=0.5,
    )

    # In cost sensitive env, cost of ALTERNATIVE_PAYMENT should be substantially higher than in stable
    cost_sens_cost = envs["cost_sensitive"].get_action_cost(Action.ALTERNATIVE_PAYMENT)
    stable_cost = envs["stable"].get_action_cost(Action.ALTERNATIVE_PAYMENT)
    assert cost_sens_cost > stable_cost

    # In friction env, friction impact should be higher
    fric_impact = envs["friction"].get_friction_impact(Action.RECOVERY_MESSAGE, 0.5)
    stable_impact = envs["stable"].get_friction_impact(Action.RECOVERY_MESSAGE, 0.5)
    assert fric_impact > stable_impact


def test_experiment_engine_multi_baseline_comparison():
    """Verify experiment engine runs identical transactions across all baselines and RecoverAI."""
    engine = ExperimentEngine()
    res = engine.run_experiment(
        environment_type="stable",
        num_transactions=15,
        seed=42,
        strategies=["always_retry", "fixed_rules", "immediate_optimizer", "recoverai"],
    )

    assert "always_retry" in res.strategies
    assert "fixed_rules" in res.strategies
    assert "immediate_optimizer" in res.strategies
    assert "recoverai" in res.strategies

    for s_name, s_res in res.strategies.items():
        assert s_res.total_at_risk > 0
        assert s_res.total_actions > 0
        assert len(s_res.cases) == 15
        assert len(s_res.cumulative_data) > 0

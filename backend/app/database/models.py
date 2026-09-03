"""SQLAlchemy ORM models for RecoverAI.

Models represent the complete data layer for:
- Customers and transactions
- Payment events and failure evidence
- Recovery cases with sequential steps
- Audit trail entries
- Revenue ledger
- Recovery memory (what the agent has learned)
- Experiment runs and results
- Policy configuration
"""

import datetime
import json
from sqlalchemy import (
    Column, Integer, Float, String, Text, Boolean,
    DateTime, ForeignKey, JSON, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from app.database.db import Base


class Customer(Base):
    """Represents a merchant's customer with payment history."""
    __tablename__ = "customers"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String)
    segment = Column(String, default="standard")  # standard, premium, high_value, new
    tenure_months = Column(Integer, default=0)
    total_transactions = Column(Integer, default=0)
    successful_transactions = Column(Integer, default=0)
    total_spend = Column(Float, default=0.0)
    avg_transaction_value = Column(Float, default=0.0)
    preferred_payment_method = Column(String, default="UPI")
    friction_score = Column(Float, default=0.0)  # 0.0 = no friction, 1.0 = max friction
    future_purchase_probability = Column(Float, default=0.8)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    transactions = relationship("Transaction", back_populates="customer")
    recovery_memory = relationship("RecoveryMemoryEntry", back_populates="customer")


class Transaction(Base):
    """Represents a payment transaction."""
    __tablename__ = "transactions"

    id = Column(String, primary_key=True)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    payment_method = Column(String, nullable=False)  # UPI, CARD, NETBANKING, WALLET
    status = Column(String, default="FAILED")  # FAILED, RECOVERED, ABANDONED, ACTIVE
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    customer = relationship("Customer", back_populates="transactions")
    payment_event = relationship("PaymentEvent", back_populates="transaction", uselist=False)
    recovery_case = relationship("RecoveryCase", back_populates="transaction", uselist=False)


class PaymentEvent(Base):
    """Raw failure evidence for a transaction — NOT a pre-labeled diagnosis.

    This is the evidence layer the diagnosis engine must reason from.
    """
    __tablename__ = "payment_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    transaction_id = Column(String, ForeignKey("transactions.id"), nullable=False, unique=True)

    # Raw gateway evidence (the agent must infer diagnosis from these)
    gateway_response_code = Column(String, nullable=False)  # e.g., "E001", "E002", "T001"
    gateway_response_message = Column(String, nullable=False)  # e.g., "Connection timeout"
    gateway_name = Column(String, default="sim_gateway")

    # Payment attempt evidence
    attempt_count = Column(Integer, default=1)
    time_since_first_failure_minutes = Column(Float, default=0.0)
    previous_success_rate = Column(Float, default=1.0)  # historical success rate for this customer
    recent_failure_count = Column(Integer, default=1)

    # Additional evidence signals
    amount_percentile = Column(Float, default=0.5)  # where this amount falls for the customer
    is_recurring = Column(Boolean, default=False)
    hour_of_day = Column(Integer, default=12)
    day_of_week = Column(Integer, default=1)  # 0=Monday

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    transaction = relationship("Transaction", back_populates="payment_event")


class RecoveryCase(Base):
    """A recovery case tracking the full sequential recovery workflow."""
    __tablename__ = "recovery_cases"

    id = Column(String, primary_key=True)
    transaction_id = Column(String, ForeignKey("transactions.id"), nullable=False, unique=True)
    strategy = Column(String, default="recoverai")  # recoverai, always_retry, fixed_rules, immediate_optimizer

    # Diagnosis (inferred, not given)
    diagnosis = Column(String)  # transient, expired_credential, insufficient_funds, repeated, fraud_risk, unknown
    diagnosis_confidence = Column(Float, default=0.0)
    diagnosis_evidence = Column(JSON, default=list)

    # Current state
    status = Column(String, default="OPEN")  # OPEN, IN_PROGRESS, RECOVERED, STOPPED, ESCALATED, ABANDONED
    current_step = Column(Integer, default=0)
    total_steps = Column(Integer, default=0)

    # Financial
    amount_at_risk = Column(Float, default=0.0)
    amount_recovered = Column(Float, default=0.0)
    total_action_cost = Column(Float, default=0.0)
    estimated_ltv = Column(Float, default=0.0)

    # Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    closed_at = Column(DateTime, nullable=True)

    # Experiment tracking
    experiment_id = Column(String, nullable=True)
    environment_type = Column(String, default="stable")

    transaction = relationship("Transaction", back_populates="recovery_case")
    steps = relationship("RecoveryStep", back_populates="recovery_case", order_by="RecoveryStep.step_number")


class RecoveryStep(Base):
    """One step in a sequential recovery workflow.

    Each step records the full decision chain:
    evidence → diagnosis → candidates → predictions → economic values →
    agent decision → policy decision → execution → outcome
    """
    __tablename__ = "recovery_steps"

    id = Column(Integer, primary_key=True, autoincrement=True)
    case_id = Column(String, ForeignKey("recovery_cases.id"), nullable=False)
    step_number = Column(Integer, nullable=False)

    # Agent's assessment at this step
    state_summary = Column(JSON, default=dict)  # full context snapshot

    # Candidate actions with predictions
    candidate_actions = Column(JSON, default=dict)
    # Format: {"RETRY_NOW": {"p_success": 0.7, "expected_value": 3500, "ltv": 4200, "cost": 10, "friction": 0.1}, ...}

    # Agent decision
    selected_action = Column(String)  # RETRY_NOW, RETRY_LATER, ALTERNATIVE_PAYMENT, RECOVERY_MESSAGE, ESCALATE, STOP
    decision_reason = Column(Text)

    # Policy check
    policy_result = Column(String)  # ALLOW, REVIEW, STOP
    policy_reason = Column(Text)

    # Final action taken (may differ from selected if policy overrides)
    executed_action = Column(String)

    # Outcome (from environment, NOT from agent)
    outcome = Column(String)  # SUCCESS, FAILED, PENDING, STOPPED, ESCALATED
    outcome_revenue = Column(Float, default=0.0)
    outcome_cost = Column(Float, default=0.0)
    outcome_friction = Column(Float, default=0.0)

    # Learning update
    learning_update = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    recovery_case = relationship("RecoveryCase", back_populates="steps")


class AuditEntry(Base):
    """Immutable audit trail entry for compliance and explainability."""
    __tablename__ = "audit_entries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    transaction_id = Column(String, nullable=False, index=True)
    case_id = Column(String, nullable=True)
    step_number = Column(Integer, nullable=True)

    event_type = Column(String, nullable=False)  # DETECTION, DIAGNOSIS, PREDICTION, DECISION, POLICY, EXECUTION, OUTCOME, LEARNING
    event_data = Column(JSON, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)


class LedgerEntry(Base):
    """Revenue ledger entry — financial record of recovery."""
    __tablename__ = "ledger_entries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    transaction_id = Column(String, nullable=False, index=True)
    case_id = Column(String, nullable=True)

    original_amount = Column(Float, nullable=False)
    recovered_amount = Column(Float, default=0.0)
    action_taken = Column(String)
    action_cost = Column(Float, default=0.0)
    estimated_future_value = Column(Float, default=0.0)
    net_recovery_value = Column(Float, default=0.0)

    status = Column(String, default="PENDING")  # PENDING, RECOVERED, UNRECOVERED, PARTIAL
    strategy = Column(String, default="recoverai")
    environment_type = Column(String, default="stable")
    experiment_id = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class RecoveryMemoryEntry(Base):
    """What the agent has learned about recovery patterns.

    Stores per-customer or per-segment learning about which
    recovery strategies work best for which failure patterns.
    """
    __tablename__ = "recovery_memory"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=True)
    segment = Column(String, nullable=True)  # can learn at segment level too

    failure_pattern = Column(String, nullable=False)  # transient, expired, insufficient, repeated
    action = Column(String, nullable=False)
    attempts = Column(Integer, default=0)
    successes = Column(Integer, default=0)
    total_revenue_recovered = Column(Float, default=0.0)
    avg_friction_impact = Column(Float, default=0.0)

    # Thompson Sampling parameters
    alpha = Column(Float, default=1.0)  # Beta distribution alpha (successes + 1)
    beta_param = Column(Float, default=1.0)  # Beta distribution beta (failures + 1)

    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    customer = relationship("Customer", back_populates="recovery_memory")


class ExperimentRun(Base):
    """Tracks an experiment run comparing strategies."""
    __tablename__ = "experiment_runs"

    id = Column(String, primary_key=True)
    environment_type = Column(String, nullable=False)
    num_transactions = Column(Integer, nullable=False)
    seed = Column(Integer, nullable=False)
    strategies = Column(JSON, nullable=False)  # list of strategy names
    status = Column(String, default="PENDING")  # PENDING, RUNNING, COMPLETED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    results = relationship("ExperimentResult", back_populates="experiment")


class ExperimentResult(Base):
    """Results for one strategy within an experiment."""
    __tablename__ = "experiment_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    experiment_id = Column(String, ForeignKey("experiment_runs.id"), nullable=False)
    strategy = Column(String, nullable=False)

    # Core metrics
    total_at_risk = Column(Float, default=0.0)
    total_recovered = Column(Float, default=0.0)
    recovery_rate = Column(Float, default=0.0)
    total_cost = Column(Float, default=0.0)
    net_recovery = Column(Float, default=0.0)
    estimated_future_value = Column(Float, default=0.0)

    # Decision metrics
    total_actions = Column(Integer, default=0)
    total_stops = Column(Integer, default=0)
    total_escalations = Column(Integer, default=0)
    avg_actions_per_case = Column(Float, default=0.0)

    # Per-action breakdown
    action_breakdown = Column(JSON, default=dict)
    # Over-time data (for adaptive learning charts)
    cumulative_data = Column(JSON, default=list)

    experiment = relationship("ExperimentRun", back_populates="results")


class PolicyConfigModel(Base):
    """Merchant-configurable policy settings."""
    __tablename__ = "policy_config"

    id = Column(Integer, primary_key=True, autoincrement=True)
    max_automatic_retries = Column(Integer, default=2)
    max_customer_messages = Column(Integer, default=1)
    min_retry_interval_minutes = Column(Integer, default=30)
    max_recovery_window_hours = Column(Integer, default=24)
    high_value_threshold = Column(Float, default=50000.0)
    enable_auto_escalation = Column(Boolean, default=True)
    max_total_recovery_attempts = Column(Integer, default=5)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

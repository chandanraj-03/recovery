export interface DashboardMetrics {
  revenue_at_risk: number;
  revenue_recovered: number;
  recovery_rate: number;
  incremental_revenue: number;
  active_cases: number;
  policy_stops: number;
  escalations: number;
  total_cases: number;
  recovered_cases: number;
  net_recovery_value: number;
  avg_recovery_value: number;
  recovery_cost: number;
  total_actions?: number;
  avg_actions_per_case?: number;
  environment?: string;
  has_data: boolean;
}

export interface DiagnosisData {
  label: string;
  confidence: number;
  evidence: string[];
  all_scores?: Record<string, number>;
}

export interface ActionEvaluation {
  action: string;
  p_success: number;
  expected_immediate_recovery: number;
  expected_future_value: number;
  action_cost: number;
  friction_penalty: number;
  expected_long_term_value: number;
}

export interface EconomicEvaluationData {
  evaluations: ActionEvaluation[];
  best_immediate_action: string;
  best_longterm_action: string;
}

export interface StepData {
  step_number: number;
  diagnosis: DiagnosisData;
  predictions: Record<string, number>;
  economic_evaluation: EconomicEvaluationData;
  best_immediate_action: string;
  best_longterm_action: string;
  selected_action: string;
  decision_reason: string;
  policy_result: 'ALLOW' | 'REVIEW' | 'STOP';
  policy_reason: string;
  executed_action: string;
  outcome: 'SUCCESS' | 'FAILED' | 'STOPPED' | 'ESCALATED' | 'PENDING';
  revenue: number;
  cost: number;
  friction_delta: number;
  learning_update?: {
    context_bucket: string;
    action: string;
    alpha: number;
    beta: number;
    mean: number;
    updates: number;
  } | null;
}

export interface RecoveryCaseSummary {
  transaction_id: string;
  customer_id: string;
  amount: number;
  diagnosis: string;
  diagnosis_confidence: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'RECOVERED' | 'STOPPED' | 'ESCALATED' | 'ABANDONED';
  total_recovered: number;
  estimated_ltv: number;
  num_steps: number;
}

export interface RecoveryCaseDetail extends RecoveryCaseSummary {
  diagnosis_evidence: string[];
  total_cost: number;
  environment: string;
  steps: StepData[];
}

export interface CumulativePoint {
  transaction_index: number;
  cumulative_recovered: number;
  cumulative_cost: number;
  cumulative_net: number;
  running_recovery_rate: number;
}

export interface StrategyResult {
  strategy: string;
  total_at_risk: number;
  total_recovered: number;
  recovery_rate: number;
  total_cost: number;
  net_recovery: number;
  estimated_future_value: number;
  total_actions: number;
  total_stops: number;
  total_escalations: number;
  avg_actions_per_case: number;
  action_breakdown: Record<string, number>;
  cumulative_data: CumulativePoint[];
}

export interface ExperimentRunResponse {
  experiment_id: string;
  environment_type: string;
  num_transactions: number;
  seed: number;
  strategies: Record<string, StrategyResult>;
  incremental_revenue: number;
  timestamp: string;
}

export interface PolicyConfig {
  max_automatic_retries: number;
  max_customer_messages: number;
  min_retry_interval_minutes: number;
  max_recovery_window_hours: number;
  high_value_threshold: number;
  enable_auto_escalation: boolean;
  max_total_recovery_attempts: number;
}

export interface LedgerEntry {
  transaction_id: string;
  original_amount: number;
  recovered_amount: number;
  action_taken: string;
  action_cost: number;
  estimated_future_value: number;
  net_recovery_value: number;
  status: string;
  num_steps: number;
}

export interface LedgerResponse {
  entries: LedgerEntry[];
  aggregates: {
    total_at_risk: number;
    total_recovered: number;
    recovery_rate: number;
    total_cost: number;
    net_recovery: number;
    avg_recovery_value: number;
  };
}

export interface MemoryRecord {
  segment: string;
  failure_pattern: string;
  action: string;
  attempts: number;
  successes: number;
  success_rate: number;
  total_revenue: number;
  avg_friction: number;
}

export interface BanditParam {
  context_bucket: string;
  action: string;
  alpha: number;
  beta: number;
  mean: number;
  observations: number;
}

export interface MemoryResponse {
  memory_records: MemoryRecord[];
  bandit_params: BanditParam[];
  total_updates: number;
}

export interface AuditTimelineEvent {
  event: 'DETECTION' | 'DIAGNOSIS' | 'PREDICTION' | 'EVALUATION' | 'DECISION' | 'POLICY' | 'EXECUTION' | 'OUTCOME' | 'LEARNING';
  description: string;
  data: any;
}

export interface AuditTrailResponse {
  transaction_id: string;
  timeline: AuditTimelineEvent[];
  summary: {
    status: string;
    total_recovered: number;
    total_cost: number;
    total_steps: number;
  };
}

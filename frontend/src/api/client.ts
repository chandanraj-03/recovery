import {
  DashboardMetrics,
  RecoveryCaseSummary,
  RecoveryCaseDetail,
  ExperimentRunResponse,
  PolicyConfig,
  LedgerResponse,
  MemoryResponse,
  AuditTrailResponse,
} from '../types';

const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const normalizedApiUrl = rawApiUrl
  ? rawApiUrl.startsWith('http')
    ? rawApiUrl.replace(/\/$/, '')
    : `https://${rawApiUrl.replace(/\/$/, '')}`
  : '';
export const API_BASE = normalizedApiUrl ? `${normalizedApiUrl}/api` : '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API error (${res.status}): ${errorText || res.statusText}`);
  }

  return res.json();
}

export const api = {
  // Dashboard
  getDashboard: () => fetchJson<DashboardMetrics>('/dashboard'),

  // Recovery
  runRecovery: (params: { num_transactions: number; environment_type: string; seed: number }) =>
    fetchJson<{ summary: DashboardMetrics; num_cases: number }>('/recovery/run', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  getCases: () => fetchJson<RecoveryCaseSummary[]>('/recovery/cases'),

  getCaseDetail: (transactionId: string) =>
    fetchJson<RecoveryCaseDetail>(`/recovery/cases/${transactionId}`),

  // Experiments
  runExperiment: (params: {
    environment_type: string;
    num_transactions: number;
    seed: number;
    strategies?: string[];
  }) =>
    fetchJson<ExperimentRunResponse>('/experiments/run', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  runCrossEnvironment: (params: {
    num_transactions: number;
    seed: number;
    strategies?: string[];
  }) =>
    fetchJson<{
      environments: Record<string, Record<string, any>>;
      num_transactions: number;
      seed: number;
    }>('/experiments/cross-environment', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  getExperimentResults: () => fetchJson<any[]>('/experiments/results'),

  // Policies
  getPolicies: () => fetchJson<PolicyConfig>('/policies'),

  updatePolicies: (policies: PolicyConfig) =>
    fetchJson<{ status: string; policy: PolicyConfig }>('/policies', {
      method: 'PUT',
      body: JSON.stringify(policies),
    }),

  // Ledger
  getLedger: () => fetchJson<LedgerResponse>('/ledger'),

  // Memory
  getMemory: () => fetchJson<MemoryResponse>('/memory'),

  clearMemory: () =>
    fetchJson<{ status: string }>('/memory/clear', {
      method: 'POST',
    }),

  // Audit
  getAuditTrail: (transactionId: string) =>
    fetchJson<AuditTrailResponse>(`/audit/${transactionId}`),

  // Razorpay Integration
  getRazorpayConfig: () =>
    fetchJson<{
      key_id: string;
      is_configured: boolean;
      currency: string;
      merchant_name: string;
    }>('/razorpay/config'),

  createRazorpayOrder: (params: {
    transaction_id: string;
    amount: number;
    customer_id?: string;
  }) =>
    fetchJson<{
      success: boolean;
      mode: string;
      order_id: string;
      amount: number;
      currency: string;
      key_id: string;
      receipt: string;
    }>('/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  createRazorpayLink: (params: {
    transaction_id: string;
    amount: number;
    customer_id?: string;
    description?: string;
  }) =>
    fetchJson<{
      success: boolean;
      mode: string;
      payment_link_id: string;
      short_url: string;
      amount: number;
    }>('/razorpay/create-link', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  verifyRazorpayPayment: (params: {
    transaction_id: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature?: string;
  }) =>
    fetchJson<{
      success: boolean;
      transaction_id: string;
      razorpay_payment_id: string;
      status: string;
      message: string;
    }>('/razorpay/verify-payment', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  // AI Ops Copilot & Explainability (Powered by Groq LLM)
  chatAgent: (query: string) =>
    fetchJson<{
      query: string;
      response: string;
      model: string;
    }>('/agent/chat', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),

  explainCase: (transactionId: string) =>
    fetchJson<{
      transaction_id: string;
      explanation: string;
      model: string;
    }>(`/agent/explain/${transactionId}`),
};



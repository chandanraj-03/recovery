import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { RecoveryCaseDetail, StepData } from '../types';
import {
  Play,
  SkipForward,
  RotateCcw,
  Bot,
  Search,
  TrendingUp,
  Coins,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Brain,
  Layers,
  Sparkles,
  ArrowRight,
  CreditCard,
} from 'lucide-react';
import { RazorpayCheckoutModal } from '../components/RazorpayCheckoutModal';

const STAGES = [
  { id: 'detect', label: '1. Detect', desc: 'Failed payment event received' },
  { id: 'context', label: '2. Context', desc: 'Assembling customer & failure signals' },
  { id: 'diagnose', label: '3. Diagnose', desc: 'Inferring cause from evidence' },
  { id: 'predict', label: '4. Predict', desc: 'Estimating P(success|state, action)' },
  { id: 'evaluate', label: '5. Evaluate', desc: 'Calculating immediate & future LTV' },
  { id: 'decide', label: '6. Decide', desc: 'Agent chooses optimal next action' },
  { id: 'policy', label: '7. Policy', desc: 'Deterministic policy validation' },
  { id: 'execute', label: '8. Execute', desc: 'Simulated gateway action dispatched' },
  { id: 'observe', label: '9. Observe', desc: 'Environment returns outcome' },
  { id: 'learn', label: '10. Learn', desc: 'Contextual bandit & memory update' },
];

export const LiveAgentStepperPage: React.FC = () => {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cases, setCases] = useState<any[]>([]);
  const [selectedTxId, setSelectedTxId] = useState<string>('');
  const [activeCase, setActiveCase] = useState<RecoveryCaseDetail | null>(null);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);

  const refreshCurrentCase = () => {
    if (!selectedTxId) return;
    api.getCaseDetail(selectedTxId).then((data) => {
      if (!('error' in data)) {
        setActiveCase(data);
      }
    });
  };

  useEffect(() => {
    api.getCases().then((list) => {
      setCases(list);
      if (list.length > 0) {
        setSelectedTxId(list[0].transaction_id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedTxId) return;
    api.getCaseDetail(selectedTxId).then((data) => {
      if (!('error' in data)) {
        setActiveCase(data);
        setActiveStageIndex(0);
      }
    });
  }, [selectedTxId]);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveStageIndex((prev) => {
          if (prev < STAGES.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const step: StepData | undefined = activeCase?.steps[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#1A1918]">
              Live Agent Execution Stepper
            </h1>
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
              Agentic Pipeline Visualizer
            </span>
          </div>
          <p className="mt-1 text-xs text-[#706B67]">
            Observe step-by-step reasoning: Detection → Evidence Diagnosis → Prediction → Valuation → Policy → Action → Learning
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-2 shadow-xs">
          <select
            value={selectedTxId}
            onChange={(e) => setSelectedTxId(e.target.value)}
            className="rounded-xl border border-[#CEC8C4] bg-[#F6F4F3] px-3 py-1.5 text-xs font-bold text-[#1A1918] focus:outline-none"
          >
            {cases.map((c) => (
              <option key={c.transaction_id} value={c.transaction_id}>
                {c.transaction_id} (₹{c.amount.toLocaleString('en-IN')}) - {c.status}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              isPlaying
                ? 'bg-amber-600 text-white'
                : 'bg-[#1A1918] text-white hover:bg-[#2E2C2A]'
            }`}
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
          </button>

          <button
            onClick={() => setActiveStageIndex((prev) => Math.min(STAGES.length - 1, prev + 1))}
            disabled={activeStageIndex >= STAGES.length - 1}
            className="flex items-center gap-1.5 rounded-xl border border-[#CEC8C4] bg-[#FFFFFF] px-3 py-1.5 text-xs font-bold text-[#1A1918] hover:bg-[#F6F4F3] disabled:opacity-40"
          >
            <SkipForward className="h-3.5 w-3.5" />
            <span>Next</span>
          </button>

          <button
            onClick={() => {
              setActiveStageIndex(0);
              setIsPlaying(false);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#CEC8C4] bg-[#FFFFFF] text-[#65605C] hover:bg-[#F6F4F3]"
            title="Reset Stepper"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <div className="h-5 w-px bg-[#DDD8D5] mx-1" />

          <button
            onClick={() => setIsRazorpayOpen(true)}
            disabled={!activeCase}
            className="flex items-center gap-1.5 rounded-xl bg-[#0c2340] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#16365f] transition-all disabled:opacity-50"
            title="Launch Razorpay Checkout for Buildathon Demo"
          >
            <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span>⚡ Razorpay Demo</span>
          </button>
        </div>
      </div>

      {/* Pipeline Stage Bar */}
      <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-5 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[750px] relative">
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#E0DBD8] -z-0"></div>
          {STAGES.map((stg, idx) => {
            const isCompleted = idx < activeStageIndex;
            const isCurrent = idx === activeStageIndex;

            return (
              <button
                key={stg.id}
                onClick={() => setActiveStageIndex(idx)}
                className="flex flex-col items-center relative z-10 focus:outline-none"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-[#1A1918] text-[#FFFFFF] ring-4 ring-emerald-400/30 scale-110'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#DDD8D5] text-[#65605C]'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span
                  className={`mt-2 text-[11px] font-bold tracking-tight ${
                    isCurrent ? 'text-[#1A1918]' : 'text-[#8F8985]'
                  }`}
                >
                  {stg.label.split('. ')[1]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage Detail Card */}
      {activeCase && step && (
        <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-6 shadow-xs min-h-[300px]">
          <div className="border-b border-[#E0DBD8] pb-4">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Active Stage: Step {activeStageIndex + 1} of {STAGES.length}
            </span>
            <h2 className="text-lg font-extrabold text-[#1A1918]">
              {STAGES[activeStageIndex].label} — {STAGES[activeStageIndex].desc}
            </h2>
          </div>

          <div className="mt-5">
            {activeStageIndex === 0 && (
              <div className="space-y-3">
                <p className="text-xs text-[#65605C]">
                  Payment event received from payment gateway webhook. Transaction was marked at-risk.
                </p>
                <div className="grid grid-cols-3 gap-3 rounded-xl bg-[#F6F4F3] p-4 text-xs">
                  <div>
                    <span className="text-[#8F8985]">Transaction ID:</span>{' '}
                    <span className="font-bold font-mono">{activeCase.transaction_id}</span>
                  </div>
                  <div>
                    <span className="text-[#8F8985]">Customer ID:</span>{' '}
                    <span className="font-bold">{activeCase.customer_id}</span>
                  </div>
                  <div>
                    <span className="text-[#8F8985]">Original Amount:</span>{' '}
                    <span className="font-bold text-[#1A1918]">
                      ₹{activeCase.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeStageIndex === 1 && (
              <div className="space-y-3">
                <p className="text-xs text-[#65605C]">
                  Context Builder assembled transaction attributes, customer tenure, historical success rate, and prior attempts.
                </p>
                <div className="rounded-xl bg-[#F6F4F3] p-4 text-xs space-y-2">
                  <div className="font-semibold text-[#1A1918]">Assembled Context Attributes:</div>
                  <ul className="list-disc list-inside space-y-1 text-[#65605C]">
                    <li>Transaction Value: ₹{activeCase.amount.toLocaleString('en-IN')}</li>
                    <li>Environment Model: {activeCase.environment}</li>
                    <li>Attempt Number: Step #{step.step_number + 1}</li>
                    <li>Customer Value Profile: Preserved LTV ₹{activeCase.estimated_ltv.toLocaleString('en-IN')}</li>
                  </ul>
                </div>
              </div>
            )}

            {activeStageIndex === 2 && (
              <div className="space-y-3">
                <p className="text-xs text-[#65605C]">
                  Recovery Diagnosis inferred the underlying failure state using raw signals (response code, previous rates) rather than being handed a static label.
                </p>
                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold capitalize text-blue-950">
                      Inferred: {step.diagnosis.label.replace('_', ' ')}
                    </span>
                    <span className="rounded bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                      {(step.diagnosis.confidence * 100).toFixed(0)}% Confidence
                    </span>
                  </div>
                  <div className="mt-3">
                    <span className="font-bold text-blue-900 block mb-1">Supporting Evidence:</span>
                    <ul className="space-y-1 text-blue-800">
                      {step.diagnosis.evidence.map((ev, i) => (
                        <li key={i}>• {ev}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeStageIndex === 3 && (
              <div className="space-y-3">
                <p className="text-xs text-[#65605C]">
                  Recovery Predictor estimated P(success | state, action) across all permitted interventions.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(step.predictions).map(([act, p]) => (
                    <div key={act} className="rounded-xl bg-[#F6F4F3] p-3 text-xs border border-[#DDD8D5]">
                      <span className="font-bold text-[#1A1918] block truncate">{act}</span>
                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-[#8F8985]">P(Recovery):</span>
                        <span className="font-mono text-sm font-extrabold text-purple-700">
                          {(p * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeStageIndex === 4 && (
              <div className="space-y-3">
                <p className="text-xs text-[#65605C]">
                  Economic Evaluator calculated immediate expected recovery, future customer value, action cost, and friction penalty.
                </p>
                <div className="rounded-xl bg-[#F6F4F3] p-4 text-xs space-y-2">
                  <div className="flex justify-between font-bold text-xs border-b border-[#DDD8D5] pb-2">
                    <span>Best Immediate Action: {step.best_immediate_action}</span>
                    <span className="text-emerald-700">Best Long-Term: {step.best_longterm_action}</span>
                  </div>
                  <p className="text-[11px] text-[#706B67]">
                    The agent weighs customer friction against immediate payoff. If retrying immediately damages future retention, the agent prefers a gentler or delayed action.
                  </p>
                </div>
              </div>
            )}

            {activeStageIndex === 5 && (
              <div className="space-y-3">
                <p className="text-xs text-[#65605C]">
                  The Recovery Agent resolved trade-offs and selected the proposed next intervention.
                </p>
                <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-4 text-xs">
                  <span className="font-mono text-sm font-black text-emerald-950 block">
                    Selected Action: {step.selected_action}
                  </span>
                  <p className="mt-2 text-emerald-800 leading-relaxed">
                    Rationale: {step.decision_reason}
                  </p>
                </div>
              </div>
            )}

            {activeStageIndex === 6 && (
              <div className="space-y-3">
                <p className="text-xs text-[#65605C]">
                  Deterministic Policy Check evaluated the proposed action against merchant safety rules (max retries, message limits, interval, high-value review).
                </p>
                <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-bold ${
                        step.policy_result === 'ALLOW'
                          ? 'bg-blue-600 text-white'
                          : step.policy_result === 'REVIEW'
                          ? 'bg-amber-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {step.policy_result}
                    </span>
                    <span className="font-bold text-blue-900">Deterministic Guard Verdict</span>
                  </div>
                  <p className="mt-2 text-blue-800 leading-relaxed">
                    {step.policy_reason}
                  </p>
                </div>
              </div>
            )}

            {activeStageIndex === 7 && (
              <div className="space-y-3">
                <p className="text-xs text-[#65605C]">
                  Action Executor dispatched the approved action to the gateway. The AI selects and formats the optimal payload for the payment rails.
                </p>
                <div className="rounded-xl bg-[#F6F4F3] p-4 text-xs">
                  <span className="font-bold text-[#1A1918]">
                    Dispatched Action: {step.executed_action}
                  </span>
                  <div className="mt-2 text-[#706B67]">
                    Cost Incurred: ₹{step.cost.toFixed(0)} • Target: Gateway Adapter
                  </div>
                </div>

                {/* Razorpay Gateway Live Trigger for Judges */}
                <div className="mt-3 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50/50 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0c2340] text-white">
                        <CreditCard className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#1A1918]">
                          Live Razorpay Gateway Handshake
                        </div>
                        <p className="text-[11px] text-[#706B67]">
                          Experience the actual customer payment checkout with Razorpay SDK in real time.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsRazorpayOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0c2340] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#16365f] transition-all shrink-0"
                    >
                      <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      <span>Launch Razorpay Modal</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeStageIndex === 8 && (
              <div className="space-y-3">
                <p className="text-xs text-[#65605C]">
                  Outcome Collector received the external response from the simulation environment.
                </p>
                <div
                  className={`rounded-xl border p-4 text-xs ${
                    step.outcome === 'SUCCESS'
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                      : step.outcome === 'STOPPED'
                      ? 'border-amber-300 bg-amber-50 text-amber-900'
                      : 'border-rose-300 bg-rose-50 text-rose-900'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-sm">
                    <span>Outcome: {step.outcome}</span>
                    {step.revenue > 0 && <span>Recovered: +₹{step.revenue.toLocaleString('en-IN')}</span>}
                  </div>
                  <div className="mt-2 text-xs opacity-90">
                    Customer Friction Change: {step.friction_delta > 0 ? `+${step.friction_delta}` : step.friction_delta}
                  </div>
                </div>
              </div>
            )}

            {activeStageIndex === 9 && (
              <div className="space-y-3">
                <p className="text-xs text-[#65605C]">
                  Adaptive Learning updated the contextual bandit posterior (Thompson Sampling) and recovery memory to improve subsequent sequencing.
                </p>
                {step.learning_update ? (
                  <div className="rounded-xl border border-emerald-300 bg-emerald-50/80 p-4 text-xs">
                    <span className="font-bold text-emerald-950 block mb-1">
                      Posterior Distribution Updated:
                    </span>
                    <div className="grid grid-cols-3 gap-3 font-mono text-emerald-900 mt-2">
                      <div>Bucket: {step.learning_update.context_bucket}</div>
                      <div>α={step.learning_update.alpha}, β={step.learning_update.beta}</div>
                      <div>Posterior Mean: {(step.learning_update.mean * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-[#F6F4F3] p-4 text-xs text-[#706B67]">
                    Terminal state reached or action was STOP — customer relationship preserved without further friction.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Razorpay Checkout Modal */}
      {activeCase && (
        <RazorpayCheckoutModal
          isOpen={isRazorpayOpen}
          onClose={() => setIsRazorpayOpen(false)}
          transactionId={activeCase.transaction_id}
          amount={activeCase.amount}
          customerId={activeCase.customer_id}
          onSuccess={refreshCurrentCase}
        />
      )}
    </div>
  );
};

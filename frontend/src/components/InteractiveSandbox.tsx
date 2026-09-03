import React, { useState } from 'react';
import {
  Zap,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Clock,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { RazorpayCheckoutModal } from './RazorpayCheckoutModal';

interface ScenarioPreset {
  id: string;
  name: string;
  tag: string;
  code: string;
  amount: number;
  customer: string;
  segment: string;
  expectedDiagnosis: string;
  confidence: number;
  expectedAction: string;
  actionReason: string;
  policyCheck: string;
  outcomeType: 'RECOVERED' | 'ESCALATED' | 'STOPPED';
}

const PRESETS: ScenarioPreset[] = [
  {
    id: 'bank_timeout',
    name: 'Transient Bank Network Timeout',
    tag: 'Network Flake',
    code: 'E001 - GATEWAY_TIMEOUT',
    amount: 4750,
    customer: 'C104',
    segment: 'Standard Buyer (Friction: 0.15)',
    expectedDiagnosis: 'transient_network_failure',
    confidence: 0.92,
    expectedAction: 'RETRY_LATER (30m Cooldown)',
    actionReason: 'Immediate retry has 12% success due to bank downtime. Waiting 30m yields 86% success with zero churn.',
    policyCheck: 'PASS: Retry interval satisfies 30-min policy rule.',
    outcomeType: 'RECOVERED',
  },
  {
    id: 'card_declined',
    name: 'Card Expired / Hard Bank Decline',
    tag: 'Customer Action Required',
    code: 'E002 - CARD_EXPIRED_OR_DECLINED',
    amount: 14200,
    customer: 'C118',
    segment: 'VIP Loyal (LTV ₹68,000)',
    expectedDiagnosis: 'customer_action_required',
    confidence: 0.98,
    expectedAction: 'ALTERNATIVE_PAYMENT (Razorpay Link)',
    actionReason: 'Card is permanently blocked. Blind retries would increase customer friction. Dispatched Razorpay multi-method link.',
    policyCheck: 'PASS: Maximum customer messages (1) not exceeded.',
    outcomeType: 'RECOVERED',
  },
  {
    id: 'upi_dropped',
    name: 'UPI Intent Dropped / App Switch Failure',
    tag: 'Mobile Flow',
    code: 'E010 - UPI_INTENT_ABANDONED',
    amount: 2499,
    customer: 'C205',
    segment: 'New Customer (Friction: 0.05)',
    expectedDiagnosis: 'customer_friction_sensitive',
    confidence: 0.88,
    expectedAction: 'ALTERNATIVE_PAYMENT (Instant Razorpay QR)',
    actionReason: 'User switched apps during UPI flow. Sent instant Razorpay recovery link with dynamic QR code.',
    policyCheck: 'PASS: Permitted under 24h recovery window.',
    outcomeType: 'RECOVERED',
  },
  {
    id: 'high_value',
    name: 'High-Value Enterprise Payment Failure',
    tag: 'Policy Escalation',
    code: 'E088 - TRANSACTION_LIMIT_EXCEEDED',
    amount: 78500,
    customer: 'C990',
    segment: 'Enterprise Account (LTV ₹2,50,000)',
    expectedDiagnosis: 'high_value_risk',
    confidence: 0.95,
    expectedAction: 'ESCALATE (Account Manager Queue)',
    actionReason: 'Amount ₹78,500 exceeds high-value threshold (₹50,000). Automated retries suspended to prevent alienating enterprise partner.',
    policyCheck: 'TRIGGERED: High-Value Threshold Rule routed case to Human Review.',
    outcomeType: 'ESCALATED',
  },
];

export const InteractiveSandbox: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESETS[0].id);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState<boolean>(false);

  const selectedPreset = PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];

  const handleStartSimulation = () => {
    setCurrentStep(1);
    setIsSimulating(true);

    // Step-by-step automated simulation sequence
    setTimeout(() => setCurrentStep(2), 700);
    setTimeout(() => setCurrentStep(3), 1500);
    setTimeout(() => setCurrentStep(4), 2300);
    setTimeout(() => {
      setCurrentStep(5);
      setIsSimulating(false);
    }, 3100);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsSimulating(false);
  };

  return (
    <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E0DBD8] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-[#1A1918]">
              Interactive Failure & Autonomous Recovery Sandbox
            </h2>
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 border border-blue-200">
              Live Test Station
            </span>
          </div>
          <p className="text-xs text-[#706B67] mt-0.5">
            Test how RecoverAI intercepts payment failures, reasons about customer LTV, enforces deterministic policies, and dispatches Razorpay recovery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={currentStep === 0 || isSimulating}
            className="flex items-center gap-1.5 rounded-xl border border-[#CEC8C4] px-3 py-1.5 text-xs font-bold text-[#65605C] hover:bg-[#F6F4F3] disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleStartSimulation}
            disabled={isSimulating}
            className="flex items-center gap-1.5 rounded-xl bg-[#0c2340] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#15345d] active:scale-98 disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>{isSimulating ? 'Simulating...' : 'Simulate Failure'}</span>
          </button>
        </div>
      </div>

      {/* Preset Selection Cards Grid */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#706B67] block mb-2.5">
          Select a Payment Failure Scenario:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESETS.map((preset) => {
            const isSelected = preset.id === selectedPresetId;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  setSelectedPresetId(preset.id);
                  handleReset();
                }}
                className={`rounded-xl p-3.5 text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#0c2340] bg-[#0c2340]/5 ring-2 ring-[#0c2340]/20 shadow-xs'
                    : 'border-[#DDD8D5] bg-[#FFFFFF] hover:border-[#CEC8C4] hover:bg-[#F6F4F3]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-[#F6F4F3] border border-[#DDD8D5] px-1.5 py-0.5 text-[9px] font-extrabold text-[#65605C]">
                    {preset.tag}
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-700">
                    ₹{preset.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="mt-2 text-xs font-bold text-[#1A1918] line-clamp-1">
                  {preset.name}
                </div>
                <div className="mt-1 font-mono text-[10px] text-[#706B67] truncate">
                  {preset.code}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Pipeline Visualization */}
      <div className="rounded-2xl border border-[#DDD8D5] bg-[#F6F4F3] p-5">
        <div className="flex items-center justify-between border-b border-[#E0DBD8] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1A1918]">
              Autonomous Recovery Pipeline
            </span>
            <span className="font-mono text-xs text-[#706B67]">
              (Testing: {selectedPreset.name})
            </span>
          </div>
          <span className="text-xs font-bold text-[#706B67]">
            Amount: ₹{selectedPreset.amount.toLocaleString('en-IN')} • Customer: {selectedPreset.customer}
          </span>
        </div>

        {/* Step Progression */}
        <div className="space-y-3">
          {/* Step 1: Detect Failure */}
          <div
            className={`rounded-xl border p-3.5 text-xs transition-all duration-300 ${
              currentStep >= 1
                ? 'border-amber-300 bg-amber-50 text-amber-950'
                : 'border-[#DDD8D5] bg-[#FFFFFF] opacity-50'
            }`}
          >
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>1. Intercept Raw Payment Failure</span>
              </span>
              {currentStep >= 1 && (
                <span className="rounded bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold">
                  Intercepted
                </span>
              )}
            </div>
            {currentStep >= 1 && (
              <p className="mt-1.5 text-[11px] text-amber-900 leading-relaxed">
                Received raw gateway event <code className="font-bold">{selectedPreset.code}</code> for customer {selectedPreset.customer}. Case opened without manual triage.
              </p>
            )}
          </div>

          {/* Step 2: Evidence Diagnosis */}
          <div
            className={`rounded-xl border p-3.5 text-xs transition-all duration-300 ${
              currentStep >= 2
                ? 'border-blue-300 bg-blue-50 text-blue-950'
                : 'border-[#DDD8D5] bg-[#FFFFFF] opacity-50'
            }`}
          >
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span>2. Multi-Signal Cause Inference (AI Diagnosis Engine)</span>
              </span>
              {currentStep >= 2 && (
                <span className="rounded bg-blue-200/80 px-2 py-0.5 text-[10px] font-bold">
                  {(selectedPreset.confidence * 100).toFixed(0)}% Confidence
                </span>
              )}
            </div>
            {currentStep >= 2 && (
              <p className="mt-1.5 text-[11px] text-blue-900 leading-relaxed">
                Inferred root cause: <strong className="font-bold capitalize">{selectedPreset.expectedDiagnosis.replace(/_/g, ' ')}</strong>. Evaluated transaction history, payment method reliability, and gateway latency.
              </p>
            )}
          </div>

          {/* Step 3: Economic Valuation */}
          <div
            className={`rounded-xl border p-3.5 text-xs transition-all duration-300 ${
              currentStep >= 3
                ? 'border-purple-300 bg-purple-50 text-purple-950'
                : 'border-[#DDD8D5] bg-[#FFFFFF] opacity-50'
            }`}
          >
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600" />
                <span>3. Long-Term Value & Friction Optimization</span>
              </span>
              {currentStep >= 3 && (
                <span className="rounded bg-purple-200/80 px-2 py-0.5 text-[10px] font-bold">
                  Action: {selectedPreset.expectedAction.split(' ')[0]}
                </span>
              )}
            </div>
            {currentStep >= 3 && (
              <p className="mt-1.5 text-[11px] text-purple-900 leading-relaxed">
                {selectedPreset.actionReason}
              </p>
            )}
          </div>

          {/* Step 4: Deterministic Policy Engine */}
          <div
            className={`rounded-xl border p-3.5 text-xs transition-all duration-300 ${
              currentStep >= 4
                ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                : 'border-[#DDD8D5] bg-[#FFFFFF] opacity-50'
            }`}
          >
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>4. Deterministic Guard Validation</span>
              </span>
              {currentStep >= 4 && (
                <span className="rounded bg-emerald-200/80 px-2 py-0.5 text-[10px] font-bold">
                  Verified Safe
                </span>
              )}
            </div>
            {currentStep >= 4 && (
              <p className="mt-1.5 text-[11px] text-emerald-900 leading-relaxed">
                {selectedPreset.policyCheck}
              </p>
            )}
          </div>

          {/* Step 5: Execution & Razorpay Handshake */}
          <div
            className={`rounded-xl border p-3.5 text-xs transition-all duration-300 ${
              currentStep >= 5
                ? 'border-[#0c2340] bg-[#0c2340] text-white'
                : 'border-[#DDD8D5] bg-[#FFFFFF] opacity-50'
            }`}
          >
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-300" />
                <span>5. Gateway Action Dispatched (Razorpay Rails)</span>
              </span>
              {currentStep >= 5 && (
                <span className="rounded bg-blue-500/30 border border-blue-400/40 px-2 py-0.5 text-[10px] font-bold text-blue-200">
                  {selectedPreset.outcomeType}
                </span>
              )}
            </div>
            {currentStep >= 5 && (
              <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/10">
                <p className="text-[11px] text-blue-100/90">
                  Action dispatched successfully to Razorpay API. Transaction ready for customer checkout.
                </p>
                <button
                  onClick={() => setIsRazorpayOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-1.5 text-xs font-bold text-[#0c2340] shadow-sm hover:bg-blue-50 transition-all shrink-0 cursor-pointer"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span>⚡ Test Razorpay Checkout Now</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Razorpay Checkout Modal */}
      <RazorpayCheckoutModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        transactionId={`TX_SANDBOX_${selectedPreset.id.toUpperCase()}`}
        amount={selectedPreset.amount}
        customerId={selectedPreset.customer}
      />
    </div>
  );
};

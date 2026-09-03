import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Trophy,
  Compass,
  X,
  ChevronRight,
  ChevronLeft,
  Zap,
  Smartphone,
  ShieldCheck,
  CreditCard,
  Clock,
  Sparkles,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
} from 'lucide-react';
import { RazorpayCheckoutModal } from './RazorpayCheckoutModal';
import { CustomerTouchpointModal } from './CustomerTouchpointModal';

interface ActDefinition {
  actNumber: number;
  title: string;
  tag: string;
  tagColor: string;
  problem: string;
  naiveMistake: string;
  recoverAiAction: string;
  razorpayRole: string;
  keyMetric: string;
  transactionId: string;
  amount: number;
  customerName: string;
  customerId: string;
}

const ACTS: ActDefinition[] = [
  {
    actNumber: 1,
    title: 'Act 1: The Hard Decline (Customer Action Required)',
    tag: 'Razorpay Payment Link',
    tagColor: 'bg-blue-100 text-blue-900 border-blue-200',
    problem: 'VIP Customer Rahul Verma’s card expired (Error E002). Customer LTV is ₹68,000.',
    naiveMistake: 'Traditional gateways blindly retry the card 3 to 5 times. Every retry fails, triggering bank decline fees and customer frustration.',
    recoverAiAction: 'RecoverAI identifies permanent failure, halts automated retries immediately, and generates a personalized Razorpay recovery payment link.',
    razorpayRole: 'Calls /v1/payment_links API to produce a branded payment URL (rzp.io) delivered via WhatsApp.',
    keyMetric: '100% Recovery Rate • Zero Customer Churn',
    transactionId: 'TX10022',
    amount: 14200,
    customerName: 'Rahul Verma',
    customerId: 'C118',
  },
  {
    actNumber: 2,
    title: 'Act 2: The Bank Outage (Transient Flake & Smart Cooldown)',
    tag: 'Scheduled Cooldown',
    tagColor: 'bg-amber-100 text-amber-900 border-amber-200',
    problem: 'State Bank gateway experiences a 15-minute connection timeout spike (Error E001).',
    naiveMistake: 'Immediate retries within seconds fail 88% of the time, burning merchant retry quotas and triggering gateway rate limits.',
    recoverAiAction: 'AI infers transient network failure (92% confidence), enforces a mandatory 30-minute policy cooldown, and schedules a smart retry when the bank recovers.',
    razorpayRole: 'Retries order via Razorpay gateway at optimal time window when bank uptime returns to 89%.',
    keyMetric: 'Zero Customer Disturbance • 86% Recovery on Step 2',
    transactionId: 'TX10001',
    amount: 16423,
    customerName: 'Priya Sharma',
    customerId: 'C291',
  },
  {
    actNumber: 3,
    title: 'Act 3: Mobile UPI Friction (Instant Dynamic QR Recovery)',
    tag: 'UPI Intent Dropped',
    tagColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    problem: 'Customer switches apps during a UPI intent checkout, causing session drop (Error E010).',
    naiveMistake: 'Merchant marks transaction as Abandoned. Customer abandons the cart forever.',
    recoverAiAction: 'AI detects mobile friction sensitivity, intercepts the dropped intent, and generates a dynamic Razorpay QR code and payment link within 60 seconds.',
    razorpayRole: 'Generates instant Razorpay QR code compatible with Google Pay, PhonePe, and Paytm.',
    keyMetric: 'Rescued ₹2,499 cart in < 60 seconds',
    transactionId: 'TX10015',
    amount: 2499,
    customerName: 'Ananya Gupta',
    customerId: 'C205',
  },
  {
    actNumber: 4,
    title: 'Act 4: Enterprise Safeguard (Deterministic Auto-Escalation)',
    tag: 'Policy Guardrail',
    tagColor: 'bg-purple-100 text-purple-900 border-purple-200',
    problem: 'A high-value B2B purchase of ₹78,500 fails due to account limit (Error E088).',
    naiveMistake: 'Automated generic bots send canned emails or repeated attempts, irritating an enterprise corporate buyer.',
    recoverAiAction: 'Deterministic Policy Engine detects amount > ₹50,000 threshold and halts AI execution, safely routing the case to the Human Account Manager Queue.',
    razorpayRole: 'Preserves enterprise relationship while generating a pre-approved Razorpay invoice for the sales rep.',
    keyMetric: 'Guaranteed Safety • No Hallucinated Retries',
    transactionId: 'TX10099',
    amount: 78500,
    customerName: 'TechCorp Solutions',
    customerId: 'C990',
  },
  {
    actNumber: 5,
    title: 'Act 5: Adaptive Learning & Financial Ledger (The Payoff)',
    tag: 'Thompson Sampling & Ledger',
    tagColor: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    problem: 'Hardcoded rule engines cannot adapt when payment provider success rates fluctuate.',
    naiveMistake: 'Engineers spend weeks manually tweaking retry rules that quickly go out of date.',
    recoverAiAction: 'Contextual Bandit updates Beta distribution priors (Thompson Sampling) in memory, and writes net recovery value (Revenue minus action costs) to the immutable financial ledger.',
    razorpayRole: 'Full transaction reconciliation between Razorpay payout records and RecoverAI ledger.',
    keyMetric: '+₹1,51,591 Net Recovered • Reconciled Ledger',
    transactionId: 'TX10000',
    amount: 25000,
    customerName: 'Merchant Aggregate',
    customerId: 'C_PORTFOLIO',
  },
];

interface JudgeDemoModeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JudgeDemoMode: React.FC<JudgeDemoModeProps> = ({ isOpen, onClose }) => {
  const [currentActIndex, setCurrentActIndex] = useState(0);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [isTouchpointOpen, setIsTouchpointOpen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const act = ACTS[currentActIndex];

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl border border-[#DDD8D5] bg-[#FFFFFF] p-6 sm:p-8 shadow-2xl my-auto max-h-[94vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Badge & Close Button */}
        <div className="flex items-start justify-between border-b border-[#E0DBD8] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md">
              <Compass className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-[#1A1918]">
                  RecoverAI Guided Walkthrough
                </h2>
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-900 border border-amber-300">
                  5-Act Interactive Scenarios
                </span>
              </div>
              <p className="text-xs text-[#706B67]">
                A curated end-to-end walkthrough demonstrating RecoverAI's autonomous intelligence and Razorpay rails
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Guided Walkthrough"
            className="rounded-xl p-2 text-[#706B67] hover:bg-[#F6F4F3] hover:text-[#1A1918] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 5-Act Stepper Timeline Progress Bar */}
        <div className="mt-5">
          <div className="grid grid-cols-5 gap-2">
            {ACTS.map((item, idx) => {
              const isCurrent = idx === currentActIndex;
              const isPast = idx < currentActIndex;
              return (
                <button
                  key={item.actNumber}
                  onClick={() => setCurrentActIndex(idx)}
                  className={`flex flex-col items-center p-2 rounded-xl text-center transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#0c2340] text-white shadow-sm ring-2 ring-[#0c2340]/20'
                      : isPast
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-[#F6F4F3] text-[#8F8985] hover:bg-[#DDD8D5]'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    Act {item.actNumber}
                  </span>
                  <span className="text-[11px] font-bold truncate max-w-full">
                    {item.title.split(':')[1]?.trim()?.split(' ')[0] || `Act ${item.actNumber}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Act Details Card */}
        <div className="mt-5 space-y-4 rounded-2xl border border-[#DDD8D5] bg-[#F6F4F3] p-5">
          {/* Title & Tag */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E0DBD8] pb-3">
            <div>
              <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border ${act.tagColor}`}>
                {act.tag}
              </span>
              <h3 className="mt-1 text-base font-extrabold text-[#1A1918]">{act.title}</h3>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs text-[#706B67] block">Transaction & Value</span>
              <span className="font-mono text-sm font-bold text-emerald-700">
                ₹{act.amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Problem vs RecoverAI Solution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 space-y-1">
              <span className="font-bold text-rose-900 uppercase text-[10px] flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                The Naive Mistake
              </span>
              <p className="text-rose-950 leading-relaxed">{act.naiveMistake}</p>
            </div>

            <div className="rounded-xl border border-emerald-300 bg-emerald-50/80 p-3.5 space-y-1">
              <span className="font-bold text-emerald-900 uppercase text-[10px] flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                The RecoverAI Response
              </span>
              <p className="text-emerald-950 leading-relaxed">{act.recoverAiAction}</p>
            </div>
          </div>

          {/* Razorpay Integration Role */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 text-xs">
            <div className="flex items-center gap-2 text-blue-950 font-bold">
              <CreditCard className="h-4 w-4 text-blue-600" />
              <span>Razorpay Rails Handshake:</span>
            </div>
            <p className="mt-1 text-blue-900 leading-relaxed">{act.razorpayRole}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded bg-blue-200/80 px-2 py-0.5 text-[10px] font-bold text-blue-900">
                Key Business Impact: {act.keyMetric}
              </span>
            </div>
          </div>
        </div>

        {/* Live Interactive Action Buttons for Judges */}
        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          {/* Button 1: Preview Customer Notification */}
          <button
            onClick={() => setIsTouchpointOpen(true)}
            className="flex-1 min-w-[180px] flex items-center justify-center gap-2 rounded-xl border border-[#CEC8C4] bg-[#FFFFFF] py-2.5 px-4 text-xs font-bold text-[#1A1918] shadow-xs hover:bg-[#F6F4F3] transition-all cursor-pointer"
          >
            <Smartphone className="h-4 w-4 text-emerald-600" />
            <span>📱 Preview What Customer Sees</span>
          </button>

          {/* Button 2: Launch Real Razorpay Checkout */}
          <button
            onClick={() => setIsRazorpayOpen(true)}
            className="flex-1 min-w-[200px] flex items-center justify-center gap-2 rounded-xl bg-[#0c2340] py-2.5 px-4 text-xs font-bold text-white shadow-md hover:bg-[#15345d] transition-all cursor-pointer"
          >
            <Zap className="h-4 w-4 text-amber-400 fill-amber-400" />
            <span>⚡ Launch Razorpay Checkout Modal</span>
          </button>
        </div>

        {/* Navigation Footer (Prev / Next Act) */}
        <div className="mt-6 flex items-center justify-between border-t border-[#E0DBD8] pt-4">
          <button
            onClick={() => setCurrentActIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentActIndex === 0}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-[#65605C] hover:bg-[#F6F4F3] disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous Act</span>
          </button>

          <span className="text-xs font-bold text-[#706B67]">
            Act {currentActIndex + 1} of {ACTS.length}
          </span>

          {currentActIndex < ACTS.length - 1 ? (
            <button
              onClick={() => setCurrentActIndex((prev) => Math.min(ACTS.length - 1, prev + 1))}
              className="flex items-center gap-1.5 rounded-xl bg-[#1A1918] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#2E2C2A] cursor-pointer"
            >
              <span>Next: Act {currentActIndex + 2}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 cursor-pointer"
            >
              <span>Complete Walkthrough</span>
              <CheckCircle2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Embedded Live Razorpay Checkout Modal */}
      <RazorpayCheckoutModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        transactionId={act.transactionId}
        amount={act.amount}
        customerId={act.customerId}
      />

      {/* Embedded Customer Touchpoint Previewer Modal */}
      <CustomerTouchpointModal
        isOpen={isTouchpointOpen}
        onClose={() => setIsTouchpointOpen(false)}
        transactionId={act.transactionId}
        amount={act.amount}
        customerId={act.customerId}
        customerName={act.customerName}
      />
    </div>
  );

  return createPortal(modalContent, document.body);
};

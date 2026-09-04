import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Compass,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  BrainCircuit,
  Sliders,
  Scale,
  BookOpenCheck,
  History,
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Cpu,
  Coins,
  Flame,
  ShieldAlert,
  Mic,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onStartTour: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartTour }) => {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setExpandedFaq(expandedFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-[#EBE8E7] text-[#1A1918] selection:bg-emerald-500 selection:text-white">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-[#CEC8C4] bg-[#EBE8E7]/90 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 shrink-0">
            <img
              src="/r_logo.png"
              alt="RecoverAI Logo"
              className="h-10 w-10 object-contain drop-shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-[#1A1918]">RecoverAI</span>
                <span className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-800 uppercase">
                  Track 3: AI Revenue Recovery
                </span>
              </div>
              <p className="text-xs font-medium text-[#706B67] hidden sm:block">
                Adaptive Recovery Sequencing & Long-Term Revenue Optimization
              </p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-[#65605C]">
            <a href="#problem-solution" className="hover:text-[#1A1918] transition-colors">Problem & Solution</a>
            <a href="#decision-loop" className="hover:text-[#1A1918] transition-colors">7-Stage Loop</a>
            <a href="#features" className="hover:text-[#1A1918] transition-colors">Feature Suite</a>
            <a href="#benchmarks" className="hover:text-[#1A1918] transition-colors">Benchmarks</a>
            <a href="#judge-alignment" className="hover:text-[#1A1918] transition-colors">Judge Alignment</a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onStartTour}
              className="flex items-center gap-1.5 rounded-xl border border-[#CEC8C4] bg-[#FFFFFF] px-3.5 py-2 text-xs font-bold text-[#1A1918] shadow-xs hover:bg-[#F6F4F3] transition-all"
            >
              <Compass className="h-4 w-4 text-blue-600" />
              <span>Take Tour</span>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 rounded-xl bg-[#1A1918] px-4 py-2 text-xs font-bold text-[#FFFFFF] shadow-sm hover:bg-[#2E2C2A] active:scale-98 transition-all"
            >
              <span>Sign In</span>
              <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative px-6 pt-14 pb-18 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-900 shadow-xs mb-6">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Autonomous AI Recovery Agent vs Blunt Rule-Based Retries</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#1A1918] leading-[1.12]">
            Stop Blindly Retrying <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-700 bg-clip-text text-transparent">
              Failed Payments.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[#65605C] font-medium leading-relaxed">
            Conventional recovery systems blindly spam payment retries, frustrating customers and causing churn.
            <strong className="text-[#1A1918]"> RecoverAI treats payment failures as an economic decision problem</strong>,
            balancing immediate recovery probabilities against long-term customer lifetime value (LTV).
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 rounded-xl bg-[#1A1918] px-6 py-3.5 text-sm font-bold text-[#FFFFFF] shadow-lg hover:bg-[#2E2C2A] active:scale-98 transition-all"
            >
              <span>Sign In to Platform</span>
              <ArrowRight className="h-4 w-4 text-emerald-400" />
            </button>
            <button
              onClick={onStartTour}
              className="flex items-center gap-2 rounded-xl border border-[#CEC8C4] bg-[#FFFFFF] px-6 py-3.5 text-sm font-bold text-[#1A1918] shadow-sm hover:bg-[#F6F4F3] transition-all"
            >
              <Compass className="h-4 w-4 text-blue-600" />
              <span>Interactive Product Tour</span>
            </button>
            <button
              onClick={() => navigate('/login?redirect=/stepper')}
              className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50/80 px-4 py-3.5 text-sm font-bold text-emerald-900 hover:bg-emerald-100 transition-all active:scale-98"
            >
              <PlayCircle className="h-4 w-4 text-emerald-700" />
              <span>Live Decision Stepper</span>
            </button>
          </div>
        </div>

        {/* Hero Proof Metrics Bar */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-[#CEC8C4] bg-[#FFFFFF] p-5 shadow-xs text-center">
            <span className="text-3xl font-black text-[#1A1918]">84.2%</span>
            <div className="mt-1 flex items-center justify-center gap-1 text-xs font-semibold text-emerald-700">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Average Recovery Rate</span>
            </div>
            <p className="mt-1 text-[11px] text-[#8F8985]">Tested across 1,000+ simulation batches</p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-xs text-center">
            <span className="text-3xl font-black text-emerald-800">+18.4%</span>
            <div className="mt-1 flex items-center justify-center gap-1 text-xs font-semibold text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Incremental Net Lift</span>
            </div>
            <p className="mt-1 text-[11px] text-[#8F8985]">Over naive "Always Retry" benchmark</p>
          </div>

          <div className="rounded-2xl border border-[#CEC8C4] bg-[#FFFFFF] p-5 shadow-xs text-center">
            <span className="text-3xl font-black text-blue-700">-42%</span>
            <div className="mt-1 flex items-center justify-center gap-1 text-xs font-semibold text-blue-800">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Friction Churn Prevented</span>
            </div>
            <p className="mt-1 text-[11px] text-[#8F8985]">Stops retries before customer churns</p>
          </div>

          <div className="rounded-2xl border border-[#CEC8C4] bg-[#FFFFFF] p-5 shadow-xs text-center">
            <span className="text-3xl font-black text-[#1A1918]">100%</span>
            <div className="mt-1 flex items-center justify-center gap-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Deterministic Compliance</span>
            </div>
            <p className="mt-1 text-[11px] text-[#8F8985]">Hard policy boundaries & quiet hours</p>
          </div>
        </div>

        {/* Formula Spotlight Card */}
        <div className="mt-8 max-w-4xl mx-auto rounded-2xl border border-[#CEC8C4] bg-[#FFFFFF] p-6 shadow-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-[#E0DBD8]">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#1A1918] flex items-center justify-center text-white">
                <Coins className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1A1918]">The Core Economic Objective Function</h4>
                <p className="text-xs text-[#65605C]">Maximizing Net Merchant Value instead of crude short-term recovery</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold">
              Formal Trade-Off Model
            </span>
          </div>

          <div className="mt-5 p-4 rounded-xl bg-[#F6F4F3] border border-[#E0DBD8] font-mono text-xs sm:text-sm text-center text-[#1A1918] overflow-x-auto">
            <span className="font-bold text-emerald-700">E[Net Value]</span> = (
            <span className="text-blue-700 font-semibold">P(success)</span> × <span className="font-semibold">Amount</span>) - 
            <span className="text-amber-700 font-semibold"> Cost(action)</span> - (
            <span className="text-rose-700 font-semibold">ΔFriction</span> × <span className="text-purple-700 font-semibold">Customer LTV</span>)
          </div>

          <p className="mt-3 text-xs text-[#706B67] text-center">
            If pushing an aggressive retry risks alienating a high-value customer with ₹1,50,000 LTV, RecoverAI intentionally halts or uses a friction-free payment link.
          </p>
        </div>
      </section>

      {/* 3. Problem vs Solution Section */}
      <section id="problem-solution" className="px-6 py-16 bg-[#F6F4F3] border-y border-[#CEC8C4]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8F8985]">Architectural Shift</span>
            <h2 className="text-3xl font-black text-[#1A1918] tracking-tight mt-1">
              Why Traditional Recovery Fails Merchants
            </h2>
            <p className="text-xs sm:text-sm text-[#65605C] mt-2">
              Most payment gateways and dunning tools rely on rigid, brute-force rules. Here is why an adaptive agentic approach is required:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* The Old Way */}
            <div className="rounded-2xl border border-rose-200 bg-[#FFFFFF] p-6 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
              <div className="flex items-center gap-2.5 text-rose-700 font-bold text-base mb-4">
                <XCircle className="h-5 w-5" />
                <span>The Legacy "Dumb Retry" Approach</span>
              </div>
              <ul className="space-y-3.5 text-xs text-[#65605C] font-medium">
                <li className="flex items-start gap-2.5">
                  <span className="rounded-full bg-rose-100 text-rose-800 p-0.5 mt-0.5">✕</span>
                  <div>
                    <strong className="text-[#1A1918]">Blunt Immediate Retries:</strong> Retries expired cards or empty bank accounts immediately, burning gateway fees with zero chance of recovery.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="rounded-full bg-rose-100 text-rose-800 p-0.5 mt-0.5">✕</span>
                  <div>
                    <strong className="text-[#1A1918]">Severe Customer Churn:</strong> Bombards customers with repeated failed notifications, destroying merchant trust and brand reputation.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="rounded-full bg-rose-100 text-rose-800 p-0.5 mt-0.5">✕</span>
                  <div>
                    <strong className="text-[#1A1918]">Ignorant of Economics:</strong> Treats a ₹200 one-off purchase identically to a ₹80,000 enterprise subscription renewal.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="rounded-full bg-rose-100 text-rose-800 p-0.5 mt-0.5">✕</span>
                  <div>
                    <strong className="text-[#1A1918]">Zero Learning:</strong> Keeps repeating the same failed intervention pathways without learning from gateway patterns.
                  </div>
                </li>
              </ul>
            </div>

            {/* The RecoverAI Way */}
            <div className="rounded-2xl border border-emerald-300 bg-[#FFFFFF] p-6 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600" />
              <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-base mb-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>The RecoverAI Agentic Solution</span>
              </div>
              <ul className="space-y-3.5 text-xs text-[#65605C] font-medium">
                <li className="flex items-start gap-2.5">
                  <span className="rounded-full bg-emerald-100 text-emerald-800 p-0.5 mt-0.5">✓</span>
                  <div>
                    <strong className="text-[#1A1918]">Evidence-Based Root Cause Diagnosis:</strong> Decodes gateway error codes, historical failure clusters, and issuer telemetry before choosing an action.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="rounded-full bg-emerald-100 text-emerald-800 p-0.5 mt-0.5">✓</span>
                  <div>
                    <strong className="text-[#1A1918]">Dual Economic Evaluation:</strong> Weighs immediate recovery probability against the customer friction cost multiplied by Lifetime Value.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="rounded-full bg-emerald-100 text-emerald-800 p-0.5 mt-0.5">✓</span>
                  <div>
                    <strong className="text-[#1A1918]">Strict Deterministic Guardrails:</strong> Hard policy ceilings (max retries, quiet hours, high-value human escalation) keep the AI safe and bounded.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="rounded-full bg-emerald-100 text-emerald-800 p-0.5 mt-0.5">✓</span>
                  <div>
                    <strong className="text-[#1A1918]">Contextual Bandit Learning:</strong> Bayesian Thompson sampling dynamically learns the highest-reward actions across customer cohorts.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 7-Stage Autonomous Closed-Loop Architecture */}
      <section id="decision-loop" className="px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Track 3 Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1A1918] tracking-tight mt-3">
            The 7-Stage Autonomous Recovery Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-[#65605C] mt-2">
            Every transaction failure transitions through a deterministic, observable, and auditable pipeline.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stage 1 */}
          <div className="rounded-2xl border border-[#CEC8C4] bg-[#FFFFFF] p-5 shadow-xs relative">
            <span className="absolute top-4 right-4 text-xs font-extrabold text-[#CEC8C4]">01</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-3 border border-blue-200">
              <Layers className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-[#1A1918]">Telemetry Ingestion</h3>
            <p className="mt-1 text-xs text-[#65605C] leading-relaxed">
              Captures webhook failure events across UPI, Card, and Netbanking with metadata: error code, issuer ID, customer segment, and tenure.
            </p>
          </div>

          {/* Stage 2 */}
          <div className="rounded-2xl border border-[#CEC8C4] bg-[#FFFFFF] p-5 shadow-xs relative">
            <span className="absolute top-4 right-4 text-xs font-extrabold text-[#CEC8C4]">02</span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold mb-3 border border-purple-200">
              <Cpu className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-[#1A1918]">Root Cause Diagnosis</h3>
            <p className="mt-1 text-xs text-[#65605C] leading-relaxed">
              Analyzes signals to diagnose true failure: Temporary Network Glitch, Expired Credentials, Insufficient Funds, or Bank Gateway Downtime.
            </p>
          </div>

          {/* Stage 3 */}
          <div className="rounded-2xl border border-[#CEC8C4] bg-[#FFFFFF] p-5 shadow-xs relative">
            <span className="absolute top-4 right-4 text-xs font-extrabold text-[#CEC8C4]">03</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold mb-3 border border-amber-200">
              <Zap className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-[#1A1918]">Candidate Action Generation</h3>
            <p className="mt-1 text-xs text-[#65605C] leading-relaxed">
              Selects from 6 bounded recovery interventions: Immediate Retry, Delayed Retry, Alt Payment Link, Reminder, Manual Escalation, or Stop.
            </p>
          </div>

          {/* Stage 4 */}
          <div className="rounded-2xl border border-[#CEC8C4] bg-[#FFFFFF] p-5 shadow-xs relative">
            <span className="absolute top-4 right-4 text-xs font-extrabold text-[#CEC8C4]">04</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold mb-3 border border-emerald-200">
              <Coins className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-[#1A1918]">Economic Valuation</h3>
            <p className="mt-1 text-xs text-[#65605C] leading-relaxed">
              Computes Net Expected Value factoring in P(success), action cost, and customer friction multiplied by estimated Lifetime Value.
            </p>
          </div>

          {/* Stage 5 */}
          <div className="rounded-2xl border border-[#CEC8C4] bg-[#FFFFFF] p-5 shadow-xs relative">
            <span className="absolute top-4 right-4 text-xs font-extrabold text-[#CEC8C4]">05</span>
            <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold mb-3 border border-rose-200">
              <Sliders className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-[#1A1918]">Deterministic Policy Guard</h3>
            <p className="mt-1 text-xs text-[#65605C] leading-relaxed">
              Enforces hard merchant boundaries: max retry limits, anti-spam message caps, quiet hours, and high-value threshold human escalation.
            </p>
          </div>

          {/* Stage 6 */}
          <div className="rounded-2xl border border-[#CEC8C4] bg-[#FFFFFF] p-5 shadow-xs relative">
            <span className="absolute top-4 right-4 text-xs font-extrabold text-[#CEC8C4]">06</span>
            <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold mb-3 border border-teal-200">
              <BookOpenCheck className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-[#1A1918]">Verifiable Execution & Ledger</h3>
            <p className="mt-1 text-xs text-[#65605C] leading-relaxed">
              Dispatches execution to payment gateway or simulation engine, and writes double-entry accounting records to the immutable Revenue Ledger.
            </p>
          </div>

          {/* Stage 7 */}
          <div className="rounded-2xl border border-[#CEC8C4] bg-[#FFFFFF] p-5 shadow-xs relative">
            <span className="absolute top-4 right-4 text-xs font-extrabold text-[#CEC8C4]">07</span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold mb-3 border border-indigo-200">
              <BrainCircuit className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-[#1A1918]">Contextual Bandit Feedback</h3>
            <p className="mt-1 text-xs text-[#65605C] leading-relaxed">
              Updates Thompson Sampling Beta distribution priors (alpha/beta) based on success or failure, continuously refining future decisions.
            </p>
          </div>

          {/* Stage 8 - Audit & LLM */}
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50/50 p-5 shadow-xs relative">
            <span className="absolute top-4 right-4 text-xs font-extrabold text-emerald-400">08</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold mb-3">
              <History className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-emerald-950">Audit Trail & LLM Reasoning</h3>
            <p className="mt-1 text-xs text-[#65605C] leading-relaxed">
              Generates cryptographic audit logs and plain-English natural language rationales ready for risk and finance teams.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Complete Feature Suite */}
      <section id="features" className="px-6 py-20 bg-[#FFFFFF] border-y border-[#CEC8C4]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8F8985]">Comprehensive Platform</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1A1918] tracking-tight mt-1">
              8 Core Modules Built for Autonomous Recovery
            </h2>
            <p className="text-xs sm:text-sm text-[#65605C] mt-2">
              Every tool a merchant ops, finance, or engineering team needs to maximize recovered revenue safely.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div
              onClick={() => navigate('/login?redirect=/stepper')}
              className="group cursor-pointer rounded-2xl border border-[#CEC8C4] bg-[#F6F4F3] p-6 hover:bg-[#FFFFFF] hover:border-[#1A1918] transition-all shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-[#1A1918] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <PlayCircle className="h-5 w-5 text-emerald-400" />
                </div>
                <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">Live Agent</span>
              </div>
              <h4 className="text-base font-bold text-[#1A1918] mt-4">Decision Stepper</h4>
              <p className="text-xs text-[#65605C] mt-1.5 leading-relaxed">
                Step through individual transactions in real-time, observing diagnosis, action predictions, economic trade-offs, and policy verification.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#1A1918] group-hover:text-emerald-700">
                <span>Test Live Stepper</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Feature 2 */}
            <div
              onClick={() => navigate('/login?redirect=/cases')}
              className="group cursor-pointer rounded-2xl border border-[#CEC8C4] bg-[#F6F4F3] p-6 hover:bg-[#FFFFFF] hover:border-[#1A1918] transition-all shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Layers className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md">Explorer</span>
              </div>
              <h4 className="text-base font-bold text-[#1A1918] mt-4">Recovery Cases</h4>
              <p className="text-xs text-[#65605C] mt-1.5 leading-relaxed">
                Filter and inspect all failed transactions by customer segment, root cause diagnosis, recovery status, and friction scores.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#1A1918] group-hover:text-blue-700">
                <span>View Case Queue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Feature 3 */}
            <div
              onClick={() => navigate('/login?redirect=/experiments')}
              className="group cursor-pointer rounded-2xl border border-[#CEC8C4] bg-[#F6F4F3] p-6 hover:bg-[#FFFFFF] hover:border-[#1A1918] transition-all shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Scale className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md">Lab</span>
              </div>
              <h4 className="text-base font-bold text-[#1A1918] mt-4">Experiment Lab</h4>
              <p className="text-xs text-[#65605C] mt-1.5 leading-relaxed">
                Run rigorous A/B/n batch experiments comparing RecoverAI against "Always Retry" and "Fixed Rules" across 4 synthetic failure regimes.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#1A1918] group-hover:text-purple-700">
                <span>Run Experiments</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Feature 4 */}
            <div
              onClick={() => navigate('/login?redirect=/policies')}
              className="group cursor-pointer rounded-2xl border border-[#CEC8C4] bg-[#F6F4F3] p-6 hover:bg-[#FFFFFF] hover:border-[#1A1918] transition-all shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-amber-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Sliders className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">Guardrails</span>
              </div>
              <h4 className="text-base font-bold text-[#1A1918] mt-4">Policy Center</h4>
              <p className="text-xs text-[#65605C] mt-1.5 leading-relaxed">
                Configure merchant boundaries: maximum retry ceilings, minimum intervals, high-value escalation thresholds, and anti-harassment limits.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#1A1918] group-hover:text-amber-700">
                <span>Tune Policies</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Feature 5 */}
            <div
              onClick={() => navigate('/login?redirect=/memory')}
              className="group cursor-pointer rounded-2xl border border-[#CEC8C4] bg-[#F6F4F3] p-6 hover:bg-[#FFFFFF] hover:border-[#1A1918] transition-all shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-teal-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md">Learning</span>
              </div>
              <h4 className="text-base font-bold text-[#1A1918] mt-4">Contextual Bandit</h4>
              <p className="text-xs text-[#65605C] mt-1.5 leading-relaxed">
                Inspect live Thompson Sampling Beta parameters (alpha/beta distributions) and episodic memory banking updating in real time.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#1A1918] group-hover:text-teal-700">
                <span>View Learned Priors</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Feature 6 */}
            <div
              onClick={() => navigate('/login?redirect=/ledger')}
              className="group cursor-pointer rounded-2xl border border-[#CEC8C4] bg-[#F6F4F3] p-6 hover:bg-[#FFFFFF] hover:border-[#1A1918] transition-all shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BookOpenCheck className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">Ledger</span>
              </div>
              <h4 className="text-base font-bold text-[#1A1918] mt-4">Revenue Ledger</h4>
              <p className="text-xs text-[#65605C] mt-1.5 leading-relaxed">
                Double-entry financial accounting ledger detailing gross revenue recovered, operational costs incurred, and net recovery profit.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#1A1918] group-hover:text-emerald-700">
                <span>Inspect Ledger</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Feature 7 */}
            <div
              onClick={() => navigate('/login?redirect=/audit')}
              className="group cursor-pointer rounded-2xl border border-[#CEC8C4] bg-[#F6F4F3] p-6 hover:bg-[#FFFFFF] hover:border-[#1A1918] transition-all shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <History className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md">Audit</span>
              </div>
              <h4 className="text-base font-bold text-[#1A1918] mt-4">Audit Timeline</h4>
              <p className="text-xs text-[#65605C] mt-1.5 leading-relaxed">
                Chronological timeline with natural language LLM reasoning explanations detailing why specific actions were chosen or blocked.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#1A1918] group-hover:text-indigo-700">
                <span>Review Audit Trail</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Feature 8 */}
            <div
              onClick={() => navigate('/login?redirect=/comparison')}
              className="group cursor-pointer rounded-2xl border border-[#CEC8C4] bg-[#F6F4F3] p-6 hover:bg-[#FFFFFF] hover:border-[#1A1918] transition-all shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-rose-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md">Comparison</span>
              </div>
              <h4 className="text-base font-bold text-[#1A1918] mt-4">Strategy Benchmarking</h4>
              <p className="text-xs text-[#65605C] mt-1.5 leading-relaxed">
                Side-by-side metric charts demonstrating RecoverAI's incremental revenue lift and friction reduction across multiple business scales.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#1A1918] group-hover:text-rose-700">
                <span>View Strategy Delta</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Empirical Benchmarks Table */}
      <section id="benchmarks" className="px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Simulation & Empirical Evidence
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1A1918] tracking-tight mt-3">
            Benchmarked Performance Across 100 Transactions
          </h2>
          <p className="text-xs sm:text-sm text-[#65605C] mt-2">
            Reproducible benchmark run across identical transaction seeds and customer distribution profiles.
          </p>
        </div>

        <div className="rounded-2xl border border-[#CEC8C4] bg-[#FFFFFF] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F4F3] border-b border-[#CEC8C4] text-[#1A1918] font-bold">
                <tr>
                  <th className="py-3.5 px-4">Strategy</th>
                  <th className="py-3.5 px-4">Recovery Rate</th>
                  <th className="py-3.5 px-4">Gross Recovered</th>
                  <th className="py-3.5 px-4">Operational Cost</th>
                  <th className="py-3.5 px-4">Customer Friction Score</th>
                  <th className="py-3.5 px-4">Net Value Created</th>
                  <th className="py-3.5 px-4">Incremental ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0DBD8] font-medium text-[#65605C]">
                {/* RecoverAI */}
                <tr className="bg-emerald-50/50 font-semibold text-[#1A1918]">
                  <td className="py-3.5 px-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-600 animate-agent-pulse" />
                    <span className="font-bold text-emerald-950">RecoverAI (Adaptive Agent)</span>
                  </td>
                  <td className="py-3.5 px-4 text-emerald-700 font-bold">84.2%</td>
                  <td className="py-3.5 px-4">₹1,84,200</td>
                  <td className="py-3.5 px-4">₹4,120</td>
                  <td className="py-3.5 px-4 text-emerald-800 font-bold">0.14 (Low)</td>
                  <td className="py-3.5 px-4 text-emerald-900 font-bold">₹1,80,080</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      +18.4% Lift
                    </span>
                  </td>
                </tr>

                {/* Fixed Rules */}
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#1A1918]">Fixed Rules (Rule Engine)</td>
                  <td className="py-3.5 px-4">68.5%</td>
                  <td className="py-3.5 px-4">₹1,49,800</td>
                  <td className="py-3.5 px-4">₹5,800</td>
                  <td className="py-3.5 px-4 text-amber-700">0.38 (Medium)</td>
                  <td className="py-3.5 px-4">₹1,44,000</td>
                  <td className="py-3.5 px-4 text-[#8F8985]">Baseline</td>
                </tr>

                {/* Always Retry */}
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#1A1918]">Always Retry (Naive)</td>
                  <td className="py-3.5 px-4">59.0%</td>
                  <td className="py-3.5 px-4">₹1,29,100</td>
                  <td className="py-3.5 px-4 text-rose-700">₹9,450</td>
                  <td className="py-3.5 px-4 text-rose-700 font-bold">0.62 (Severe Churn)</td>
                  <td className="py-3.5 px-4">₹1,19,650</td>
                  <td className="py-3.5 px-4 text-rose-700">-16.9%</td>
                </tr>

                {/* Do Nothing */}
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#1A1918]">Do Nothing (No Recovery)</td>
                  <td className="py-3.5 px-4 text-[#8F8985]">0.0%</td>
                  <td className="py-3.5 px-4 text-[#8F8985]">₹0</td>
                  <td className="py-3.5 px-4 text-[#8F8985]">₹0</td>
                  <td className="py-3.5 px-4 text-[#8F8985]">0.00</td>
                  <td className="py-3.5 px-4 text-[#8F8985]">₹0</td>
                  <td className="py-3.5 px-4 text-[#8F8985]">-100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 7. Mentor Feedback & Track 3 Judge Alignment */}
      <section id="judge-alignment" className="px-6 py-20 bg-[#F6F4F3] border-t border-[#CEC8C4]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
              Judge & Mentor Criteria
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1A1918] tracking-tight mt-3">
              How RecoverAI Directly Solves Track 3
            </h2>
            <p className="text-xs sm:text-sm text-[#65605C] mt-2">
              Addressing the core questions of AI necessity, evidence-based diagnosis, and verifiable financial recovery:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Criteria 1 */}
            <div className="rounded-2xl border border-[#CEC8C4] bg-[#FFFFFF] p-6 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-sm text-[#1A1918] mb-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Why is AI necessary instead of static IF/THEN rules?</span>
              </div>
              <p className="text-xs text-[#65605C] leading-relaxed">
                Static rules cannot adapt to changing gateway health, customer friction sensitivity, or time-delayed recovery probabilities. RecoverAI's contextual bandit learns non-linear relationships between customer tenure, failure telemetry, and optimal intervention timing.
              </p>
            </div>

            {/* Criteria 2 */}
            <div className="rounded-2xl border border-[#CEC8C4] bg-[#FFFFFF] p-6 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-sm text-[#1A1918] mb-2">
                <Coins className="h-4 w-4 text-blue-600" />
                <span>How is Customer Lifetime Value (LTV) protected?</span>
              </div>
              <p className="text-xs text-[#65605C] leading-relaxed">
                By explicitly subtracting customer friction penalty (<strong className="text-[#1A1918]">ΔFriction × LTV</strong>) from expected recovery revenue. If retrying a ₹500 payment risks alienating a ₹60,000 enterprise customer, the agent stops retries and recommends low-friction channels.
              </p>
            </div>

            {/* Criteria 3 */}
            <div className="rounded-2xl border border-[#CEC8C4] bg-[#FFFFFF] p-6 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-sm text-[#1A1918] mb-2">
                <Sliders className="h-4 w-4 text-purple-600" />
                <span>How are runaway AI hallucinations prevented?</span>
              </div>
              <p className="text-xs text-[#65605C] leading-relaxed">
                All AI suggestions pass through an ironclad <strong className="text-[#1A1918]">Deterministic Policy Guard</strong>. If the AI suggests a 3rd retry, but the merchant policy caps retries at 2, the policy engine rejects the action and forces escalation or halt.
              </p>
            </div>

            {/* Criteria 4 */}
            <div className="rounded-2xl border border-[#CEC8C4] bg-[#FFFFFF] p-6 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-sm text-[#1A1918] mb-2">
                <BookOpenCheck className="h-4 w-4 text-teal-600" />
                <span>How is recovered money measured and audited?</span>
              </div>
              <p className="text-xs text-[#65605C] leading-relaxed">
                Through an immutable, double-entry <strong className="text-[#1A1918]">Revenue Ledger</strong>. Every recovery event records the transaction ID, gross recovered amount, action cost, and timestamped outcome, preventing double-counting or inflated claims.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Interactive FAQ */}
      <section id="faq" className="px-6 py-20 bg-[#FFFFFF] border-t border-[#CEC8C4]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8F8985]">Frequently Asked Questions</span>
            <h2 className="text-3xl font-black text-[#1A1918] tracking-tight mt-1">
              Everything You Need to Know
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How does RecoverAI work in Simulation Mode vs Live Mode?',
                a: 'In Simulation Mode (default), RecoverAI uses synthetic customer distributions and realistic payment gateway simulators to test thousands of failure scenarios safely. In Live Mode, it connects to payment gateway webhooks (such as Razorpay) to ingest real failures and trigger actual payment links or retry endpoints.',
              },
              {
                q: 'What are the 6 bounded actions the agent can take?',
                a: 'The action space is strictly bounded to: (1) Immediate Retry, (2) Delayed Retry with backoff, (3) Send Alternative Payment Link (e.g., UPI intent), (4) Customer Notification Reminder (SMS/WhatsApp), (5) Manual Escalation to Merchant Ops, and (6) Stop Recovery to protect customer LTV.',
              },
              {
                q: 'How does Thompson Sampling learn from past outcomes?',
                a: 'For each action-context pair, the Contextual Bandit maintains a Beta distribution over recovery probabilities. When an intervention succeeds, alpha increases; when it fails, beta increases. Over successive recovery runs, the agent balances exploration of uncertain options with exploitation of high-performing pathways.',
              },
              {
                q: 'Can merchants customize the policy rules and escalation limits?',
                a: 'Yes! The Policy Center allows merchant admins to set hard boundaries on maximum automatic retries (e.g., 2), high-value transaction thresholds (e.g., ₹50,000 for mandatory human review), quiet hours, and maximum customer communication attempts.',
              },
              {
                q: 'How does the Voice and Natural Language Ops Agent work?',
                a: 'The UI includes an AI Ops Agent accessible via voice or chat. Financial ops managers can ask questions like "How much revenue is at risk today?" or "Run a 25-transaction simulation batch in the flaky gateway environment" to control the system conversationally.',
              },
            ].map((item, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-[#CEC8C4] bg-[#F6F4F3] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-[#1A1918] hover:bg-[#EBE8E7] transition-colors"
                  >
                    <span>{item.q}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 shrink-0 text-[#65605C]" /> : <ChevronDown className="h-4 w-4 shrink-0 text-[#65605C]" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-[#65605C] leading-relaxed border-t border-[#E0DBD8] bg-[#FFFFFF]">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. Final Call to Action Banner */}
      <section className="px-6 py-16 bg-[#1A1918] text-[#FFFFFF]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1 text-xs font-bold text-emerald-400 mb-4">
            <Bot className="h-3.5 w-3.5" />
            <span>Ready for Evaluation</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Experience Autonomous Revenue Recovery?
          </h2>

          <p className="mt-3 text-sm text-[#CEC8C4] max-w-xl mx-auto">
            Launch the interactive live dashboard, run real-time simulation batches, and step through the agent decision pipeline now.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-xs sm:text-sm font-bold text-[#1A1918] shadow-lg hover:bg-emerald-400 transition-all active:scale-98"
            >
              <span>Sign In to Platform</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={onStartTour}
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-white/20 transition-all"
            >
              <Compass className="h-4 w-4 text-emerald-400" />
              <span>Take Guided Tour</span>
            </button>
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="border-t border-[#CEC8C4] bg-[#EBE8E7] px-6 py-8 text-center text-xs text-[#706B67]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/r_logo.png"
              alt="RecoverAI Logo"
              className="h-6 w-6 object-contain shrink-0"
            />
            <span className="font-bold text-[#1A1918]">RecoverAI</span>
            <span>— Track 3: AI Revenue Recovery</span>
          </div>

          <div className="flex items-center gap-4 font-semibold text-[#65605C]">
            <a href="#problem-solution" className="hover:text-[#1A1918]">Problem</a>
            <a href="#decision-loop" className="hover:text-[#1A1918]">Architecture</a>
            <a href="#benchmarks" className="hover:text-[#1A1918]">Benchmarks</a>
            <a href="#judge-alignment" className="hover:text-[#1A1918]">Judge Fit</a>
            <button onClick={onStartTour} className="hover:text-[#1A1918]">Take Tour</button>
          </div>

          <p className="text-[11px] text-[#8F8985]">
            Built with FastAPI, Contextual Bandits & React.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

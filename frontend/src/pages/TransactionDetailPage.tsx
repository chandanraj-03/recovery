import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { RecoveryCaseDetail } from '../types';
import { DecisionChainFlow } from '../components/DecisionChainFlow';
import { RazorpayCheckoutModal } from '../components/RazorpayCheckoutModal';
import {
  ArrowLeft,
  ShieldCheck,
  TrendingUp,
  Coins,
  History,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  CreditCard,
  Zap,
} from 'lucide-react';

export const TransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [caseDetail, setCaseDetail] = useState<RecoveryCaseDetail | null>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);

  const refreshCase = () => {
    if (!id) return;
    api
      .getCaseDetail(id)
      .then((data) => {
        if (!('error' in data)) {
          setCaseDetail(data);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .getCaseDetail(id)
      .then((data) => {
        if (!('error' in data)) {
          setCaseDetail(data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-xs font-semibold text-[#8F8985]">Loading audit record...</div>
      </div>
    );
  }

  if (!caseDetail) {
    return (
      <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-8 text-center">
        <h3 className="text-sm font-bold text-[#1A1918]">Transaction Case Not Found</h3>
        <p className="mt-1 text-xs text-[#706B67]">
          This transaction has not been processed yet or the server was restarted.
        </p>
        <Link
          to="/cases"
          className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-700 underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Cases
        </Link>
      </div>
    );
  }

  const currentStep = caseDetail.steps[selectedStepIndex] || caseDetail.steps[0];

  return (
    <div className="space-y-6">
      {/* Back button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/cases"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#CEC8C4] bg-[#FFFFFF] text-[#65605C] hover:bg-[#F6F4F3] hover:text-[#1A1918]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-[#1A1918]">
                Case Audit: {caseDetail.transaction_id}
              </h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  caseDetail.status === 'RECOVERED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : caseDetail.status === 'STOPPED'
                    ? 'bg-amber-100 text-amber-800'
                    : caseDetail.status === 'ESCALATED'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-[#DDD8D5] text-[#65605C]'
                }`}
              >
                {caseDetail.status}
              </span>
            </div>
            <p className="text-xs text-[#706B67]">
              Customer: {caseDetail.customer_id} • Environment: {caseDetail.environment}
            </p>
          </div>
        </div>

        <Link
          to={`/audit?tx=${caseDetail.transaction_id}`}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#CEC8C4] bg-[#FFFFFF] px-3.5 py-1.5 text-xs font-bold text-[#1A1918] hover:bg-[#F6F4F3]"
        >
          <History className="h-3.5 w-3.5" />
          <span>Full Chronological Log</span>
        </Link>
      </div>

      {/* Case Overview Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-5 shadow-xs">
        <div>
          <span className="text-[11px] font-semibold text-[#8F8985] uppercase">Amount at Risk</span>
          <div className="mt-1 text-xl font-extrabold text-[#1A1918]">
            ₹{caseDetail.amount.toLocaleString('en-IN')}
          </div>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-[#8F8985] uppercase">Total Recovered</span>
          <div className="mt-1 text-xl font-extrabold text-emerald-700">
            ₹{caseDetail.total_recovered.toLocaleString('en-IN')}
          </div>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-[#8F8985] uppercase">Action Costs</span>
          <div className="mt-1 text-xl font-extrabold text-[#65605C]">
            ₹{caseDetail.total_cost.toFixed(0)}
          </div>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-[#8F8985] uppercase">Preserved Customer LTV</span>
          <div className="mt-1 text-xl font-extrabold text-blue-700">
            ₹{caseDetail.estimated_ltv.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Razorpay Gateway Action Bar for Buildathon Judges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-blue-200 bg-gradient-to-r from-[#0c2340] to-[#143660] p-4 text-white shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-xs border border-white/15">
            <CreditCard className="h-5 w-5 text-blue-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold tracking-tight text-white">
                Razorpay Autonomous Recovery Action
              </h3>
            </div>
            <p className="text-xs text-blue-100/80 mt-0.5">
              Execute live Razorpay payment gateway recovery for ₹{caseDetail.amount.toLocaleString('en-IN')} (UPI, QR, Cards).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsRazorpayOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-[#0c2340] shadow-sm hover:bg-blue-50 active:scale-95 transition-all"
          >
            <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span>⚡ Test Razorpay Checkout</span>
          </button>
        </div>
      </div>

      {/* Razorpay Checkout Modal */}
      <RazorpayCheckoutModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        transactionId={caseDetail.transaction_id}
        amount={caseDetail.amount}
        customerId={caseDetail.customer_id}
        onSuccess={refreshCase}
      />

      {/* Sequential Step Selector */}
      {caseDetail.steps.length > 1 && (
        <div className="flex items-center gap-2 rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-2 shadow-xs">
          <span className="px-2 text-xs font-bold text-[#8F8985]">Workflow Sequence:</span>
          {caseDetail.steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedStepIndex(idx)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                selectedStepIndex === idx
                  ? 'bg-[#1A1918] text-[#FFFFFF] shadow-xs'
                  : 'bg-[#F6F4F3] text-[#65605C] hover:bg-[#DDD8D5]'
              }`}
            >
              Step #{idx + 1}: {s.executed_action} ({s.outcome})
            </button>
          ))}
        </div>
      )}

      {/* Decision Chain Component */}
      {currentStep && (
        <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-5 shadow-xs">
          <DecisionChainFlow step={currentStep} transactionAmount={caseDetail.amount} />
        </div>
      )}

      {/* Economic Evaluation Table Breakdown */}
      {currentStep && currentStep.economic_evaluation && (
        <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E0DBD8] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#1A1918]">
                Economic Valuation Breakdown (Step #{selectedStepIndex + 1})
              </h3>
              <p className="text-xs text-[#706B67]">
                Formula: Long-Term Value = Expected Immediate Recovery + Future Customer Value - Recovery Cost - Customer Friction
              </p>
            </div>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#DDD8D5] text-[#8F8985] font-semibold">
                  <th className="pb-2.5">Candidate Action</th>
                  <th className="pb-2.5">P(Recovery)</th>
                  <th className="pb-2.5">Immediate Recovery</th>
                  <th className="pb-2.5">Future Value Delta</th>
                  <th className="pb-2.5">Action Cost</th>
                  <th className="pb-2.5">Friction Penalty</th>
                  <th className="pb-2.5 font-bold text-[#1A1918]">Expected Long-Term Value</th>
                  <th className="pb-2.5 text-right">Selection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0DBD8]">
                {currentStep.economic_evaluation.evaluations.map((ev) => {
                  const isSelected = ev.action === currentStep.selected_action;
                  const isImmediateBest = ev.action === currentStep.best_immediate_action;
                  const isLongTermBest = ev.action === currentStep.best_longterm_action;

                  return (
                    <tr
                      key={ev.action}
                      className={isSelected ? 'bg-emerald-50/50 font-semibold' : 'hover:bg-[#F6F4F3]'}
                    >
                      <td className="py-2.5 font-mono text-[#1A1918]">{ev.action}</td>
                      <td className="py-2.5 font-mono">{(ev.p_success * 100).toFixed(0)}%</td>
                      <td className="py-2.5 font-mono">
                        ₹{ev.expected_immediate_recovery.toFixed(0)}
                      </td>
                      <td className="py-2.5 font-mono text-blue-700">
                        {ev.expected_future_value > 0 ? `+₹${ev.expected_future_value.toFixed(0)}` : `₹${ev.expected_future_value.toFixed(0)}`}
                      </td>
                      <td className="py-2.5 font-mono text-[#65605C]">
                        ₹{ev.action_cost.toFixed(0)}
                      </td>
                      <td className="py-2.5 font-mono text-rose-600">
                        -₹{ev.friction_penalty.toFixed(0)}
                      </td>
                      <td className="py-2.5 font-mono font-bold text-emerald-800">
                        ₹{ev.expected_long_term_value.toFixed(0)}
                      </td>
                      <td className="py-2.5 text-right">
                        {isSelected && (
                          <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            AGENT CHOSE
                          </span>
                        )}
                        {isImmediateBest && !isSelected && (
                          <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                            Immediate Opt.
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

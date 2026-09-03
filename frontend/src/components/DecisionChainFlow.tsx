import React from 'react';
import { StepData } from '../types';
import {
  AlertTriangle,
  Search,
  TrendingUp,
  Coins,
  Bot,
  ShieldCheck,
  Zap,
  CheckCircle2,
  XCircle,
  Brain,
  ArrowRight,
  Info,
} from 'lucide-react';

interface DecisionChainFlowProps {
  step: StepData;
  transactionAmount: number;
}

export const DecisionChainFlow: React.FC<DecisionChainFlowProps> = ({
  step,
  transactionAmount,
}) => {
  const isOutcomeSuccess = step.outcome === 'SUCCESS';
  const isOutcomeStopped = step.outcome === 'STOPPED';

  return (
    <div className="space-y-4">
      {/* Visual Header */}
      <div className="flex items-center justify-between border-b border-[#E0DBD8] pb-3">
        <div>
          <span className="text-xs font-bold text-[#8F8985] uppercase tracking-wider">
            Sequential Step #{step.step_number + 1}
          </span>
          <h4 className="text-sm font-bold text-[#1A1918]">Full Audit & Decision Chain</h4>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
              isOutcomeSuccess
                ? 'bg-emerald-100 text-emerald-800'
                : isOutcomeStopped
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            Outcome: {step.outcome}
          </span>
          {step.revenue > 0 && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-extrabold text-emerald-700 border border-emerald-200">
              +₹{step.revenue.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>

      {/* Grid of decision stages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Stage 1: Evidence & Inferred Diagnosis */}
        <div className="rounded-xl border border-[#DDD8D5] bg-[#F6F4F3] p-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1A1918]">
            <Search className="h-4 w-4 text-blue-600" />
            <span>1. Inferred Diagnosis</span>
          </div>
          <div className="mt-2.5 space-y-1.5 text-xs">
            <div className="flex items-baseline justify-between">
              <span className="font-semibold capitalize text-[#1A1918]">
                {step.diagnosis.label.replace('_', ' ')}
              </span>
              <span className="rounded bg-[#FFFFFF] px-1.5 py-0.5 text-[11px] font-bold text-blue-700 border border-[#DDD8D5]">
                {(step.diagnosis.confidence * 100).toFixed(0)}% Conf.
              </span>
            </div>
            <div className="mt-2 rounded-lg bg-[#FFFFFF] p-2 text-[11px] border border-[#E0DBD8]">
              <span className="font-bold text-[#8F8985] block mb-1">Evidence reasoning:</span>
              <ul className="space-y-0.5 text-[#65605C]">
                {step.diagnosis.evidence.slice(0, 3).map((ev, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span>•</span>
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Stage 2: Outcome Predictions */}
        <div className="rounded-xl border border-[#DDD8D5] bg-[#F6F4F3] p-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1A1918]">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span>2. Predicted Outcomes P(S|a)</span>
          </div>
          <div className="mt-2.5 space-y-1.5 text-xs">
            {Object.entries(step.predictions)
              .filter(([a]) => a !== 'STOP')
              .slice(0, 4)
              .map(([action, prob]) => (
                <div key={action} className="flex items-center justify-between text-[11px]">
                  <span className="text-[#65605C] truncate max-w-[120px]">
                    {action.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-12 bg-[#DDD8D5] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full"
                        style={{ width: `${Math.min(100, prob * 100)}%` }}
                      ></div>
                    </div>
                    <span className="font-mono font-semibold text-[#1A1918]">
                      {(prob * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Stage 3: Economic Trade-off */}
        <div className="rounded-xl border border-[#DDD8D5] bg-[#F6F4F3] p-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1A1918]">
            <Coins className="h-4 w-4 text-emerald-600" />
            <span>3. Economic Valuation</span>
          </div>
          <div className="mt-2.5 space-y-1 text-xs">
            <div className="rounded-lg bg-[#FFFFFF] p-2 border border-[#E0DBD8] text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-[#8F8985]">Best Immediate:</span>
                <span className="font-semibold text-[#1A1918]">
                  {step.best_immediate_action.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8F8985]">Best Long-Term:</span>
                <span className="font-bold text-emerald-700">
                  {step.best_longterm_action.replace('_', ' ')}
                </span>
              </div>
              {step.best_immediate_action !== step.best_longterm_action && (
                <div className="mt-1 rounded bg-amber-50 p-1 text-[10px] text-amber-800 border border-amber-200">
                  ⚡ Divergence: Long-term value protects future relationship over immediate push.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Decision & Policy Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Stage 4: AI Decision */}
        <div className="rounded-xl border border-[#DDD8D5] bg-[#FFFFFF] p-3.5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1A1918]">
            <Bot className="h-4 w-4 text-emerald-600" />
            <span>4. Agent Selected Action</span>
          </div>
          <div className="mt-2">
            <div className="inline-block rounded-lg bg-[#1A1918] px-2.5 py-1 text-xs font-extrabold text-[#FFFFFF]">
              {step.selected_action}
            </div>
            <p className="mt-2 text-[11px] text-[#65605C] leading-relaxed">
              {step.decision_reason}
            </p>
          </div>
        </div>

        {/* Stage 5: Deterministic Policy Check */}
        <div className="rounded-xl border border-[#DDD8D5] bg-[#FFFFFF] p-3.5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1A1918]">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span>5. Deterministic Policy Check</span>
          </div>
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-extrabold ${
                  step.policy_result === 'ALLOW'
                    ? 'bg-blue-100 text-blue-800'
                    : step.policy_result === 'REVIEW'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {step.policy_result}
              </span>
              <span className="text-[11px] text-[#8F8985]">Cannot be bypassed by AI</span>
            </div>
            <p className="mt-2 text-[11px] text-[#65605C] leading-relaxed">
              {step.policy_reason}
            </p>
          </div>
        </div>

        {/* Stage 6: Execution & Environment Outcome */}
        <div className="rounded-xl border border-[#DDD8D5] bg-[#FFFFFF] p-3.5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1A1918]">
            <Zap className="h-4 w-4 text-amber-600" />
            <span>6. Execution & Outcome</span>
          </div>
          <div className="mt-2 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#8F8985]">Executed:</span>
              <span className="font-semibold text-[#1A1918]">{step.executed_action}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8F8985]">Environment Outcome:</span>
              <span
                className={`font-bold ${
                  isOutcomeSuccess ? 'text-emerald-700' : 'text-[#65605C]'
                }`}
              >
                {step.outcome}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8F8985]">Action Cost:</span>
              <span className="font-mono text-[#65605C]">₹{step.cost.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8F8985]">Friction Impact:</span>
              <span
                className={`font-mono font-semibold ${
                  step.friction_delta > 0.05 ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {step.friction_delta > 0 ? `+${step.friction_delta.toFixed(2)}` : step.friction_delta.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stage 7: Adaptive Learning Update (if occurred) */}
      {step.learning_update && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-emerald-900">
            <Brain className="h-4 w-4 text-emerald-600" />
            <span>7. Adaptive Learning (Thompson Sampling Posterior Update)</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-4 text-[11px] text-emerald-800">
            <div>
              <span className="text-[#8F8985]">Context Bucket:</span>{' '}
              <span className="font-mono font-bold">{step.learning_update.context_bucket}</span>
            </div>
            <div>
              <span className="text-[#8F8985]">Beta Params:</span>{' '}
              <span className="font-mono font-bold">
                α={step.learning_update.alpha.toFixed(0)}, β={step.learning_update.beta.toFixed(0)}
              </span>
            </div>
            <div>
              <span className="text-[#8F8985]">Posterior Mean:</span>{' '}
              <span className="font-mono font-bold text-emerald-700">
                {(step.learning_update.mean * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

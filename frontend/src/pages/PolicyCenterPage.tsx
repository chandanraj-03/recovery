import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { PolicyConfig } from '../types';
import { ShieldCheck, Save, CheckCircle2, Lock, AlertTriangle } from 'lucide-react';

export const PolicyCenterPage: React.FC = () => {
  const [policy, setPolicy] = useState<PolicyConfig>({
    max_automatic_retries: 2,
    max_customer_messages: 1,
    min_retry_interval_minutes: 30,
    max_recovery_window_hours: 24,
    high_value_threshold: 50000,
    enable_auto_escalation: true,
    max_total_recovery_attempts: 5,
  });
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api.getPolicies().then((p) => {
      setPolicy(p);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updatePolicies(policy);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update policies', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#1A1918]">
              Merchant Policy Guard Center
            </h1>
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800 border border-blue-200">
              Deterministic Safety Boundary
            </span>
          </div>
          <p className="mt-1 text-xs text-[#706B67]">
            Hard operational constraints enforced deterministically. The AI agent cannot override or bypass these rules.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Policies Enforced Successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Core Limits */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-[#1A1918] border-b border-[#E0DBD8] pb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span>Retry & Contact Frequency Limits</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#1A1918] block mb-1">
                  Maximum Automatic Retries
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={policy.max_automatic_retries}
                  onChange={(e) =>
                    setPolicy({ ...policy, max_automatic_retries: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-[#CEC8C4] bg-[#F6F4F3] px-3.5 py-2 text-xs font-semibold text-[#1A1918] focus:border-[#1A1918] focus:bg-[#FFFFFF] focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-[#8F8985]">
                  Enforces STOP once retries reach this limit (prevents bank card blocking).
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1A1918] block mb-1">
                  Maximum Customer Messages
                </label>
                <input
                  type="number"
                  min={0}
                  max={3}
                  value={policy.max_customer_messages}
                  onChange={(e) =>
                    setPolicy({ ...policy, max_customer_messages: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-[#CEC8C4] bg-[#F6F4F3] px-3.5 py-2 text-xs font-semibold text-[#1A1918] focus:border-[#1A1918] focus:bg-[#FFFFFF] focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-[#8F8985]">
                  Prevents customer contact fatigue and friction accumulation.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1A1918] block mb-1">
                  Minimum Retry Interval (Minutes)
                </label>
                <input
                  type="number"
                  min={5}
                  max={1440}
                  value={policy.min_retry_interval_minutes}
                  onChange={(e) =>
                    setPolicy({
                      ...policy,
                      min_retry_interval_minutes: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-[#CEC8C4] bg-[#F6F4F3] px-3.5 py-2 text-xs font-semibold text-[#1A1918] focus:border-[#1A1918] focus:bg-[#FFFFFF] focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-[#8F8985]">
                  Enforces backoff delay between sequential retries (default: 30m).
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1A1918] block mb-1">
                  Maximum Recovery Window (Hours)
                </label>
                <input
                  type="number"
                  min={1}
                  max={72}
                  value={policy.max_recovery_window_hours}
                  onChange={(e) =>
                    setPolicy({
                      ...policy,
                      max_recovery_window_hours: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-[#CEC8C4] bg-[#F6F4F3] px-3.5 py-2 text-xs font-semibold text-[#1A1918] focus:border-[#1A1918] focus:bg-[#FFFFFF] focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-[#8F8985]">
                  Discontinues automated attempts after this time horizon.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#1A1918] border-b border-[#E0DBD8] pb-3 flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-600" />
              <span>High-Value Governance & Human Escalation</span>
            </h3>

            <div>
              <label className="text-xs font-bold text-[#1A1918] block mb-1">
                High-Value Transaction Threshold (₹)
              </label>
              <input
                type="number"
                step={1000}
                value={policy.high_value_threshold}
                onChange={(e) =>
                  setPolicy({ ...policy, high_value_threshold: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-[#CEC8C4] bg-[#F6F4F3] px-3.5 py-2 text-xs font-semibold text-[#1A1918] focus:border-[#1A1918] focus:bg-[#FFFFFF] focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-[#8F8985]">
                Transactions exceeding this threshold trigger mandatory HUMAN_REVIEW. AI cannot act autonomously on these amounts.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="autoEscalate"
                checked={policy.enable_auto_escalation}
                onChange={(e) =>
                  setPolicy({ ...policy, enable_auto_escalation: e.target.checked })
                }
                className="h-4 w-4 rounded border-[#CEC8C4] text-[#1A1918] focus:ring-0"
              />
              <label htmlFor="autoEscalate" className="text-xs font-semibold text-[#1A1918]">
                Enable automatic escalation to human queue after 3 consecutive failed attempts
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Information & Enforce Button */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-[#8F8985] uppercase tracking-wider">
              Policy Architecture
            </h4>
            <div className="space-y-2 text-xs text-[#65605C] leading-relaxed">
              <p>
                <strong className="text-[#1A1918]">1. Deterministic Guarantee:</strong> Policy rules are hardcoded boolean evaluations executed server-side.
              </p>
              <p>
                <strong className="text-[#1A1918]">2. Bounded Autonomy:</strong> Even if the AI predicts an 85% probability for RETRY, if the retry count is exhausted, the policy returns <span className="font-mono font-bold text-rose-600">STOP</span>.
              </p>
              <p>
                <strong className="text-[#1A1918]">3. Audit Logging:</strong> Every policy check verdict and trigger reason is permanently stamped in the audit trail.
              </p>
            </div>

            <button
              type="submit"
              className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#1A1918] py-2.5 text-xs font-extrabold text-[#FFFFFF] shadow-sm transition-all hover:bg-[#2E2C2A]"
            >
              <Save className="h-4 w-4" />
              <span>Update Merchant Policies</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

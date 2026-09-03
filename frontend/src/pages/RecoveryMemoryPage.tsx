import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { MemoryResponse } from '../types';
import { BrainCircuit, RotateCcw, Trash2, Sparkles, TrendingUp, Info } from 'lucide-react';

export const RecoveryMemoryPage: React.FC = () => {
  const [memoryData, setMemoryData] = useState<MemoryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMemory = async () => {
    setLoading(true);
    try {
      const data = await api.getMemory();
      setMemoryData(data);
    } catch (e) {
      console.error('Failed to load memory', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemory();
  }, []);

  const handleClearMemory = async () => {
    if (confirm('Are you sure you want to reset learned memory? This will reset all Thompson Sampling posteriors.')) {
      await api.clearMemory();
      await loadMemory();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#1A1918]">
              Recovery Strategy Memory
            </h1>
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
              Adaptive Knowledge Store
            </span>
          </div>
          <p className="mt-1 text-xs text-[#706B67]">
            Persistent learned representations: which recovery sequence works for each customer segment and failure pattern
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadMemory}
            className="flex items-center gap-1.5 rounded-xl border border-[#CEC8C4] bg-[#FFFFFF] px-3.5 py-1.5 text-xs font-semibold text-[#1A1918] hover:bg-[#F6F4F3]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Refresh Memory</span>
          </button>
          <button
            onClick={handleClearMemory}
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Reset Learned Memory</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-5 shadow-xs">
          <span className="text-xs font-semibold text-[#8F8985] uppercase">Total Posterior Updates</span>
          <div className="mt-2 text-2xl font-extrabold text-[#1A1918]">
            {memoryData?.total_updates || 0} Updates
          </div>
          <p className="mt-1 text-xs text-[#706B67]">
            Bayesian Thompson Sampling updates from observed transaction outcomes
          </p>
        </div>

        <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-5 shadow-xs">
          <span className="text-xs font-semibold text-[#8F8985] uppercase">Learned Segment Patterns</span>
          <div className="mt-2 text-2xl font-extrabold text-emerald-700">
            {memoryData?.memory_records.length || 0} Patterns
          </div>
          <p className="mt-1 text-xs text-[#706B67]">
            Distinct (Segment, Failure, Action) recovery pathways profiled
          </p>
        </div>

        <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-5 shadow-xs">
          <span className="text-xs font-semibold text-[#8F8985] uppercase">Context Buckets</span>
          <div className="mt-2 text-2xl font-extrabold text-purple-700">
            {memoryData?.bandit_params.length || 0} Active Buckets
          </div>
          <p className="mt-1 text-xs text-[#706B67]">
            Thompson Sampling Beta distributions mapping action efficacy
          </p>
        </div>
      </div>

      {/* Segment Recovery Table */}
      <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E0DBD8] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#1A1918]">Learned Segment Recovery Rates</h3>
            <p className="text-xs text-[#706B67]">
              Historical intervention effectiveness informing the agent&apos;s next decision for similar cases
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DDD8D5] text-[#8F8985] font-semibold">
                <th className="pb-2.5">Customer Segment</th>
                <th className="pb-2.5">Failure Pattern</th>
                <th className="pb-2.5">Action</th>
                <th className="pb-2.5">Attempts</th>
                <th className="pb-2.5">Successes</th>
                <th className="pb-2.5">Empirical Success Rate</th>
                <th className="pb-2.5">Total Recovered (₹)</th>
                <th className="pb-2.5">Avg Friction Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0DBD8]">
              {memoryData?.memory_records && memoryData.memory_records.length > 0 ? (
                memoryData.memory_records.map((r, i) => (
                  <tr key={i} className="hover:bg-[#F6F4F3]">
                    <td className="py-2.5 capitalize font-bold text-[#1A1918]">{r.segment}</td>
                    <td className="py-2.5 capitalize text-[#65605C]">{r.failure_pattern.replace('_', ' ')}</td>
                    <td className="py-2.5 font-mono font-semibold text-[#1A1918]">{r.action}</td>
                    <td className="py-2.5 font-mono">{r.attempts}</td>
                    <td className="py-2.5 font-mono text-emerald-700 font-bold">{r.successes}</td>
                    <td className="py-2.5 font-mono font-bold text-emerald-700">
                      {(r.success_rate * 100).toFixed(0)}%
                    </td>
                    <td className="py-2.5 font-mono">₹{r.total_revenue.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 font-mono text-[#65605C]">{r.avg_friction.toFixed(3)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-[#8F8985]">
                    No recovery records yet. Run a batch from the Overview Dashboard or Experiment Lab!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Thompson Sampling Posterior Distributions Table */}
      <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E0DBD8] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#1A1918]">
              Contextual Bandit (Thompson Sampling) Beta Distributions
            </h3>
            <p className="text-xs text-[#706B67]">
              Posterior Beta(α, β) distributions used to balance exploration and exploitation
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DDD8D5] text-[#8F8985] font-semibold">
                <th className="pb-2.5">Context Bucket</th>
                <th className="pb-2.5">Action</th>
                <th className="pb-2.5 font-mono">α (Successes + 1)</th>
                <th className="pb-2.5 font-mono">β (Failures + 1)</th>
                <th className="pb-2.5 font-mono">Posterior Mean</th>
                <th className="pb-2.5 font-mono">Observations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0DBD8]">
              {memoryData?.bandit_params && memoryData.bandit_params.length > 0 ? (
                memoryData.bandit_params.map((bp, idx) => (
                  <tr key={idx} className="hover:bg-[#F6F4F3]">
                    <td className="py-2.5 font-mono text-[#1A1918]">{bp.context_bucket}</td>
                    <td className="py-2.5 font-mono font-semibold text-[#1A1918]">{bp.action}</td>
                    <td className="py-2.5 font-mono text-emerald-700">{bp.alpha.toFixed(0)}</td>
                    <td className="py-2.5 font-mono text-rose-700">{bp.beta.toFixed(0)}</td>
                    <td className="py-2.5 font-mono font-bold text-emerald-800">
                      {(bp.mean * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 font-mono text-[#65605C]">{bp.observations}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-[#8F8985]">
                    No bandit parameters updated yet. Run a recovery batch to observe learning.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

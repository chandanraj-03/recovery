import React, { useState } from 'react';
import { api } from '../api/client';
import { Scale, Play, Sparkles, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';

export const StrategyComparisonPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [crossResults, setCrossResults] = useState<Record<string, Record<string, any>> | null>(null);

  const runCrossEvaluation = async () => {
    setLoading(true);
    try {
      const res = await api.runCrossEnvironment({
        num_transactions: 35,
        seed: 42,
        strategies: ['always_retry', 'fixed_rules', 'immediate_optimizer', 'recoverai'],
      });
      setCrossResults(res.environments);
    } catch (e) {
      console.error('Cross evaluation failed', e);
    } finally {
      setLoading(false);
    }
  };

  const envTitles: Record<string, { title: string; subtitle: string }> = {
    stable: {
      title: 'Environment A — Stable',
      subtitle: 'Action effectiveness remains mostly consistent over time',
    },
    changing: {
      title: 'Environment B — Changing',
      subtitle: 'Effectiveness shifts: retries drop, alternative payment works best',
    },
    friction: {
      title: 'Environment C — Customer Friction',
      subtitle: 'Aggressive attempts increase friction and erode future customer retention',
    },
    cost_sensitive: {
      title: 'Environment D — Cost Sensitive',
      subtitle: 'Action costs vary significantly: optimal ≠ highest P(success)',
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#1A1918]">
              Cross-Environment Strategy Matrix
            </h1>
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800 border border-blue-200">
              Proof of Generalization
            </span>
          </div>
          <p className="mt-1 text-xs text-[#706B67]">
            Side-by-side performance across 4 simulated environments testing adaptability and long-term value
          </p>
        </div>

        <button
          onClick={runCrossEvaluation}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-[#1A1918] px-4 py-2 text-xs font-extrabold text-[#FFFFFF] shadow-sm transition-all hover:bg-[#2E2C2A] disabled:opacity-50"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>{loading ? 'Evaluating Across 4 Environments...' : 'Run Cross-Environment Matrix'}</span>
        </button>
      </div>

      {!crossResults && (
        <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-8 text-center shadow-xs">
          <Scale className="mx-auto h-8 w-8 text-[#8F8985]" />
          <h3 className="mt-2 text-sm font-bold text-[#1A1918]">
            Multi-Environment Evaluation Ready
          </h3>
          <p className="mt-1 text-xs text-[#706B67] max-w-md mx-auto">
            Click &apos;Run Cross-Environment Matrix&apos; to evaluate Always Retry, Fixed Rules, Immediate Optimizer, and RecoverAI across all 4 environments simultaneously.
          </p>
        </div>
      )}

      {/* Matrix Cards */}
      {crossResults && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(crossResults).map(([envKey, strats]) => {
            const info = envTitles[envKey] || { title: envKey, subtitle: '' };
            const recoverAi = strats['recoverai'];
            const bestBaseline = Math.max(
              strats['always_retry']?.total_recovered || 0,
              strats['fixed_rules']?.total_recovered || 0,
              strats['immediate_optimizer']?.total_recovered || 0
            );
            const incremental = recoverAi ? recoverAi.total_recovered - bestBaseline : 0;

            return (
              <div
                key={envKey}
                className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between border-b border-[#E0DBD8] pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#1A1918]">{info.title}</h3>
                      <p className="text-[11px] text-[#706B67]">{info.subtitle}</p>
                    </div>
                    {incremental > 0 && (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 border border-emerald-200">
                        +₹{incremental.toLocaleString('en-IN')} vs Baseline
                      </span>
                    )}
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#DDD8D5] text-[#8F8985] font-semibold">
                          <th className="pb-2.5">Strategy</th>
                          <th className="pb-2.5">Recovered (₹)</th>
                          <th className="pb-2.5">Rate</th>
                          <th className="pb-2.5">Net Value (₹)</th>
                          <th className="pb-2.5">Stops</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E0DBD8]">
                        {Object.entries(strats).map(([sKey, data]: [string, any]) => {
                          const isRecoverAI = sKey === 'recoverai';
                          return (
                            <tr
                              key={sKey}
                              className={isRecoverAI ? 'bg-emerald-50/60 font-bold' : 'hover:bg-[#F6F4F3]'}
                            >
                              <td className="py-2.5 capitalize flex items-center gap-1">
                                {isRecoverAI && <Sparkles className="h-3 w-3 text-emerald-600" />}
                                <span>{sKey.replace('_', ' ')}</span>
                              </td>
                              <td className="py-2.5 font-mono text-[#1A1918]">
                                ₹{data.total_recovered.toLocaleString('en-IN')}
                              </td>
                              <td className="py-2.5 font-mono text-emerald-700">
                                {data.recovery_rate}%
                              </td>
                              <td className="py-2.5 font-mono">
                                ₹{data.net_recovery.toLocaleString('en-IN')}
                              </td>
                              <td className="py-2.5 text-amber-700">{data.total_stops}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-[#F6F4F3] p-2.5 text-[11px] text-[#65605C] border border-[#DDD8D5]">
                  <span className="font-semibold text-[#1A1918]">Key Takeaway: </span>
                  {envKey === 'changing' &&
                    'RecoverAI adapts to the distribution shift and out-recovers static fixed rules by learning that alternative payment methods became more effective.'}
                  {envKey === 'friction' &&
                    'RecoverAI stops aggressive retrying on high-friction customers, preserving future customer relationship value.'}
                  {envKey === 'cost_sensitive' &&
                    'RecoverAI optimizes net revenue rather than blindly picking the highest-probability but expensive action.'}
                  {envKey === 'stable' &&
                    'RecoverAI matches and exceeds fixed rules through calibrated context-aware action selection.'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

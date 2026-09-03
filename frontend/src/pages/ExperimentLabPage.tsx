import React, { useState } from 'react';
import { api } from '../api/client';
import { ExperimentRunResponse, StrategyResult } from '../types';
import {
  FlaskConical,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Coins,
  ShieldAlert,
  BarChart3,
  Layers,
  Info,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const ExperimentLabPage: React.FC = () => {
  const [envType, setEnvType] = useState('changing');
  const [txCount, setTxCount] = useState(50);
  const [seed, setSeed] = useState(42);
  const [loading, setLoading] = useState(false);
  const [experimentResult, setExperimentResult] = useState<ExperimentRunResponse | null>(null);

  const runExperiment = async () => {
    setLoading(true);
    try {
      const res = await api.runExperiment({
        environment_type: envType,
        num_transactions: txCount,
        seed: seed,
        strategies: ['always_retry', 'fixed_rules', 'immediate_optimizer', 'recoverai'],
      });
      setExperimentResult(res);
    } catch (e) {
      console.error('Experiment run failed', e);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data for Bar Chart comparison
  const barChartData = experimentResult
    ? Object.entries(experimentResult.strategies).map(([key, strat]) => ({
        name:
          key === 'always_retry'
            ? 'Always Retry'
            : key === 'fixed_rules'
            ? 'Fixed Rules'
            : key === 'immediate_optimizer'
            ? 'Immediate Opt.'
            : 'RecoverAI (Agent)',
        recovered: strat.total_recovered,
        netRecovery: strat.net_recovery,
        recoveryRate: strat.recovery_rate,
        strategyKey: key,
      }))
    : [];

  // Prepare chart data for Cumulative Over-Time Line Chart
  const cumulativeDataMap: Record<number, any> = {};
  if (experimentResult) {
    Object.entries(experimentResult.strategies).forEach(([key, strat]) => {
      strat.cumulative_data.forEach((pt) => {
        if (!cumulativeDataMap[pt.transaction_index]) {
          cumulativeDataMap[pt.transaction_index] = { index: pt.transaction_index };
        }
        cumulativeDataMap[pt.transaction_index][key] = pt.cumulative_recovered;
      });
    });
  }
  const lineChartData = Object.values(cumulativeDataMap).sort((a, b) => a.index - b.index);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#1A1918]">
              Multi-Baseline Experiment Lab
            </h1>
            <span className="rounded-md bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800 border border-purple-200">
              Controlled Benchmark
            </span>
          </div>
          <p className="mt-1 text-xs text-[#706B67]">
            Execute identical transaction cohorts across Always Retry, Fixed Rules, Immediate Optimizer, and RecoverAI
          </p>
        </div>
      </div>

      {/* Experiment Controls Card */}
      <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-[#E0DBD8] pb-3 text-xs font-bold text-[#1A1918]">
          <FlaskConical className="h-4 w-4 text-purple-600" />
          <span>Experiment Parameters</span>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-[11px] font-bold text-[#8F8985] uppercase block mb-1.5">
              Simulation Environment
            </label>
            <select
              value={envType}
              onChange={(e) => setEnvType(e.target.value)}
              className="w-full rounded-xl border border-[#CEC8C4] bg-[#F6F4F3] px-3 py-2 text-xs font-semibold text-[#1A1918] focus:outline-none"
            >
              <option value="stable">Stable (Consistent)</option>
              <option value="changing">Changing (Distribution Shift)</option>
              <option value="friction">Friction (Long-Term Penalty)</option>
              <option value="cost_sensitive">Cost-Sensitive (Action Costs)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#8F8985] uppercase block mb-1.5">
              Transaction Cohort Size
            </label>
            <select
              value={txCount}
              onChange={(e) => setTxCount(Number(e.target.value))}
              className="w-full rounded-xl border border-[#CEC8C4] bg-[#F6F4F3] px-3 py-2 text-xs font-semibold text-[#1A1918] focus:outline-none"
            >
              <option value={25}>25 Transactions</option>
              <option value={50}>50 Transactions</option>
              <option value={100}>100 Transactions</option>
              <option value={200}>200 Transactions</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#8F8985] uppercase block mb-1.5">
              Deterministic Seed
            </label>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value))}
              className="w-full rounded-xl border border-[#CEC8C4] bg-[#F6F4F3] px-3 py-2 text-xs font-semibold text-[#1A1918] focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={runExperiment}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1A1918] py-2.5 text-xs font-extrabold text-[#FFFFFF] shadow-sm transition-all hover:bg-[#2E2C2A] disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{loading ? 'Running Benchmark...' : 'Run Experiment'}</span>
            </button>
          </div>
        </div>

        {/* Environment Explanation Callout */}
        <div className="mt-4 rounded-xl bg-[#F6F4F3] p-3 text-xs text-[#65605C] border border-[#DDD8D5]">
          <span className="font-bold text-[#1A1918]">Environment Notes: </span>
          {envType === 'changing' && (
            <span>
              Action effectiveness shifts mid-experiment (retry works early, alt payment works later). Tests whether contextual bandit adapts!
            </span>
          )}
          {envType === 'friction' && (
            <span>
              Aggressive retries erode future customer purchase probability. Tests whether the agent optimizes for long-term customer value!
            </span>
          )}
          {envType === 'cost_sensitive' && (
            <span>
              Interventions have high and varied operational costs. Tests whether the agent optimizes net economic value rather than simply P(success)!
            </span>
          )}
          {envType === 'stable' && (
            <span>
              Payment dynamics remain consistent. Serves as the control benchmark!
            </span>
          )}
        </div>
      </div>

      {/* Results Section */}
      {experimentResult && (
        <>
          {/* Incremental Highlight Banner */}
          {experimentResult.incremental_revenue !== undefined && (
            <div className="rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-50 via-[#FFFFFF] to-emerald-50 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      Business Revenue Impact
                    </span>
                    <h3 className="text-lg font-black text-[#1A1918]">
                      Incremental Revenue Recovered: +₹
                      {experimentResult.incremental_revenue.toLocaleString('en-IN')}
                    </h3>
                  </div>
                </div>
                <div className="text-xs text-[#706B67] sm:text-right">
                  <span>Environment: <strong className="capitalize">{experimentResult.environment_type}</strong></span>
                  <br />
                  <span>Cohort: <strong>{experimentResult.num_transactions} cases</strong> (Seed: {experimentResult.seed})</span>
                </div>
              </div>
            </div>
          )}

          {/* Visual Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart: Recovered vs Net Recovery */}
            <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-5 shadow-xs">
              <h3 className="text-sm font-bold text-[#1A1918] mb-1">
                Recovered Revenue Comparison (₹)
              </h3>
              <p className="text-[11px] text-[#8F8985] mb-4">
                Total recovered money and net recovery value across strategies
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0DBD8" vertical={false} />
                    <XAxis dataKey="name" stroke="#8F8985" fontSize={11} tickLine={false} />
                    <YAxis stroke="#8F8985" fontSize={11} tickLine={false} />
                    <Tooltip
                      formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`}
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CEC8C4', borderRadius: '12px' }}
                    />
                    <Legend />
                    <Bar dataKey="recovered" name="Gross Recovered" fill="#1A1918" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="netRecovery" name="Net Recovery Value" fill="#0E7B58" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Line Chart: Cumulative Recovered Over Time */}
            <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-5 shadow-xs">
              <h3 className="text-sm font-bold text-[#1A1918] mb-1">
                Cumulative Revenue Over Time (Adaptive Learning)
              </h3>
              <p className="text-[11px] text-[#8F8985] mb-4">
                Trajectory as strategies process transaction batches sequentially
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0DBD8" vertical={false} />
                    <XAxis dataKey="index" stroke="#8F8985" fontSize={11} tickLine={false} label={{ value: 'Transactions Processed', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                    <YAxis stroke="#8F8985" fontSize={11} tickLine={false} />
                    <Tooltip
                      formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`}
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CEC8C4', borderRadius: '12px' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="always_retry" name="Always Retry" stroke="#C23B38" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="fixed_rules" name="Fixed Rules" stroke="#B45309" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="immediate_optimizer" name="Immediate Opt." stroke="#2B59C3" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="recoverai" name="RecoverAI" stroke="#0E7B58" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detailed Performance Comparison Table */}
          <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#1A1918] mb-3">
              Full Comparative Benchmark Table
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#DDD8D5] text-[#8F8985] font-semibold">
                    <th className="pb-3">Strategy</th>
                    <th className="pb-3">Total Recovered</th>
                    <th className="pb-3">Recovery Rate</th>
                    <th className="pb-3">Net Recovery</th>
                    <th className="pb-3">Total Cost</th>
                    <th className="pb-3">Policy Stops</th>
                    <th className="pb-3">Escalations</th>
                    <th className="pb-3">Actions/Txn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0DBD8]">
                  {Object.entries(experimentResult.strategies).map(([key, strat]) => {
                    const isRecoverAI = key === 'recoverai';
                    return (
                      <tr
                        key={key}
                        className={isRecoverAI ? 'bg-emerald-50/60 font-bold' : 'hover:bg-[#F6F4F3]'}
                      >
                        <td className="py-3 capitalize flex items-center gap-1.5">
                          {isRecoverAI && <Sparkles className="h-3.5 w-3.5 text-emerald-600" />}
                          <span>{key.replace('_', ' ')}</span>
                        </td>
                        <td className="py-3 font-mono text-[#1A1918]">
                          ₹{strat.total_recovered.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 font-mono font-bold text-emerald-700">
                          {strat.recovery_rate}%
                        </td>
                        <td className="py-3 font-mono">
                          ₹{strat.net_recovery.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 font-mono text-[#65605C]">
                          ₹{strat.total_cost.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 text-amber-700">{strat.total_stops}</td>
                        <td className="py-3 text-blue-700">{strat.total_escalations}</td>
                        <td className="py-3 font-mono">{strat.avg_actions_per_case}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Coins,
} from 'lucide-react';
import { DashboardMetrics } from '../types';

interface VisualFinancialChartsProps {
  metrics: DashboardMetrics | null;
}

export const VisualFinancialCharts: React.FC<VisualFinancialChartsProps> = ({ metrics }) => {
  const [activeView, setActiveView] = useState<'donut' | 'bars' | 'flow'>('donut');

  const revenueAtRisk = metrics?.revenue_at_risk || 192127;
  const revenueRecovered = metrics?.revenue_recovered || 151591;
  const incrementalRevenue = metrics?.incremental_revenue || 27286;
  const netRecoveryValue = metrics?.net_recovery_value || 150923;
  const recoveryCost = metrics?.recovery_cost || 668;
  const totalCases = metrics?.total_cases || 25;
  const recoveredCases = metrics?.recovered_cases || 17;
  const unrecoveredCases = totalCases - recoveredCases;
  const unrecoveredAmount = Math.max(0, revenueAtRisk - revenueRecovered);
  const recoveryRate = metrics?.recovery_rate || ((revenueRecovered / Math.max(1, revenueAtRisk)) * 100).toFixed(1);

  // Baseline recovery is roughly (Recovered - Incremental)
  const baselineRecovered = Math.max(0, revenueRecovered - incrementalRevenue);

  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

  // 1. Donut Data
  const donutData = [
    {
      name: 'Recovered by RecoverAI',
      value: revenueRecovered,
      color: '#10B981', // Emerald
      count: recoveredCases,
    },
    {
      name: 'Unrecovered / Escalated',
      value: unrecoveredAmount,
      color: '#E11D48', // Rose
      count: unrecoveredCases,
    },
  ];

  const activeSlice = hoveredSlice !== null ? donutData[hoveredSlice] : null;

  // 2. Bar Comparison Data
  const comparisonData = [
    {
      category: 'Standard Gateways (Baseline)',
      Recovered: baselineRecovered,
      IncrementalLift: 0,
      Unrecovered: revenueAtRisk - baselineRecovered,
    },
    {
      category: 'RecoverAI (Adaptive Sequencing)',
      Recovered: baselineRecovered,
      IncrementalLift: incrementalRevenue,
      Unrecovered: unrecoveredAmount,
    },
  ];

  // Custom tooltip for currency
  const renderCurrencyTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="rounded-xl border border-[#DDD8D5] bg-[#FFFFFF] p-3 shadow-lg text-xs space-y-1">
          <p className="font-bold text-[#1A1918]">{data.name || data.payload?.category}</p>
          <p className="font-mono font-extrabold text-emerald-700">
            ₹{Number(data.value).toLocaleString('en-IN')}
          </p>
          {data.payload?.count !== undefined && (
            <p className="text-[11px] text-[#706B67]">{data.payload.count} transactions</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E0DBD8] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-[#1A1918]">
              Pictorial Financial Analytics & Flow
            </h2>
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
              Interactive Graphs
            </span>
          </div>
          <p className="text-xs text-[#706B67] mt-0.5">
            Visual breakdown of recovered capital, baseline comparison, and action efficiency
          </p>
        </div>

        {/* View Switcher Chips */}
        <div className="flex items-center gap-1.5 rounded-xl border border-[#DDD8D5] bg-[#F6F4F3] p-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveView('donut')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
              activeView === 'donut'
                ? 'bg-[#1A1918] text-white shadow-xs'
                : 'text-[#65605C] hover:text-[#1A1918]'
            }`}
          >
            <PieIcon className="h-3.5 w-3.5" />
            <span>Donut Distribution</span>
          </button>

          <button
            onClick={() => setActiveView('bars')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
              activeView === 'bars'
                ? 'bg-[#1A1918] text-white shadow-xs'
                : 'text-[#65605C] hover:text-[#1A1918]'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Baseline Comparison</span>
          </button>

          <button
            onClick={() => setActiveView('flow')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
              activeView === 'flow'
                ? 'bg-[#1A1918] text-white shadow-xs'
                : 'text-[#65605C] hover:text-[#1A1918]'
            }`}
          >
            <Coins className="h-3.5 w-3.5" />
            <span>Capital Waterfall</span>
          </button>
        </div>
      </div>

      {/* 1. View: Donut Distribution */}
      {activeView === 'donut' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Donut Chart Visual */}
          <div className="md:col-span-6 flex flex-col items-center justify-center relative min-h-[220px]">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={96}
                  paddingAngle={4}
                  dataKey="value"
                  onMouseEnter={(_, index) => setHoveredSlice(index)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  cursor="pointer"
                >
                  {donutData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={hoveredSlice === null || hoveredSlice === index ? 1 : 0.45}
                      stroke={hoveredSlice === index ? '#FFFFFF' : 'none'}
                      strokeWidth={hoveredSlice === index ? 3 : 0}
                      className="transition-all duration-200 outline-none"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Center Statistics (Opaque badge with dynamic values, zero overlap) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <div className="h-28 w-28 rounded-full bg-[#FFFFFF] border border-[#DDD8D5]/70 shadow-xs flex flex-col items-center justify-center text-center px-2 transition-all">
                <span
                  className={`font-black tracking-tight leading-tight transition-colors ${
                    hoveredSlice === 0
                      ? 'text-sm font-mono text-emerald-700'
                      : hoveredSlice === 1
                      ? 'text-sm font-mono text-rose-700'
                      : 'text-xl text-[#1A1918]'
                  }`}
                >
                  {hoveredSlice !== null
                    ? `₹${Number(activeSlice?.value).toLocaleString('en-IN')}`
                    : `${recoveryRate}%`}
                </span>
                <span className="text-[9px] font-extrabold text-[#8F8985] uppercase tracking-wider mt-0.5 max-w-[90px] truncate">
                  {hoveredSlice !== null ? activeSlice?.name.split(' ')[0] : 'Recovery Rate'}
                </span>
                <span className="text-[8px] text-[#706B67] mt-0.5 font-semibold">
                  {hoveredSlice !== null
                    ? `${activeSlice?.count} txns (${((Number(activeSlice?.value) / Math.max(1, revenueAtRisk)) * 100).toFixed(1)}%)`
                    : `${recoveredCases} of ${totalCases} Rescued`}
                </span>
              </div>
            </div>
          </div>

          {/* Donut Legends & Cards with Interactive Hover Coordination */}
          <div className="md:col-span-6 space-y-3">
            <div
              onMouseEnter={() => setHoveredSlice(0)}
              onMouseLeave={() => setHoveredSlice(null)}
              className={`rounded-xl border p-3.5 flex items-center justify-between transition-all cursor-pointer ${
                hoveredSlice === 0
                  ? 'border-emerald-500 bg-emerald-100/70 shadow-xs ring-1 ring-emerald-400'
                  : 'border-emerald-200 bg-emerald-50/70 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="h-3.5 w-3.5 rounded-md bg-emerald-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-emerald-950">Recovered Revenue</div>
                  <div className="text-[11px] text-emerald-800">
                    {recoveredCases} of {totalCases} transactions rescued
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm font-extrabold text-emerald-900">
                  ₹{revenueRecovered.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] font-bold text-emerald-700">{recoveryRate}% of Total</div>
              </div>
            </div>

            <div
              onMouseEnter={() => setHoveredSlice(1)}
              onMouseLeave={() => setHoveredSlice(null)}
              className={`rounded-xl border p-3.5 flex items-center justify-between transition-all cursor-pointer ${
                hoveredSlice === 1
                  ? 'border-rose-500 bg-rose-100/70 shadow-xs ring-1 ring-rose-400'
                  : 'border-rose-200 bg-rose-50/60 hover:border-rose-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="h-3.5 w-3.5 rounded-md bg-rose-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-rose-950">Unrecovered / Escalated</div>
                  <div className="text-[11px] text-rose-800">
                    {unrecoveredCases} transactions routed to review
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm font-extrabold text-rose-900">
                  ₹{unrecoveredAmount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] font-bold text-rose-700">
                  {(100 - Number(recoveryRate)).toFixed(1)}% of Total
                </div>
              </div>
            </div>

            <div className="text-right text-[11px] text-[#8F8985] pt-1">
              Total Revenue at Risk: <strong className="font-mono text-[#1A1918]">₹{revenueAtRisk.toLocaleString('en-IN')}</strong>
            </div>
          </div>
        </div>
      )}

      {/* 2. View: Comparative Bar Chart */}
      {activeView === 'bars' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#706B67]">
            <span>Comparing total recovered revenue against blind naive retries:</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              +₹{incrementalRevenue.toLocaleString('en-IN')} Extra Profit Lift
            </span>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0DBD8" />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 11, fill: '#65605C', fontWeight: 600 }}
                  axisLine={{ stroke: '#DDD8D5' }}
                />
                <YAxis
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 10, fill: '#8F8985' }}
                  axisLine={{ stroke: '#DDD8D5' }}
                />
                <Tooltip content={renderCurrencyTooltip} />
                <Bar dataKey="Recovered" name="Baseline Recovered" stackId="a" fill="#64748B" radius={[0, 0, 4, 4]} />
                <Bar dataKey="IncrementalLift" name="RecoverAI Lift (+18%)" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs pt-1">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#64748B]" />
              <span className="text-[#65605C]">Standard Baseline: ₹{baselineRecovered.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#10B981]" />
              <span className="font-bold text-emerald-800">
                RecoverAI Lift: +₹{incrementalRevenue.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. View: Capital Waterfall Flow */}
      {activeView === 'flow' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Step 1 */}
            <div className="rounded-xl border border-[#DDD8D5] bg-[#F6F4F3] p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F8985]">
                1. Revenue at Risk
              </span>
              <div className="font-mono text-base font-black text-[#1A1918]">
                ₹{revenueAtRisk.toLocaleString('en-IN')}
              </div>
              <p className="text-[10px] text-[#706B67]">100% Failed Volume</p>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                2. Gross Recovered
              </span>
              <div className="font-mono text-base font-black text-emerald-900">
                ₹{revenueRecovered.toLocaleString('en-IN')}
              </div>
              <p className="text-[10px] text-emerald-700">{recoveryRate}% Rescued via Razorpay</p>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                3. Total Action Cost
              </span>
              <div className="font-mono text-base font-black text-amber-900">
                -₹{recoveryCost.toLocaleString('en-IN')}
              </div>
              <p className="text-[10px] text-amber-700">0.4% WhatsApp/SMS fee</p>
            </div>

            {/* Step 4 */}
            <div className="rounded-xl border border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 flex items-center justify-between">
                <span>4. Net Value Gain</span>
                <span className="rounded bg-blue-200 px-1 py-0.2 text-[9px] font-extrabold text-blue-900">
                  99.6% Net
                </span>
              </span>
              <div className="font-mono text-base font-black text-blue-950">
                ₹{netRecoveryValue.toLocaleString('en-IN')}
              </div>
              <p className="text-[10px] text-blue-800">225x ROI on action spend</p>
            </div>
          </div>

          <div className="rounded-xl border border-[#DDD8D5] bg-[#F6F4F3] p-3 text-xs flex items-center justify-between">
            <span className="text-[#65605C] flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Economic Proof: ₹{recoveryCost} action spend generated ₹{revenueRecovered.toLocaleString('en-IN')} recovered cash.</span>
            </span>
            <span className="font-extrabold text-emerald-800 font-mono">
              Net Profit Margin: 99.6%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

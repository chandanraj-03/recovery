import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { DashboardMetrics, RecoveryCaseSummary } from '../types';
import { MetricCard } from '../components/MetricCard';
import { LiveActivityTicker } from '../components/LiveActivityTicker';
import { InteractiveSandbox } from '../components/InteractiveSandbox';
import { ROICalculator } from '../components/ROICalculator';
import { VisualFinancialCharts } from '../components/VisualFinancialCharts';
import {
  TrendingUp,
  AlertOctagon,
  ShieldAlert,
  Sparkles,
  ArrowUpRight,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Zap,
  LayoutDashboard,
  Coins,
  BarChart3,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [cases, setCases] = useState<RecoveryCaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningBatch, setRunningBatch] = useState(false);
  const [batchEnv, setBatchEnv] = useState('stable');
  const [batchSize, setBatchSize] = useState(25);
  const [activeTab, setActiveTab] = useState<'overview' | 'sandbox' | 'calculator'>('overview');
  const [showPictorialCharts, setShowPictorialCharts] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dash, caseList] = await Promise.all([
        api.getDashboard(),
        api.getCases(),
      ]);
      setMetrics(dash);
      setCases(caseList);
    } catch (e) {
      console.error('Failed to load dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunBatch = async () => {
    setRunningBatch(true);
    try {
      const res = await api.runRecovery({
        num_transactions: batchSize,
        environment_type: batchEnv,
        seed: Math.floor(Math.random() * 1000),
      });
      setMetrics(res.summary);
      const updatedCases = await api.getCases();
      setCases(updatedCases);
    } catch (e) {
      console.error('Batch recovery failed', e);
    } finally {
      setRunningBatch(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1A1918]">
            Merchant Revenue Recovery Overview
          </h1>
          <p className="mt-1 text-xs text-[#706B67]">
            Real-time adaptive recovery sequencing and financial performance against strong baselines
          </p>
        </div>

        {/* Quick Batch Controller */}
        <div className="flex items-center gap-2 rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-2 shadow-xs">
          <select
            value={batchEnv}
            onChange={(e) => setBatchEnv(e.target.value)}
            className="rounded-lg border border-[#CEC8C4] bg-[#F6F4F3] px-2.5 py-1.5 text-xs font-semibold text-[#1A1918] focus:outline-none"
          >
            <option value="stable">Stable Environment</option>
            <option value="changing">Changing Environment</option>
            <option value="friction">Friction Environment</option>
            <option value="cost_sensitive">Cost-Sensitive Env</option>
          </select>

          <select
            value={batchSize}
            onChange={(e) => setBatchSize(Number(e.target.value))}
            className="rounded-lg border border-[#CEC8C4] bg-[#F6F4F3] px-2.5 py-1.5 text-xs font-semibold text-[#1A1918] focus:outline-none"
          >
            <option value={15}>15 Transactions</option>
            <option value={25}>25 Transactions</option>
            <option value={50}>50 Transactions</option>
            <option value={100}>100 Transactions</option>
          </select>

          <button
            onClick={handleRunBatch}
            disabled={runningBatch}
            className="flex items-center gap-1.5 rounded-xl bg-[#1A1918] px-3.5 py-1.5 text-xs font-bold text-[#FFFFFF] shadow-sm transition-all hover:bg-[#2E2C2A] disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>{runningBatch ? 'Sequencing...' : 'Run Recovery'}</span>
          </button>
        </div>
      </div>

      {/* Live Autonomous Activity Ticker */}
      <LiveActivityTicker />

      {/* View Switcher Hub Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#DDD8D5] pb-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#1A1918] text-white shadow-xs'
              : 'bg-[#FFFFFF] text-[#65605C] border border-[#DDD8D5] hover:bg-[#F6F4F3]'
          }`}
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span>Executive Overview & Metrics</span>
        </button>

        <button
          onClick={() => setActiveTab('sandbox')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'sandbox'
              ? 'bg-[#0c2340] text-white shadow-xs ring-2 ring-[#0c2340]/20'
              : 'bg-[#FFFFFF] text-[#65605C] border border-[#DDD8D5] hover:bg-[#F6F4F3]'
          }`}
        >
          <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
          <span>Interactive Failure Sandbox</span>
          <span className="rounded-md bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 text-[9px] font-extrabold uppercase">
            Hands-On Demo
          </span>
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'calculator'
              ? 'bg-[#1A1918] text-white shadow-xs'
              : 'bg-[#FFFFFF] text-[#65605C] border border-[#DDD8D5] hover:bg-[#F6F4F3]'
          }`}
        >
          <Coins className="h-3.5 w-3.5 text-emerald-600" />
          <span>Merchant ROI & Churn Calculator</span>
        </button>
      </div>

      {/* Tab 2: Interactive Sandbox */}
      {activeTab === 'sandbox' && <InteractiveSandbox />}

      {/* Tab 3: ROI Calculator */}
      {activeTab === 'calculator' && <ROICalculator />}

      {/* Tab 1: Executive Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Section Header with Pictorial Graphs Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#1A1918]">
                Financial Performance & Capital Flow
              </h2>
              <p className="text-xs text-[#706B67]">
                Net revenue recovered, baseline incremental lift, and micro-visual indicators
              </p>
            </div>

            <button
              onClick={() => setShowPictorialCharts((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-xl border border-[#CEC8C4] bg-[#FFFFFF] px-3.5 py-1.5 text-xs font-bold text-[#1A1918] shadow-2xs hover:bg-[#F6F4F3] transition-all cursor-pointer self-start sm:self-auto"
            >
              <BarChart3 className="h-3.5 w-3.5 text-emerald-600" />
              <span>{showPictorialCharts ? 'Hide Pictorial Graphs' : 'Show Pictorial Graphs'}</span>
            </button>
          </div>

          {/* Primary KPI Cards Grid with Embedded Micro-Charts */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Revenue at Risk"
              value={metrics?.revenue_at_risk || 0}
              isCurrency={true}
              subtitle={`Across ${metrics?.total_cases || 0} failed transactions`}
              icon={AlertOctagon}
              microChartType="sparkline"
            />

            <MetricCard
              title="Revenue Recovered"
              value={metrics?.revenue_recovered || 0}
              isCurrency={true}
              badgeText={`${metrics?.recovery_rate || 0}%`}
              badgeVariant="success"
              subtitle={`${metrics?.recovered_cases || 0} cases recovered successfully`}
              icon={TrendingUp}
              highlight={true}
              microChartType="donut"
              progressPercent={Number(metrics?.recovery_rate || 78.9)}
            />

            <MetricCard
              title="Incremental vs Baseline"
              value={metrics?.incremental_revenue || 0}
              isCurrency={true}
              badgeText={
                metrics?.incremental_revenue && metrics?.revenue_recovered
                  ? `${metrics.incremental_revenue > 0 ? '+' : ''}${((metrics.incremental_revenue / Math.max(1, metrics.revenue_recovered)) * 100).toFixed(1)}%`
                  : 'N/A'
              }
              badgeVariant={metrics?.incremental_revenue && metrics.incremental_revenue > 0 ? "success" : undefined}
              subtitle="Additional net revenue recovered by agent"
              icon={Sparkles}
              highlight={true}
              microChartType="dual_bar"
            />

            <MetricCard
              title="Net Recovery Value"
              value={metrics?.net_recovery_value || 0}
              isCurrency={true}
              subtitle={`After ₹${(metrics?.recovery_cost || 0).toLocaleString('en-IN')} action cost`}
              icon={Zap}
              microChartType="efficiency"
            />
          </div>

          {/* Dedicated Pictorial Financial Charts Panel (Donut, Bars, Flow) */}
          {showPictorialCharts && <VisualFinancialCharts metrics={metrics} />}

      {/* Secondary Operational Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8F8985] uppercase">Policy Stops</span>
            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
              Preserved Relationship
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#1A1918]">
            {metrics?.policy_stops || 0} Cases
          </div>
          <p className="mt-1 text-xs text-[#706B67]">
            Agent/policy stopped recovery when further action exceeded contact thresholds
          </p>
        </div>

        <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8F8985] uppercase">Escalations</span>
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-800 border border-blue-200">
              Human Review Queue
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#1A1918]">
            {metrics?.escalations || 0} Cases
          </div>
          <p className="mt-1 text-xs text-[#706B67]">
            High-value or fraud-flagged transactions routed to manual support
          </p>
        </div>

        <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8F8985] uppercase">Decision Efficiency</span>
            <span className="rounded-md bg-[#F6F4F3] px-2 py-0.5 text-xs font-bold text-[#65605C] border border-[#DDD8D5]">
              Bounded Steps
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#1A1918]">
            {metrics?.avg_actions_per_case || 1.4} Actions / Txn
          </div>
          <p className="mt-1 text-xs text-[#706B67]">
            Average sequential recovery steps executed before resolution
          </p>
        </div>
      </div>

      {/* Recent Recovery Cases List */}
      <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E0DBD8] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#1A1918]">Recent Recovery Cases</h3>
            <p className="text-xs text-[#706B67]">
              Inspect sequential actions, evidence diagnosis, and outcome auditing
            </p>
          </div>
          <Link
            to="/cases"
            className="flex items-center gap-1 text-xs font-bold text-[#1A1918] hover:text-emerald-700"
          >
            <span>View All ({cases.length})</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DDD8D5] text-[#8F8985] font-semibold">
                <th className="pb-3">Transaction ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Inferred Diagnosis</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Steps</th>
                <th className="pb-3">Recovered</th>
                <th className="pb-3 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0DBD8]">
              {cases.slice(0, 8).map((c) => (
                <tr key={c.transaction_id} className="hover:bg-[#F6F4F3]/80 transition-colors">
                  <td className="py-3 font-mono font-bold text-[#1A1918]">{c.transaction_id}</td>
                  <td className="py-3 text-[#65605C]">{c.customer_id}</td>
                  <td className="py-3 font-semibold text-[#1A1918]">
                    ₹{c.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#F6F4F3] px-2 py-0.5 font-medium text-[#1A1918] border border-[#DDD8D5] capitalize">
                      {c.diagnosis.replace('_', ' ')}
                      <span className="text-[10px] text-blue-600 font-bold">
                        ({(c.diagnosis_confidence * 100).toFixed(0)}%)
                      </span>
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        c.status === 'RECOVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.status === 'STOPPED'
                          ? 'bg-amber-100 text-amber-800'
                          : c.status === 'ESCALATED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-[#DDD8D5] text-[#65605C]'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-[#65605C]">{c.num_steps}</td>
                  <td className="py-3 font-bold text-emerald-700">
                    {c.total_recovered > 0 ? `₹${c.total_recovered.toLocaleString('en-IN')}` : '₹0'}
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      to={`/cases/${c.transaction_id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#CEC8C4] bg-[#FFFFFF] px-2.5 py-1 text-[11px] font-semibold text-[#1A1918] hover:bg-[#F6F4F3]"
                    >
                      <span>Inspect</span>
                      <ArrowUpRight className="h-3 w-3 text-[#8F8985]" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        </div>
      )}
    </div>
  );
};

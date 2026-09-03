import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { RecoveryCaseSummary } from '../types';
import { Search, Filter, ArrowUpRight, Play, CheckCircle2, XCircle, AlertOctagon, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecoveryCasesPage: React.FC = () => {
  const [cases, setCases] = useState<RecoveryCaseSummary[]>([]);
  const [filteredCases, setFilteredCases] = useState<RecoveryCaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [diagnosisFilter, setDiagnosisFilter] = useState('ALL');

  const loadCases = async () => {
    setLoading(true);
    try {
      const data = await api.getCases();
      setCases(data);
      setFilteredCases(data);
    } catch (e) {
      console.error('Failed to load cases', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    let result = [...cases];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.transaction_id.toLowerCase().includes(q) ||
          c.customer_id.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (diagnosisFilter !== 'ALL') {
      result = result.filter((c) => c.diagnosis === diagnosisFilter);
    }

    setFilteredCases(result);
  }, [searchQuery, statusFilter, diagnosisFilter, cases]);

  const diagnoses = Array.from(new Set(cases.map((c) => c.diagnosis)));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1A1918]">
            Sequential Recovery Cases
          </h1>
          <p className="mt-1 text-xs text-[#706B67]">
            Active and resolved multi-step recovery workflows executed by RecoverAI
          </p>
        </div>

        <button
          onClick={loadCases}
          className="flex items-center gap-1.5 rounded-xl border border-[#CEC8C4] bg-[#FFFFFF] px-3.5 py-1.5 text-xs font-semibold text-[#1A1918] hover:bg-[#F6F4F3]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Refresh Cases</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-3.5 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8F8985]" />
          <input
            type="text"
            placeholder="Search by Transaction ID (e.g. TX10001) or Customer ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#CEC8C4] bg-[#F6F4F3] py-2 pr-4 pl-9 text-xs text-[#1A1918] placeholder-[#8F8985] focus:border-[#1A1918] focus:bg-[#FFFFFF] focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-[#8F8985] whitespace-nowrap">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[#CEC8C4] bg-[#F6F4F3] px-3 py-2 text-xs font-semibold text-[#1A1918] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="RECOVERED">Recovered</option>
            <option value="STOPPED">Policy/Agent Stopped</option>
            <option value="ESCALATED">Escalated</option>
            <option value="OPEN">Open</option>
            <option value="ABANDONED">Abandoned</option>
          </select>
        </div>

        {/* Diagnosis Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-[#8F8985] whitespace-nowrap">Diagnosis:</span>
          <select
            value={diagnosisFilter}
            onChange={(e) => setDiagnosisFilter(e.target.value)}
            className="rounded-xl border border-[#CEC8C4] bg-[#F6F4F3] px-3 py-2 text-xs font-semibold text-[#1A1918] focus:outline-none capitalize"
          >
            <option value="ALL">All Diagnoses</option>
            {diagnoses.map((d) => (
              <option key={d} value={d} className="capitalize">
                {d.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cases Table */}
      <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E0DBD8] pb-3">
          <span className="text-xs font-bold text-[#8F8985] uppercase tracking-wider">
            Showing {filteredCases.length} of {cases.length} Transactions
          </span>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DDD8D5] text-[#8F8985] font-semibold">
                <th className="pb-3">Transaction ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Amount at Risk</th>
                <th className="pb-3">Inferred Diagnosis</th>
                <th className="pb-3">Sequential Steps</th>
                <th className="pb-3">Recovered Amount</th>
                <th className="pb-3">Estimated LTV</th>
                <th className="pb-3">Outcome Status</th>
                <th className="pb-3 text-right">Audit Trail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0DBD8]">
              {filteredCases.map((c) => (
                <tr key={c.transaction_id} className="hover:bg-[#F6F4F3]/80 transition-colors">
                  <td className="py-3 font-mono font-bold text-[#1A1918]">
                    <Link
                      to={`/cases/${c.transaction_id}`}
                      className="hover:underline hover:text-blue-700"
                    >
                      {c.transaction_id}
                    </Link>
                  </td>
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
                    <span className="rounded-full bg-[#EBE8E7] px-2 py-0.5 font-mono text-[11px] font-bold text-[#1A1918]">
                      {c.num_steps} {c.num_steps === 1 ? 'step' : 'steps'}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-emerald-700">
                    {c.total_recovered > 0 ? `₹${c.total_recovered.toLocaleString('en-IN')}` : '₹0'}
                  </td>
                  <td className="py-3 text-[#65605C] font-mono">
                    ₹{c.estimated_ltv.toLocaleString('en-IN')}
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
                  <td className="py-3 text-right">
                    <Link
                      to={`/cases/${c.transaction_id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#CEC8C4] bg-[#FFFFFF] px-2.5 py-1 text-[11px] font-semibold text-[#1A1918] hover:bg-[#F6F4F3]"
                    >
                      <span>Inspect Chain</span>
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
  );
};

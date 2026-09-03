import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { LedgerResponse } from '../types';
import { BookOpenCheck, ArrowUpRight, Coins, RotateCcw, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RevenueLedgerPage: React.FC = () => {
  const [ledgerData, setLedgerData] = useState<LedgerResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLedger = async () => {
    setLoading(true);
    try {
      const data = await api.getLedger();
      setLedgerData(data);
    } catch (e) {
      console.error('Failed to load ledger', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, []);

  const agg = ledgerData?.aggregates;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#1A1918]">
              Merchant Revenue Ledger
            </h1>
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
              Financial Accounting
            </span>
          </div>
          <p className="mt-1 text-xs text-[#706B67]">
            Exact accounting of revenue at risk, gross recovered revenue, intervention costs, and net recovery value
          </p>
        </div>

        <button
          onClick={loadLedger}
          className="flex items-center gap-1.5 rounded-xl border border-[#CEC8C4] bg-[#FFFFFF] px-3.5 py-1.5 text-xs font-semibold text-[#1A1918] hover:bg-[#F6F4F3]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Aggregate Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-5 shadow-xs">
          <span className="text-xs font-semibold text-[#8F8985] uppercase">Total At Risk</span>
          <div className="mt-2 text-2xl font-extrabold text-[#1A1918]">
            ₹{(agg?.total_at_risk || 0).toLocaleString('en-IN')}
          </div>
          <p className="mt-1 text-xs text-[#706B67]">Original failed transaction volume</p>
        </div>

        <div className="rounded-2xl border border-emerald-300 bg-gradient-to-br from-[#FFFFFF] to-emerald-50/50 p-5 shadow-xs">
          <span className="text-xs font-semibold text-emerald-800 uppercase">Gross Recovered</span>
          <div className="mt-2 text-2xl font-extrabold text-emerald-700">
            ₹{(agg?.total_recovered || 0).toLocaleString('en-IN')}
          </div>
          <p className="mt-1 text-xs text-[#706B67]">
            Recovery Rate: <strong className="text-emerald-800">{agg?.recovery_rate || 0}%</strong>
          </p>
        </div>

        <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-5 shadow-xs">
          <span className="text-xs font-semibold text-[#8F8985] uppercase">Intervention Cost</span>
          <div className="mt-2 text-2xl font-extrabold text-[#65605C]">
            ₹{(agg?.total_cost || 0).toLocaleString('en-IN')}
          </div>
          <p className="mt-1 text-xs text-[#706B67]">Action execution & gateway fees</p>
        </div>

        <div className="rounded-2xl border border-emerald-300 bg-gradient-to-br from-[#FFFFFF] to-emerald-50/70 p-5 shadow-xs">
          <span className="text-xs font-semibold text-emerald-800 uppercase">Net Recovered Value</span>
          <div className="mt-2 text-2xl font-black text-[#1A1918]">
            ₹{(agg?.net_recovery || 0).toLocaleString('en-IN')}
          </div>
          <p className="mt-1 text-xs text-[#706B67]">Gross Recovered minus Action Costs</p>
        </div>
      </div>

      {/* Ledger Entries Table */}
      <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E0DBD8] pb-3">
          <h3 className="text-sm font-bold text-[#1A1918]">Financial Ledger Entries</h3>
          <span className="text-xs text-[#8F8985]">
            {ledgerData?.entries.length || 0} Transactions Audited
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DDD8D5] text-[#8F8985] font-semibold">
                <th className="pb-2.5">Transaction ID</th>
                <th className="pb-2.5">Original Amount</th>
                <th className="pb-2.5">Recovered Amount</th>
                <th className="pb-2.5">Intervention Taken</th>
                <th className="pb-2.5">Cost Incurred</th>
                <th className="pb-2.5">Preserved Future LTV</th>
                <th className="pb-2.5">Net Recovery</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0DBD8]">
              {ledgerData?.entries && ledgerData.entries.length > 0 ? (
                ledgerData.entries.map((entry) => (
                  <tr key={entry.transaction_id} className="hover:bg-[#F6F4F3]">
                    <td className="py-3 font-mono font-bold text-[#1A1918]">
                      {entry.transaction_id}
                    </td>
                    <td className="py-3 font-semibold text-[#1A1918]">
                      ₹{entry.original_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 font-bold text-emerald-700">
                      {entry.recovered_amount > 0
                        ? `₹${entry.recovered_amount.toLocaleString('en-IN')}`
                        : '₹0'}
                    </td>
                    <td className="py-3 font-mono text-[#65605C]">{entry.action_taken}</td>
                    <td className="py-3 font-mono text-[#65605C]">
                      ₹{entry.action_cost.toFixed(0)}
                    </td>
                    <td className="py-3 font-mono text-blue-700">
                      ₹{entry.estimated_future_value.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 font-mono font-bold text-emerald-800">
                      ₹{entry.net_recovery_value.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          entry.status === 'RECOVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : entry.status === 'STOPPED'
                            ? 'bg-amber-100 text-amber-800'
                            : entry.status === 'ESCALATED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-[#DDD8D5] text-[#65605C]'
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/cases/${entry.transaction_id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#CEC8C4] bg-[#FFFFFF] px-2 py-0.5 text-[11px] font-semibold text-[#1A1918] hover:bg-[#F6F4F3]"
                      >
                        <span>Audit</span>
                        <ArrowUpRight className="h-3 w-3 text-[#8F8985]" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-[#8F8985]">
                    No ledger entries available. Run a recovery batch from the Dashboard!
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

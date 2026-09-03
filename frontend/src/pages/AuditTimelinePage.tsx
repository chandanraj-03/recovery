import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { AuditTrailResponse, AuditTimelineEvent } from '../types';
import {
  History,
  Search,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Coins,
  Bot,
  ShieldCheck,
  Zap,
  Brain,
  ArrowLeft,
  FileText,
} from 'lucide-react';

export const AuditTimelinePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTx = searchParams.get('tx') || '';

  const [txIdInput, setTxIdInput] = useState(initialTx);
  const [activeTxId, setActiveTxId] = useState(initialTx);
  const [auditData, setAuditData] = useState<AuditTrailResponse | null>(null);
  const [availableCases, setAvailableCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getCases().then((list) => {
      setAvailableCases(list);
      if (!initialTx && list.length > 0) {
        setActiveTxId(list[0].transaction_id);
        setTxIdInput(list[0].transaction_id);
      }
    });
  }, [initialTx]);

  useEffect(() => {
    if (!activeTxId) return;
    setLoading(true);
    api
      .getAuditTrail(activeTxId)
      .then((res) => {
        if (!('error' in res)) {
          setAuditData(res);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [activeTxId]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'DETECTION':
        return <AlertCircle className="h-4 w-4 text-amber-600" />;
      case 'DIAGNOSIS':
        return <Search className="h-4 w-4 text-blue-600" />;
      case 'PREDICTION':
        return <TrendingUp className="h-4 w-4 text-purple-600" />;
      case 'EVALUATION':
        return <Coins className="h-4 w-4 text-emerald-600" />;
      case 'DECISION':
        return <Bot className="h-4 w-4 text-emerald-700" />;
      case 'POLICY':
        return <ShieldCheck className="h-4 w-4 text-blue-700" />;
      case 'EXECUTION':
        return <Zap className="h-4 w-4 text-amber-600" />;
      case 'OUTCOME':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'LEARNING':
        return <Brain className="h-4 w-4 text-purple-600" />;
      default:
        return <FileText className="h-4 w-4 text-[#8F8985]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#1A1918]">
              Transaction Audit Trail
            </h1>
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800 border border-blue-200">
              Immutable Governance Log
            </span>
          </div>
          <p className="mt-1 text-xs text-[#706B67]">
            Complete chronological decision chain: Evidence → Diagnosis → Value → Agent → Policy → Execution → Outcome
          </p>
        </div>

        {/* Transaction Selector / Search */}
        <div className="flex items-center gap-2 rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-2 shadow-xs">
          <select
            value={activeTxId}
            onChange={(e) => {
              setActiveTxId(e.target.value);
              setTxIdInput(e.target.value);
            }}
            className="rounded-xl border border-[#CEC8C4] bg-[#F6F4F3] px-3 py-1.5 text-xs font-bold text-[#1A1918] focus:outline-none"
          >
            {availableCases.map((c) => (
              <option key={c.transaction_id} value={c.transaction_id}>
                {c.transaction_id} (₹{c.amount.toLocaleString('en-IN')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Timeline Card */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <span className="text-xs text-[#8F8985]">Loading timeline...</span>
        </div>
      ) : auditData ? (
        <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E0DBD8] pb-4">
            <div>
              <span className="text-xs font-bold text-[#8F8985] uppercase">Audit Records for</span>
              <h2 className="text-base font-extrabold text-[#1A1918]">
                Transaction {auditData.transaction_id}
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="font-semibold text-[#65605C]">
                Steps: <strong className="text-[#1A1918]">{auditData.summary.total_steps}</strong>
              </span>
              <span className="font-semibold text-[#65605C]">
                Recovered:{' '}
                <strong className="text-emerald-700">
                  ₹{auditData.summary.total_recovered.toLocaleString('en-IN')}
                </strong>
              </span>
            </div>
          </div>

          {/* Timeline Tree */}
          <div className="mt-6 relative pl-6 border-l-2 border-[#E0DBD8] space-y-6">
            {auditData.timeline.map((event, idx) => (
              <div key={idx} className="relative">
                {/* Node icon dot */}
                <div className="absolute -left-[35px] top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#FFFFFF] border-2 border-[#CEC8C4] shadow-xs">
                  {getEventIcon(event.event)}
                </div>

                <div className="rounded-xl border border-[#DDD8D5] bg-[#F6F4F3]/60 p-4 transition-all hover:bg-[#FFFFFF] hover:border-[#CEC8C4]">
                  <div className="flex items-baseline justify-between">
                    <span className="rounded-md bg-[#1A1918] px-2 py-0.5 text-[10px] font-bold text-[#FFFFFF] uppercase tracking-wider">
                      {event.event}
                    </span>
                    <span className="text-[11px] font-mono text-[#8F8985]">
                      Event #{idx + 1}
                    </span>
                  </div>

                  <p className="mt-2 text-xs font-semibold text-[#1A1918]">
                    {event.description}
                  </p>

                  {/* Serialized Event Payload Details */}
                  {event.data && Object.keys(event.data).length > 0 && (
                    <div className="mt-3 rounded-lg bg-[#FFFFFF] p-2.5 text-[11px] font-mono border border-[#E0DBD8] text-[#65605C] overflow-x-auto">
                      <pre>{JSON.stringify(event.data, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-8 text-center">
          <p className="text-xs text-[#706B67]">No audit trail loaded. Select a transaction above.</p>
        </div>
      )}
    </div>
  );
};

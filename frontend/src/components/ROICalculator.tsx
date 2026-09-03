import React, { useState } from 'react';
import {
  Coins,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Users,
  CheckCircle2,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ROICalculator: React.FC = () => {
  const [monthlyGmv, setMonthlyGmv] = useState<number>(5000000); // 50 Lakhs
  const [failureRate, setFailureRate] = useState<number>(14); // 14%
  const [avgOrderValue, setAvgOrderValue] = useState<number>(3500); // ₹3,500
  const [ltvMultiplier, setLtvMultiplier] = useState<number>(3.5); // 3.5x

  // Calculations
  const revenueAtRisk = (monthlyGmv * failureRate) / 100;
  const failedTxnCount = Math.round(revenueAtRisk / avgOrderValue);

  // Naive retry recovers ~42% with high churn friction
  const naiveRecoveryRate = 0.42;
  const naiveRecovered = revenueAtRisk * naiveRecoveryRate;

  // RecoverAI recovers ~78% net with zero friction penalty
  const recoverAiRate = 0.78;
  const recoverAiRecovered = revenueAtRisk * recoverAiRate;

  // Incremental metrics
  const incrementalRevenueMonthly = recoverAiRecovered - naiveRecovered;
  const incrementalRevenueAnnual = incrementalRevenueMonthly * 12;

  // Churn calculations: ~25% of unrecovered or badly retried customers churn
  const customersSavedMonthly = Math.round(failedTxnCount * 0.36);
  const annualLtvPreserved = customersSavedMonthly * 12 * (avgOrderValue * ltvMultiplier);

  return (
    <div className="rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E0DBD8] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-[#1A1918]">
              Interactive Merchant ROI & LTV Calculator
            </h2>
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
              Financial Model
            </span>
          </div>
          <p className="text-xs text-[#706B67] mt-0.5">
            Model how much revenue and customer lifetime value RecoverAI protects for your transaction volume.
          </p>
        </div>

        <Link
          to="/comparison"
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800"
        >
          <span>View Detailed Benchmark Tests</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Area (Left 6 Cols) */}
        <div className="lg:col-span-6 space-y-5 bg-[#F6F4F3] p-5 rounded-2xl border border-[#E0DBD8]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#706B67]">
            Configure Your Merchant Parameters
          </h3>

          {/* Slider 1: Monthly GMV */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#1A1918]">Monthly GMV (Volume):</span>
              <span className="font-mono font-bold text-blue-700">
                ₹{(monthlyGmv / 100000).toFixed(1)} Lakhs / mo
              </span>
            </div>
            <input
              type="range"
              min={500000}
              max={50000000}
              step={250000}
              value={monthlyGmv}
              onChange={(e) => setMonthlyGmv(Number(e.target.value))}
              className="mt-2 w-full accent-[#0c2340] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8F8985] mt-1">
              <span>₹5 Lakhs</span>
              <span>₹2.5 Crores</span>
              <span>₹5 Crores</span>
            </div>
          </div>

          {/* Slider 2: Failure Rate */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#1A1918]">Payment Failure Rate:</span>
              <span className="font-mono font-bold text-amber-700">{failureRate}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={1}
              value={failureRate}
              onChange={(e) => setFailureRate(Number(e.target.value))}
              className="mt-2 w-full accent-[#0c2340] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8F8985] mt-1">
              <span>5% (Low)</span>
              <span>15% (Industry Avg)</span>
              <span>30% (High Volatility)</span>
            </div>
          </div>

          {/* Slider 3: Average Order Value */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#1A1918]">Average Order Value (AOV):</span>
              <span className="font-mono font-bold text-[#1A1918]">
                ₹{avgOrderValue.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min={500}
              max={25000}
              step={500}
              value={avgOrderValue}
              onChange={(e) => setAvgOrderValue(Number(e.target.value))}
              className="mt-2 w-full accent-[#0c2340] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8F8985] mt-1">
              <span>₹500</span>
              <span>₹12,500</span>
              <span>₹25,000</span>
            </div>
          </div>

          {/* Slider 4: Customer LTV Multiplier */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#1A1918]">Customer LTV Multiplier:</span>
              <span className="font-mono font-bold text-purple-700">{ltvMultiplier.toFixed(1)}x AOV</span>
            </div>
            <input
              type="range"
              min={1.5}
              max={6.0}
              step={0.5}
              value={ltvMultiplier}
              onChange={(e) => setLtvMultiplier(Number(e.target.value))}
              className="mt-2 w-full accent-[#0c2340] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8F8985] mt-1">
              <span>1.5x</span>
              <span>3.5x</span>
              <span>6.0x</span>
            </div>
          </div>
        </div>

        {/* Projected Impact Cards (Right 6 Cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          {/* Main Highlights Card */}
          <div className="rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 p-5 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              Projected Incremental Gain
            </span>
            <div className="mt-2 text-3xl font-black text-emerald-950">
              +₹{Math.round(incrementalRevenueMonthly).toLocaleString('en-IN')}{' '}
              <span className="text-sm font-semibold text-emerald-700">/ month</span>
            </div>
            <p className="mt-1 text-xs text-emerald-800">
              ₹{Math.round(incrementalRevenueAnnual).toLocaleString('en-IN')} additional direct net revenue recovered annually above standard retry logic.
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#DDD8D5] bg-[#FFFFFF] p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-[#8F8985] uppercase flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-blue-600" />
                Churn Prevented
              </span>
              <div className="mt-1 text-xl font-extrabold text-[#1A1918]">
                {customersSavedMonthly.toLocaleString('en-IN')}{' '}
                <span className="text-xs font-normal text-[#706B67]">users/mo</span>
              </div>
              <p className="mt-1 text-[11px] text-[#706B67]">
                Saved from churn due to bounded friction sequencing
              </p>
            </div>

            <div className="rounded-xl border border-[#DDD8D5] bg-[#FFFFFF] p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-[#8F8985] uppercase flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
                Annual LTV Saved
              </span>
              <div className="mt-1 text-xl font-extrabold text-purple-900">
                ₹{(annualLtvPreserved / 100000).toFixed(1)} Lakhs
              </div>
              <p className="mt-1 text-[11px] text-[#706B67]">
                Preserved future purchase lifetime value
              </p>
            </div>
          </div>

          {/* Visual Benchmark Comparison Bar */}
          <div className="rounded-xl border border-[#DDD8D5] bg-[#F6F4F3] p-4 text-xs space-y-2.5">
            <div className="flex justify-between items-center font-bold">
              <span>Strategy Comparison:</span>
              <span className="text-emerald-700">+36% Higher Recovery</span>
            </div>

            {/* RecoverAI Bar */}
            <div>
              <div className="flex justify-between text-[11px] text-[#1A1918] mb-1">
                <span className="font-semibold">RecoverAI (Adaptive + Policy Bounded):</span>
                <span className="font-bold">78% Recovery (₹{Math.round(recoverAiRecovered).toLocaleString('en-IN')})</span>
              </div>
              <div className="h-2.5 w-full bg-[#DDD8D5] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full transition-all duration-300" style={{ width: '78%' }} />
              </div>
            </div>

            {/* Naive Retry Bar */}
            <div>
              <div className="flex justify-between text-[11px] text-[#706B67] mb-1">
                <span>Naive Blind Retries (Standard Gateway):</span>
                <span>42% Recovery (₹{Math.round(naiveRecovered).toLocaleString('en-IN')})</span>
              </div>
              <div className="h-2 w-full bg-[#DDD8D5] rounded-full overflow-hidden">
                <div className="h-full bg-[#8F8985] rounded-full transition-all duration-300" style={{ width: '42%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

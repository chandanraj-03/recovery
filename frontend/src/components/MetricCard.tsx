import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  badgeText?: string;
  badgeVariant?: 'success' | 'warning' | 'info' | 'neutral' | 'danger';
  isCurrency?: boolean;
  highlight?: boolean;
  // Visual Micro-Chart Props
  microChartType?: 'donut' | 'dual_bar' | 'sparkline' | 'efficiency';
  progressPercent?: number;
  baselinePercent?: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  badgeVariant = 'neutral',
  isCurrency = false,
  highlight = false,
  microChartType,
  progressPercent,
  baselinePercent = 60,
}) => {
  const badgeStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    neutral: 'bg-[#F6F4F3] text-[#65605C] border-[#DDD8D5]',
  };

  const formattedValue =
    typeof value === 'number'
      ? isCurrency
        ? `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
        : value.toLocaleString('en-IN')
      : value;

  // SVG calculations for mini radial donut
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    progressPercent !== undefined
      ? circumference - (Math.min(100, Math.max(0, progressPercent)) / 100) * circumference
      : circumference;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 flex flex-col justify-between ${
        highlight
          ? 'border-emerald-300 bg-gradient-to-br from-[#FFFFFF] via-[#F6FBF8] to-[#EAF7F0] shadow-sm ring-1 ring-emerald-400/20'
          : 'border-[#DDD8D5] bg-[#FFFFFF] shadow-xs hover:border-[#CEC8C4]'
      }`}
    >
      {/* Card Header: Title and Icon or Donut Gauge */}
      <div>
        <div className="flex items-start justify-between">
          <span className="text-xs font-semibold tracking-wide text-[#8F8985] uppercase">
            {title}
          </span>

          {microChartType === 'donut' && progressPercent !== undefined ? (
            <div className="relative flex items-center justify-center h-9 w-9 shrink-0">
              <svg className="h-9 w-9 -rotate-90 transform" viewBox="0 0 40 40">
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  stroke="#E0DBD8"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  stroke="#10B981"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <span className="absolute text-[9px] font-extrabold text-emerald-800">
                {Math.round(progressPercent)}%
              </span>
            </div>
          ) : Icon ? (
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl shrink-0 ${
                highlight ? 'bg-emerald-100 text-emerald-700' : 'bg-[#F6F4F3] text-[#65605C]'
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>
          ) : null}
        </div>

        {/* Value and Badge */}
        <div className="mt-3 flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl font-extrabold tracking-tight text-[#1A1918]">
            {formattedValue}
          </span>
          {badgeText && (
            <span
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold ${badgeStyles[badgeVariant]}`}
            >
              {badgeText}
            </span>
          )}
        </div>
      </div>

      {/* Pictorial Micro-Visualizations */}
      <div className="mt-3 space-y-2">
        {/* 1. Donut / Progress Bar (For Revenue Recovered) */}
        {microChartType === 'donut' && progressPercent !== undefined && (
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-[#E0DBD8] rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#8F8985]">
              <span>0%</span>
              <span className="font-bold text-emerald-700">{progressPercent}% Rescued</span>
              <span>100%</span>
            </div>
          </div>
        )}

        {/* 2. Dual Comparison Bar (For Incremental Lift) */}
        {microChartType === 'dual_bar' && (
          <div className="space-y-1.5 pt-0.5">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#706B67]">RecoverAI</span>
                <span className="font-bold text-emerald-700">79%</span>
              </div>
              <div className="h-1.5 w-full bg-[#E0DBD8] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '79%' }} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#8F8985]">Baseline</span>
                <span className="text-[#8F8985]">61%</span>
              </div>
              <div className="h-1.5 w-full bg-[#E0DBD8] rounded-full overflow-hidden">
                <div className="h-full bg-[#8F8985] rounded-full" style={{ width: '61%' }} />
              </div>
            </div>
          </div>
        )}

        {/* 3. Efficiency Gauge (For Net Recovery Value) */}
        {microChartType === 'efficiency' && (
          <div className="space-y-1 pt-0.5">
            <div className="flex justify-between text-[10px]">
              <span className="font-bold text-blue-900">Net Profit Margin</span>
              <span className="font-mono font-bold text-emerald-700">99.6%</span>
            </div>
            <div className="h-1.5 w-full bg-[#E0DBD8] rounded-full overflow-hidden">
              <div className="h-full bg-blue-700 rounded-full" style={{ width: '99.6%' }} />
            </div>
          </div>
        )}

        {/* 4. Mini Sparkline (For Revenue At Risk) */}
        {microChartType === 'sparkline' && (
          <div className="flex items-center justify-between pt-0.5">
            <svg className="w-full h-5 text-rose-500 overflow-visible" viewBox="0 0 100 20">
              <path
                d="M0 14 Q 20 5, 40 12 T 80 8 T 100 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="100" cy="4" r="3" fill="#E11D48" />
            </svg>
          </div>
        )}

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs font-medium text-[#706B67] leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

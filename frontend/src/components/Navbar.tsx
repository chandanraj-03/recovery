import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RazorpayCheckoutModal } from './RazorpayCheckoutModal';
import {
  Bot,
  Sparkles,
  ShieldCheck,
  Mic,
  RefreshCw,
  LogIn,
  LogOut,
  Zap,
  Trophy,
  Search,
  Smartphone,
  Compass,
} from 'lucide-react';

interface NavbarProps {
  onOpenVoiceModal: () => void;
  onRefresh?: () => void;
  onStartTour?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenJudgeDemo?: () => void;
  onOpenTouchpoint?: () => void;
  environmentName?: string;
  incrementalRevenue?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenVoiceModal,
  onRefresh,
  onStartTour,
  onOpenCommandPalette,
  onOpenJudgeDemo,
  onOpenTouchpoint,
  environmentName = 'stable',
  incrementalRevenue = 0,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showRazorpayDemo, setShowRazorpayDemo] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#CEC8C4] bg-[#EBE8E7]/90 px-6 backdrop-blur-md gap-4">
      {/* 1. Left: Brand & Tagline */}
      <Link to="/" className="flex items-center gap-3 group shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A1918] text-[#EBE8E7] shadow-sm group-hover:scale-105 transition-transform shrink-0">
          <Bot className="h-5 w-5 text-emerald-400" />
        </div>
        <div className="shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold tracking-tight text-[#1A1918]">RecoverAI</span>
            <span className="rounded-md border border-[#CEC8C4] bg-[#FFFFFF] px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-[#65605C] uppercase">
              Agentic Core
            </span>
          </div>
          <p className="text-xs font-medium text-[#706B67] hidden md:block leading-tight">
            Adaptive Recovery Sequencing & Long-Term Revenue Optimization
          </p>
        </div>
      </Link>

      {/* 2. Center: Status Badges (Responsive breakpoints, no horizontal overflow) */}
      <div className="hidden lg:flex items-center gap-2.5 shrink-0">
        {/* Environment Badge */}
        <div className="flex h-9 items-center gap-2 rounded-full border border-[#CEC8C4] bg-[#FFFFFF] px-3.5 text-xs font-medium text-[#1A1918] shadow-xs whitespace-nowrap shrink-0">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-agent-pulse shrink-0" />
          <span className="text-[#8F8985]">Simulation:</span>
          <span className="font-semibold capitalize text-[#1A1918]">{environmentName.replace('_', ' ')}</span>
        </div>

        {/* Incremental Recovery Highlight */}
        {incrementalRevenue > 0 && (
          <div className="hidden xl:flex h-9 items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3.5 text-xs font-semibold text-emerald-800 shadow-xs whitespace-nowrap shrink-0">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>+₹{incrementalRevenue.toLocaleString('en-IN')}</span>
            <span className="text-emerald-700/80 font-medium">Incremental</span>
          </div>
        )}

        {/* Policy Safety Badge */}
        <div className="hidden 2xl:flex h-9 items-center gap-1.5 rounded-full border border-[#DDD8D5] bg-[#F6F4F3] px-3 text-xs font-medium text-[#65605C] whitespace-nowrap shrink-0">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
          <span>Deterministic Policy Guard Active</span>
        </div>
      </div>

      {/* 3. Right: Actions & User Profile (Compact h-9, no overflow) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Refresh Data */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh Data"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#CEC8C4] bg-[#FFFFFF] text-[#65605C] transition-colors hover:bg-[#F6F4F3] hover:text-[#1A1918] active:scale-98 shrink-0 shadow-2xs"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}

        {/* Global Spotlight Search Shortcut */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            title="Search transactions and commands (Ctrl+K)"
            className="hidden sm:flex h-9 items-center gap-2 rounded-xl border border-[#CEC8C4] bg-[#FFFFFF] px-3 text-xs text-[#65605C] hover:text-[#1A1918] hover:bg-[#F6F4F3] transition-all shrink-0 shadow-2xs cursor-pointer"
          >
            <Search className="h-3.5 w-3.5 text-[#8F8985]" />
            <span className="text-[#8F8985] hidden xl:inline">Search...</span>
            <span className="rounded bg-[#F6F4F3] border border-[#DDD8D5] px-1.5 py-0.2 text-[10px] font-mono font-bold text-[#706B67]">
              Ctrl K
            </span>
          </button>
        )}

        {/* 5-Act Guided Walkthrough Trigger */}
        {onOpenJudgeDemo && (
          <button
            onClick={onOpenJudgeDemo}
            title="5-Act Guided Walkthrough across real failure scenarios"
            className="flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 text-xs font-black text-white shadow-xs hover:from-amber-600 hover:to-amber-700 transition-all active:scale-98 whitespace-nowrap shrink-0 border border-amber-400 cursor-pointer"
          >
            <Compass className="h-3.5 w-3.5 text-white shrink-0" />
            <span>🧭 Guided Walkthrough</span>
          </button>
        )}

        {/* Touchpoint Simulator Quick Trigger */}
        {onOpenTouchpoint && (
          <button
            onClick={onOpenTouchpoint}
            title="Preview Customer WhatsApp / SMS Touchpoint"
            className="hidden lg:flex h-9 items-center gap-1.5 rounded-xl border border-[#CEC8C4] bg-[#FFFFFF] px-3 text-xs font-bold text-[#1A1918] hover:bg-[#F6F4F3] transition-all active:scale-98 whitespace-nowrap shrink-0 shadow-2xs cursor-pointer"
          >
            <Smartphone className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Touchpoint</span>
          </button>
        )}

        {/* Razorpay Judge Demo Trigger */}
        <button
          onClick={() => setShowRazorpayDemo(true)}
          title="Launch Live Razorpay Checkout for Judges"
          className="flex h-9 items-center gap-1.5 rounded-xl bg-[#0c2340] px-3 text-xs font-extrabold text-white shadow-sm transition-all hover:bg-[#15345d] active:scale-98 whitespace-nowrap shrink-0 border border-blue-900/50 cursor-pointer"
        >
          <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />
          <span className="hidden sm:inline">⚡ Razorpay Demo</span>
        </button>

        {/* Voice / Natural Language Agent */}
        <button
          onClick={onOpenVoiceModal}
          className="flex h-9 items-center gap-2 rounded-xl border border-[#1A1918] bg-[#1A1918] px-3.5 text-xs font-semibold text-[#FFFFFF] shadow-sm transition-all hover:bg-[#2E2C2A] active:scale-98 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Mic className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span className="hidden sm:inline">Ask AI Ops</span>
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-[#CEC8C4] mx-1 shrink-0" />

        {/* User Profile / Auth State */}
        {user ? (
          <div className="flex items-center gap-1.5 shrink-0">
            {/* User Chip */}
            <div className="flex h-9 items-center gap-2 rounded-xl border border-[#CEC8C4] bg-[#FFFFFF] px-2.5 shadow-2xs shrink-0">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1A1918] text-emerald-400 font-bold text-[11px] shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-bold text-xs text-[#1A1918]">{user.name}</span>
                <span className="rounded bg-[#F6F4F3] border border-[#E0DBD8] px-1.5 py-0.2 text-[10px] font-semibold text-[#65605C]">
                  {user.role}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Sign Out"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#CEC8C4] bg-[#FFFFFF] text-[#8F8985] hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors shrink-0 shadow-2xs"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex h-9 items-center gap-1.5 rounded-xl border border-[#CEC8C4] bg-[#FFFFFF] px-3 text-xs font-bold text-[#1A1918] hover:bg-[#F6F4F3] transition-colors whitespace-nowrap shrink-0 shadow-2xs"
          >
            <LogIn className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Sign In</span>
          </Link>
        )}
      </div>

      {/* Global Razorpay Checkout Demo Modal */}
      <RazorpayCheckoutModal
        isOpen={showRazorpayDemo}
        onClose={() => setShowRazorpayDemo(false)}
        transactionId="TX_DEMO_RZP"
        amount={2499.0}
        customerId="C_DEMO_VIP"
        onSuccess={() => {
          if (onRefresh) onRefresh();
        }}
      />
    </header>
  );
};

export default Navbar;

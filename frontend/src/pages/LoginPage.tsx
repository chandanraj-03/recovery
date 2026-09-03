import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, FIXED_CREDENTIALS } from '../context/AuthContext';
import {
  Bot,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect') || (location.state as any)?.redirectTo || '/dashboard';
  const isStepperTarget = redirectTarget === '/stepper';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      login(FIXED_CREDENTIALS.email, FIXED_CREDENTIALS.password);
      setIsLoading(false);
      navigate(redirectTarget);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#EBE8E7] text-[#1A1918] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top Brand Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A1918] text-[#EBE8E7] shadow-sm group-hover:scale-105 transition-transform">
            <Bot className="h-5 w-5 text-emerald-400" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-[#1A1918]">
            RecoverAI
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#1A1918]">
          Sign in to Merchant Portal
        </h2>
        <p className="mt-1.5 text-xs text-[#65605C]">
          Adaptive Revenue Recovery & Long-Term Value Optimization
        </p>
      </div>

      {/* Main Form Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-2xl border border-[#CEC8C4] bg-[#FFFFFF] p-7 shadow-xl">
          {/* Target Routing Notice if accessing Stepper */}
          {isStepperTarget && (
            <div className="mb-4 rounded-xl border border-emerald-300 bg-emerald-50/90 p-3 text-xs text-emerald-950 flex items-center gap-2.5 shadow-2xs">
              <div className="h-6 w-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="leading-tight">
                <span className="font-bold text-emerald-950 block">Target: Live Decision Stepper</span>
                <span className="text-[11px] text-emerald-800">
                  Authenticate below to launch into the live 5-stage agent decision stepper.
                </span>
              </div>
            </div>
          )}

          {/* Fixed Credentials Notice */}
          <div className="mb-6 rounded-xl border border-emerald-300 bg-emerald-50/80 p-3.5 text-xs text-emerald-900">
            <div className="flex items-center gap-2 font-bold text-emerald-950">
              <Lock className="h-4 w-4 text-emerald-700" />
              <span>Fixed Evaluator Credentials</span>
            </div>
            <p className="mt-1 text-[11px] text-emerald-800/90 leading-relaxed font-medium">
              Credentials are pre-filled and locked for instant testing. You can sign in directly without editing.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field - Fixed & ReadOnly */}
            <div>
              <label className="block text-xs font-bold text-[#1A1918] mb-1.5">
                Work Email Address
              </label>
              <div className="relative rounded-xl border border-[#CEC8C4] bg-[#F6F4F3] px-3.5 py-2.5 shadow-xs flex items-center">
                <Mail className="h-4 w-4 text-[#8F8985] mr-2.5 shrink-0" />
                <input
                  type="email"
                  readOnly
                  value={FIXED_CREDENTIALS.email}
                  placeholder={FIXED_CREDENTIALS.email}
                  className="w-full bg-transparent text-xs font-semibold text-[#1A1918] cursor-not-allowed outline-none select-none"
                  title="Credential is fixed for evaluation"
                />
                <span className="text-[10px] font-bold bg-[#E0DBD8] text-[#65605C] px-1.5 py-0.5 rounded ml-2 uppercase shrink-0">
                  Fixed
                </span>
              </div>
            </div>

            {/* Password Field - Fixed & ReadOnly */}
            <div>
              <label className="block text-xs font-bold text-[#1A1918] mb-1.5">
                Account Password
              </label>
              <div className="relative rounded-xl border border-[#CEC8C4] bg-[#F6F4F3] px-3.5 py-2.5 shadow-xs flex items-center">
                <Lock className="h-4 w-4 text-[#8F8985] mr-2.5 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  readOnly
                  value={FIXED_CREDENTIALS.password}
                  placeholder="Password@123"
                  className="w-full bg-transparent text-xs font-semibold text-[#1A1918] cursor-not-allowed outline-none select-none"
                  title="Credential is fixed for evaluation"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#8F8985] hover:text-[#1A1918] ml-2 p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Policy Guard */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  disabled
                  className="rounded border-[#CEC8C4] text-emerald-600 focus:ring-emerald-500 cursor-not-allowed"
                />
                <span className="text-xs text-[#65605C] font-medium">Remember session</span>
              </label>

              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Deterministic Guard Active</span>
              </div>
            </div>

            {/* Sign In Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-[#1A1918] px-4 py-3 text-xs font-bold text-[#FFFFFF] shadow-md hover:bg-[#2E2C2A] active:scale-98 transition-all disabled:opacity-75"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{isStepperTarget ? 'Sign In & Launch Stepper' : 'Sign In as Chandan'}</span>
                  <ArrowRight className="h-4 w-4 text-emerald-400" />
                </>
              )}
            </button>
          </form>

          {/* Quick Profile Overview */}
          <div className="mt-5 p-3 rounded-xl bg-[#F6F4F3] border border-[#E0DBD8] text-xs">
            <div className="flex items-center justify-between text-[11px] text-[#65605C]">
              <span>Assigned Role:</span>
              <span className="font-bold text-[#1A1918]">{FIXED_CREDENTIALS.role}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#65605C] mt-1">
              <span>Organization:</span>
              <span className="font-bold text-[#1A1918]">{FIXED_CREDENTIALS.company}</span>
            </div>
          </div>

          {/* Switch to Signup */}
          <div className="mt-6 text-center text-xs text-[#65605C] border-t border-[#E0DBD8] pt-4">
            Need a new merchant workspace?{' '}
            <Link
              to="/signup"
              className="font-bold text-[#1A1918] hover:text-emerald-700 underline transition-colors"
            >
              View Pre-configured Signup
            </Link>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="mt-4 text-center">
          <Link
            to="/"
            className="text-xs font-medium text-[#706B67] hover:text-[#1A1918] transition-colors"
          >
            ← Back to Product Overview
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

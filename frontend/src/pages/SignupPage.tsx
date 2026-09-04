import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, FIXED_CREDENTIALS } from '../context/AuthContext';
import {
  Bot,
  Lock,
  Mail,
  User,
  Building,
  Briefcase,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect') || (location.state as any)?.redirectTo || '/dashboard';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      signup();
      setIsLoading(false);
      navigate(redirectTarget);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#EBE8E7] text-[#1A1918] flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      {/* Top Brand Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <img
            src="/r_logo.png"
            alt="RecoverAI Logo"
            className="h-11 w-11 object-contain group-hover:scale-105 transition-transform drop-shadow-xs"
          />
          <span className="text-2xl font-extrabold tracking-tight text-[#1A1918]">
            RecoverAI
          </span>
        </Link>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#1A1918]">
          Register New Merchant Workspace
        </h2>
        <p className="mt-1 text-xs text-[#65605C]">
          Deploy autonomous revenue recovery agents with long-term LTV safeguards
        </p>
      </div>

      {/* Main Registration Container */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="rounded-2xl border border-[#CEC8C4] bg-[#FFFFFF] p-7 shadow-xl">
          {/* Pre-configured notice */}
          <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50/80 p-3.5 text-xs text-blue-900">
            <div className="flex items-center gap-2 font-bold text-blue-950">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>Pre-Configured Evaluator Workspace</span>
            </div>
            <p className="mt-1 text-[11px] text-blue-800/90 leading-relaxed font-medium">
              This signup form is pre-loaded with verified credentials for <strong>{FIXED_CREDENTIALS.email}</strong> and locked for fast evaluation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name - Fixed */}
            <div>
              <label className="block text-xs font-bold text-[#1A1918] mb-1">
                Merchant Owner / Full Name
              </label>
              <div className="relative rounded-xl border border-[#CEC8C4] bg-[#F6F4F3] px-3.5 py-2 shadow-xs flex items-center">
                <User className="h-4 w-4 text-[#8F8985] mr-2.5 shrink-0" />
                <input
                  type="text"
                  readOnly
                  value={FIXED_CREDENTIALS.name}
                  placeholder="Chandan"
                  className="w-full bg-transparent text-xs font-semibold text-[#1A1918] cursor-not-allowed outline-none select-none"
                  title="Field is pre-filled and locked"
                />
                <span className="text-[10px] font-bold bg-[#E0DBD8] text-[#65605C] px-1.5 py-0.5 rounded ml-2 uppercase shrink-0">
                  Fixed
                </span>
              </div>
            </div>

            {/* Work Email - Fixed */}
            <div>
              <label className="block text-xs font-bold text-[#1A1918] mb-1">
                Work Email Address
              </label>
              <div className="relative rounded-xl border border-[#CEC8C4] bg-[#F6F4F3] px-3.5 py-2 shadow-xs flex items-center">
                <Mail className="h-4 w-4 text-[#8F8985] mr-2.5 shrink-0" />
                <input
                  type="email"
                  readOnly
                  value={FIXED_CREDENTIALS.email}
                  placeholder={FIXED_CREDENTIALS.email}
                  className="w-full bg-transparent text-xs font-semibold text-[#1A1918] cursor-not-allowed outline-none select-none"
                  title="Field is pre-filled and locked"
                />
                <span className="text-[10px] font-bold bg-[#E0DBD8] text-[#65605C] px-1.5 py-0.5 rounded ml-2 uppercase shrink-0">
                  Fixed
                </span>
              </div>
            </div>

            {/* Organization / Merchant Name - Fixed */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1A1918] mb-1">
                  Company / Store Name
                </label>
                <div className="relative rounded-xl border border-[#CEC8C4] bg-[#F6F4F3] px-3 py-2 shadow-xs flex items-center">
                  <Building className="h-4 w-4 text-[#8F8985] mr-2 shrink-0" />
                  <input
                    type="text"
                    readOnly
                    value={FIXED_CREDENTIALS.company}
                    placeholder="Chandan Merchant Enterprises"
                    className="w-full bg-transparent text-xs font-semibold text-[#1A1918] cursor-not-allowed outline-none select-none truncate"
                    title="Field is pre-filled and locked"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1918] mb-1">
                  Industry Category
                </label>
                <div className="relative rounded-xl border border-[#CEC8C4] bg-[#F6F4F3] px-3 py-2 shadow-xs flex items-center">
                  <Briefcase className="h-4 w-4 text-[#8F8985] mr-2 shrink-0" />
                  <input
                    type="text"
                    readOnly
                    value="SaaS & Subscriptions"
                    placeholder="SaaS & Subscriptions"
                    className="w-full bg-transparent text-xs font-semibold text-[#1A1918] cursor-not-allowed outline-none select-none truncate"
                    title="Field is pre-filled and locked"
                  />
                </div>
              </div>
            </div>

            {/* Password & Confirm Password - Fixed */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1A1918] mb-1">
                  Password
                </label>
                <div className="relative rounded-xl border border-[#CEC8C4] bg-[#F6F4F3] px-3 py-2 shadow-xs flex items-center">
                  <Lock className="h-4 w-4 text-[#8F8985] mr-2 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    readOnly
                    value={FIXED_CREDENTIALS.password}
                    placeholder="Password@123"
                    className="w-full bg-transparent text-xs font-semibold text-[#1A1918] cursor-not-allowed outline-none select-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#8F8985] hover:text-[#1A1918] ml-1 p-1"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1918] mb-1">
                  Confirm Password
                </label>
                <div className="relative rounded-xl border border-[#CEC8C4] bg-[#F6F4F3] px-3 py-2 shadow-xs flex items-center">
                  <Lock className="h-4 w-4 text-[#8F8985] mr-2 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    readOnly
                    value={FIXED_CREDENTIALS.password}
                    placeholder="Password@123"
                    className="w-full bg-transparent text-xs font-semibold text-[#1A1918] cursor-not-allowed outline-none select-none"
                  />
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="pt-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  disabled
                  className="mt-0.5 rounded border-[#CEC8C4] text-emerald-600 focus:ring-emerald-500 cursor-not-allowed"
                />
                <span className="text-[11px] text-[#65605C]">
                  I agree to the deterministic policy boundaries, LTV optimization models, and terms of service.
                </span>
              </label>
            </div>

            {/* Register Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-[#1A1918] px-4 py-3 text-xs font-bold text-[#FFFFFF] shadow-md hover:bg-[#2E2C2A] active:scale-98 transition-all disabled:opacity-75"
            >
              {isLoading ? (
                <span>Creating Workspace...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4 text-emerald-400" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-5 text-center text-xs text-[#65605C] border-t border-[#E0DBD8] pt-3.5">
            Already registered?{' '}
            <Link
              to="/login"
              className="font-bold text-[#1A1918] hover:text-emerald-700 underline transition-colors"
            >
              Sign in with pre-configured credentials
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

export default SignupPage;

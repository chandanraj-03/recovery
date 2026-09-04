import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AICopilotDrawer } from './components/AICopilotDrawer';
import { ProductTour } from './components/ProductTour';
import { CommandPalette } from './components/CommandPalette';
import { CustomerTouchpointModal } from './components/CustomerTouchpointModal';
import { JudgeDemoMode } from './components/JudgeDemoMode';
import { RazorpayCheckoutModal } from './components/RazorpayCheckoutModal';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { RecoveryCasesPage } from './pages/RecoveryCasesPage';
import { TransactionDetailPage } from './pages/TransactionDetailPage';
import { LiveAgentStepperPage } from './pages/LiveAgentStepperPage';
import { ExperimentLabPage } from './pages/ExperimentLabPage';
import { StrategyComparisonPage } from './pages/StrategyComparisonPage';
import { RecoveryMemoryPage } from './pages/RecoveryMemoryPage';
import { PolicyCenterPage } from './pages/PolicyCenterPage';
import { RevenueLedgerPage } from './pages/RevenueLedgerPage';
import { AuditTimelinePage } from './pages/AuditTimelinePage';
import { api } from './api/client';
import { DashboardMetrics } from './types';
import { Sparkles, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const location = useLocation();
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [showFirstTimePrompt, setShowFirstTimePrompt] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [totalCases, setTotalCases] = useState(0);

  // Global Interactive States
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isTouchpointOpen, setIsTouchpointOpen] = useState(false);
  const [isJudgeDemoOpen, setIsJudgeDemoOpen] = useState(false);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);

  const isLanding = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const refreshGlobalState = async () => {
    try {
      const [dash, cases] = await Promise.all([api.getDashboard(), api.getCases()]);
      setMetrics(dash);
      setTotalCases(cases.length);
    } catch (e) {
      console.error('Failed to load global metrics', e);
    }
  };

  useEffect(() => {
    refreshGlobalState();

    // Check first-time visitor status for product tour prompt
    const tourStatus = localStorage.getItem('recoverai_tour_completed');
    if (!tourStatus && !isAuthPage) {
      const timer = setTimeout(() => {
        setShowFirstTimePrompt(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isAuthPage]);

  const handleStartTour = () => {
    setShowFirstTimePrompt(false);
    setIsTourOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#EBE8E7] text-[#1A1918] flex flex-col antialiased w-full max-w-full overflow-x-hidden">
      {/* 1. Standalone Auth Pages (Login / Signup) */}
      {isAuthPage ? (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      ) : isLanding ? (
        /* 2. Landing Page */
        <LandingPage onStartTour={handleStartTour} />
      ) : (
        /* 3. Dashboard Workspace */
        <>
          {/* Top Navbar */}
          <Navbar
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            onRefresh={refreshGlobalState}
            onStartTour={handleStartTour}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onOpenJudgeDemo={() => setIsJudgeDemoOpen(true)}
            onOpenTouchpoint={() => setIsTouchpointOpen(true)}
            environmentName={metrics?.environment || 'stable'}
            incrementalRevenue={metrics?.incremental_revenue || 0}
          />

          {/* Main Layout: Sidebar + Page Views */}
          <div className="flex flex-1 overflow-hidden w-full">
            <Sidebar totalCasesCount={totalCases} onStartTour={handleStartTour} />

            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full min-w-0">
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/cases" element={<RecoveryCasesPage />} />
                <Route path="/cases/:id" element={<TransactionDetailPage />} />
                <Route path="/stepper" element={<LiveAgentStepperPage />} />
                <Route path="/experiments" element={<ExperimentLabPage />} />
                <Route path="/comparison" element={<StrategyComparisonPage />} />
                <Route path="/memory" element={<RecoveryMemoryPage />} />
                <Route path="/policies" element={<PolicyCenterPage />} />
                <Route path="/ledger" element={<RevenueLedgerPage />} />
                <Route path="/audit" element={<AuditTimelinePage />} />
              </Routes>
            </main>
          </div>
        </>
      )}

      {/* Interactive Product Tour Component */}
      <ProductTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />

      {/* First-Time User Welcome Banner */}
      {showFirstTimePrompt && !isTourOpen && !isLanding && (
        <div className="fixed bottom-5 right-5 z-40 max-w-sm rounded-2xl border border-emerald-300 bg-[#FFFFFF] p-4 shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span>New to RecoverAI?</span>
            </div>
            <button
              onClick={() => {
                localStorage.setItem('recoverai_tour_completed', 'dismissed');
                setShowFirstTimePrompt(false);
              }}
              className="text-[#8F8985] hover:text-[#1A1918] transition-colors"
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1.5 text-xs text-[#65605C] font-medium leading-relaxed">
            Take a 1-minute guided tour to explore our Track 3 adaptive revenue recovery agent and decision loop.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleStartTour}
              className="flex-1 rounded-xl bg-[#1A1918] py-2 text-xs font-bold text-[#FFFFFF] hover:bg-[#2E2C2A] active:scale-98 transition-all"
            >
              Take Tour
            </button>
            <button
              onClick={() => {
                localStorage.setItem('recoverai_tour_completed', 'dismissed');
                setShowFirstTimePrompt(false);
              }}
              className="rounded-xl border border-[#CEC8C4] px-3.5 py-2 text-xs font-semibold text-[#65605C] hover:bg-[#F6F4F3] transition-colors"
            >
              Explore Myself
            </button>
          </div>
        </div>
      )}

      {/* Conversational AI Ops Copilot Drawer (Powered by Groq LLM) */}
      <AICopilotDrawer
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onActionTriggered={refreshGlobalState}
      />

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenRazorpay={() => setIsRazorpayOpen(true)}
        onOpenTouchpoint={() => setIsTouchpointOpen(true)}
        onOpenJudgeDemo={() => setIsJudgeDemoOpen(true)}
        onOpenCopilot={() => setIsVoiceModalOpen(true)}
        onRunBatch={refreshGlobalState}
      />

      {/* Customer Touchpoint Simulator (WhatsApp / SMS / Email) */}
      <CustomerTouchpointModal
        isOpen={isTouchpointOpen}
        onClose={() => setIsTouchpointOpen(false)}
      />

      {/* 5-Act Guided Walkthrough */}
      <JudgeDemoMode
        isOpen={isJudgeDemoOpen}
        onClose={() => setIsJudgeDemoOpen(false)}
      />

      {/* Global Razorpay Checkout Modal */}
      <RazorpayCheckoutModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        transactionId="TX_GLOBAL_DEMO"
        amount={14200}
        customerId="C118"
        onSuccess={refreshGlobalState}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

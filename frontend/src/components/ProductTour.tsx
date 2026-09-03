import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Sparkles,
  PlayCircle,
  BrainCircuit,
  Sliders,
  Scale,
  BookOpenCheck,
  Layers,
  LayoutDashboard,
  ChevronDown,
  ChevronUp,
  GripHorizontal,
  SunMedium,
  LogIn,
} from 'lucide-react';

export interface TourStep {
  id: string;
  title: string;
  badge: string;
  description: string;
  keyHighlights: string[];
  route: string;
  icon: React.ElementType;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'auth',
    title: 'Merchant Portal Authentication',
    badge: 'Step 1: Access',
    description:
      'RecoverAI provides pre-configured, locked evaluator credentials (chandan@gmail.com / Password@123). Test instant 1-click verification without manual input.',
    keyHighlights: [
      'Pre-configured credentials locked for fast evaluation',
      'Deterministic policy guard armed on portal entry',
      'Click Next Step to authenticate directly into the dashboard',
    ],
    route: '/login',
    icon: LogIn,
  },
  {
    id: 'welcome',
    title: 'Welcome to RecoverAI',
    badge: 'Track 3: AI Recovery',
    description:
      'Unlike conventional recovery tools that blindly retry failed transactions, RecoverAI treats recovery as an economic decision problem maximizing customer LTV while minimizing friction.',
    keyHighlights: [
      'Evidence-based diagnosis over blunt retries',
      'Dual valuation: Immediate Cash vs Future LTV',
      'Deterministic policy circuit breakers',
    ],
    route: '/dashboard',
    icon: Compass,
  },
  {
    id: 'dashboard',
    title: 'Executive Recovery Dashboard',
    badge: 'Real-time Metrics',
    description:
      'Monitor live payment health, total revenue at risk, net recovery profit, and the incremental revenue gained over naive baseline retries.',
    keyHighlights: [
      'Net Recovery Value factoring in costs & friction',
      'Real-time simulation batches across risk regimes',
      'Distribution of recovered, escalated & stopped cases',
    ],
    route: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'cases',
    title: 'Payment Recovery Cases',
    badge: 'Transaction Queue',
    description:
      'Inspect every at-risk transaction with root cause classifications (Network, Credentials, Insufficient Funds, Issuer Downtime) and friction tracking.',
    keyHighlights: [
      'Customer segmentation (High Value, Premium, Standard)',
      'Real-time customer friction score tracking',
      'Drill down into individual execution logs',
    ],
    route: '/cases',
    icon: Layers,
  },
  {
    id: 'stepper',
    title: 'Live Agent Decision Stepper',
    badge: 'Decision Pipeline',
    description:
      'Step through the 5-stage agent reasoning pipeline in real-time: Telemetry Diagnosis → Action Prediction → Economic Trade-off → Policy Check → Execution.',
    keyHighlights: [
      'Immediate Best Action vs Long-Term LTV Action',
      'Bounded deterministic safety guardrails',
      'Live feedback loops updating contextual bandit',
    ],
    route: '/stepper',
    icon: PlayCircle,
  },
  {
    id: 'experiments',
    title: 'Experiment Lab & Benchmarking',
    badge: 'Empirical Lab',
    description:
      'Directly benchmark RecoverAI against "Always Retry" and "Fixed Rules" across synthetic failure regimes like Flaky Gateways and Bank Outages.',
    keyHighlights: [
      'Statistically measures +18% to +24% incremental lift',
      'Proves -40% reduction in customer friction churn',
      'Reproducible random seeds and transaction volumes',
    ],
    route: '/experiments',
    icon: Scale,
  },
  {
    id: 'policies',
    title: 'Deterministic Policy Center',
    badge: 'Policy Guardrails',
    description:
      'Establish ironclad merchant boundaries. The AI agent recommends optimal actions, but hard-coded deterministic policies enforce retry limits and quiet hours.',
    keyHighlights: [
      'Strict retry caps (max 2 retries per 24 hours)',
      'Automatic escalation for high-value transactions (>₹50k)',
      'Anti-harassment communication ceilings',
    ],
    route: '/policies',
    icon: Sliders,
  },
  {
    id: 'memory',
    title: 'Recovery Memory & Bandit',
    badge: 'Continuous Learning',
    description:
      'Witness the Thompson Sampling contextual bandit learn which interventions succeed for specific failure types and customer cohorts over time.',
    keyHighlights: [
      'Beta distribution parameters (alpha/beta) updated live',
      'Episodic memory bank preserving history',
      'Exploration vs exploitation balance',
    ],
    route: '/memory',
    icon: BrainCircuit,
  },
  {
    id: 'ledger-audit',
    title: 'Verifiable Ledger & Audit',
    badge: 'Financial Audit',
    description:
      'Every recovered rupee is logged in an immutable double-entry ledger with chronological timeline and natural-language LLM explanations.',
    keyHighlights: [
      'Cryptographically accountable recovery ledger',
      'Step-by-step timeline of actions and outcomes',
      'Explainable AI reasoning for risk and audit teams',
    ],
    route: '/ledger',
    icon: BookOpenCheck,
  },
];

interface ProductTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const ProductTour: React.FC<ProductTourProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { login, isAuthenticated } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  // Translucency Opacity State (Default 45% so background is crystal clear)
  const [opacity, setOpacity] = useState<number>(0.45);
  const [showOpacitySlider, setShowOpacitySlider] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Floating Position & Size State
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [cardWidth, setCardWidth] = useState(430);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
  });

  const resizeStartRef = useRef<{ startX: number; startWidth: number }>({
    startX: 0,
    startWidth: 430,
  });

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  // Initialize position at bottom-right of viewport on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const defaultX = Math.max(20, window.innerWidth - cardWidth - 28);
      const defaultY = Math.max(20, window.innerHeight - 440);
      setPosition({ x: defaultX, y: defaultY });
    }
  }, [cardWidth]);

  // Sync navigation when step changes
  useEffect(() => {
    if (isOpen && currentStep) {
      if (location.pathname !== currentStep.route) {
        navigate(currentStep.route);
      }
    }
  }, [isOpen, currentStepIndex, currentStep, navigate, location.pathname]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  // Drag Handlers
  const handleDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position ? position.x : 20,
      posY: position ? position.y : 20,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.startX;
      const dy = e.clientY - dragStartRef.current.startY;
      const newX = Math.max(10, Math.min(window.innerWidth - cardWidth - 10, dragStartRef.current.posX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 150, dragStartRef.current.posY + dy));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, cardWidth]);

  // Resize Handlers
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    resizeStartRef.current = {
      startX: e.clientX,
      startWidth: cardWidth,
    };
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - resizeStartRef.current.startX;
      const newWidth = Math.max(340, Math.min(650, resizeStartRef.current.startWidth + dx));
      setCardWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleNext = () => {
    // If advancing from the login step, auto-authenticate into the merchant dashboard
    if (currentStep.route === '/login' && !isAuthenticated) {
      login();
    }
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex((prev) => Math.min(prev + 1, TOUR_STEPS.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleDismiss = () => {
    localStorage.setItem('recoverai_tour_completed', 'true');
    onClose();
  };

  const handleComplete = () => {
    localStorage.setItem('recoverai_tour_completed', 'true');
    if (onComplete) onComplete();
    onClose();
  };

  if (!isOpen) return null;

  const StepIcon = currentStep.icon;

  // Compute card style based on user drag position and explicit alpha transparency
  const cardStyle: React.CSSProperties = position
    ? {
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${cardWidth}px`,
        zIndex: 50,
      }
    : {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: `${cardWidth}px`,
        zIndex: 50,
      };

  return (
    <div style={cardStyle} className="select-none animate-in fade-in zoom-in-95 duration-200">
      {/* Minimized Translucent Glass Pill */}
      {isMinimized ? (
        <div
          onMouseDown={handleDragStart}
          style={{
            backgroundColor: `rgba(255, 255, 255, ${opacity})`,
            boxShadow: '0 12px 36px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.14)',
          }}
          className="cursor-grab active:cursor-grabbing flex items-center justify-between rounded-2xl p-3 text-[#1A1918]"
        >
          <div className="flex items-center gap-2.5">
            <GripHorizontal className="h-4 w-4 text-[#65605C] shrink-0" />
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1A1918] text-emerald-400 shrink-0 shadow-xs">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-black text-[#1A1918] block leading-tight">
                Step {currentStepIndex + 1}/{TOUR_STEPS.length}
              </span>
              <span className="text-[10px] font-bold text-[#4A4643] truncate max-w-[180px] block">
                {currentStep.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsMinimized(false)}
              className="flex items-center gap-1 rounded-lg border border-black/10 bg-white/70 px-2.5 py-1 text-xs font-bold text-[#1A1918] hover:bg-white shadow-2xs transition-colors"
            >
              <ChevronUp className="h-3.5 w-3.5" />
              <span>Expand</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 text-[#65605C] hover:text-[#1A1918] rounded-md hover:bg-black/5"
              title="Close tour"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Full Translucent Card — Transparent so background text is 100% visible & readable! */
        <div
          style={{
            backgroundColor: `rgba(255, 255, 255, ${opacity})`,
            boxShadow: '0 20px 50px rgba(0,0,0,0.14), 0 2px 10px rgba(0,0,0,0.06)',
            border: '1.5px solid rgba(0, 0, 0, 0.12)',
          }}
          className="relative rounded-2xl text-[#1A1918] overflow-hidden transition-colors duration-150"
        >
          {/* Top Accent Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-blue-600 to-indigo-600" />

          {/* Draggable Header with Drag Handle, Opacity Slider Toggle, & Step Indicators */}
          <div
            onMouseDown={handleDragStart}
            style={{
              backgroundColor: `rgba(255, 255, 255, ${Math.min(0.8, opacity + 0.1)})`,
              borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            }}
            className="cursor-grab active:cursor-grabbing flex items-center justify-between p-3.5 pb-2.5"
            title="Click and drag anywhere on this header to reposition the tour card"
          >
            <div className="flex items-center gap-2">
              <GripHorizontal className="h-4 w-4 text-[#65605C] shrink-0" />
              <span className="inline-flex items-center justify-center h-5 px-2 rounded-full text-[11px] font-extrabold bg-[#1A1918] text-[#FFFFFF] shrink-0 shadow-xs">
                Step {currentStepIndex + 1} of {TOUR_STEPS.length}
              </span>
              <span className="text-[10px] font-black text-emerald-950 bg-emerald-100 border border-emerald-300 rounded-full px-2 py-0.5 shrink-0">
                {currentStep.badge}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Opacity Adjustment Button */}
              <button
                onClick={() => setShowOpacitySlider(!showOpacitySlider)}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                  showOpacitySlider
                    ? 'bg-[#1A1918] text-white'
                    : 'text-[#65605C] hover:text-[#1A1918] hover:bg-black/5'
                }`}
                title="Adjust Window Translucency"
              >
                <SunMedium className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono">{Math.round(opacity * 100)}%</span>
              </button>

              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 rounded-lg text-[#65605C] hover:text-[#1A1918] hover:bg-black/5 transition-colors"
                title="Minimize tour card"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={handleDismiss}
                className="p-1 rounded-lg text-[#65605C] hover:text-[#1A1918] hover:bg-black/5 transition-colors"
                title="Exit tour (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Opacity Adjuster Tray */}
          {showOpacitySlider && (
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
              }}
              className="px-4 py-2 flex items-center justify-between gap-3 text-xs"
            >
              <span className="text-[11px] font-bold text-[#1A1918]">Window Opacity:</span>
              <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                <input
                  type="range"
                  min="0.15"
                  max="0.95"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#CEC8C4] rounded-lg appearance-none cursor-pointer accent-[#1A1918]"
                />
                <span className="font-mono text-[11px] font-bold text-[#1A1918] w-8 text-right">
                  {Math.round(opacity * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setOpacity(0.25)}
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-[#CEC8C4] hover:bg-[#F6F4F3]"
                  title="25% - High Translucency"
                >
                  Clear
                </button>
                <button
                  onClick={() => setOpacity(0.5)}
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-[#CEC8C4] hover:bg-[#F6F4F3]"
                  title="50% - Medium Glass"
                >
                  Glass
                </button>
                <button
                  onClick={() => setOpacity(0.85)}
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-[#CEC8C4] hover:bg-[#F6F4F3]"
                  title="85% - Solid View"
                >
                  Solid
                </button>
              </div>
            </div>
          )}

          {/* Content Body - Clear typography with zero background blur obstruction */}
          <div className="p-4 pt-3">
            <div className="flex items-start gap-3 mb-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs">
                <StepIcon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-black text-[#1A1918] leading-tight">
                  {currentStep.title}
                </h3>
                <p className="text-[11px] text-[#1A1918] mt-1 font-semibold leading-relaxed">
                  {currentStep.description}
                </p>
              </div>
            </div>

            {/* Translucent Key Highlights Panel */}
            <div
              style={{
                backgroundColor: `rgba(255, 255, 255, ${Math.max(0.15, opacity * 0.5)})`,
                border: '1px solid rgba(0, 0, 0, 0.08)',
              }}
              className="my-2.5 p-3 rounded-xl shadow-2xs space-y-1.5"
            >
              <span className="text-[9px] font-black uppercase tracking-wider text-[#57534E] block">
                Key Highlights
              </span>
              <ul className="space-y-1">
                {currentStep.keyHighlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-[11px] text-[#1A1918] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                    <span className="leading-tight">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Progress Dots & Drag Hint */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                {TOUR_STEPS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentStepIndex
                        ? 'w-5 bg-[#1A1918]'
                        : idx < currentStepIndex
                        ? 'w-1.5 bg-emerald-700'
                        : 'w-1.5 bg-black/20'
                    }`}
                    title={`Jump to step ${idx + 1}`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-[#57534E] font-bold">
                Drag header to move
              </span>
            </div>
          </div>

          {/* Action Buttons Footer with Resize Handle */}
          <div
            style={{
              backgroundColor: `rgba(255, 255, 255, ${Math.min(0.85, opacity + 0.15)})`,
              borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            }}
            className="relative px-4 py-3 flex items-center justify-between gap-2"
          >
            <button
              onClick={handleDismiss}
              className="text-[11px] font-bold text-[#65605C] hover:text-[#1A1918] px-2 py-1.5 rounded-lg hover:bg-black/5 transition-colors"
            >
              Skip
            </button>

            <div className="flex items-center gap-1.5 pr-3">
              {!isFirstStep && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border border-black/15 bg-white text-[#1A1918] hover:bg-black/5 transition-colors shadow-2xs"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back</span>
                </button>
              )}

              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-extrabold bg-[#1A1918] text-[#FFFFFF] hover:bg-[#2E2C2A] shadow-md transition-all active:scale-98"
              >
                <span>{isLastStep ? 'Complete' : 'Next Step'}</span>
                {isLastStep ? (
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Corner Resize Grip */}
            <div
              onMouseDown={handleResizeStart}
              title="Click and drag horizontally to resize"
              className="absolute bottom-1 right-1.5 w-4 h-4 cursor-ew-resize flex items-end justify-end p-0.5 opacity-60 hover:opacity-100 transition-opacity"
            >
              <svg className="w-3 h-3 text-[#57534E]" viewBox="0 0 6 6" fill="currentColor">
                <circle cx="5" cy="5" r="0.8" />
                <circle cx="5" cy="2" r="0.8" />
                <circle cx="2" cy="5" r="0.8" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTour;

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Zap,
  Smartphone,
  Trophy,
  Compass,
  Bot,
  Coins,
  Play,
  Layers,
  Sliders,
  History,
  LayoutDashboard,
  BrainCircuit,
  Scale,
  FlaskConical,
  BookOpenCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { api } from '../api/client';
import { RecoveryCaseSummary } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRazorpay: () => void;
  onOpenTouchpoint: () => void;
  onOpenJudgeDemo: () => void;
  onOpenCopilot: () => void;
  onRunBatch?: () => void;
}

interface CommandItem {
  id: string;
  category: 'Actions' | 'Pages' | 'Cases';
  title: string;
  subtitle?: string;
  icon: any;
  iconColor: string;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenRazorpay,
  onOpenTouchpoint,
  onOpenJudgeDemo,
  onOpenCopilot,
  onRunBatch,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cases, setCases] = useState<RecoveryCaseSummary[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      api.getCases().then((list) => setCases(list.slice(0, 8))).catch(() => {});
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Static action and navigation items
  const baseItems: CommandItem[] = [
    {
      id: 'demo_mode',
      category: 'Actions',
      title: 'Start 5-Act Guided Walkthrough',
      subtitle: 'Curated end-to-end interactive walkthrough across 5 recovery scenarios',
      icon: Compass,
      iconColor: 'text-amber-500',
      action: () => {
        onClose();
        onOpenJudgeDemo();
      },
    },
    {
      id: 'razorpay_modal',
      category: 'Actions',
      title: 'Launch Official Razorpay Checkout Modal',
      subtitle: 'Open the live Razorpay payment popup with UPI, QR, and Cards',
      icon: Zap,
      iconColor: 'text-blue-500',
      action: () => {
        onClose();
        onOpenRazorpay();
      },
    },
    {
      id: 'touchpoint_preview',
      category: 'Actions',
      title: 'Preview Customer WhatsApp / SMS Message',
      subtitle: 'See what the customer sees on their smartphone',
      icon: Smartphone,
      iconColor: 'text-emerald-500',
      action: () => {
        onClose();
        onOpenTouchpoint();
      },
    },
    {
      id: 'copilot',
      category: 'Actions',
      title: 'Ask AI Ops Copilot (Groq LLM)',
      subtitle: 'Chat with the autonomous agent powered by openai/gpt-oss-120b',
      icon: Bot,
      iconColor: 'text-emerald-600',
      action: () => {
        onClose();
        onOpenCopilot();
      },
    },
    {
      id: 'run_batch',
      category: 'Actions',
      title: 'Execute Recovery Batch (25 Transactions)',
      subtitle: 'Run autonomous agent sequencing on 25 simulated failures',
      icon: Play,
      iconColor: 'text-[#1A1918]',
      action: () => {
        onClose();
        if (onRunBatch) onRunBatch();
      },
    },
    // Pages
    {
      id: 'page_dashboard',
      category: 'Pages',
      title: 'Executive Dashboard & Sandbox',
      subtitle: 'Overview KPIs, Interactive Sandbox, and ROI Calculator',
      icon: LayoutDashboard,
      iconColor: 'text-[#65605C]',
      action: () => {
        onClose();
        navigate('/dashboard');
      },
    },
    {
      id: 'page_cases',
      category: 'Pages',
      title: 'Recovery Cases Directory',
      subtitle: 'Inspect all 25+ failure diagnoses and sequential steps',
      icon: Layers,
      iconColor: 'text-[#65605C]',
      action: () => {
        onClose();
        navigate('/cases');
      },
    },
    {
      id: 'page_stepper',
      category: 'Pages',
      title: 'Live Agent 10-Stage Execution Stepper',
      subtitle: 'Inspect reasoning from Detection to Thompson Sampling',
      icon: Sparkles,
      iconColor: 'text-blue-600',
      action: () => {
        onClose();
        navigate('/stepper');
      },
    },
    {
      id: 'page_policies',
      category: 'Pages',
      title: 'Policy Center & Guardrails',
      subtitle: 'Deterministic cooldown rules and high-value limits',
      icon: Sliders,
      iconColor: 'text-[#65605C]',
      action: () => {
        onClose();
        navigate('/policies');
      },
    },
    {
      id: 'page_ledger',
      category: 'Pages',
      title: 'Revenue Ledger & Financial Audit',
      subtitle: 'Reconcile net recovery value, action costs, and ROI',
      icon: BookOpenCheck,
      iconColor: 'text-[#65605C]',
      action: () => {
        onClose();
        navigate('/ledger');
      },
    },
    {
      id: 'page_comparison',
      category: 'Pages',
      title: 'Strategy Comparison Benchmarks',
      subtitle: 'RecoverAI vs Naive Retries across 4 environments',
      icon: Scale,
      iconColor: 'text-[#65605C]',
      action: () => {
        onClose();
        navigate('/comparison');
      },
    },
    {
      id: 'page_audit',
      category: 'Pages',
      title: 'Immutable Audit Timeline',
      subtitle: 'Inspect 300+ verifiable decision log entries',
      icon: History,
      iconColor: 'text-[#65605C]',
      action: () => {
        onClose();
        navigate('/audit');
      },
    },
  ];

  // Dynamic case search items
  const caseItems: CommandItem[] = cases.map((c) => ({
    id: `case_${c.transaction_id}`,
    category: 'Cases',
    title: `Case ${c.transaction_id} — ₹${c.amount.toLocaleString('en-IN')}`,
    subtitle: `Customer: ${c.customer_id} • Status: ${c.status} • Diagnosis: ${c.diagnosis}`,
    icon: Layers,
    iconColor: c.status === 'RECOVERED' ? 'text-emerald-600' : 'text-amber-500',
    action: () => {
      onClose();
      navigate(`/cases/${c.transaction_id}`);
    },
  }));

  const allItems = [...baseItems, ...caseItems];

  // Filter based on query
  const filtered = allItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(query.toLowerCase()))
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  const content = (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E0DBD8]">
          <Search className="h-5 w-5 text-[#8F8985] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, transaction ID, or page name..."
            className="flex-1 bg-transparent text-sm text-[#1A1918] placeholder:text-[#8F8985] focus:outline-none"
          />
          <span className="rounded-md bg-[#F6F4F3] border border-[#DDD8D5] px-1.5 py-0.5 text-[10px] font-mono text-[#706B67]">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8F8985]">
              No commands or transactions matching "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected ? 'bg-[#0c2340] text-white' : 'hover:bg-[#F6F4F3] text-[#1A1918]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        isSelected ? 'bg-white/15 text-white' : 'bg-[#F6F4F3] ' + item.iconColor
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{item.title}</div>
                      {item.subtitle && (
                        <div
                          className={`text-[11px] truncate ${
                            isSelected ? 'text-blue-200' : 'text-[#706B67]'
                          }`}
                        >
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-[#F6F4F3] text-[#8F8985] border border-[#DDD8D5]'
                    }`}
                  >
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hotkeys Hint */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#F6F4F3] border-t border-[#E0DBD8] text-[10px] text-[#8F8985]">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono font-bold">↑</kbd> <kbd className="font-mono font-bold">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="font-mono font-bold">↵</kbd> to select
            </span>
          </div>
          <span>RecoverAI Command Core</span>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

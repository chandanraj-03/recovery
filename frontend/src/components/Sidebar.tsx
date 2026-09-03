import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  LayoutDashboard,
  Layers,
  PlayCircle,
  FlaskConical,
  Scale,
  BrainCircuit,
  Sliders,
  BookOpenCheck,
  History,
  Info,
} from 'lucide-react';

interface SidebarProps {
  totalCasesCount?: number;
  onStartTour?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ totalCasesCount = 0, onStartTour }) => {
  const operationalNavItems = [
    {
      to: '/dashboard',
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/cases',
      label: 'Recovery Cases',
      icon: Layers,
      badge: totalCasesCount > 0 ? `${totalCasesCount}` : undefined,
    },
    {
      to: '/stepper',
      label: 'Live Agent Stepper',
      icon: PlayCircle,
      highlight: true,
    },
    {
      to: '/experiments',
      label: 'Experiment Lab',
      icon: FlaskConical,
    },
    {
      to: '/comparison',
      label: 'Strategy Comparison',
      icon: Scale,
    },
    {
      to: '/memory',
      label: 'Recovery Memory',
      icon: BrainCircuit,
    },
    {
      to: '/policies',
      label: 'Policy Center',
      icon: Sliders,
    },
    {
      to: '/ledger',
      label: 'Revenue Ledger',
      icon: BookOpenCheck,
    },
    {
      to: '/audit',
      label: 'Audit Timeline',
      icon: History,
    },
  ];

  return (
    <aside className="flex w-64 flex-col border-r border-[#CEC8C4] bg-[#EBE8E7] p-4 text-[#1A1918]">
      <div className="mb-2 px-3 py-1">
        <span className="text-[10px] font-bold tracking-wider text-[#8F8985] uppercase">
          Merchant Navigation
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {/* Product Tour Action */}
        {onStartTour && (
          <button
            onClick={onStartTour}
            className="w-full mb-2 flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-all border border-blue-200 bg-blue-50/80 text-blue-900 hover:bg-blue-100 hover:border-blue-300 active:scale-98 text-left shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <Compass className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Take Product Tour</span>
            </div>
            <span className="rounded-full bg-blue-200/80 px-1.5 py-0.5 text-[9px] font-extrabold text-blue-900 uppercase">
              Tour
            </span>
          </button>
        )}

        {/* 3. Operational Navigation Views */}
        {operationalNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#1A1918] text-[#FFFFFF] shadow-sm'
                    : 'text-[#65605C] hover:bg-[#DDD8D5]/60 hover:text-[#1A1918]'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="rounded-full bg-[#CEC8C4] px-1.5 py-0.2 text-[10px] font-bold text-[#1A1918]">
                  {item.badge}
                </span>
              )}
              {item.highlight && (
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-agent-pulse shrink-0" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Mentor Requirement Quick Reference Callout */}
      <div className="mt-3 rounded-xl border border-[#DDD8D5] bg-[#FFFFFF] p-3.5 shadow-xs shrink-0">
        <div className="flex items-center gap-2 text-xs font-bold text-[#1A1918]">
          <Info className="h-3.5 w-3.5 text-blue-600 shrink-0" />
          <span>Core Agent Principles</span>
        </div>
        <ul className="mt-2 space-y-1 text-[11px] text-[#65605C]">
          <li>• Evidence-based diagnosis</li>
          <li>• Sequential, bounded decisions</li>
          <li>• Long-term value optimization</li>
          <li>• Policy engine safety stops</li>
          <li>• Thompson sampling adaptation</li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;

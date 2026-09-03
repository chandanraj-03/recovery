import React, { useState, useEffect } from 'react';
import { Zap, ShieldCheck, CreditCard, Activity, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ActivityItem {
  id: string;
  time: string;
  type: 'decision' | 'policy' | 'razorpay' | 'learning';
  icon: any;
  iconColor: string;
  text: string;
  badge: string;
  badgeColor: string;
  link?: string;
}

const SAMPLE_EVENTS: ActivityItem[] = [
  {
    id: '1',
    time: 'Just now',
    type: 'razorpay',
    icon: CreditCard,
    iconColor: 'text-blue-600',
    badge: 'Razorpay Action',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    text: 'Dispatched Razorpay payment link (rzp.io) for ₹16,423 to VIP Customer C102.',
    link: '/cases',
  },
  {
    id: '2',
    time: '20s ago',
    type: 'decision',
    icon: Zap,
    iconColor: 'text-amber-500',
    badge: 'Agent Diagnosis',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    text: 'Identified transient gateway timeout (91% conf). Cooldown scheduled for 30 min.',
    link: '/stepper',
  },
  {
    id: '3',
    time: '1m ago',
    type: 'policy',
    icon: ShieldCheck,
    iconColor: 'text-emerald-600',
    badge: 'Deterministic Guard',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    text: 'Blocked aggressive retry #3 on Customer C291 — customer friction preserved.',
    link: '/policies',
  },
  {
    id: '4',
    time: '2m ago',
    type: 'decision',
    icon: Activity,
    iconColor: 'text-purple-600',
    badge: 'Thompson Sampling',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    text: 'Posterior mean updated to 78.4% success for UPI Intent failure bucket.',
    link: '/memory',
  },
];

export const LiveActivityTicker: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SAMPLE_EVENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const event = SAMPLE_EVENTS[currentIndex];
  const Icon = event.icon;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] px-4 py-2.5 shadow-2xs">
      {/* Left: Pulsing Live Indicator */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-600" />
        </div>
        <span className="text-xs font-extrabold uppercase tracking-wider text-[#1A1918]">
          Live Agent Stream
        </span>
        <span className="hidden md:inline-block rounded-md bg-[#F6F4F3] border border-[#DDD8D5] px-2 py-0.5 text-[10px] font-bold text-[#706B67]">
          0.18s Decision Latency
        </span>
      </div>

      {/* Middle: Rotating Event Banner with Smooth Fade */}
      <div className="flex flex-1 items-center gap-2.5 overflow-hidden text-xs min-w-0">
        <span
          className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-extrabold ${event.badgeColor}`}
        >
          {event.badge}
        </span>
        <div className="flex items-center gap-1.5 min-w-0 text-[#1A1918] truncate">
          <Icon className={`h-3.5 w-3.5 shrink-0 ${event.iconColor}`} />
          <span className="font-medium truncate">{event.text}</span>
          <span className="text-[10px] font-semibold text-[#8F8985] shrink-0">({event.time})</span>
        </div>
      </div>

      {/* Right: Quick Action Link */}
      {event.link && (
        <Link
          to={event.link}
          className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-800 transition-colors"
        >
          <span>Inspect</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
};

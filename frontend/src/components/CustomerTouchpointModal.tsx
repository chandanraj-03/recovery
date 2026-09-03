import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  MessageSquare,
  Smartphone,
  Mail,
  Zap,
  CheckCheck,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  CreditCard,
  PhoneCall,
  Share2,
} from 'lucide-react';
import { RazorpayCheckoutModal } from './RazorpayCheckoutModal';

interface CustomerTouchpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId?: string;
  amount?: number;
  customerId?: string;
  customerName?: string;
}

export const CustomerTouchpointModal: React.FC<CustomerTouchpointModalProps> = ({
  isOpen,
  onClose,
  transactionId = 'TX10022',
  amount = 14200,
  customerId = 'C118',
  customerName = 'Rahul Verma',
}) => {
  const [activeChannel, setActiveChannel] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp');
  const [copied, setCopied] = useState(false);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const paymentLink = `https://rzp.io/rzp/JfvS5h8`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappMessage = `Hi ${customerName}, your payment of ₹${amount.toLocaleString('en-IN')} for Order #${transactionId} was declined by your card issuer. 

RecoverAI generated a safe recovery checkout link via Razorpay:
👉 ${paymentLink}

Click the link to complete your payment with UPI, QR, or NetBanking without re-entering card details. Valid for 24 hours.`;

  const smsMessage = `Acme Store: Payment of Rs.${amount.toLocaleString('en-IN')} for ${transactionId} failed. Complete safely via Razorpay: ${paymentLink} (Valid 24h)`;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl border border-[#DDD8D5] bg-[#FFFFFF] p-6 shadow-2xl my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-[#E0DBD8] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
              <Smartphone className="h-5 w-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#1A1918]">
                  Customer Touchpoint Simulator
                </h2>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                  End-User Experience
                </span>
              </div>
              <p className="text-xs text-[#706B67]">
                What the customer receives when RecoverAI dispatches an alternative payment action
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-xl p-2 text-[#706B67] hover:bg-[#F6F4F3] hover:text-[#1A1918] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Channel Switcher Tabs */}
        <div className="mt-4 flex items-center gap-2 border-b border-[#E0DBD8] pb-3">
          <button
            onClick={() => setActiveChannel('whatsapp')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeChannel === 'whatsapp'
                ? 'bg-[#128C7E] text-white shadow-xs'
                : 'bg-[#F6F4F3] text-[#65605C] hover:bg-[#DDD8D5]'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>WhatsApp Business</span>
          </button>

          <button
            onClick={() => setActiveChannel('sms')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeChannel === 'sms'
                ? 'bg-[#0c2340] text-white shadow-xs'
                : 'bg-[#F6F4F3] text-[#65605C] hover:bg-[#DDD8D5]'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>SMS Cellular</span>
          </button>

          <button
            onClick={() => setActiveChannel('email')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeChannel === 'email'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-[#F6F4F3] text-[#65605C] hover:bg-[#DDD8D5]'
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Transactional Email</span>
          </button>
        </div>

        {/* Smartphone Screen Simulator Canvas */}
        <div className="mt-4 rounded-2xl border border-[#DDD8D5] bg-[#EBE8E7] p-4">
          {/* 1. WhatsApp View */}
          {activeChannel === 'whatsapp' && (
            <div className="rounded-xl overflow-hidden shadow-md border border-[#c4e0db]">
              {/* WhatsApp Header Bar */}
              <div className="bg-[#075E54] text-white px-3.5 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                    R
                  </div>
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1">
                      <span>RecoverAI Merchant</span>
                      <span className="h-3 w-3 rounded-full bg-emerald-400 text-[#075E54] flex items-center justify-center text-[8px] font-black">
                        ✓
                      </span>
                    </div>
                    <div className="text-[10px] text-emerald-100 opacity-90">Official Business Account</div>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-200">10:42 AM</span>
              </div>

              {/* Chat Canvas */}
              <div className="bg-[#ECE5DD] p-3.5 space-y-2 text-xs">
                <div className="bg-white rounded-xl rounded-tl-none p-3 max-w-[92%] shadow-xs space-y-2">
                  <p className="text-[#1A1918] leading-relaxed">
                    Hi <strong className="font-bold">{customerName}</strong>, your payment of{' '}
                    <span className="font-bold text-emerald-800">₹{amount.toLocaleString('en-IN')}</span> for Order #{transactionId} was declined by your card issuer.
                  </p>
                  <p className="text-[#65605C] text-[11px]">
                    To protect your order from cancellation, our automated system prepared a secure alternative checkout via Razorpay.
                  </p>

                  {/* Interactive Button in WhatsApp */}
                  <div className="pt-2 border-t border-gray-100">
                    <button
                      onClick={() => setIsRazorpayOpen(true)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366] text-[#075E54] py-2 px-3 text-xs font-extrabold shadow-xs hover:bg-[#1EBE5D] transition-all cursor-pointer"
                    >
                      <Zap className="h-3.5 w-3.5 fill-[#075E54]" />
                      <span>⚡ Pay ₹{amount.toLocaleString('en-IN')} with Razorpay</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-end gap-1 text-[9px] text-[#8F8985] pt-0.5">
                    <span>10:42 AM</span>
                    <CheckCheck className="h-3 w-3 text-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. SMS View */}
          {activeChannel === 'sms' && (
            <div className="rounded-xl overflow-hidden shadow-md border border-[#DDD8D5] bg-white">
              <div className="bg-[#F6F4F3] border-b border-[#E0DBD8] px-4 py-2 flex items-center justify-between text-xs">
                <div className="font-bold text-[#1A1918]">Messages • VK-RZPAY</div>
                <span className="text-[10px] text-[#8F8985]">Now</span>
              </div>
              <div className="p-4 bg-gray-50">
                <div className="bg-[#0c2340] text-white p-3.5 rounded-2xl rounded-tl-xs max-w-[90%] text-xs shadow-xs space-y-2">
                  <p className="leading-relaxed">{smsMessage}</p>
                  <div className="pt-1">
                    <button
                      onClick={() => setIsRazorpayOpen(true)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-300 underline hover:text-white"
                    >
                      <span>Click to open link</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Transactional Email View */}
          {activeChannel === 'email' && (
            <div className="rounded-xl overflow-hidden shadow-md border border-[#DDD8D5] bg-white text-xs">
              <div className="border-b border-[#E0DBD8] p-3 bg-gray-50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#1A1918]">From: orders@merchant.recoverai.demo</div>
                  <div className="text-[11px] text-[#65605C]">Subject: Action Required: Complete Order #{transactionId}</div>
                </div>
                <span className="text-[10px] text-[#8F8985]">10:42 AM</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-sm text-[#1A1918]">Acme Merchant Store</span>
                  <span className="text-emerald-700 font-extrabold text-sm">
                    ₹{amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[#65605C] leading-relaxed">
                  Hi {customerName}, your previous payment attempt was unfulfilled due to an issuer timeout. Click below to complete your checkout safely via Razorpay rails.
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => setIsRazorpayOpen(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0c2340] text-white py-2.5 px-4 text-xs font-bold shadow-sm hover:bg-[#15345d] transition-all cursor-pointer"
                  >
                    <CreditCard className="h-4 w-4 text-blue-400" />
                    <span>Complete Order via Razorpay Checkout</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#E0DBD8]">
          <button
            onClick={() => handleCopy(activeChannel === 'whatsapp' ? whatsappMessage : smsMessage)}
            className="flex items-center gap-1.5 rounded-xl border border-[#CEC8C4] px-3.5 py-2 text-xs font-semibold text-[#1A1918] hover:bg-[#F6F4F3] transition-all cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Message Template'}</span>
          </button>

          <button
            onClick={() => setIsRazorpayOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#0c2340] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#15345d] transition-all cursor-pointer"
          >
            <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span>⚡ Test Customer Click (Open Razorpay Checkout)</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between text-[11px] text-[#8F8985] pt-2 border-t border-[#E0DBD8]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Zero Customer Spam • Bounded 1 message max
          </span>
          <span>Razorpay Rails</span>
        </div>
      </div>

      {/* Embedded Live Razorpay Checkout Modal */}
      <RazorpayCheckoutModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        transactionId={transactionId}
        amount={amount}
        customerId={customerId}
      />
    </div>
  );

  return createPortal(modalContent, document.body);
};

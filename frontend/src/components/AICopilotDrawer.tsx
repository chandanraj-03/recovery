import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../api/client';
import {
  Bot,
  Send,
  X,
  Mic,
  MicOff,
  Sparkles,
  RefreshCw,
  Zap,
  ShieldCheck,
  TrendingUp,
  User,
} from 'lucide-react';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onActionTriggered?: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  time: string;
}

const SUGGESTIONS = [
  'Why avoid aggressive retries on failing cards?',
  'What is our current Net Recovery Value and ROI?',
  'How do deterministic policy guardrails protect merchants?',
  'Explain how Thompson Sampling adapts to failure types.',
];

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  onActionTriggered,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'agent',
      text: "Hello! I am RecoverAI's AI Operations Copilot powered by Groq LLM (openai/gpt-oss-120b). Ask me about recovery decisions, customer friction economics, or policy guardrails.",
      time: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSendMessage = async (queryText?: string) => {
    const text = queryText || inputQuery;
    if (!text.trim() || isThinking) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    try {
      const res = await api.chatAgent(text.trim());
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: res.response || 'No response received from agent.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch (err: any) {
      console.error('Chat failed:', err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: 'Sorry, could not connect to Groq AI Ops Agent: ' + (err.message || 'Network error'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleVoiceToggle = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(transcript);
        handleSendMessage(transcript);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const drawerContent = (
    <div
      className="fixed inset-0 z-[9999] flex justify-end bg-black/50 backdrop-blur-2xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex h-full w-full max-w-md flex-col bg-[#FFFFFF] shadow-2xl border-l border-[#DDD8D5] animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-[#E0DBD8] px-5 py-4 bg-[#F6F4F3]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A1918] text-white shadow-xs">
              <Bot className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-[#1A1918]">AI Ops Copilot</h3>
                <span className="rounded-md bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                  Groq 120B
                </span>
              </div>
              <p className="text-[11px] text-[#706B67]">
                Autonomous Recovery Intelligence & Explainability
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="rounded-xl p-1.5 text-[#706B67] hover:bg-[#DDD8D5]/50 hover:text-[#1A1918] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Chat Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#EBE8E7]/30">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-end gap-1.5 max-w-[88%]">
                {msg.sender === 'agent' && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#1A1918] text-emerald-400 shrink-0 mb-1">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-xs shadow-xs leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-[#0c2340] text-white rounded-br-xs'
                      : 'bg-[#FFFFFF] text-[#1A1918] border border-[#DDD8D5] rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
              <span className="mt-1 text-[10px] font-semibold text-[#8F8985] px-1">
                {msg.time}
              </span>
            </div>
          ))}

          {/* Thinking Indicator */}
          {isThinking && (
            <div className="flex items-center gap-2 text-xs text-[#706B67] pl-8">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-600" />
              <span>AI Ops Agent analyzing platform state...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="border-t border-[#E0DBD8] px-4 py-2.5 bg-[#FFFFFF]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F8985] block mb-1.5">
            Suggested Prompts:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(s)}
                disabled={isThinking}
                className="rounded-lg border border-[#DDD8D5] bg-[#F6F4F3] px-2 py-1 text-[11px] font-medium text-[#1A1918] hover:bg-[#E0DBD8] transition-colors disabled:opacity-50 text-left"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="border-t border-[#E0DBD8] p-3.5 bg-[#FFFFFF]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleVoiceToggle}
              title={isListening ? 'Stop listening' : 'Speak command'}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all shrink-0 ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'border border-[#CEC8C4] bg-[#F6F4F3] text-[#65605C] hover:text-[#1A1918]'
              }`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={isListening ? 'Listening...' : 'Ask about recovery, policies, LTV...'}
              disabled={isThinking}
              className="flex-1 rounded-xl border border-[#CEC8C4] bg-[#F6F4F3] px-3.5 py-2 text-xs text-[#1A1918] focus:outline-none focus:border-[#1A1918] focus:bg-[#FFFFFF] transition-all"
            />

            <button
              type="submit"
              disabled={!inputQuery.trim() || isThinking}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0c2340] text-white shadow-xs hover:bg-[#15345d] transition-all disabled:opacity-40 shrink-0 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
};

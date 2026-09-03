import React, { useState } from 'react';
import { Mic, MicOff, Send, X, Bot, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VoiceCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunBatch?: () => void;
}

export const VoiceCommandModal: React.FC<VoiceCommandModalProps> = ({
  isOpen,
  onClose,
  onRunBatch,
}) => {
  const navigate = useNavigate();
  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [agentResponse, setAgentResponse] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your command below.');
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
        handleExecuteCommand(transcript);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleExecuteCommand = (command: string) => {
    const q = command.toLowerCase().trim();

    if (q.includes('run recovery') || q.includes('failed payment') || q.includes('run batch')) {
      if (onRunBatch) onRunBatch();
      setAgentResponse(
        'Executing recovery sequencing batch on failed payment cases under active deterministic policies. Check Overview Dashboard for live metrics.'
      );
      setTimeout(() => {
        onClose();
        navigate('/cases');
      }, 1800);
    } else if (q.includes('stopped') || q.includes('stop')) {
      setAgentResponse(
        'Filtering recovery cases where RecoverAI or Policy Engine decided to STOP. Stopping prevents unnecessary customer contact and preserves future relationship value.'
      );
      setTimeout(() => {
        onClose();
        navigate('/cases');
      }, 1500);
    } else if (q.includes('delayed retry') || q.includes('why')) {
      setAgentResponse(
        'RecoverAI prefers delayed retry when evidence indicates insufficient funds or high customer friction. Immediate retries have a low recovery rate (~18%) and compound friction, whereas waiting 24 hours yields ~60% recovery with minimal relationship erosion.'
      );
    } else if (q.includes('compare') || q.includes('fixed rule') || q.includes('baseline')) {
      setAgentResponse(
        'Opening Experiment Lab comparing RecoverAI against Always Retry, Fixed Rules, and Immediate Revenue Optimizer across 4 simulated environments.'
      );
      setTimeout(() => {
        onClose();
        navigate('/experiments');
      }, 1500);
    } else if (q.includes('policy') || q.includes('rules')) {
      onClose();
      navigate('/policies');
    } else if (q.includes('stepper') || q.includes('live')) {
      onClose();
      navigate('/stepper');
    } else {
      setAgentResponse(
        `Understood "${command}". The RecoverAI agentic orchestrator is ready. You can inspect live decision chains, test changing environments, or view learned recovery memory in the console.`
      );
    }
  };

  const presetCommands = [
    "Run recovery on today's failed payments.",
    "Show me transactions where the agent stopped.",
    "Why did RecoverAI choose delayed retry?",
    "Compare RecoverAI with fixed rules.",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-[#CEC8C4] bg-[#FFFFFF] p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E0DBD8] pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1A1918] text-[#EBE8E7]">
              <Bot className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A1918]">RecoverAI Operations Agent</h3>
              <p className="text-[11px] text-[#8F8985]">Voice & Command Interface</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#8F8985] hover:bg-[#F6F4F3] hover:text-[#1A1918]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Input Box */}
        <div className="mt-4">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputQuery.trim()) {
                  handleExecuteCommand(inputQuery);
                }
              }}
              placeholder="Ask agent e.g. 'Why did you choose delayed retry?'..."
              className="w-full rounded-xl border border-[#CEC8C4] bg-[#F6F4F3] py-2.5 pr-20 pl-3.5 text-xs text-[#1A1918] placeholder-[#8F8985] focus:border-[#1A1918] focus:bg-[#FFFFFF] focus:outline-none"
            />
            <div className="absolute right-1.5 flex items-center gap-1">
              <button
                type="button"
                onClick={handleSpeechRecognition}
                title="Speak command"
                className={`rounded-lg p-1.5 transition-colors ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-[#65605C] hover:bg-[#DDD8D5] hover:text-[#1A1918]'
                }`}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => inputQuery.trim() && handleExecuteCommand(inputQuery)}
                className="rounded-lg bg-[#1A1918] p-1.5 text-[#FFFFFF] hover:bg-[#2E2C2A]"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Presets */}
        <div className="mt-4">
          <span className="text-[11px] font-semibold text-[#8F8985]">Recommended Ops Queries:</span>
          <div className="mt-2 space-y-1.5">
            {presetCommands.map((cmd, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputQuery(cmd);
                  handleExecuteCommand(cmd);
                }}
                className="flex w-full items-center justify-between rounded-lg border border-[#DDD8D5] bg-[#F6F4F3] px-3 py-2 text-left text-xs font-medium text-[#1A1918] transition-colors hover:border-[#CEC8C4] hover:bg-[#FFFFFF]"
              >
                <span>{cmd}</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#8F8985]" />
              </button>
            ))}
          </div>
        </div>

        {/* Response Box */}
        {agentResponse && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>Agent Rationale</span>
            </div>
            <p className="mt-1 text-emerald-800 leading-relaxed">{agentResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
};

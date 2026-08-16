import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  Waves, 
  Flame, 
  Droplets, 
  Construction, 
  Trash2,
  CornerDownLeft,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AiCopilotMessage } from '../types';

interface AICommandCenterProps {
  onTriggerAction?: (actionType: string, params?: any) => void;
}

const SAMPLE_PROMPTS = [
  {
    title: '🌊 Flood Forecast',
    prompt: 'Which areas of the city are most likely to flood tomorrow, and what is the expected peak timing?',
  },
  {
    title: '💧 Ward 18 Water Risk',
    prompt: 'Why is Ward 18 showing high water risk, and what is the reservoir drawdown rate?',
  },
  {
    title: '🛡️ Preventive Actions for Ward 12',
    prompt: 'What preventive actions should municipal authorities deploy for Ward 12 before the 6 PM rain peak?',
  },
  {
    title: '🛣️ Road Degradation Audit',
    prompt: 'Run an infrastructure priority audit for high-risk potholes and damaged manholes.',
  },
  {
    title: '🌡️ Heatwave Protocol',
    prompt: 'What are the peak heatwave predictions today, and are cooling centres equipped for vulnerable wards?',
  },
  {
    title: '🗑️ Waste Overflow Mitigation',
    prompt: 'Identify critical waste hotspots approaching overflow and optimize compactor truck routes.',
  }
];

export const AICommandCenter: React.FC<AICommandCenterProps> = ({ onTriggerAction }) => {
  const [messages, setMessages] = useState<AiCopilotMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `### 🛡️ Welcome to Urban Resilience AI Command Center

I am your proactive **Smart-City Copilot**. Unlike legacy reactive systems that only respond after citizen complaints, I continuously analyze satellite radar passes, IoT water sensors, road computer vision feeds, and meteorological models to **predict urban failures before they happen**.

**You can ask me questions like:**
* *"Which wards are most likely to flood during tonight's monsoon peak?"*
* *"Why is Ward 18 experiencing acute water stress?"*
* *"Recommend preventive pump placement for Ward 12."*
* *"Which road defects require emergency P1 night-milling?"*

Select one of the prompt chips below or type your inquiry to begin.`,
      timestamp: new Date().toISOString()
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (promptToSend?: string) => {
    const text = (promptToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    const userMessage: AiCopilotMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          conversationHistory: messages
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages(prev => [...prev, data.message]);
        }
      } else {
        const errData = await res.json();
        setMessages(prev => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: `**⚠️ Copilot Notice:** ${errData.error || 'Failed to process copilot query.'}`,
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `**⚠️ Connectivity Notice:** Unable to reach AI Copilot backend. Please check network status.`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[580px] bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden text-slate-100">
      {/* Top Header */}
      <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-white">AI Urban Command Copilot</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                Gemini 2.5 Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Conversational decision support synthesizing telemetry across all 5 urban resilience vectors
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([messages[0]]);
          }}
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs inline-flex items-center gap-1.5 transition-colors"
          title="Reset conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5 text-indigo-400">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white shadow-md rounded-tr-none'
                  : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 shadow-sm rounded-tl-none'
              }`}
            >
              <div className="prose prose-invert max-w-none text-xs sm:text-sm prose-p:my-1.5 prose-headings:my-2 prose-ul:my-1.5 prose-li:my-0.5 prose-strong:text-white">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[10px] text-slate-400">
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="inline-flex items-center gap-1 hover:text-slate-200 transition-colors"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy Directive
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-slate-300">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3.5 justify-start">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0 text-indigo-400 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl rounded-tl-none p-4 text-xs text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>Analyzing city telemetry, weather radar &amp; infrastructure vulnerability models...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Row */}
      <div className="px-6 py-2 bg-slate-950/40 border-t border-slate-800/80 overflow-x-auto">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider shrink-0">
            Quick Prompts:
          </span>
          {SAMPLE_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(item.prompt)}
              className="shrink-0 px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-medium transition-all active:scale-95 flex items-center gap-1.5"
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input Box */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask AI Copilot (e.g., 'Which areas will flood tomorrow?' or 'Recommend pump deployment for Ward 12')..."
              className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-xs sm:text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 shrink-0 active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>
      </div>
    </div>
  );
};

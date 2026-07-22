import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Bot, BookOpen, User, Flame, Clock } from 'lucide-react';
import { sendChatMessage } from '../services/chatApi';

interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
}

interface Message {
  sender: 'user' | 'agent';
  agentName?: string;
  text: string;
  confidence?: number;
  riskLevel?: 'LOW' | 'MODERATE' | 'CRITICAL';
  citations?: string[];
}

export default function Chat() {
  const location = useLocation();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [sessions, setSessions] = useState<ChatSession[]>([]);

  const [activeSession, setActiveSession] = useState('1');
  const [selectedAgent, setSelectedAgent] = useState('AUTO');
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'agent',
      agentName: 'Mnemos',
      text: 'Mnemos Orchestrator initialized. **Select a specific agent** or use **Auto-Router** to delegate tasks. Type your query below.',
      confidence: 0.98,
      riskLevel: 'LOW',
      citations: ['Manual-v4.pdf', 'SOP-09.txt']
    }
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (location.state?.query) {
      const q = location.state.query as string;
      handleQuery(q);
    }
  }, [location.state]);

  const renderText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const resolveRiskLevel = (confidence: number): 'LOW' | 'MODERATE' | 'CRITICAL' => {
    if (confidence >= 0.9) return 'LOW';
    if (confidence >= 0.75) return 'MODERATE';
    return 'CRITICAL';
  };

  const resolveAgentName = (query: string): string => {
    if (selectedAgent !== 'AUTO') return selectedAgent;
    const lower = query.toLowerCase();
    if (lower.includes('rca') || lower.includes('cause') || lower.includes('fail')) return 'RcaAgent';
    if (lower.includes('lesson') || lower.includes('history') || lower.includes('incident')) return 'LessonsAgent';
    if (lower.includes('compliance') || lower.includes('standard') || lower.includes('safe')) return 'ComplianceAgent';
    return 'CopilotAgent';
  };

  const handleQuery = async (query: string) => {
    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    setTyping(true);
    setError(null);

    try {
      const data = await sendChatMessage(query);
      const agentName = resolveAgentName(query);
      const riskLevel = resolveRiskLevel(data.confidence);

      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          agentName,
          text: data.reply,
          confidence: data.confidence,
          riskLevel,
          citations: data.actions,
        }
      ]);

      setSessions((prev) => {
        const exists = prev.find((s) => s.title === query.slice(0, 40));
        if (exists) return prev;
        return [
          { id: String(Date.now()), title: query.slice(0, 40), timestamp: 'Just now' },
          ...prev
        ];
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to reach Mnemos backend: ${message}`);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          agentName: 'System',
          text: `⚠️ Could not reach the Mnemos backend. Please ensure the backend is running on port 8000.`,
          confidence: 0,
          riskLevel: 'CRITICAL',
        }
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || typing) return;
    const query = input.trim();
    setInput('');
    handleQuery(query);
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
      <aside className="w-64 bg-[#0F172A]/80 border-r border-slate-800 hidden md:flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">History</span>
          <Clock className="h-4 w-4 text-slate-500" />
        </div>
        <div className="flex-1 p-2 space-y-1 overflow-y-auto">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSession(s.id)}
              className={`w-full text-left p-3 rounded-lg text-xs transition-all ${activeSession === s.id
                  ? 'bg-slate-800 text-sky-400 font-semibold border-l-2 border-sky-400'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
            >
              <p className="truncate font-medium">{s.title}</p>
              <span className="text-[10px] text-slate-600 block mt-1">{s.timestamp}</span>
            </button>
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col bg-slate-900">
        <header className="px-6 py-4 border-b border-slate-800 bg-[#0F172A]/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Agent Router</span>
          </div>
          <div className="flex gap-2">
            {['AUTO', 'CopilotAgent', 'RcaAgent', 'LessonsAgent', 'ComplianceAgent'].map((agent) => (
              <button
                key={agent}
                onClick={() => setSelectedAgent(agent)}
                className={`px-3 py-1 rounded text-[10px] font-bold tracking-wide uppercase transition-all ${selectedAgent === agent
                    ? 'bg-sky-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
              >
                {agent === 'AUTO' ? 'Auto-Router' : agent.replace('Agent', '')}
              </button>
            ))}
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'agent' && (
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                  <Bot className="h-5 w-5" />
                </div>
              )}
              <div className="max-w-2xl space-y-2">
                <div className={`p-4 rounded-xl text-sm leading-relaxed border ${msg.sender === 'user'
                    ? 'bg-sky-500 text-slate-950 border-sky-400 font-medium'
                    : 'bg-slate-800/80 text-slate-200 border-slate-700/60'
                  }`}>
                  {msg.agentName && (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400 block mb-1">
                      {msg.agentName}
                    </span>
                  )}
                  <div>{renderText(msg.text)}</div>
                </div>

                {msg.sender === 'agent' && (
                  <div className="flex flex-wrap gap-2 items-center text-[10px]">
                    {msg.confidence !== undefined && msg.confidence > 0 && (
                      <span className="bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/20 font-mono font-bold">
                        {(msg.confidence * 100).toFixed(0)}% Confidence
                      </span>
                    )}
                    {msg.riskLevel && (
                      <span className={`px-2 py-0.5 rounded-full border font-bold flex items-center gap-1 ${msg.riskLevel === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          msg.riskLevel === 'MODERATE' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                        <Flame className="h-3 w-3" />
                        {msg.riskLevel} RISK
                      </span>
                    )}
                    {msg.citations && msg.citations.map((cite, idx) => (
                      <span key={idx} className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700/50 flex items-center gap-1 font-mono">
                        <BookOpen className="h-3 w-3 text-slate-500" />
                        {cite}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-sky-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                  <User className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}

          {typing && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                <Bot className="h-5 w-5" />
              </div>
              <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-xl flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-bounce"></span>
                <span className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {error && (
          <div className="mx-4 mb-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-[#0F172A] flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Query orchestrated agents..."
            disabled={typing}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={typing || !input.trim()}
            className="bg-sky-500 hover:bg-sky-400 text-slate-900 p-2.5 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

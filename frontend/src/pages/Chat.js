import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Bot, BookOpen, User, Flame, Clock } from 'lucide-react';
import { sendChatMessage } from '../services/chatApi';
export default function Chat() {
    const location = useLocation();
    const bottomRef = useRef(null);
    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState('1');
    const [selectedAgent, setSelectedAgent] = useState('AUTO');
    const [typing, setTyping] = useState(false);
    const [input, setInput] = useState('');
    const [error, setError] = useState(null);
    const [messages, setMessages] = useState([
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
            const q = location.state.query;
            handleQuery(q);
        }
    }, [location.state]);
    const renderText = (text) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return _jsx("strong", { className: "font-bold text-white", children: part.slice(2, -2) }, i);
            }
            return part;
        });
    };
    const resolveRiskLevel = (confidence) => {
        if (confidence >= 0.9)
            return 'LOW';
        if (confidence >= 0.75)
            return 'MODERATE';
        return 'CRITICAL';
    };
    const resolveAgentName = (query) => {
        if (selectedAgent !== 'AUTO')
            return selectedAgent;
        const lower = query.toLowerCase();
        if (lower.includes('rca') || lower.includes('cause') || lower.includes('fail'))
            return 'RcaAgent';
        if (lower.includes('lesson') || lower.includes('history') || lower.includes('incident'))
            return 'LessonsAgent';
        if (lower.includes('compliance') || lower.includes('standard') || lower.includes('safe'))
            return 'ComplianceAgent';
        return 'CopilotAgent';
    };
    const handleQuery = async (query) => {
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
                if (exists)
                    return prev;
                return [
                    { id: String(Date.now()), title: query.slice(0, 40), timestamp: 'Just now' },
                    ...prev
                ];
            });
        }
        catch (err) {
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
        }
        finally {
            setTyping(false);
        }
    };
    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim() || typing)
            return;
        const query = input.trim();
        setInput('');
        handleQuery(query);
    };
    return (_jsxs("div", { className: "flex h-[calc(100vh-12rem)] border border-slate-800 rounded-xl overflow-hidden bg-slate-950", children: [_jsxs("aside", { className: "w-64 bg-[#0F172A]/80 border-r border-slate-800 hidden md:flex flex-col", children: [_jsxs("div", { className: "p-4 border-b border-slate-800 flex items-center justify-between", children: [_jsx("span", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider", children: "History" }), _jsx(Clock, { className: "h-4 w-4 text-slate-500" })] }), _jsx("div", { className: "flex-1 p-2 space-y-1 overflow-y-auto", children: sessions.map((s) => (_jsxs("button", { onClick: () => setActiveSession(s.id), className: `w-full text-left p-3 rounded-lg text-xs transition-all ${activeSession === s.id
                                ? 'bg-slate-800 text-sky-400 font-semibold border-l-2 border-sky-400'
                                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`, children: [_jsx("p", { className: "truncate font-medium", children: s.title }), _jsx("span", { className: "text-[10px] text-slate-600 block mt-1", children: s.timestamp })] }, s.id))) })] }), _jsxs("div", { className: "flex-1 flex flex-col bg-slate-900", children: [_jsxs("header", { className: "px-6 py-4 border-b border-slate-800 bg-[#0F172A]/50 flex flex-wrap items-center justify-between gap-4", children: [_jsx("div", { className: "flex items-center gap-2", children: _jsx("span", { className: "text-xs font-semibold text-slate-400 uppercase", children: "Agent Router" }) }), _jsx("div", { className: "flex gap-2", children: ['AUTO', 'CopilotAgent', 'RcaAgent', 'LessonsAgent', 'ComplianceAgent'].map((agent) => (_jsx("button", { onClick: () => setSelectedAgent(agent), className: `px-3 py-1 rounded text-[10px] font-bold tracking-wide uppercase transition-all ${selectedAgent === agent
                                        ? 'bg-sky-500 text-slate-950'
                                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`, children: agent === 'AUTO' ? 'Auto-Router' : agent.replace('Agent', '') }, agent))) })] }), _jsxs("div", { className: "flex-1 p-6 overflow-y-auto space-y-6", children: [messages.map((msg, i) => (_jsxs("div", { className: `flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`, children: [msg.sender === 'agent' && (_jsx("div", { className: "w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0", children: _jsx(Bot, { className: "h-5 w-5" }) })), _jsxs("div", { className: "max-w-2xl space-y-2", children: [_jsxs("div", { className: `p-4 rounded-xl text-sm leading-relaxed border ${msg.sender === 'user'
                                                    ? 'bg-sky-500 text-slate-950 border-sky-400 font-medium'
                                                    : 'bg-slate-800/80 text-slate-200 border-slate-700/60'}`, children: [msg.agentName && (_jsx("span", { className: "text-[10px] uppercase font-bold tracking-wider text-sky-400 block mb-1", children: msg.agentName })), _jsx("div", { children: renderText(msg.text) })] }), msg.sender === 'agent' && (_jsxs("div", { className: "flex flex-wrap gap-2 items-center text-[10px]", children: [msg.confidence !== undefined && msg.confidence > 0 && (_jsxs("span", { className: "bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/20 font-mono font-bold", children: [(msg.confidence * 100).toFixed(0), "% Confidence"] })), msg.riskLevel && (_jsxs("span", { className: `px-2 py-0.5 rounded-full border font-bold flex items-center gap-1 ${msg.riskLevel === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                            msg.riskLevel === 'MODERATE' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                                'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`, children: [_jsx(Flame, { className: "h-3 w-3" }), msg.riskLevel, " RISK"] })), msg.citations && msg.citations.map((cite, idx) => (_jsxs("span", { className: "bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700/50 flex items-center gap-1 font-mono", children: [_jsx(BookOpen, { className: "h-3 w-3 text-slate-500" }), cite] }, idx)))] }))] }), msg.sender === 'user' && (_jsx("div", { className: "w-8 h-8 rounded-lg bg-sky-500 text-slate-950 flex items-center justify-center font-bold shrink-0", children: _jsx(User, { className: "h-5 w-5" }) }))] }, i))), typing && (_jsxs("div", { className: "flex gap-4 justify-start", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0", children: _jsx(Bot, { className: "h-5 w-5" }) }), _jsxs("div", { className: "bg-slate-800/80 border border-slate-700/60 p-4 rounded-xl flex items-center gap-1", children: [_jsx("span", { className: "w-2.5 h-2.5 bg-sky-400 rounded-full animate-bounce" }), _jsx("span", { className: "w-2.5 h-2.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.2s]" }), _jsx("span", { className: "w-2.5 h-2.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.4s]" })] })] })), _jsx("div", { ref: bottomRef })] }), error && (_jsx("div", { className: "mx-4 mb-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs", children: error })), _jsxs("form", { onSubmit: handleSend, className: "p-4 border-t border-slate-800 bg-[#0F172A] flex gap-4", children: [_jsx("input", { type: "text", value: input, onChange: (e) => setInput(e.target.value), placeholder: "Query orchestrated agents...", disabled: typing, className: "flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 disabled:opacity-50" }), _jsx("button", { type: "submit", disabled: typing || !input.trim(), className: "bg-sky-500 hover:bg-sky-400 text-slate-900 p-2.5 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed", children: _jsx(Send, { className: "h-5 w-5" }) })] })] })] }));
}

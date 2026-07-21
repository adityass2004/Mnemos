import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MessageSquare, ShieldAlert, Cpu } from 'lucide-react';
export default function PatternIntelligence() {
    const navigate = useNavigate();
    const [selectedId, setSelectedId] = useState('P-1');
    const patterns = [
        {
            id: 'P-1',
            name: 'Thermal Fatigue Cycle',
            category: 'Thermodynamics',
            occurrences: 14,
            description: 'Rapid temperature fluctuations causing joint strain and pressure spikes in primary steam tubes.',
            equipment: ['Boiler #01', 'Safety Valve #02'],
            timeline: [
                { date: '2026-07-18', event: 'Sensor drift on main steam line', status: 'resolved' },
                { date: '2026-06-02', event: 'Tube flange micro-expansion', status: 'monitored' },
                { date: '2026-05-11', event: 'Safety Valve #02 bypass release', status: 'resolved' }
            ]
        },
        {
            id: 'P-2',
            name: 'Resonant Vibration Peak',
            category: 'Mechanics',
            occurrences: 8,
            description: 'Synchronized rotor frequency misalignment leading to coolant pump stabilizer bearing failure.',
            equipment: ['Coolant Pump #02'],
            timeline: [
                { date: '2026-07-15', event: 'Stabilizer bearing wear detection', status: 'pending' },
                { date: '2026-04-10', event: 'Frequency peak exceeding 0.08g', status: 'resolved' }
            ]
        }
    ];
    const selectedPattern = patterns.find(p => p.id === selectedId) || patterns[0];
    const handleOpenChat = (name) => {
        navigate(`/chat`, { state: { query: `Tell me about the ${name} failure pattern.` } });
    };
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: "Failure Pattern Intelligence" }), _jsx("p", { className: "text-slate-400 text-sm", children: "Analyze recurring signatures and failure loops across machinery" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-sm font-semibold text-slate-400 uppercase tracking-wider", children: "Pattern Signature Cards" }), _jsx("div", { className: "space-y-4", children: patterns.map((pat) => (_jsxs("div", { onClick: () => setSelectedId(pat.id), className: `p-5 rounded-xl border cursor-pointer transition-all hover:translate-x-1 ${selectedId === pat.id
                                        ? 'bg-slate-800 border-sky-400 text-white'
                                        : 'bg-slate-900 border-slate-805 text-slate-300 hover:bg-slate-850'}`, children: [_jsxs("div", { className: "flex justify-between items-start gap-4", children: [_jsxs("div", { children: [_jsx("span", { className: "text-[9px] uppercase font-bold text-sky-400 tracking-widest", children: pat.category }), _jsx("h4", { className: "font-bold text-sm mt-0.5", children: pat.name })] }), _jsxs("span", { className: "bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold", children: [pat.occurrences, " Occurred"] })] }), _jsx("p", { className: "text-slate-400 text-xs mt-3 line-clamp-2 leading-relaxed", children: pat.description })] }, pat.id))) })] }), _jsx("div", { className: "lg:col-span-2 space-y-6", children: _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6", children: [_jsxs("div", { className: "flex flex-wrap justify-between items-start gap-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold text-white", children: selectedPattern.name }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: selectedPattern.description })] }), _jsxs("button", { onClick: () => handleOpenChat(selectedPattern.name), className: "bg-sky-500 hover:bg-sky-400 text-slate-950 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all", children: [_jsx(MessageSquare, { className: "h-4 w-4" }), "Analyze in Chat"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-800 pt-6", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("h4", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5", children: [_jsx(Cpu, { className: "h-4 w-4 text-sky-400" }), "Related Assets"] }), _jsx("div", { className: "flex flex-wrap gap-2", children: selectedPattern.equipment.map((eq, i) => (_jsx("span", { className: "bg-slate-850 text-slate-300 border border-slate-800 px-3 py-1 rounded-lg text-xs font-medium", children: eq }, i))) })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("h4", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5", children: [_jsx(ShieldAlert, { className: "h-4 w-4 text-sky-400" }), "Pattern Parameters"] }), _jsxs("div", { className: "flex gap-4", children: [_jsxs("div", { className: "bg-slate-850 p-3 rounded-lg border border-slate-800 text-center flex-1", children: [_jsx("span", { className: "text-base font-bold text-white font-mono", children: selectedPattern.occurrences }), _jsx("p", { className: "text-[9px] text-slate-500 uppercase mt-0.5 font-semibold", children: "Frequency" })] }), _jsxs("div", { className: "bg-slate-850 p-3 rounded-lg border border-slate-800 text-center flex-1", children: [_jsx("span", { className: "text-base font-bold text-red-400 font-mono", children: "HIGH" }), _jsx("p", { className: "text-[9px] text-slate-500 uppercase mt-0.5 font-semibold", children: "Priority" })] })] })] })] }), _jsxs("div", { className: "border-t border-slate-800 pt-6 space-y-4", children: [_jsxs("h4", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5", children: [_jsx(Calendar, { className: "h-4 w-4 text-sky-400" }), "Incident Timeline Loop"] }), _jsx("div", { className: "space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-800", children: selectedPattern.timeline.map((evt, idx) => (_jsxs("div", { className: "flex gap-4 items-start pl-8 relative", children: [_jsx("div", { className: "absolute left-[9px] top-1.5 w-2.5 h-2.5 rounded-full bg-sky-500 border border-[#0B0F19]" }), _jsxs("div", { className: "flex-1 bg-slate-850 p-3.5 rounded-lg border border-slate-800 flex justify-between items-center text-xs", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-slate-200", children: evt.event }), _jsx("span", { className: "text-[10px] text-slate-500 font-mono block mt-0.5", children: evt.date })] }), _jsx("span", { className: `text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${evt.status === 'resolved'
                                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`, children: evt.status })] })] }, idx))) })] })] }) })] })] }));
}

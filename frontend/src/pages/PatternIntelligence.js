import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ShieldAlert, Cpu } from 'lucide-react';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
export default function PatternIntelligence() {
    const navigate = useNavigate();
    const [clusters, setClusters] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        fetch(`${BASE_URL}/clusters`)
            .then(r => { if (!r.ok)
            throw new Error(`${r.status}`); return r.json(); })
            .then(data => {
            setClusters(data.clusters || []);
            if (data.clusters?.length > 0)
                setSelectedId(data.clusters[0].cluster_id);
        })
            .catch(e => setError(`Failed to load clusters: ${e.message}`))
            .finally(() => setLoading(false));
    }, []);
    const selected = clusters.find(c => c.cluster_id === selectedId) ?? null;
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: "Failure Pattern Intelligence" }), _jsx("p", { className: "text-slate-400 text-sm", children: "Recurring incident clusters surfaced by unsupervised learning" })] }), error && (_jsx("div", { className: "bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl", children: error })), loading ? (_jsx("p", { className: "text-slate-400 text-sm", children: "Loading clusters..." })) : (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-sm font-semibold text-slate-400 uppercase tracking-wider", children: "Cluster Cards" }), _jsx("div", { className: "space-y-4", children: clusters.map((c) => (_jsx("div", { onClick: () => setSelectedId(c.cluster_id), className: `p-5 rounded-xl border cursor-pointer transition-all hover:translate-x-1 ${selectedId === c.cluster_id
                                        ? 'bg-slate-800 border-sky-400 text-white'
                                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'}`, children: _jsxs("div", { className: "flex justify-between items-start gap-4", children: [_jsxs("div", { children: [_jsx("span", { className: "text-[9px] uppercase font-bold text-sky-400 tracking-widest", children: "Cluster" }), _jsxs("h4", { className: "font-bold text-sm mt-0.5", children: ["#", c.cluster_id] })] }), _jsxs("span", { className: "bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold", children: [c.member_ids.length, " incidents"] })] }) }, c.cluster_id))) })] }), _jsx("div", { className: "lg:col-span-2 space-y-6", children: selected ? (_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6", children: [_jsxs("div", { className: "flex flex-wrap justify-between items-start gap-4", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-bold text-white", children: ["Cluster #", selected.cluster_id] }), _jsxs("p", { className: "text-xs text-slate-400 mt-1", children: [selected.member_ids.length, " incidents in this pattern group"] })] }), _jsxs("button", { onClick: () => navigate('/chat', { state: { query: `Analyze incident cluster #${selected.cluster_id} with incidents: ${selected.member_ids.join(', ')}` } }), className: "bg-sky-500 hover:bg-sky-400 text-slate-950 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all", children: [_jsx(MessageSquare, { className: "h-4 w-4" }), "Analyze in Chat"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-800 pt-6", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("h4", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5", children: [_jsx(Cpu, { className: "h-4 w-4 text-sky-400" }), "Incident IDs"] }), _jsx("div", { className: "flex flex-wrap gap-2", children: selected.member_ids.map((id) => (_jsx("span", { className: "bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-lg text-xs font-mono", children: id }, id))) })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("h4", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5", children: [_jsx(ShieldAlert, { className: "h-4 w-4 text-sky-400" }), "Pattern Parameters"] }), _jsxs("div", { className: "flex gap-4", children: [_jsxs("div", { className: "bg-slate-800 p-3 rounded-lg border border-slate-700 text-center flex-1", children: [_jsx("span", { className: "text-base font-bold text-white font-mono", children: selected.member_ids.length }), _jsx("p", { className: "text-[9px] text-slate-500 uppercase mt-0.5 font-semibold", children: "Frequency" })] }), _jsxs("div", { className: "bg-slate-800 p-3 rounded-lg border border-slate-700 text-center flex-1", children: [_jsx("span", { className: "text-base font-bold text-red-400 font-mono", children: "HIGH" }), _jsx("p", { className: "text-[9px] text-slate-500 uppercase mt-0.5 font-semibold", children: "Priority" })] })] })] })] })] })) : (_jsx("p", { className: "text-xs text-slate-500 italic", children: "Select a cluster to inspect." })) })] }))] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Network, Layers, ArrowRight } from 'lucide-react';
export default function GraphExplorer() {
    const [filter, setFilter] = useState('ALL');
    const nodes = [
        { id: 'boiler-1', label: 'Boiler #01', type: 'Equipment', props: 'Sector A, Limit: 200psi' },
        { id: 'valve-2', label: 'Safety Valve #02', type: 'Equipment', props: 'Relief, Status: Active' },
        { id: 'inc-842', label: 'INC-842: Steam Leak', type: 'Incident', props: 'June 2024, Thermal fatigue' },
        { id: 'osha-psm', label: 'OSHA 1910.119', type: 'Regulation', props: 'Process Safety Management' },
        { id: 'doc-sop-04', label: 'SOP-04: Purge Procedure', type: 'Document', props: 'Revision 3, Plain text' },
    ];
    const edges = [
        { source: 'doc-sop-04', relation: 'contains', target: 'boiler-1' },
        { source: 'boiler-1', relation: 'mentions', target: 'inc-842' },
        { source: 'inc-842', relation: 'references', target: 'osha-psm' },
        { source: 'boiler-1', relation: 'related_to', target: 'valve-2' },
    ];
    const filteredNodes = filter === 'ALL' ? nodes : nodes.filter(n => n.type === filter);
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: "Knowledge Graph Explorer" }), _jsx("p", { className: "text-slate-400 text-sm", children: "Visualize entity relationships extracted from industrial manuals and logs" })] }), _jsx("div", { className: "flex gap-2 bg-[#0F172A] p-1.5 rounded-lg border border-slate-800 w-max", children: ['ALL', 'Equipment', 'Incident', 'Regulation', 'Document'].map((t) => (_jsx("button", { onClick: () => setFilter(t), className: `px-4 py-1.5 rounded-md text-xs font-semibold uppercase transition-all ${filter === t
                        ? 'bg-sky-500 text-slate-900'
                        : 'text-slate-400 hover:text-slate-200'}`, children: t }, t))) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4", children: [_jsxs("h3", { className: "text-lg font-semibold text-white flex items-center gap-2", children: [_jsx(Layers, { className: "h-5 w-5 text-sky-400" }), "Nodes (", filteredNodes.length, ")"] }), _jsx("div", { className: "space-y-3 max-h-[400px] overflow-y-auto pr-2", children: filteredNodes.map((node) => (_jsxs("div", { className: "p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg flex items-center justify-between transition-all", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-bold text-slate-200 text-sm", children: node.label }), _jsx("p", { className: "text-xs text-slate-400 mt-0.5", children: node.props })] }), _jsx("span", { className: `text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider ${node.type === 'Equipment' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                                                node.type === 'Incident' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                                                    node.type === 'Regulation' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' :
                                                        'bg-purple-500/10 text-purple-400 border border-purple-500/30'}`, children: node.type })] }, node.id))) })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4", children: [_jsxs("h3", { className: "text-lg font-semibold text-white flex items-center gap-2", children: [_jsx(Network, { className: "h-5 w-5 text-sky-400" }), "Relationships (", edges.length, ")"] }), _jsx("div", { className: "space-y-3 max-h-[400px] overflow-y-auto pr-2", children: edges.map((edge, idx) => (_jsxs("div", { className: "p-4 bg-slate-800/30 border border-slate-700/30 rounded-lg flex items-center justify-between", children: [_jsx("span", { className: "text-slate-300 font-semibold text-xs", children: edge.source }), _jsxs("div", { className: "flex flex-col items-center px-4", children: [_jsx("span", { className: "text-[10px] uppercase font-bold text-sky-400 tracking-wider bg-sky-500/10 px-2 py-0.5 rounded-full", children: edge.relation }), _jsx(ArrowRight, { className: "h-4 w-4 text-slate-500 mt-1" })] }), _jsx("span", { className: "text-slate-300 font-semibold text-xs", children: edge.target })] }, idx))) })] })] })] }));
}

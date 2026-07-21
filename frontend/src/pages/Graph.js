import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Search, Layers } from 'lucide-react';
export default function Graph() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNode, setSelectedNode] = useState(null);
    const graphRef = useRef(null);
    const [graphData] = useState({
        nodes: [
            { id: 'boiler-1', name: 'Boiler #01', val: 12, type: 'Equipment', color: '#3b82f6', properties: { location: 'Sector A', threshold: '200psi', status: 'normal' } },
            { id: 'valve-2', name: 'Safety Valve #02', val: 8, type: 'Equipment', color: '#3b82f6', properties: { type: 'Relief', status: 'Active' } },
            { id: 'inc-842', name: 'INC-842: Steam Leak', val: 10, type: 'Incident', color: '#ef4444', properties: { date: '2024-06-15', cause: 'Thermal fatigue' } },
            { id: 'osha-psm', name: 'OSHA 1910.119', val: 10, type: 'Regulation', color: '#eab308', properties: { title: 'Process Safety Management' } },
            { id: 'doc-sop-04', name: 'SOP-04: Purge SOP', val: 8, type: 'Document', color: '#a855f7', properties: { revisions: '3', author: 'Eng Dept' } },
        ],
        links: [
            { source: 'doc-sop-04', target: 'boiler-1', relation: 'contains' },
            { source: 'boiler-1', target: 'inc-842', relation: 'mentions' },
            { source: 'inc-842', target: 'osha-psm', relation: 'references' },
            { source: 'boiler-1', target: 'valve-2', relation: 'related_to' },
        ]
    });
    const handleNodeClick = (node) => {
        setSelectedNode(node);
    };
    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim())
            return;
        const found = graphData.nodes.find(n => n.name.toLowerCase().includes(searchQuery.toLowerCase()) || n.id.toLowerCase().includes(searchQuery.toLowerCase()));
        if (found && graphRef.current) {
            graphRef.current.centerAt(found.x, found.y, 1000);
            graphRef.current.zoom(3, 1000);
            setSelectedNode(found);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: "Interactive Knowledge Graph" }), _jsx("p", { className: "text-slate-400 text-sm", children: "Force-directed visualization of systems, incidents, and standards" })] }), _jsxs("form", { onSubmit: handleSearch, className: "flex gap-2", children: [_jsx("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search nodes...", className: "bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-sky-500 w-64" }), _jsx("button", { type: "submit", className: "bg-sky-500 hover:bg-sky-400 text-slate-950 p-2 rounded-lg flex items-center justify-center transition-all", children: _jsx(Search, { className: "h-4 w-4" }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden h-[500px] relative", children: [_jsx(ForceGraph2D, { ref: graphRef, graphData: graphData, nodeLabel: "name", nodeColor: (n) => n.color, nodeVal: (n) => n.val, linkColor: () => '#334155', linkDirectionalParticles: 2, linkDirectionalParticleSpeed: 0.005, onNodeClick: handleNodeClick, cooldownTicks: 100, width: 700, height: 500 }), _jsxs("div", { className: "absolute bottom-4 left-4 bg-slate-950/80 border border-slate-800 p-4 rounded-lg flex flex-col gap-2 text-xs backdrop-blur-sm", children: [_jsx("span", { className: "font-bold text-white mb-1", children: "Legend" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-3 h-3 rounded-full bg-blue-500" }), _jsx("span", { className: "text-slate-300", children: "Equipment" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-3 h-3 rounded-full bg-red-500" }), _jsx("span", { className: "text-slate-300", children: "Incident" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-3 h-3 rounded-full bg-yellow-500" }), _jsx("span", { className: "text-slate-300", children: "Regulation" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-3 h-3 rounded-full bg-purple-500" }), _jsx("span", { className: "text-slate-300", children: "Document" })] })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4", children: [_jsx("h3", { className: "text-sm font-semibold text-slate-400 uppercase tracking-wider", children: "Graph Statistics" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 text-center", children: [_jsx("span", { className: "text-2xl font-bold text-white", children: graphData.nodes.length }), _jsx("p", { className: "text-[10px] text-slate-500 mt-1 uppercase font-semibold", children: "Total Nodes" })] }), _jsxs("div", { className: "bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 text-center", children: [_jsx("span", { className: "text-2xl font-bold text-white", children: graphData.links.length }), _jsx("p", { className: "text-[10px] text-slate-500 mt-1 uppercase font-semibold", children: "Total Links" })] })] })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 min-h-[220px]", children: [_jsxs("h3", { className: "text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2", children: [_jsx(Layers, { className: "h-4 w-4 text-sky-400" }), "Node details"] }), selectedNode ? (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-base font-bold text-white", children: selectedNode.name }), _jsx("span", { className: "text-[10px] bg-slate-850 text-slate-400 px-2 py-0.5 rounded border border-slate-800 mt-1 inline-block font-semibold", children: selectedNode.type })] }), _jsx("div", { className: "pt-3 border-t border-slate-800 space-y-2", children: Object.entries(selectedNode.properties).map(([k, v]) => (_jsxs("div", { className: "flex justify-between text-xs", children: [_jsxs("span", { className: "text-slate-500 capitalize", children: [k, ":"] }), _jsx("span", { className: "text-slate-300 font-medium", children: v })] }, k))) })] })) : (_jsx("p", { className: "text-xs text-slate-550 italic", children: "Select a node from the canvas to view properties." }))] })] })] })] }));
}

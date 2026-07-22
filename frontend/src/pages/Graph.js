import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Search, Layers } from 'lucide-react';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const TYPE_COLORS = {
    Equipment: '#3b82f6',
    Incident: '#ef4444',
    Regulation: '#eab308',
    Document: '#a855f7',
};
export default function Graph() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNode, setSelectedNode] = useState(null);
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [graphSize, setGraphSize] = useState({ width: 0, height: 500 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const graphRef = useRef(null);
    const graphContainerRef = useRef(null);
    useEffect(() => {
        const container = graphContainerRef.current;
        if (!container)
            return;
        const updateSize = () => {
            setGraphSize({ width: container.clientWidth, height: container.clientHeight });
        };
        updateSize();
        const observer = new ResizeObserver(updateSize);
        observer.observe(container);
        return () => observer.disconnect();
    }, []);
    useEffect(() => {
        fetch(`${BASE_URL}/graph`)
            .then(r => { if (!r.ok)
            throw new Error(`${r.status}`); return r.json(); })
            .then(data => {
            const nodes = (data.nodes || []).map((n) => ({
                id: n.id,
                name: n.label || n.id,
                val: 8,
                type: n.type || n.properties?.type || 'Unknown',
                color: TYPE_COLORS[n.type || n.properties?.type] || '#64748b',
                properties: n.properties || {},
            }));
            const links = (data.edges || []).map((e) => ({
                source: e.source,
                target: e.target,
                relation: e.relation || 'related_to',
            }));
            setGraphData({ nodes, links });
        })
            .catch(e => setError(`Failed to load graph: ${e.message}`))
            .finally(() => setLoading(false));
    }, []);
    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim())
            return;
        const found = graphData.nodes.find(n => n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.id.toLowerCase().includes(searchQuery.toLowerCase()));
        if (found && graphRef.current) {
            graphRef.current.centerAt(found.x, found.y, 1000);
            graphRef.current.zoom(3, 1000);
            setSelectedNode(found);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: "Interactive Knowledge Graph" }), _jsx("p", { className: "text-slate-400 text-sm", children: "Force-directed visualization of systems, incidents, and standards" })] }), _jsxs("form", { onSubmit: handleSearch, className: "flex gap-2", children: [_jsx("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search nodes...", className: "bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-sky-500 w-64" }), _jsx("button", { type: "submit", className: "bg-sky-500 hover:bg-sky-400 text-slate-950 p-2 rounded-lg flex items-center justify-center transition-all", children: _jsx(Search, { className: "h-4 w-4" }) })] })] }), error && (_jsx("div", { className: "bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl", children: error })), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { ref: graphContainerRef, className: "lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden h-[500px] relative", children: [loading ? (_jsx("div", { className: "flex items-center justify-center h-full text-slate-400 text-sm", children: "Loading graph..." })) : (graphSize.width > 0 && (_jsx(ForceGraph2D, { ref: graphRef, graphData: graphData, nodeLabel: "name", nodeColor: (n) => n.color, nodeVal: (n) => n.val, linkColor: () => '#334155', linkDirectionalParticles: 2, linkDirectionalParticleSpeed: 0.005, onNodeClick: (node) => setSelectedNode(node), cooldownTicks: 100, width: graphSize.width, height: graphSize.height }))), _jsxs("div", { className: "absolute bottom-4 left-4 bg-slate-950/80 border border-slate-800 p-4 rounded-lg flex flex-col gap-2 text-xs backdrop-blur-sm", children: [_jsx("span", { className: "font-bold text-white mb-1", children: "Legend" }), Object.entries(TYPE_COLORS).map(([type, color]) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-3 h-3 rounded-full", style: { backgroundColor: color } }), _jsx("span", { className: "text-slate-300", children: type })] }, type)))] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4", children: [_jsx("h3", { className: "text-sm font-semibold text-slate-400 uppercase tracking-wider", children: "Graph Statistics" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 text-center", children: [_jsx("span", { className: "text-2xl font-bold text-white", children: graphData.nodes.length }), _jsx("p", { className: "text-[10px] text-slate-500 mt-1 uppercase font-semibold", children: "Total Nodes" })] }), _jsxs("div", { className: "bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 text-center", children: [_jsx("span", { className: "text-2xl font-bold text-white", children: graphData.links.length }), _jsx("p", { className: "text-[10px] text-slate-500 mt-1 uppercase font-semibold", children: "Total Links" })] })] })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 min-h-[220px]", children: [_jsxs("h3", { className: "text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2", children: [_jsx(Layers, { className: "h-4 w-4 text-sky-400" }), "Node Details"] }), selectedNode ? (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-base font-bold text-white", children: selectedNode.name }), _jsx("span", { className: "text-[10px] bg-slate-850 text-slate-400 px-2 py-0.5 rounded border border-slate-800 mt-1 inline-block font-semibold", children: selectedNode.type })] }), _jsx("div", { className: "pt-3 border-t border-slate-800 space-y-2", children: Object.entries(selectedNode.properties).map(([k, v]) => (_jsxs("div", { className: "flex justify-between text-xs", children: [_jsxs("span", { className: "text-slate-500 capitalize", children: [k, ":"] }), _jsx("span", { className: "text-slate-300 font-medium", children: String(v) })] }, k))) })] })) : (_jsx("p", { className: "text-xs text-slate-500 italic", children: "Select a node from the canvas to view properties." }))] })] })] })] }));
}

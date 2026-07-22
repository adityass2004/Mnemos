import React, { useState, useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Search, Layers } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const TYPE_COLORS: Record<string, string> = {
  Equipment: '#3b82f6',
  Incident: '#ef4444',
  Regulation: '#eab308',
  Document: '#a855f7',
};

interface Node {
  id: string;
  name: string;
  val: number;
  type: string;
  color: string;
  properties: Record<string, string>;
  x?: number;
  y?: number;
}

interface Link {
  source: string;
  target: string;
  relation: string;
}

export default function Graph() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [graphData, setGraphData] = useState<{ nodes: Node[]; links: Link[] }>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const graphRef = useRef<any>(null);

  useEffect(() => {
    fetch(`${BASE_URL}/graph`)
      .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then(data => {
        const nodes: Node[] = (data.nodes || []).map((n: any) => ({
          id: n.id,
          name: n.label || n.id,
          val: 8,
          type: n.properties?.type || 'Unknown',
          color: TYPE_COLORS[n.properties?.type] || '#64748b',
          properties: n.properties || {},
        }));
        const links: Link[] = (data.edges || []).map((e: any) => ({
          source: e.source,
          target: e.target,
          relation: e.relation || 'related_to',
        }));
        setGraphData({ nodes, links });
      })
      .catch(e => setError(`Failed to load graph: ${e.message}`))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const found = graphData.nodes.find(n =>
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (found && graphRef.current) {
      graphRef.current.centerAt(found.x, found.y, 1000);
      graphRef.current.zoom(3, 1000);
      setSelectedNode(found);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Interactive Knowledge Graph</h2>
          <p className="text-slate-400 text-sm">Force-directed visualization of systems, incidents, and standards</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search nodes..."
            className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-sky-500 w-64"
          />
          <button type="submit" className="bg-sky-500 hover:bg-sky-400 text-slate-950 p-2 rounded-lg flex items-center justify-center transition-all">
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden h-[500px] relative">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">Loading graph...</div>
          ) : (
            <ForceGraph2D
              ref={graphRef}
              graphData={graphData}
              nodeLabel="name"
              nodeColor={(n: any) => n.color}
              nodeVal={(n: any) => n.val}
              linkColor={() => '#334155'}
              linkDirectionalParticles={2}
              linkDirectionalParticleSpeed={0.005}
              onNodeClick={(node: any) => setSelectedNode(node)}
              cooldownTicks={100}
              width={700}
              height={500}
            />
          )}
          <div className="absolute bottom-4 left-4 bg-slate-950/80 border border-slate-800 p-4 rounded-lg flex flex-col gap-2 text-xs backdrop-blur-sm">
            <span className="font-bold text-white mb-1">Legend</span>
            {Object.entries(TYPE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
                <span className="text-slate-300">{type}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Graph Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 text-center">
                <span className="text-2xl font-bold text-white">{graphData.nodes.length}</span>
                <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">Total Nodes</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 text-center">
                <span className="text-2xl font-bold text-white">{graphData.links.length}</span>
                <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">Total Links</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 min-h-[220px]">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-sky-400" />
              Node Details
            </h3>
            {selectedNode ? (
              <div className="space-y-3">
                <div>
                  <h4 className="text-base font-bold text-white">{selectedNode.name}</h4>
                  <span className="text-[10px] bg-slate-850 text-slate-400 px-2 py-0.5 rounded border border-slate-800 mt-1 inline-block font-semibold">
                    {selectedNode.type}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  {Object.entries(selectedNode.properties).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-slate-500 capitalize">{k}:</span>
                      <span className="text-slate-300 font-medium">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Select a node from the canvas to view properties.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

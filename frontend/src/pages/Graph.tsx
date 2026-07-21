import React, { useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Search, Layers } from 'lucide-react';

interface Node {
  id: string;
  name: string;
  val: number;
  type: 'Equipment' | 'Incident' | 'Regulation' | 'Document';
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
  const graphRef = useRef<any>(null);

  const [graphData] = useState<{ nodes: Node[]; links: Link[] }>({
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

  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const found = graphData.nodes.find(n => n.name.toLowerCase().includes(searchQuery.toLowerCase()) || n.id.toLowerCase().includes(searchQuery.toLowerCase()));
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
          <button
            type="submit"
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 p-2 rounded-lg flex items-center justify-center transition-all"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden h-[500px] relative">
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            nodeLabel="name"
            nodeColor={(n: any) => n.color}
            nodeVal={(n: any) => n.val}
            linkColor={() => '#334155'}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.005}
            onNodeClick={handleNodeClick}
            cooldownTicks={100}
            width={700}
            height={500}
          />
          
          <div className="absolute bottom-4 left-4 bg-slate-950/80 border border-slate-800 p-4 rounded-lg flex flex-col gap-2 text-xs backdrop-blur-sm">
            <span className="font-bold text-white mb-1">Legend</span>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-slate-300">Equipment</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-slate-300">Incident</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="text-slate-300">Regulation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500"></span>
              <span className="text-slate-300">Document</span>
            </div>
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
              Node details
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
                      <span className="text-slate-300 font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-550 italic">Select a node from the canvas to view properties.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

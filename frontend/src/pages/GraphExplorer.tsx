import React, { useState } from 'react';
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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Knowledge Graph Explorer</h2>
        <p className="text-slate-400 text-sm">Visualize entity relationships extracted from industrial manuals and logs</p>
      </div>

      <div className="flex gap-2 bg-[#0F172A] p-1.5 rounded-lg border border-slate-800 w-max">
        {['ALL', 'Equipment', 'Incident', 'Regulation', 'Document'].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold uppercase transition-all ${
              filter === t 
                ? 'bg-sky-500 text-slate-900' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-sky-400" />
            Nodes ({filteredNodes.length})
          </h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {filteredNodes.map((node) => (
              <div key={node.id} className="p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg flex items-center justify-between transition-all">
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">{node.label}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{node.props}</p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider ${
                  node.type === 'Equipment' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                  node.type === 'Incident' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                  node.type === 'Regulation' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' :
                  'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                }`}>
                  {node.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Network className="h-5 w-5 text-sky-400" />
            Relationships ({edges.length})
          </h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {edges.map((edge, idx) => (
              <div key={idx} className="p-4 bg-slate-800/30 border border-slate-700/30 rounded-lg flex items-center justify-between">
                <span className="text-slate-300 font-semibold text-xs">{edge.source}</span>
                <div className="flex flex-col items-center px-4">
                  <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider bg-sky-500/10 px-2 py-0.5 rounded-full">
                    {edge.relation}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-500 mt-1" />
                </div>
                <span className="text-slate-300 font-semibold text-xs">{edge.target}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

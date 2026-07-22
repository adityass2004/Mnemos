import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ShieldAlert, Cpu } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

interface Cluster {
  cluster_id: number;
  member_ids: string[];
}

export default function PatternIntelligence() {
  const navigate = useNavigate();
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BASE_URL}/clusters`)
      .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then(data => {
        setClusters(data.clusters || []);
        if (data.clusters?.length > 0) setSelectedId(data.clusters[0].cluster_id);
      })
      .catch(e => setError(`Failed to load clusters: ${e.message}`))
      .finally(() => setLoading(false));
  }, []);

  const selected = clusters.find(c => c.cluster_id === selectedId) ?? null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Failure Pattern Intelligence</h2>
        <p className="text-slate-400 text-sm">Recurring incident clusters surfaced by unsupervised learning</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl">{error}</div>
      )}

      {loading ? (
        <p className="text-slate-400 text-sm">Loading clusters...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Cluster Cards</h3>
            <div className="space-y-4">
              {clusters.map((c) => (
                <div
                  key={c.cluster_id}
                  onClick={() => setSelectedId(c.cluster_id)}
                  className={`p-5 rounded-xl border cursor-pointer transition-all hover:translate-x-1 ${
                    selectedId === c.cluster_id
                      ? 'bg-slate-800 border-sky-400 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-sky-400 tracking-widest">Cluster</span>
                      <h4 className="font-bold text-sm mt-0.5">#{c.cluster_id}</h4>
                    </div>
                    <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                      {c.member_ids.length} incidents
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {selected ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Cluster #{selected.cluster_id}</h3>
                    <p className="text-xs text-slate-400 mt-1">{selected.member_ids.length} incidents in this pattern group</p>
                  </div>
                  <button
                    onClick={() => navigate('/chat', { state: { query: `Analyze incident cluster #${selected.cluster_id} with incidents: ${selected.member_ids.join(', ')}` } })}
                    className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Analyze in Chat
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-800 pt-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Cpu className="h-4 w-4 text-sky-400" />
                      Incident IDs
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selected.member_ids.map((id) => (
                        <span key={id} className="bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-lg text-xs font-mono">
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4 text-sky-400" />
                      Pattern Parameters
                    </h4>
                    <div className="flex gap-4">
                      <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-center flex-1">
                        <span className="text-base font-bold text-white font-mono">{selected.member_ids.length}</span>
                        <p className="text-[9px] text-slate-500 uppercase mt-0.5 font-semibold">Frequency</p>
                      </div>
                      <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-center flex-1">
                        <span className="text-base font-bold text-red-400 font-mono">HIGH</span>
                        <p className="text-[9px] text-slate-500 uppercase mt-0.5 font-semibold">Priority</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Select a cluster to inspect.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

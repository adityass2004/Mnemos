import React, { useState, useEffect } from 'react';
import { getEquipmentRisks, EquipmentRisk } from '../services/riskApi';
import { Search, Filter, ChevronUp, ChevronDown, Activity } from 'lucide-react';

export default function RiskDashboard() {
  const [data, setData] = useState<EquipmentRisk[]>([]);
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [sortField, setSortField] = useState<'name' | 'riskLevel' | 'probability' | 'severity'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<EquipmentRisk | null>(null);

  useEffect(() => {
    getEquipmentRisks().then(res => {
      setData(res);
      if (res.length > 0) setSelected(res[0]);
    });
  }, []);

  const handleSort = (field: 'name' | 'riskLevel' | 'probability' | 'severity') => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const getRiskNumeric = (lvl: string) => {
    if (lvl === 'CRITICAL') return 3;
    if (lvl === 'MODERATE') return 2;
    return 1;
  };

  const filteredData = data
    .filter(item => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.id.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filterLevel === 'ALL' || item.riskLevel === filterLevel;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'riskLevel') {
        comparison = getRiskNumeric(a.riskLevel) - getRiskNumeric(b.riskLevel);
      } else {
        comparison = a[sortField] - b[sortField];
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const criticalCount = data.filter(d => d.riskLevel === 'CRITICAL').length;
  const moderateCount = data.filter(d => d.riskLevel === 'MODERATE').length;
  const lowCount = data.filter(d => d.riskLevel === 'LOW').length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Risk Assessment Dashboard</h2>
          <p className="text-slate-400 text-sm">Analyze machinery probability and hazard indices</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search equipment..."
              className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-sky-500 w-56"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg">
            <Filter className="h-4 w-4 text-slate-500" />
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Risks</option>
              <option value="LOW">Low</option>
              <option value="MODERATE">Moderate</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Risk Distribution</h3>
            <div className="flex items-center gap-8">
              <div className="flex-1 flex gap-2 items-end h-32 pt-4">
                <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="bg-red-500 w-full rounded-t-md transition-all" style={{ height: `${(criticalCount / data.length) * 100}%` }}></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Critical ({criticalCount})</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="bg-orange-500 w-full rounded-t-md transition-all" style={{ height: `${(moderateCount / data.length) * 100}%` }}></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Moderate ({moderateCount})</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="bg-emerald-500 w-full rounded-t-md transition-all" style={{ height: `${(lowCount / data.length) * 100}%` }}></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Low ({lowCount})</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/50">
                    <th className="p-4 font-semibold uppercase cursor-pointer" onClick={() => handleSort('name')}>
                      <span className="flex items-center gap-1">
                        Equipment
                        {sortField === 'name' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                      </span>
                    </th>
                    <th className="p-4 font-semibold uppercase cursor-pointer" onClick={() => handleSort('riskLevel')}>
                      <span className="flex items-center gap-1">
                        Risk Level
                        {sortField === 'riskLevel' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                      </span>
                    </th>
                    <th className="p-4 font-semibold uppercase cursor-pointer" onClick={() => handleSort('probability')}>
                      <span className="flex items-center gap-1">
                        Probability
                        {sortField === 'probability' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                      </span>
                    </th>
                    <th className="p-4 font-semibold uppercase cursor-pointer" onClick={() => handleSort('severity')}>
                      <span className="flex items-center gap-1">
                        Severity
                        {sortField === 'severity' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  {filteredData.map(item => (
                    <tr
                      key={item.id}
                      onClick={() => setSelected(item)}
                      className={`hover:bg-slate-800/40 cursor-pointer transition-all ${
                        selected?.id === item.id ? 'bg-slate-800/70 border-l-4 border-sky-400' : ''
                      }`}
                    >
                      <td className="p-4">
                        <p className="font-bold text-white">{item.name}</p>
                        <span className="text-[10px] text-slate-500 font-mono">{item.id}</span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          item.riskLevel === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          item.riskLevel === 'MODERATE' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {item.riskLevel}
                        </span>
                      </td>
                      <td className="p-4 w-40">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-805 h-2 rounded-full overflow-hidden">
                            <div className="bg-sky-400 h-full rounded-full" style={{ width: `${item.probability * 100}%` }}></div>
                          </div>
                          <span className="font-mono text-[10px]">{Math.round(item.probability * 100)}%</span>
                        </div>
                      </td>
                      <td className="p-4 w-40">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-805 h-2 rounded-full overflow-hidden">
                            <div className="bg-orange-500 h-full rounded-full" style={{ width: `${item.severity * 100}%` }}></div>
                          </div>
                          <span className="font-mono text-[10px]">{Math.round(item.severity * 100)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 sticky top-24">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-sky-400" />
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Equipment Details</h3>
            </div>
            {selected ? (
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="text-base font-bold text-white">{selected.name}</h4>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">ID: {selected.id}</span>
                </div>
                <div className="space-y-2 border-t border-slate-800 pt-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Category:</span>
                    <span className="text-slate-300 font-medium">{selected.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Location:</span>
                    <span className="text-slate-300 font-medium">{selected.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Inspector:</span>
                    <span className="text-slate-300 font-medium">{selected.technician}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Next Inspection:</span>
                    <span className="text-slate-300 font-medium font-mono">{selected.nextInspection}</span>
                  </div>
                </div>
                <div className="border-t border-slate-800 pt-4 space-y-1.5">
                  <span className="text-slate-500">Maintenance Log Notes:</span>
                  <p className="text-slate-300 bg-slate-850 p-3 rounded-lg border border-slate-800 leading-relaxed font-sans">
                    {selected.notes}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-550 italic">Select an asset from the table list to inspect properties.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

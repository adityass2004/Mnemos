import React, { useState } from 'react';
import { ShieldCheck, Check, AlertTriangle, Download, Layers } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

interface ComplianceResult {
  procedure: string;
  compliant: boolean;
  issues: string[];
}

export default function Compliance() {
  const [procedure, setProcedure] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunAudit = async () => {
    if (!procedure.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${BASE_URL}/compliance/${encodeURIComponent(procedure.trim())}`);
      if (!res.ok) throw new Error(`${res.status}`);
      setResult(await res.json());
    } catch (e: any) {
      setError(`Audit failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', 'compliance_report.json');
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Compliance & Audit Engine</h2>
          <p className="text-slate-400 text-sm">Check procedures against regulatory standards</p>
        </div>
        {result && (
          <button
            onClick={handleDownload}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Procedure Name
        </label>
        <div className="flex gap-4">
          <input
            type="text"
            value={procedure}
            onChange={(e) => setProcedure(e.target.value)}
            placeholder="e.g. SOP-09: Boiler Pressure Bleedoff"
            className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-sky-500"
            onKeyDown={(e) => e.key === 'Enter' && handleRunAudit()}
          />
          <button
            onClick={handleRunAudit}
            disabled={loading || !procedure.trim()}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <ShieldCheck className="h-5 w-5" />
            {loading ? 'Auditing...' : 'Audit Procedure'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl">{error}</div>
      )}

      {result && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Layers className="h-5 w-5 text-sky-400" />
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Audit Result</h3>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded border ${
              result.compliant
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {result.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-slate-400">
              Procedure: <span className="text-white font-medium">{result.procedure}</span>
            </p>
          </div>

          {result.issues.length === 0 ? (
            <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
              <Check className="h-4 w-4 shrink-0" />
              No compliance issues found.
            </div>
          ) : (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Issues Found</h4>
              <ul className="space-y-2">
                {result.issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-red-300 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

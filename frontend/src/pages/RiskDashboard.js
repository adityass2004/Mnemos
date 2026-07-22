import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { getEquipmentRisk } from '../services/riskApi';
import { Search, Activity } from 'lucide-react';
export default function RiskDashboard() {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim())
            return;
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const data = await getEquipmentRisk(query.trim());
            setResult(data);
        }
        catch {
            setError('Failed to fetch risk data. Check the equipment ID and try again.');
        }
        finally {
            setLoading(false);
        }
    };
    const riskColor = (level) => {
        if (level === 'HIGH')
            return 'bg-red-500/10 text-red-400 border-red-500/20';
        if (level === 'MODERATE')
            return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
        if (level === 'LOW')
            return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    };
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: "Risk Assessment Dashboard" }), _jsx("p", { className: "text-slate-400 text-sm", children: "Query equipment failure risk scores from the LightGBM model" })] }), _jsxs("form", { onSubmit: handleSearch, className: "flex gap-4", children: [_jsxs("div", { className: "relative flex-1 max-w-sm", children: [_jsx(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-slate-500" }), _jsx("input", { type: "text", value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Enter equipment ID (e.g. P-204, EQ-0042)", className: "bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-sky-500 w-full" })] }), _jsx("button", { type: "submit", disabled: loading, className: "bg-sky-500 hover:bg-sky-400 text-slate-950 px-5 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50", children: loading ? 'Loading...' : 'Get Risk Score' })] }), error && (_jsx("div", { className: "bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl", children: error })), result && (_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Activity, { className: "h-5 w-5 text-sky-400" }), _jsx("h3", { className: "text-lg font-bold text-white font-mono", children: result.equipment })] }), _jsx("span", { className: `text-xs font-bold px-3 py-1 rounded border ${riskColor(result.risk_level)}`, children: result.risk_level })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-xs text-slate-400 mb-1", children: [_jsx("span", { children: "Failure Probability" }), _jsxs("span", { className: "font-mono", children: [Math.round(result.score * 100), "%"] })] }), _jsx("div", { className: "w-full bg-slate-800 h-3 rounded-full overflow-hidden", children: _jsx("div", { className: `h-full rounded-full transition-all ${result.risk_level === 'HIGH' ? 'bg-red-500' :
                                        result.risk_level === 'MODERATE' ? 'bg-orange-500' : 'bg-emerald-500'}`, style: { width: `${result.score * 100}%` } }) })] }), _jsxs("div", { className: "border-t border-slate-800 pt-4 space-y-2", children: [_jsx("h4", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider", children: "Details" }), _jsx("ul", { className: "space-y-1.5", children: result.details.map((d, i) => (_jsxs("li", { className: "text-xs text-slate-300 flex items-start gap-2", children: [_jsx("span", { className: "text-sky-400 mt-0.5", children: "\u203A" }), d] }, i))) })] })] }))] }));
}

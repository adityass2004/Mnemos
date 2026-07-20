import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { getEquipmentRisks } from '../services/riskApi';
import { Search, Filter, ChevronUp, ChevronDown, Activity } from 'lucide-react';
export default function RiskDashboard() {
    const [data, setData] = useState([]);
    const [search, setSearch] = useState('');
    const [filterLevel, setFilterLevel] = useState('ALL');
    const [sortField, setSortField] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [selected, setSelected] = useState(null);
    useEffect(() => {
        getEquipmentRisks().then(res => {
            setData(res);
            if (res.length > 0)
                setSelected(res[0]);
        });
    }, []);
    const handleSort = (field) => {
        const isAsc = sortField === field && sortOrder === 'asc';
        setSortOrder(isAsc ? 'desc' : 'asc');
        setSortField(field);
    };
    const getRiskNumeric = (lvl) => {
        if (lvl === 'CRITICAL')
            return 3;
        if (lvl === 'MODERATE')
            return 2;
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
        }
        else if (sortField === 'riskLevel') {
            comparison = getRiskNumeric(a.riskLevel) - getRiskNumeric(b.riskLevel);
        }
        else {
            comparison = a[sortField] - b[sortField];
        }
        return sortOrder === 'asc' ? comparison : -comparison;
    });
    const criticalCount = data.filter(d => d.riskLevel === 'CRITICAL').length;
    const moderateCount = data.filter(d => d.riskLevel === 'MODERATE').length;
    const lowCount = data.filter(d => d.riskLevel === 'LOW').length;
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: "Risk Assessment Dashboard" }), _jsx("p", { className: "text-slate-400 text-sm", children: "Analyze machinery probability and hazard indices" })] }), _jsxs("div", { className: "flex gap-4", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-slate-500" }), _jsx("input", { type: "text", value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search equipment...", className: "bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-sky-500 w-56" })] }), _jsxs("div", { className: "flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg", children: [_jsx(Filter, { className: "h-4 w-4 text-slate-500" }), _jsxs("select", { value: filterLevel, onChange: (e) => setFilterLevel(e.target.value), className: "bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer", children: [_jsx("option", { value: "ALL", children: "All Risks" }), _jsx("option", { value: "LOW", children: "Low" }), _jsx("option", { value: "MODERATE", children: "Moderate" }), _jsx("option", { value: "CRITICAL", children: "Critical" })] })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-2 space-y-8", children: [_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6", children: [_jsx("h3", { className: "text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4", children: "Risk Distribution" }), _jsx("div", { className: "flex items-center gap-8", children: _jsxs("div", { className: "flex-1 flex gap-2 items-end h-32 pt-4", children: [_jsxs("div", { className: "flex-1 flex flex-col items-center gap-1.5 h-full justify-end", children: [_jsx("div", { className: "bg-red-500 w-full rounded-t-md transition-all", style: { height: `${(criticalCount / data.length) * 100}%` } }), _jsxs("span", { className: "text-[10px] text-slate-400 font-bold uppercase", children: ["Critical (", criticalCount, ")"] })] }), _jsxs("div", { className: "flex-1 flex flex-col items-center gap-1.5 h-full justify-end", children: [_jsx("div", { className: "bg-orange-500 w-full rounded-t-md transition-all", style: { height: `${(moderateCount / data.length) * 100}%` } }), _jsxs("span", { className: "text-[10px] text-slate-400 font-bold uppercase", children: ["Moderate (", moderateCount, ")"] })] }), _jsxs("div", { className: "flex-1 flex flex-col items-center gap-1.5 h-full justify-end", children: [_jsx("div", { className: "bg-emerald-500 w-full rounded-t-md transition-all", style: { height: `${(lowCount / data.length) * 100}%` } }), _jsxs("span", { className: "text-[10px] text-slate-400 font-bold uppercase", children: ["Low (", lowCount, ")"] })] })] }) })] }), _jsx("div", { className: "bg-slate-900 border border-slate-800 rounded-xl overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs border-collapse", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-slate-800 text-slate-400 bg-slate-900/50", children: [_jsx("th", { className: "p-4 font-semibold uppercase cursor-pointer", onClick: () => handleSort('name'), children: _jsxs("span", { className: "flex items-center gap-1", children: ["Equipment", sortField === 'name' && (sortOrder === 'asc' ? _jsx(ChevronUp, { className: "h-3 w-3" }) : _jsx(ChevronDown, { className: "h-3 w-3" }))] }) }), _jsx("th", { className: "p-4 font-semibold uppercase cursor-pointer", onClick: () => handleSort('riskLevel'), children: _jsxs("span", { className: "flex items-center gap-1", children: ["Risk Level", sortField === 'riskLevel' && (sortOrder === 'asc' ? _jsx(ChevronUp, { className: "h-3 w-3" }) : _jsx(ChevronDown, { className: "h-3 w-3" }))] }) }), _jsx("th", { className: "p-4 font-semibold uppercase cursor-pointer", onClick: () => handleSort('probability'), children: _jsxs("span", { className: "flex items-center gap-1", children: ["Probability", sortField === 'probability' && (sortOrder === 'asc' ? _jsx(ChevronUp, { className: "h-3 w-3" }) : _jsx(ChevronDown, { className: "h-3 w-3" }))] }) }), _jsx("th", { className: "p-4 font-semibold uppercase cursor-pointer", onClick: () => handleSort('severity'), children: _jsxs("span", { className: "flex items-center gap-1", children: ["Severity", sortField === 'severity' && (sortOrder === 'asc' ? _jsx(ChevronUp, { className: "h-3 w-3" }) : _jsx(ChevronDown, { className: "h-3 w-3" }))] }) })] }) }), _jsx("tbody", { className: "divide-y divide-slate-800/50 text-slate-300", children: filteredData.map(item => (_jsxs("tr", { onClick: () => setSelected(item), className: `hover:bg-slate-800/40 cursor-pointer transition-all ${selected?.id === item.id ? 'bg-slate-800/70 border-l-4 border-sky-400' : ''}`, children: [_jsxs("td", { className: "p-4", children: [_jsx("p", { className: "font-bold text-white", children: item.name }), _jsx("span", { className: "text-[10px] text-slate-500 font-mono", children: item.id })] }), _jsx("td", { className: "p-4", children: _jsx("span", { className: `text-[10px] font-bold px-2 py-0.5 rounded border ${item.riskLevel === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                                    item.riskLevel === 'MODERATE' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`, children: item.riskLevel }) }), _jsx("td", { className: "p-4 w-40", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex-1 bg-slate-805 h-2 rounded-full overflow-hidden", children: _jsx("div", { className: "bg-sky-400 h-full rounded-full", style: { width: `${item.probability * 100}%` } }) }), _jsxs("span", { className: "font-mono text-[10px]", children: [Math.round(item.probability * 100), "%"] })] }) }), _jsx("td", { className: "p-4 w-40", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex-1 bg-slate-805 h-2 rounded-full overflow-hidden", children: _jsx("div", { className: "bg-orange-500 h-full rounded-full", style: { width: `${item.severity * 100}%` } }) }), _jsxs("span", { className: "font-mono text-[10px]", children: [Math.round(item.severity * 100), "%"] })] }) })] }, item.id))) })] }) }) })] }), _jsx("div", { children: _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 sticky top-24", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Activity, { className: "h-5 w-5 text-sky-400" }), _jsx("h3", { className: "text-sm font-semibold text-slate-400 uppercase tracking-wider", children: "Equipment Details" })] }), selected ? (_jsxs("div", { className: "space-y-4 text-xs", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-base font-bold text-white", children: selected.name }), _jsxs("span", { className: "text-[10px] text-slate-500 font-mono mt-0.5 block", children: ["ID: ", selected.id] })] }), _jsxs("div", { className: "space-y-2 border-t border-slate-800 pt-4", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-500", children: "Category:" }), _jsx("span", { className: "text-slate-300 font-medium", children: selected.category })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-500", children: "Location:" }), _jsx("span", { className: "text-slate-300 font-medium", children: selected.location })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-500", children: "Inspector:" }), _jsx("span", { className: "text-slate-300 font-medium", children: selected.technician })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-500", children: "Next Inspection:" }), _jsx("span", { className: "text-slate-300 font-medium font-mono", children: selected.nextInspection })] })] }), _jsxs("div", { className: "border-t border-slate-800 pt-4 space-y-1.5", children: [_jsx("span", { className: "text-slate-500", children: "Maintenance Log Notes:" }), _jsx("p", { className: "text-slate-300 bg-slate-850 p-3 rounded-lg border border-slate-800 leading-relaxed font-sans", children: selected.notes })] })] })) : (_jsx("p", { className: "text-xs text-slate-550 italic", children: "Select an asset from the table list to inspect properties." }))] }) })] })] }));
}

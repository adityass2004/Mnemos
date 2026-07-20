import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ShieldCheck, Check, AlertTriangle, Download, Layers } from 'lucide-react';
export default function Compliance() {
    const [procedure, setProcedure] = useState('SOP-09: Boiler Pressure Bleedoff');
    const [loading, setLoading] = useState(false);
    const [selectedRuleId, setSelectedRuleId] = useState('OSHA-1');
    const rules = [
        {
            id: 'OSHA-1',
            name: 'Dual Operator Authorization Sign-Off',
            passed: true,
            standard: 'OSHA 1910.119 Process Safety Management',
            evidence: 'SOP-09 Section 3.2: "Requires signatures of shift technician and control officer prior to bleeding."',
            recommendation: 'None. Verification audit parameters successfully satisfied.'
        },
        {
            id: 'OSHA-2',
            name: 'Corrosion Inspection Frequency',
            passed: true,
            standard: 'OSHA 1910.119 Process Safety Management',
            evidence: 'SOP-09 Section 4.5: "Bleedoff valve actuator must be checked for corrosion hourly by designated tech."',
            recommendation: 'None. Frequency aligns with critical hazard tolerances.'
        },
        {
            id: 'ISO-1',
            name: 'Emergency Backup Relay Redundancy',
            passed: false,
            standard: 'ISO 45001 Safety Management System Standards',
            evidence: 'SOP-09 Section 1.1: "Emergency backup power relay connection is optional before purging starts."',
            recommendation: 'Amend SOP-09 to make backup relay check mandatory before any boiler purge operations.'
        }
    ];
    const selectedRule = rules.find(r => r.id === selectedRuleId);
    const handleRunAudit = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 500);
    };
    const handleDownload = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rules, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "compliance_report.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: "Compliance & Audit Engine" }), _jsx("p", { className: "text-slate-400 text-sm", children: "Review standard operating procedures against OSHA safety regulations" })] }), _jsxs("button", { onClick: handleDownload, className: "bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all", children: [_jsx(Download, { className: "h-4 w-4" }), "Export Report"] })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4", children: [_jsx("label", { className: "block text-xs font-semibold text-slate-400 uppercase tracking-wider", children: "Select Procedure Document" }), _jsxs("div", { className: "flex gap-4", children: [_jsxs("select", { value: procedure, onChange: (e) => setProcedure(e.target.value), className: "flex-1 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-sky-500", children: [_jsx("option", { children: "SOP-09: Boiler Pressure Bleedoff" }), _jsx("option", { children: "SOP-14: Valve Purge and Clean Sequence" }), _jsx("option", { children: "SOP-22: Auxiliary Power Relay Installation" })] }), _jsxs("button", { onClick: handleRunAudit, disabled: loading, className: "bg-sky-500 hover:bg-sky-400 text-slate-950 px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50", children: [_jsx(ShieldCheck, { className: "h-5 w-5" }), loading ? 'Auditing...' : 'Audit Document'] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4", children: [_jsx("h3", { className: "text-sm font-semibold text-slate-400 uppercase tracking-wider", children: "Rule Selector" }), _jsx("div", { className: "space-y-2 max-h-[350px] overflow-y-auto pr-1", children: rules.map((rule) => (_jsxs("button", { onClick: () => setSelectedRuleId(rule.id), className: `w-full text-left p-3 rounded-lg border transition-all text-xs flex items-center justify-between ${selectedRuleId === rule.id
                                        ? 'bg-slate-800 border-sky-400 text-white font-semibold'
                                        : 'bg-slate-850 border-slate-800 text-slate-300 hover:bg-slate-800'}`, children: [_jsxs("div", { children: [_jsx("p", { className: "truncate font-medium", children: rule.name }), _jsx("span", { className: "text-[9px] text-slate-500 font-mono mt-0.5 block", children: rule.id })] }), rule.passed ? (_jsx(Check, { className: "h-4 w-4 text-emerald-400 shrink-0" })) : (_jsx(AlertTriangle, { className: "h-4 w-4 text-red-400 shrink-0" }))] }, rule.id))) })] }), _jsxs("div", { className: "lg:col-span-2 space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-3", children: [_jsx("h4", { className: "font-bold text-white text-xs uppercase tracking-wider text-slate-400", children: "Passed Rules" }), _jsx("ul", { className: "space-y-2", children: rules.filter(r => r.passed).map((rule) => (_jsxs("li", { onClick: () => setSelectedRuleId(rule.id), className: "flex items-center gap-2.5 text-xs text-emerald-300 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 cursor-pointer hover:bg-emerald-500/20 transition-all", children: [_jsx(Check, { className: "h-4 w-4 text-emerald-400 shrink-0" }), _jsx("span", { children: rule.name })] }, rule.id))) })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-3", children: [_jsx("h4", { className: "font-bold text-white text-xs uppercase tracking-wider text-slate-400", children: "Failed Rules" }), _jsx("ul", { className: "space-y-2", children: rules.filter(r => !r.passed).map((rule) => (_jsxs("li", { onClick: () => setSelectedRuleId(rule.id), className: "flex items-center gap-2.5 text-xs text-red-300 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20 cursor-pointer hover:bg-red-500/20 transition-all", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-red-400 shrink-0" }), _jsx("span", { children: rule.name })] }, rule.id))) })] })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4", children: [_jsxs("h3", { className: "text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2", children: [_jsx(Layers, { className: "h-4 w-4 text-sky-400" }), "Evidence Inspector"] }), selectedRule ? (_jsxs("div", { className: "space-y-4 text-xs", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-bold text-white", children: selectedRule.name }), _jsxs("span", { className: "text-[10px] text-slate-500 font-mono mt-0.5 block", children: ["Standard: ", selectedRule.standard] })] }), _jsxs("div", { className: "space-y-3 border-t border-slate-800 pt-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("span", { className: "text-slate-500 font-semibold uppercase text-[9px] tracking-wider", children: "Extracted Evidence Snippet" }), _jsx("p", { className: "text-slate-300 bg-slate-850 p-3 rounded-lg border border-slate-800 font-mono leading-relaxed", children: selectedRule.evidence })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("span", { className: "text-slate-500 font-semibold uppercase text-[9px] tracking-wider", children: "Audit Mitigation Recommendation" }), _jsx("p", { className: "text-slate-300 leading-relaxed", children: selectedRule.recommendation })] })] })] })) : (_jsx("p", { className: "text-xs text-slate-500 italic", children: "Select a rule from the left panel to inspect audit evidence." }))] })] })] })] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Thermometer, Gauge, Activity, AlertTriangle, CheckCircle, RefreshCcw } from 'lucide-react';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
export default function Dashboard() {
    const [telemetry, setTelemetry] = useState({
        temperature: 92.5,
        pressure: 124.0,
        vibration: 0.04,
        machineId: "BLR-01",
    });
    const [status, setStatus] = useState({
        status: "OPERATIONAL",
        anomalyDetected: false,
        recommendation: "No intervention required. Continue monitoring."
    });
    const [knowledgeStatus, setKnowledgeStatus] = useState(null);
    const [knowledgeError, setKnowledgeError] = useState(null);
    const [loadingKnowledge, setLoadingKnowledge] = useState(true);
    const loadKnowledgeStatus = async () => {
        setLoadingKnowledge(true);
        setKnowledgeError(null);
        try {
            const res = await fetch(`${BASE_URL}/knowledge/status`);
            if (!res.ok) {
                throw new Error(`${res.status} ${res.statusText}`);
            }
            const data = await res.json();
            setKnowledgeStatus(data);
        }
        catch (e) {
            setKnowledgeError(`Could not load backend status: ${e.message}`);
            setKnowledgeStatus(null);
        }
        finally {
            setLoadingKnowledge(false);
        }
    };
    useEffect(() => {
        loadKnowledgeStatus();
    }, []);
    const submitTelemetry = async (values) => {
        try {
            const res = await fetch(`${BASE_URL}/telemetry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    machine_id: values.machineId,
                    temperature: values.temperature,
                    pressure: values.pressure,
                    vibration: values.vibration,
                }),
            });
            if (!res.ok)
                return;
            const data = await res.json();
            setStatus({
                status: data.status,
                anomalyDetected: data.anomaly_detected,
                recommendation: data.recommendation,
            });
        }
        catch { /* network error — keep current status */ }
    };
    const handleSimulateNormal = () => {
        const values = { temperature: 84.2, pressure: 110.5, vibration: 0.03, machineId: "BLR-01" };
        setTelemetry(values);
        submitTelemetry(values);
    };
    const handleSimulateWarning = () => {
        const values = { temperature: 112.4, pressure: 155.2, vibration: 0.08, machineId: "BLR-01" };
        setTelemetry(values);
        submitTelemetry(values);
    };
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: "Systems Status" }), _jsx("p", { className: "text-slate-400 text-sm", children: "Real-time parameters for Mnemos Boiler #01" })] }), _jsxs("div", { className: "flex gap-4", children: [_jsx("button", { onClick: handleSimulateNormal, className: "px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-all", children: "Normal State" }), _jsx("button", { onClick: handleSimulateWarning, className: "px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 rounded-lg text-sm font-medium transition-all", children: "Trigger Anomaly" })] })] }), _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-wider text-slate-500", children: "Backend Knowledge Status" }), loadingKnowledge ? (_jsx("p", { className: "text-sm text-slate-400 mt-2", children: "Loading..." })) : knowledgeError ? (_jsx("p", { className: "text-sm text-red-400 mt-2", children: knowledgeError })) : knowledgeStatus ? (_jsxs("div", { className: "space-y-2 mt-3", children: [_jsx("p", { className: "text-2xl font-bold text-white", children: knowledgeStatus.loaded ? 'Loaded' : 'Not Loaded' }), _jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs text-slate-400", children: [_jsx("div", { children: "Documents" }), _jsx("div", { className: "text-right text-white", children: knowledgeStatus.documents }), _jsx("div", { children: "Vectors" }), _jsx("div", { className: "text-right text-white", children: knowledgeStatus.vectors }), _jsx("div", { children: "Nodes" }), _jsx("div", { className: "text-right text-white", children: knowledgeStatus.nodes }), _jsx("div", { children: "Edges" }), _jsx("div", { className: "text-right text-white", children: knowledgeStatus.edges })] })] })) : (_jsx("p", { className: "text-sm text-slate-400 mt-2", children: "No status available." }))] }), _jsx("button", { type: "button", onClick: loadKnowledgeStatus, className: "rounded-lg border border-slate-700/80 p-3 text-slate-300 hover:bg-slate-800", "aria-label": "Refresh knowledge status", children: _jsx(RefreshCcw, { className: "h-5 w-5" }) })] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "text-slate-400 text-xs font-semibold uppercase", children: "Temperature" }), _jsxs("h3", { className: "text-3xl font-bold text-white mt-1", children: [telemetry.temperature, " \u00B0C"] }), _jsx("span", { className: "text-slate-500 text-xs block mt-1", children: "Threshold: 100 \u00B0C" })] }), _jsx("div", { className: "p-3 rounded-lg bg-orange-500/10 text-orange-400", children: _jsx(Thermometer, { className: "h-8 w-8" }) })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "text-slate-400 text-xs font-semibold uppercase", children: "Pressure" }), _jsxs("h3", { className: "text-3xl font-bold text-white mt-1", children: [telemetry.pressure, " psi"] }), _jsx("span", { className: "text-slate-500 text-xs block mt-1", children: "Threshold: 150 psi" })] }), _jsx("div", { className: "p-3 rounded-lg bg-sky-500/10 text-sky-400", children: _jsx(Gauge, { className: "h-8 w-8" }) })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "text-slate-400 text-xs font-semibold uppercase", children: "Vibration" }), _jsxs("h3", { className: "text-3xl font-bold text-white mt-1", children: [telemetry.vibration, " g"] }), _jsx("span", { className: "text-slate-500 text-xs block mt-1", children: "Threshold: 0.06 g" })] }), _jsx("div", { className: "p-3 rounded-lg bg-emerald-500/10 text-emerald-400", children: _jsx(Activity, { className: "h-8 w-8" }) })] })] }), _jsxs("div", { className: `p-6 rounded-xl border flex gap-4 ${status.anomalyDetected
                    ? 'bg-red-500/10 border-red-500/30 text-red-200'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'}`, children: [_jsx("div", { className: "mt-1", children: status.anomalyDetected ? (_jsx(AlertTriangle, { className: "h-6 w-6 text-red-400" })) : (_jsx(CheckCircle, { className: "h-6 w-6 text-emerald-400" })) }), _jsxs("div", { children: [_jsxs("h4", { className: "font-bold text-lg flex items-center gap-2", children: ["Status: ", _jsx("span", { className: status.anomalyDetected ? 'text-red-400' : 'text-emerald-400', children: status.status })] }), _jsx("p", { className: "text-sm mt-1", children: status.recommendation })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: "Pressure History (6h)" }), _jsxs("div", { className: "h-64 flex items-end justify-between px-4 pb-2 border-b border-l border-slate-800 relative", children: [_jsx("div", { className: "absolute left-2 top-2 text-[10px] text-slate-500 font-mono", children: "160 psi" }), _jsx("div", { className: "absolute left-2 bottom-2 text-[10px] text-slate-500 font-mono", children: "80 psi" }), _jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 500 200", children: [_jsx("path", { d: status.anomalyDetected
                                                    ? "M 0 150 L 100 130 L 200 110 L 300 120 L 400 90 L 500 20"
                                                    : "M 0 150 L 100 130 L 200 110 L 300 120 L 400 90 L 500 80", fill: "none", stroke: status.anomalyDetected ? "#EF4444" : "#38BDF8", strokeWidth: "3", className: "transition-all duration-500" }), _jsx("circle", { cx: "496", cy: status.anomalyDetected ? 20 : 80, r: "4", fill: status.anomalyDetected ? "#EF4444" : "#38BDF8" })] }), _jsxs("div", { className: "absolute bottom-[-24px] left-0 right-0 flex justify-between text-[9px] text-slate-500 font-mono px-2", children: [_jsx("span", { children: "12:00" }), _jsx("span", { children: "13:00" }), _jsx("span", { children: "14:00" }), _jsx("span", { children: "15:00" }), _jsx("span", { children: "16:00" }), _jsx("span", { children: "17:00" })] })] })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: "Recent Incidents Log" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs border-collapse", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-slate-800 text-slate-400", children: [_jsx("th", { className: "pb-3 font-semibold uppercase", children: "Time" }), _jsx("th", { className: "pb-3 font-semibold uppercase", children: "Machine" }), _jsx("th", { className: "pb-3 font-semibold uppercase", children: "Event" }), _jsx("th", { className: "pb-3 font-semibold uppercase", children: "Severity" }), _jsx("th", { className: "pb-3 font-semibold uppercase", children: "Status" })] }) }), _jsxs("tbody", { className: "divide-y divide-slate-800/50 text-slate-300", children: [_jsxs("tr", { children: [_jsx("td", { className: "py-3 font-mono", children: "17:45" }), _jsx("td", { children: "BLR-01" }), _jsx("td", { children: "Steam Valve Leak" }), _jsx("td", { children: _jsx("span", { className: "text-red-400 font-semibold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20", children: "Critical" }) }), _jsx("td", { className: "text-slate-400", children: "Resolved" })] }), _jsxs("tr", { children: [_jsx("td", { className: "py-3 font-mono", children: "16:10" }), _jsx("td", { children: "PMP-02" }), _jsx("td", { children: "High Vibration" }), _jsx("td", { children: _jsx("span", { className: "text-yellow-400 font-semibold bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20", children: "Warning" }) }), _jsx("td", { className: "text-emerald-400 font-medium", children: "Monitoring" })] }), _jsxs("tr", { children: [_jsx("td", { className: "py-3 font-mono", children: "14:30" }), _jsx("td", { children: "HTR-05" }), _jsx("td", { children: "Temp Drift" }), _jsx("td", { children: _jsx("span", { className: "text-blue-400 font-semibold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20", children: "Low" }) }), _jsx("td", { className: "text-slate-400", children: "Resolved" })] })] })] }) })] })] })] }));
}

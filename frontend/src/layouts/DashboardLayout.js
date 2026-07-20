import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Network, ShieldCheck, Zap, Shield, Brain } from 'lucide-react';
export default function DashboardLayout({ children }) {
    const location = useLocation();
    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Agent Chat', href: '/chat', icon: MessageSquare },
        { name: 'Graph Explorer', href: '/graph', icon: Network },
        { name: 'Compliance', href: '/compliance', icon: ShieldCheck },
        { name: 'Risk Assessment', href: '/risk', icon: Shield },
        { name: 'Pattern Intelligence', href: '/patterns', icon: Brain },
    ];
    return (_jsxs("div", { className: "flex h-screen bg-[#0B0F19] text-slate-100 overflow-hidden", children: [_jsxs("aside", { className: "w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "h-16 flex items-center px-6 gap-2 border-b border-slate-800", children: [_jsx(Zap, { className: "h-6 w-6 text-sky-400 animate-pulse" }), _jsx("span", { className: "text-xl font-bold tracking-wider text-white", children: "MNEMOS" })] }), _jsx("nav", { className: "p-4 space-y-1", children: navigation.map((item) => {
                                    const active = location.pathname === item.href;
                                    const Icon = item.icon;
                                    return (_jsxs(Link, { to: item.href, className: `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${active
                                            ? 'bg-sky-500/10 text-sky-400 border-l-4 border-sky-400'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`, children: [_jsx(Icon, { className: "h-5 w-5" }), item.name] }, item.name));
                                }) })] }), _jsx("div", { className: "p-6 border-t border-slate-800", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center font-bold text-slate-900 text-sm", children: "OP" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-400 font-semibold uppercase", children: "Operator Profile" }), _jsx("p", { className: "text-sm font-medium text-white", children: "Shift Lead #4" })] })] }) })] }), _jsxs("main", { className: "flex-1 overflow-y-auto", children: [_jsxs("header", { className: "h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#0F172A]/50 backdrop-blur-md sticky top-0 z-40", children: [_jsx("h1", { className: "text-lg font-semibold text-white", children: navigation.find((n) => n.href === location.pathname)?.name || 'System Overview' }), _jsx("div", { className: "flex items-center gap-4 text-xs text-slate-400", children: _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-500 animate-ping" }), "API CONNECTED"] }) })] }), _jsx("div", { className: "p-8", children: children })] })] }));
}

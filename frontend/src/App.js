import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Graph from './pages/Graph';
import Compliance from './pages/Compliance';
import RiskDashboard from './pages/RiskDashboard';
import PatternIntelligence from './pages/PatternIntelligence';
const queryClient = new QueryClient();
export default function App() {
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(BrowserRouter, { children: _jsx(DashboardLayout, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/chat", element: _jsx(Chat, {}) }), _jsx(Route, { path: "/graph", element: _jsx(Graph, {}) }), _jsx(Route, { path: "/compliance", element: _jsx(Compliance, {}) }), _jsx(Route, { path: "/risk", element: _jsx(RiskDashboard, {}) }), _jsx(Route, { path: "/patterns", element: _jsx(PatternIntelligence, {}) })] }) }) }) }));
}

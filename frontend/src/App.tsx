import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Graph from './pages/Graph';
import Compliance from './pages/Compliance';
import RiskDashboard from './pages/RiskDashboard';
import PatternIntelligence from './pages/PatternIntelligence';
import Documents from './pages/Documents';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/graph" element={<Graph />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/risk" element={<RiskDashboard />} />
            <Route path="/patterns" element={<PatternIntelligence />} />
          </Routes>
        </DashboardLayout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}


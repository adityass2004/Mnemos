import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Network, ShieldCheck, Zap, Shield, Brain, FolderOpen } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Agent Chat', href: '/chat', icon: MessageSquare },
    { name: 'Documents', href: '/documents', icon: FolderOpen },
    { name: 'Graph Explorer', href: '/graph', icon: Network },
    { name: 'Compliance', href: '/compliance', icon: ShieldCheck },
    { name: 'Risk Assessment', href: '/risk', icon: Shield },
    { name: 'Pattern Intelligence', href: '/patterns', icon: Brain },
  ];

  return (
    <div className="flex h-screen bg-[#0B0F19] text-slate-100 overflow-hidden">
      <aside className="w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col justify-between">
        <div>
          <div className="h-16 flex items-center px-6 gap-2 border-b border-slate-800">
            <Zap className="h-6 w-6 text-sky-400 animate-pulse" />
            <span className="text-xl font-bold tracking-wider text-white">MNEMOS</span>
          </div>
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const active = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-sky-500/10 text-sky-400 border-l-4 border-sky-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-6 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center font-bold text-slate-900 text-sm">
              OP
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Operator Profile</p>
              <p className="text-sm font-medium text-white">Shift Lead #4</p>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#0F172A]/50 backdrop-blur-md sticky top-0 z-40">
          <h1 className="text-lg font-semibold text-white">
            {navigation.find((n) => n.href === location.pathname)?.name || 'System Overview'}
          </h1>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              API CONNECTED
            </span>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MessageSquare, ShieldAlert, Cpu } from 'lucide-react';

interface Pattern {
  id: string;
  name: string;
  category: string;
  occurrences: number;
  description: string;
  equipment: string[];
  timeline: { date: string; event: string; status: string }[];
}

export default function PatternIntelligence() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState('P-1');

  const patterns: Pattern[] = [
    {
      id: 'P-1',
      name: 'Thermal Fatigue Cycle',
      category: 'Thermodynamics',
      occurrences: 14,
      description: 'Rapid temperature fluctuations causing joint strain and pressure spikes in primary steam tubes.',
      equipment: ['Boiler #01', 'Safety Valve #02'],
      timeline: [
        { date: '2026-07-18', event: 'Sensor drift on main steam line', status: 'resolved' },
        { date: '2026-06-02', event: 'Tube flange micro-expansion', status: 'monitored' },
        { date: '2026-05-11', event: 'Safety Valve #02 bypass release', status: 'resolved' }
      ]
    },
    {
      id: 'P-2',
      name: 'Resonant Vibration Peak',
      category: 'Mechanics',
      occurrences: 8,
      description: 'Synchronized rotor frequency misalignment leading to coolant pump stabilizer bearing failure.',
      equipment: ['Coolant Pump #02'],
      timeline: [
        { date: '2026-07-15', event: 'Stabilizer bearing wear detection', status: 'pending' },
        { date: '2026-04-10', event: 'Frequency peak exceeding 0.08g', status: 'resolved' }
      ]
    }
  ];

  const selectedPattern = patterns.find(p => p.id === selectedId) || patterns[0];

  const handleOpenChat = (name: string) => {
    navigate(`/chat`, { state: { query: `Tell me about the ${name} failure pattern.` } });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Failure Pattern Intelligence</h2>
        <p className="text-slate-400 text-sm">Analyze recurring signatures and failure loops across machinery</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Pattern Signature Cards</h3>
          <div className="space-y-4">
            {patterns.map((pat) => (
              <div
                key={pat.id}
                onClick={() => setSelectedId(pat.id)}
                className={`p-5 rounded-xl border cursor-pointer transition-all hover:translate-x-1 ${
                  selectedId === pat.id
                    ? 'bg-slate-800 border-sky-400 text-white'
                    : 'bg-slate-900 border-slate-805 text-slate-300 hover:bg-slate-850'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-sky-400 tracking-widest">{pat.category}</span>
                    <h4 className="font-bold text-sm mt-0.5">{pat.name}</h4>
                  </div>
                  <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                    {pat.occurrences} Occurred
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-3 line-clamp-2 leading-relaxed">{pat.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedPattern.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{selectedPattern.description}</p>
              </div>
              <button
                onClick={() => handleOpenChat(selectedPattern.name)}
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all"
              >
                <MessageSquare className="h-4 w-4" />
                Analyze in Chat
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-800 pt-6">
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="h-4 w-4 text-sky-400" />
                  Related Assets
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPattern.equipment.map((eq, i) => (
                    <span
                      key={i}
                      className="bg-slate-850 text-slate-300 border border-slate-800 px-3 py-1 rounded-lg text-xs font-medium"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-sky-400" />
                  Pattern Parameters
                </h4>
                <div className="flex gap-4">
                  <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 text-center flex-1">
                    <span className="text-base font-bold text-white font-mono">{selectedPattern.occurrences}</span>
                    <p className="text-[9px] text-slate-500 uppercase mt-0.5 font-semibold">Frequency</p>
                  </div>
                  <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 text-center flex-1">
                    <span className="text-base font-bold text-red-400 font-mono">HIGH</span>
                    <p className="text-[9px] text-slate-500 uppercase mt-0.5 font-semibold">Priority</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-6 space-y-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-sky-400" />
                Incident Timeline Loop
              </h4>
              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-800">
                {selectedPattern.timeline.map((evt, idx) => (
                  <div key={idx} className="flex gap-4 items-start pl-8 relative">
                    <div className="absolute left-[9px] top-1.5 w-2.5 h-2.5 rounded-full bg-sky-500 border border-[#0B0F19]"></div>
                    <div className="flex-1 bg-slate-850 p-3.5 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-slate-200">{evt.event}</p>
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{evt.date}</span>
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        evt.status === 'resolved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {evt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

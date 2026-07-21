import React, { useState } from 'react';
import { Thermometer, Gauge, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

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

  const handleSimulateNormal = () => {
    setTelemetry({ temperature: 84.2, pressure: 110.5, vibration: 0.03, machineId: "BLR-01" });
    setStatus({
      status: "OPERATIONAL",
      anomalyDetected: false,
      recommendation: "No intervention required. Continue monitoring."
    });
  };

  const handleSimulateWarning = () => {
    setTelemetry({ temperature: 112.4, pressure: 155.2, vibration: 0.08, machineId: "BLR-01" });
    setStatus({
      status: "CRITICAL",
      anomalyDetected: true,
      recommendation: "Initiate emergency cooling system and pressure relief valve."
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">System Status</h2>
          <p className="text-slate-400 text-sm">Real-time parameters for Mnemos Boiler #01</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleSimulateNormal}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-all"
          >
            Normal State
          </button>
          <button 
            onClick={handleSimulateWarning}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 rounded-lg text-sm font-medium transition-all"
          >
            Trigger Anomaly
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase">Temperature</span>
            <h3 className="text-3xl font-bold text-white mt-1">{telemetry.temperature} °C</h3>
            <span className="text-slate-500 text-xs block mt-1">Threshold: 100 °C</span>
          </div>
          <div className="p-3 rounded-lg bg-orange-500/10 text-orange-400">
            <Thermometer className="h-8 w-8" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase">Pressure</span>
            <h3 className="text-3xl font-bold text-white mt-1">{telemetry.pressure} psi</h3>
            <span className="text-slate-500 text-xs block mt-1">Threshold: 150 psi</span>
          </div>
          <div className="p-3 rounded-lg bg-sky-500/10 text-sky-400">
            <Gauge className="h-8 w-8" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase">Vibration</span>
            <h3 className="text-3xl font-bold text-white mt-1">{telemetry.vibration} g</h3>
            <span className="text-slate-500 text-xs block mt-1">Threshold: 0.06 g</span>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Activity className="h-8 w-8" />
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-xl border flex gap-4 ${
        status.anomalyDetected 
          ? 'bg-red-500/10 border-red-500/30 text-red-200' 
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
      }`}>
        <div className="mt-1">
          {status.anomalyDetected ? (
            <AlertTriangle className="h-6 w-6 text-red-400" />
          ) : (
            <CheckCircle className="h-6 w-6 text-emerald-400" />
          )}
        </div>
        <div>
          <h4 className="font-bold text-lg flex items-center gap-2">
            Status: <span className={status.anomalyDetected ? 'text-red-400' : 'text-emerald-400'}>{status.status}</span>
          </h4>
          <p className="text-sm mt-1">{status.recommendation}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Pressure History (6h)</h3>
          <div className="h-64 flex items-end justify-between px-4 pb-2 border-b border-l border-slate-800 relative">
            <div className="absolute left-2 top-2 text-[10px] text-slate-500 font-mono">160 psi</div>
            <div className="absolute left-2 bottom-2 text-[10px] text-slate-500 font-mono">80 psi</div>
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200">
              <path
                d={status.anomalyDetected 
                  ? "M 0 150 L 100 130 L 200 110 L 300 120 L 400 90 L 500 20" 
                  : "M 0 150 L 100 130 L 200 110 L 300 120 L 400 90 L 500 80"
                }
                fill="none"
                stroke={status.anomalyDetected ? "#EF4444" : "#38BDF8"}
                strokeWidth="3"
                className="transition-all duration-500"
              />
              <circle cx="496" cy={status.anomalyDetected ? 20 : 80} r="4" fill={status.anomalyDetected ? "#EF4444" : "#38BDF8"} />
            </svg>
            <div className="absolute bottom-[-24px] left-0 right-0 flex justify-between text-[9px] text-slate-500 font-mono px-2">
              <span>12:00</span>
              <span>13:00</span>
              <span>14:00</span>
              <span>15:00</span>
              <span>16:00</span>
              <span>17:00</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Recent Incidents Log</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold uppercase">Time</th>
                  <th className="pb-3 font-semibold uppercase">Machine</th>
                  <th className="pb-3 font-semibold uppercase">Event</th>
                  <th className="pb-3 font-semibold uppercase">Severity</th>
                  <th className="pb-3 font-semibold uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                <tr>
                  <td className="py-3 font-mono">17:45</td>
                  <td>BLR-01</td>
                  <td>Steam Valve Leak</td>
                  <td>
                    <span className="text-red-400 font-semibold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">Critical</span>
                  </td>
                  <td className="text-slate-400">Resolved</td>
                </tr>
                <tr>
                  <td className="py-3 font-mono">16:10</td>
                  <td>PMP-02</td>
                  <td>High Vibration</td>
                  <td>
                    <span className="text-yellow-400 font-semibold bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">Warning</span>
                  </td>
                  <td className="text-emerald-400 font-medium">Monitoring</td>
                </tr>
                <tr>
                  <td className="py-3 font-mono">14:30</td>
                  <td>HTR-05</td>
                  <td>Temp Drift</td>
                  <td>
                    <span className="text-blue-400 font-semibold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">Low</span>
                  </td>
                  <td className="text-slate-400">Resolved</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


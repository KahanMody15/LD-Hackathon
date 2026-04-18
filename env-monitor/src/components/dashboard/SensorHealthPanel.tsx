import type { Sensor } from "@/types";
import { AlertCircle, WifiOff, CheckCircle2 } from "lucide-react";

interface SensorHealthPanelProps {
  sensors: Sensor[];
}

export function SensorHealthPanel({ sensors }: SensorHealthPanelProps) {
  const activeCount = sensors.filter(s => s.status === 'Active').length;
  const faultCount = sensors.filter(s => s.status === 'Fault').length;
  const offlineCount = sensors.filter(s => s.status === 'Offline').length;

  return (
    <div className="glass-panel p-4 rounded-xl flex flex-col h-full">
      <div className="text-sm font-semibold text-slate-300 mb-4 pb-2 border-b border-white/5 flex items-center justify-between">
        <span>Sensor Network Health</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">Total: {sensors.length}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-safe/10 border border-safe/20 rounded p-2 text-center">
          <div className="text-lg font-bold text-safe">{activeCount}</div>
          <div className="text-[10px] uppercase text-safe/80">Active</div>
        </div>
        <div className="bg-warning/10 border border-warning/20 rounded p-2 text-center">
          <div className="text-lg font-bold text-warning">{faultCount}</div>
          <div className="text-[10px] uppercase text-warning/80">Fault</div>
        </div>
        <div className="bg-slate-800/50 border border-white/10 rounded p-2 text-center">
          <div className="text-lg font-bold text-slate-400">{offlineCount}</div>
          <div className="text-[10px] uppercase text-slate-500">Offline</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
        {sensors.sort((a, b) => (a.status === 'Active' && b.status !== 'Active' ? -1 : 1)).map((sensor) => (
          <div key={sensor.id} className="bg-slate-800/30 p-2.5 rounded-lg border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3 relative">
              {sensor.status === 'Active' ? (
                <CheckCircle2 className="w-4 h-4 text-safe shrink-0" />
              ) : sensor.status === 'Fault' ? (
                <AlertCircle className="w-4 h-4 text-warning shrink-0" />
              ) : (
                <WifiOff className="w-4 h-4 text-slate-500 shrink-0" />
              )}
              
              <div>
                <div className="text-xs font-semibold text-slate-200">{sensor.name}</div>
                <div className="text-[10px] text-slate-500">
                  {sensor.status === 'Active' ? `AQI: ${sensor.aqi.toFixed(0)}` : 'Requires maintenance'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

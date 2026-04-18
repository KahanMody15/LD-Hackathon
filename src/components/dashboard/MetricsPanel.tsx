import type { Sensor } from "@/types";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface MetricsPanelProps {
  sensors: Sensor[];
}

export function MetricsPanel({ sensors }: MetricsPanelProps) {
  // Aggregate mock chart data
  const chartData = [
    { time: '10:00', pm25: 45, so2: 12 },
    { time: '10:05', pm25: 48, so2: 15 },
    { time: '10:10', pm25: 60, so2: 30 },
    { time: '10:15', pm25: 120, so2: 45 },
    { time: '10:20', pm25: 150, so2: 60 },
  ];

  const avgPM25 = sensors.reduce((acc, s) => acc + (s.status === 'Active' ? s.pm25 : 0), 0) / sensors.filter(s => s.status === 'Active').length || 0;
  const avgAQI = sensors.reduce((acc, s) => acc + (s.status === 'Active' ? s.aqi : 0), 0) / sensors.filter(s => s.status === 'Active').length || 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
          <div className="text-slate-400 text-xs font-semibold mb-1 uppercase">Avg Region PM2.5</div>
          <div className="text-3xl font-bold text-white">
            {avgPM25.toFixed(1)} <span className="text-sm font-normal text-slate-500">µg/m³</span>
          </div>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
          <div className="text-slate-400 text-xs font-semibold mb-1 uppercase">Region AQI</div>
          <div className={`text-3xl font-bold ${avgAQI > 150 ? 'text-danger' : avgAQI > 100 ? 'text-warning' : 'text-safe'}`}>
            {avgAQI.toFixed(0)}
          </div>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-xl flex-1 flex flex-col min-h-[200px]">
        <div className="text-sm font-semibold text-slate-300 mb-4 flex justify-between">
          <span>Pollutant Trends</span>
          <span className="text-xs text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded">Live</span>
        </div>
        <div className="flex-1 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="time" stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #ffffff10', borderRadius: '8px' }}
                itemStyle={{ fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}
              />
              <Line type="monotone" dataKey="pm25" name="PM2.5" stroke="#e74c3c" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="so2" name="SO2" stroke="#f39c12" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
        <h4 className="text-xs font-bold text-slate-300 mb-3 uppercase tracking-wider">AI Forecast (next 12m)</h4>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-warning to-danger w-[75%] relative">
                <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium tracking-wide">
              <span>Current</span>
              <span className="text-danger flex items-center gap-1">Expected Peak <span className="animate-pulse">↑</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

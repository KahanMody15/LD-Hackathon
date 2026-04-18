/**
 * ⑦ Wind Compass Widget — Public AQI Dashboard
 * Animated SVG compass rose showing real-time wind direction + source inference.
 */

import { useMemo } from 'react';
import type { SensorNode } from '@/backend/BackendContext';
import type { SourceInferenceResult } from '@/backend/BackendContext';

interface WindCompassProps {
  nodes: SensorNode[];
  inference: SourceInferenceResult | null;
}

function getAQIColor(aqi: number): string {
  if (aqi <= 50)  return '#22c55e';
  if (aqi <= 100) return '#eab308';
  if (aqi <= 150) return '#f97316';
  if (aqi <= 200) return '#ef4444';
  if (aqi <= 300) return '#a855f7';
  return '#991b1b';
}

function polarXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function WindCompass({ nodes, inference }: WindCompassProps) {
  const active = nodes.filter(n => n.status === 'Active');

  const stats = useMemo(() => {
    if (!active.length) return null;
    const avgWS  = active.reduce((s, n) => s + n.windSpeed, 0) / active.length;
    const avgAQI = active.reduce((s, n) => s + n.aqi, 0) / active.length;
    // Circular mean for wind direction
    const sinSum = active.reduce((s, n) => s + Math.sin(n.windDir * Math.PI / 180), 0);
    const cosSum = active.reduce((s, n) => s + Math.cos(n.windDir * Math.PI / 180), 0);
    const avgDir = (Math.atan2(sinSum, cosSum) * 180 / Math.PI + 360) % 360;
    return { avgWS, avgAQI: Math.round(avgAQI), avgDir };
  }, [active]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
        No active sensors
      </div>
    );
  }

  const cx = 110, cy = 110, R = 80;
  const aqiColor = getAQIColor(stats.avgAQI);
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

  // Wind needle points in the direction wind is blowing TO
  const windTo = (stats.avgDir + 180) % 360;
  const needleTip = polarXY(cx, cy, R - 8, windTo);
  const needleBase = polarXY(cx, cy, 22, (windTo + 180) % 360);

  // Source arrow (upwind direction)
  const sourceDir = inference ? inference.bearingDeg : null;
  const sourceTip = sourceDir !== null ? polarXY(cx, cy, R + 14, sourceDir) : null;
  const sourceBase = sourceDir !== null ? polarXY(cx, cy, R + 4, (sourceDir + 180) % 360) : null;

  // Beaufort scale label
  const ws = stats.avgWS;
  const beaufort =
    ws < 0.5 ? 'Calm' :
    ws < 1.6 ? 'Light Air' :
    ws < 3.4 ? 'Light Breeze' :
    ws < 5.5 ? 'Gentle Breeze' :
    ws < 8.0 ? 'Moderate Breeze' :
    ws < 10.8 ? 'Fresh Breeze' : 'Strong Wind';

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 220 220" className="w-full max-w-[220px]">
        {/* Outer AQI ring */}
        <circle cx={cx} cy={cy} r={R + 18} fill="none" stroke={aqiColor} strokeWidth="3" opacity="0.25" />
        <circle cx={cx} cy={cy} r={R + 18} fill="none" stroke={aqiColor} strokeWidth="1.5"
          strokeDasharray={`${(stats.avgAQI / 500) * 2 * Math.PI * (R + 18)} 9999`}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
        />

        {/* Background circle */}
        <circle cx={cx} cy={cy} r={R} fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />

        {/* Cardinal grid spokes */}
        {[0, 45, 90, 135].map(a => {
          const p1 = polarXY(cx, cy, 18, a);
          const p2 = polarXY(cx, cy, R - 2, a);
          const p3 = polarXY(cx, cy, 18, a + 180);
          const p4 = polarXY(cx, cy, R - 2, a + 180);
          return (
            <g key={a}>
              <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#1e293b" strokeWidth="0.8" />
              <line x1={p3.x} y1={p3.y} x2={p4.x} y2={p4.y} stroke="#1e293b" strokeWidth="0.8" />
            </g>
          );
        })}

        {/* Compass concentric rings */}
        {[0.33, 0.66].map(f => (
          <circle key={f} cx={cx} cy={cy} r={R * f} fill="none" stroke="#1e293b" strokeWidth="0.5" />
        ))}

        {/* Cardinal labels */}
        {dirs.map((label, i) => {
          const pos = polarXY(cx, cy, R + 8, i * 45);
          const isMain = i % 2 === 0;
          return (
            <text key={label} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
              fill={isMain ? '#94a3b8' : '#475569'}
              fontSize={isMain ? 9 : 7}
              fontWeight={isMain ? 'bold' : 'normal'}
            >
              {label}
            </text>
          );
        })}

        {/* Source direction arrow (inferred pollution source) */}
        {sourceTip && sourceBase && (
          <g opacity="0.85">
            <defs>
              <marker id="srcArrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#f97316" />
              </marker>
            </defs>
            <line
              x1={sourceBase.x} y1={sourceBase.y}
              x2={sourceTip.x} y2={sourceTip.y}
              stroke="#f97316" strokeWidth="2" strokeDasharray="4 3"
              markerEnd="url(#srcArrow)"
            />
          </g>
        )}

        {/* Wind needle */}
        <defs>
          <marker id="windArrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#38bdf8" />
          </marker>
        </defs>
        <line
          x1={needleBase.x} y1={needleBase.y}
          x2={needleTip.x}  y2={needleTip.y}
          stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round"
          markerEnd="url(#windArrow)"
        />

        {/* Center hub */}
        <circle cx={cx} cy={cy} r="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r="3" fill="#38bdf8" />

        {/* AQI center label */}
        <text x={cx} y={cy + 22} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{stats.avgAQI}</text>
        <text x={cx} y={cy + 32} textAnchor="middle" fill={aqiColor} fontSize="6.5" fontWeight="600">AQI</text>
      </svg>

      {/* Legend */}
      <div className="w-full space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-sky-400 rounded" />
            <span className="text-slate-400">Wind direction</span>
          </div>
          <span className="text-sky-400 font-semibold">{active[0]?.windDirLabel ?? '—'} · {stats.avgWS.toFixed(1)} m/s</span>
        </div>
        {inference && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-orange-400 border-dashed border-t-2 border-orange-400" style={{ border: 'none', background: 'repeating-linear-gradient(90deg,#f97316 0,#f97316 4px,transparent 4px,transparent 7px)', height: '2px' }} />
              <span className="text-slate-400">Inferred source</span>
            </div>
            <span className="text-orange-400 font-semibold">{inference.windVectorLabel}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Wind condition</span>
          <span className="text-slate-300">{beaufort}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Active nodes</span>
          <span className="text-slate-300">{active.length} / {nodes.length}</span>
        </div>
      </div>
    </div>
  );
}

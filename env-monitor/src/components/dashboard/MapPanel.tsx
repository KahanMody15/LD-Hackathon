import { useEffect, useRef } from "react";
import type { Sensor, Factory, Event } from "@/types";

interface MapPanelProps {
  sensors: Sensor[];
  factories: Factory[];
  activeEvents: Event[];
}

export function MapPanel({ sensors, factories, activeEvents }: MapPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // Draw Grid / Background style
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
      }
      for (let i = 0; i < height; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
      }

      // Convert Lat/Lng to X/Y space (rough approximation for demo)
      const latMin = 21.5, latMax = 21.75;
      const lngMin = 72.8, lngMax = 73.2;

      const toXY = (lat: number, lng: number) => {
        const x = ((lng - lngMin) / (lngMax - lngMin)) * width;
        const y = height - ((lat - latMin) / (latMax - latMin)) * height;
        return { x, y };
      };

      // Draw Event Radius
      activeEvents.forEach(evt => {
        const { x, y } = toXY(evt.location.lat, evt.location.lng);
        ctx.beginPath();
        ctx.arc(x, y, evt.radiusKm * 15, 0, Math.PI * 2);
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, evt.radiusKm * 15);
        if (evt.severity === 'Critical') {
          gradient.addColorStop(0, 'rgba(231, 76, 60, 0.4)');
          gradient.addColorStop(1, 'rgba(231, 76, 60, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(243, 156, 18, 0.4)');
          gradient.addColorStop(1, 'rgba(243, 156, 18, 0)');
        }
        
        ctx.fillStyle = gradient;
        ctx.fill();

        // Pulsing core
        const time = Date.now() / 500;
        const pulse = Math.abs(Math.sin(time)) * 5;
        ctx.beginPath();
        ctx.arc(x, y, 5 + pulse, 0, Math.PI * 2);
        ctx.fillStyle = evt.severity === 'Critical' ? '#e74c3c' : '#f39c12';
        ctx.fill();
      });

      // Draw Factories
      factories.forEach(f => {
        const { x, y } = toXY(f.location.lat, f.location.lng);
        ctx.fillStyle = "#8e44ad"; // purple for industries
        ctx.fillRect(x - 6, y - 6, 12, 12);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 6, y - 6, 12, 12);
      });

      // Draw Sensors
      sensors.forEach(s => {
        const { x, y } = toXY(s.location.lat, s.location.lng);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        
        let color = '#2ecc71'; // Active & Safe
        if (s.status === 'Offline') color = '#7f8c8d';
        else if (s.status === 'Fault') color = '#f1c40f';
        else if (s.aqi > 200) color = '#e74c3c';
        else if (s.aqi > 100) color = '#f39c12';

        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();

        if (s.aqi > 200 && s.status === 'Active') {
           ctx.beginPath();
           const pulse = (Date.now() % 1000) / 100;
           ctx.arc(x, y, 4 + pulse, 0, Math.PI * 2);
           ctx.strokeStyle = `rgba(231, 76, 60, ${1 - pulse/10})`;
           ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [sensors, factories, activeEvents]);

  return (
    <div className="relative w-full h-full bg-[#030914] rounded-xl overflow-hidden border border-white/5 shadow-inner">
      {/* Topographic Map SVG Background */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='topo' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cpath d='M0 50 Q 25 25, 50 50 T 100 50 M0 75 Q 25 50, 50 75 T 100 75 M0 25 Q 25 0, 50 25 T 100 25' fill='none' stroke='%233b82f6' stroke-width='0.5' opacity='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23topo)'/%3E%3C/svg%3E")`,
          backgroundSize: '150px 150px'
        }}
      />
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={500} 
        className="w-full h-full object-cover relative z-10"
      />
      <div className="absolute top-4 left-4 z-20 bg-slate-950/95 p-3 rounded-xl backdrop-blur-md border border-white/10 shadow-2xl">
        <h4 className="text-[10px] font-bold text-slate-200 mb-2.5 uppercase tracking-widest">Map Legend</h4>
        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full flex-shrink-0" style={{background:'#2ecc71',boxShadow:'0 0 6px #2ecc71'}}></div> AQI Good (0–100)</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full flex-shrink-0" style={{background:'#f39c12',boxShadow:'0 0 6px #f39c12'}}></div> AQI Moderate (100–200)</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full flex-shrink-0" style={{background:'#e74c3c',boxShadow:'0 0 6px #e74c3c'}}></div> AQI Hazardous (200+)</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm flex-shrink-0" style={{background:'#8e44ad',boxShadow:'0 0 6px #8e44ad'}}></div> Industrial Facility</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full flex-shrink-0" style={{background:'#7f8c8d'}}></div> Offline Sensor</div>
        </div>
      </div>
    </div>
  );
}

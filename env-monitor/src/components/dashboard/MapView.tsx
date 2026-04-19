import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap, Tooltip, Circle } from 'react-leaflet';
import L from 'leaflet';
import type { Sensor, Factory } from '@/types';
import { Wind, Thermometer, AlertTriangle } from 'lucide-react';
import { renderToString } from 'react-dom/server';

// Factory SVG Icon to replace default Leaflet marker (Purple/Square aesthetic)
const FactoryIconHTML = renderToString(
  <div style={{ backgroundColor: '#a855f7', border: '2px solid #581c87', borderRadius: '4px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(168,85,247,0.5)' }}>
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 17v-4.5a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 0-.5.5V17M2 17v-4.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5V17" />
      <path d="M12 17V8.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5V17" />
      <path d="M17 17v-8.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5V17" />
      <path d="M2 22h20" />
    </svg>
  </div>
);

const factoryIcon = new L.DivIcon({
  html: FactoryIconHTML,
  className: 'custom-factory-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface MapViewProps {
  region: { id: string; name: string; lat: number; lng: number; defaultAQI: number };
  sensors: Sensor[];
  factories: Factory[];
}

// Sub-component to re-center map when region changes
function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

export function MapView({ region, sensors, factories }: MapViewProps) {
  // Helper to color-code AQI
  const getAQIColor = (aqi: number) => {
    if (aqi <= 100) return '#22c55e'; // Green - Good
    if (aqi <= 200) return '#eab308'; // Yellow - Moderate
    return '#ef4444'; // Red - Hazardous
  };

  // Generate localized coordinates based on the active region
  // This spoofs the globally generated sensors into the selected city layout
  const mapLocalizedSensors = (items: any[]) => {
    return items.map((item, index) => {
      // Create a deterministic pseudo-random offset based on index
      const offsetLat = (Math.sin(index * 1.5) * 0.08);
      const offsetLng = (Math.cos(index * 2.1) * 0.08);
      return {
        ...item,
        location: {
          lat: region.lat + offsetLat,
          lng: region.lng + offsetLng
        }
      };
    });
  };

  const localizedSensors = mapLocalizedSensors(sensors) as Sensor[];
  const localizedFactories = mapLocalizedSensors(factories) as Factory[];

  return (
    <div className="w-full h-full min-h-[400px] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative z-0">
      <MapContainer 
        center={[region.lat, region.lng]} 
        zoom={12} 
        style={{ height: '100%', width: '100%', background: '#0a0f1a' }}
        zoomControl={false}
      >
        {/* Dark-themed OpenStreetMap tiles (CartoDB Dark Matter) */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapController center={[region.lat, region.lng]} zoom={12} />

        {/* Heatmap Simulation Layer - large translucent circles corresponding to high AQI */}
        {localizedSensors.map(sensor => {
          if (sensor.aqi > 150) {
            return (
              <Circle
                key={`heat-${sensor.id}`}
                center={[sensor.location.lat, sensor.location.lng]}
                radius={2500}
                pathOptions={{
                  color: 'none',
                  fillColor: getAQIColor(sensor.aqi),
                  fillOpacity: 0.15,
                  className: 'animate-pulse'
                }}
              />
            );
          }
          return null;
        })}

        {/* Industrial Factory Markers */}
        {localizedFactories.map((factory) => (
          <Marker 
            key={factory.id} 
            position={[factory.location.lat, factory.location.lng]} 
            icon={factoryIcon}
          >
            <Popup>
              <div className="p-1">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 border-b border-white/10 pb-1.5">Industrial Zone</div>
                <div className="text-sm font-bold text-white mb-2">{factory.name}</div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-full font-semibold ${factory.complianceStatus === 'Violation' ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                    {factory.complianceStatus}
                  </span>
                </div>
              </div>
            </Popup>
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <span className="font-bold">{factory.name}</span>
            </Tooltip>
          </Marker>
        ))}

        {/* Sensor Node Markers */}
        {localizedSensors.map((sensor) => {
          const color = getAQIColor(sensor.aqi);
          return (
             <CircleMarker
              key={sensor.id}
              center={[sensor.location.lat, sensor.location.lng]}
              radius={8}
              pathOptions={{
                color: '#fff',
                weight: 2,
                fillColor: color,
                fillOpacity: 0.9,
              }}
            >
              <Popup>
                <div className="p-1 min-w-[160px]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                    <span className="text-sm font-bold text-white">{sensor.name}</span>
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${sensor.status==='Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {sensor.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                       <span className="text-slate-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> AQI</span>
                       <span className="font-bold text-white" style={{color}}>{sensor.aqi.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                       <span className="text-slate-400 flex items-center gap-1"><Wind className="w-3 h-3"/> PM2.5</span>
                       <span className="font-bold text-white">{sensor.pm25.toFixed(1)} µg/m³</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                       <span className="text-slate-400 flex items-center gap-1"><Thermometer className="w-3 h-3"/> SO₂</span>
                       <span className="font-bold text-white">{sensor.so2.toFixed(1)} ppb</span>
                    </div>
                  </div>
                  <div className="mt-3 text-[9px] text-slate-500 format-time">
                    Updated: {new Date(sensor.lastSeen).toLocaleTimeString()}
                  </div>
                </div>
              </Popup>
              <Tooltip direction="right" offset={[10, 0]} opacity={0.9}>
                <span className="font-bold text-xs">AQI: {sensor.aqi.toFixed(0)}</span>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

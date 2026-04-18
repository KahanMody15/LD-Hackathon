/**
 * ① Distributed Sensor Data Ingestion
 * Extends the base simulation with wind direction/speed and realistic
 * multi-node distributed readings for the Ankleshwar/Vapi region.
 */

export type WindDirLabel = 'N' | 'NNE' | 'NE' | 'ENE' | 'E' | 'ESE' | 'SE' | 'SSE' | 'S' | 'SSW' | 'SW' | 'WSW' | 'W' | 'WNW' | 'NW' | 'NNW';

export interface SensorNode {
  id: string;
  name: string;
  village: string;
  location: { lat: number; lng: number };
  status: 'Active' | 'Fault' | 'Offline';
  lastSeen: Date;
  // Pollutants
  pm25: number;       // µg/m³
  pm10: number;       // µg/m³
  so2: number;        // µg/m³
  nox: number;        // µg/m³
  co: number;         // mg/m³
  aqi: number;
  // Wind
  windDir: number;        // degrees 0–360 from North
  windSpeed: number;      // m/s
  windDirLabel: WindDirLabel;
  // Derived
  temperature: number;    // °C
  humidity: number;       // %
  faultType?: string;
}

// Named sensor nodes across the GIDC / village belt
const NODE_CONFIGS = [
  { id: 'sn-01', name: 'CAAQMS Ankleshwar GIDC', village: 'Ankleshwar', lat: 21.6264, lng: 73.0033 },
  { id: 'sn-02', name: 'CAAQMS Panoli Estate',   village: 'Panoli',      lat: 21.6164, lng: 72.9933 },
  { id: 'sn-03', name: 'CAAQMS Jhagadia Rd',     village: 'Jhagadia',    lat: 21.5900, lng: 73.0100 },
  { id: 'sn-04', name: 'CAAQMS Amod Village',    village: 'Amod',        lat: 21.7150, lng: 72.9700 },
  { id: 'sn-05', name: 'CAAQMS Vagra GIDC',      village: 'Vagra',       lat: 21.6800, lng: 73.0350 },
  { id: 'sn-06', name: 'CAAQMS Jambusar Entry',  village: 'Jambusar',    lat: 22.0550, lng: 72.8020 },
] as const;

function degToLabel(deg: number): WindDirLabel {
  const labels: WindDirLabel[] = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return labels[Math.round(deg / 22.5) % 16];
}

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }

function computeAQI(pm25: number, so2: number, nox: number): number {
  // Simplified AQI: weighted combination
  const pm25_aqi = clamp((pm25 / 60) * 100, 0, 500);
  const so2_aqi  = clamp((so2 / 80) * 100,  0, 500);
  const nox_aqi  = clamp((nox / 80) * 100,  0, 500);
  return Math.round(pm25_aqi * 0.6 + so2_aqi * 0.25 + nox_aqi * 0.15);
}

// Persistent state for smooth simulation
let _nodes: SensorNode[] | null = null;
let _windBase = 220; // prevailing SW wind in industrial Gujarat

export function initSensorNodes(): SensorNode[] {
  _windBase = 180 + Math.random() * 90; // SW to SE base
  _nodes = NODE_CONFIGS.map(cfg => {
    const pm25 = 35 + Math.random() * 50;
    const pm10 = pm25 * 1.5 + Math.random() * 20;
    const so2  = 10 + Math.random() * 20;
    const nox  = 20 + Math.random() * 35;
    const co   = 0.5 + Math.random() * 1.5;
    const windDir = clamp(_windBase + (Math.random() - 0.5) * 40, 0, 359);
    return {
      id: cfg.id,
      name: cfg.name,
      village: cfg.village,
      location: { lat: cfg.lat, lng: cfg.lng },
      status: Math.random() > 0.88 ? (Math.random() > 0.5 ? 'Fault' : 'Offline') : 'Active',
      lastSeen: new Date(),
      pm25, pm10, so2, nox, co,
      aqi: computeAQI(pm25, so2, nox),
      windDir,
      windSpeed: 1 + Math.random() * 5,
      windDirLabel: degToLabel(windDir),
      temperature: 28 + Math.random() * 8,
      humidity: 55 + Math.random() * 30,
    };
  });
  return _nodes;
}

export interface IngestionTickOptions {
  industrialSurge?: { factoryLat: number; factoryLng: number; multiplier: number };
}

export function tickSensorNodes(options: IngestionTickOptions = {}): SensorNode[] {
  if (!_nodes) return initSensorNodes();

  // Drift the prevailing wind slowly
  _windBase = (_windBase + (Math.random() - 0.5) * 5 + 360) % 360;

  _nodes = _nodes.map(node => {
    if (node.status === 'Offline') {
      // Small chance of recovery
      const status = Math.random() > 0.95 ? 'Active' : 'Offline';
      return { ...node, status };
    }

    // Proximity-based surge factor
    let surge = 1;
    if (options.industrialSurge) {
      const { factoryLat, factoryLng, multiplier } = options.industrialSurge;
      const dist = Math.hypot(node.location.lat - factoryLat, node.location.lng - factoryLng);
      if (dist < 0.05) surge = multiplier;
      else if (dist < 0.1) surge = 1 + (multiplier - 1) * 0.5;
    }

    const drift = (base: number, range: number, max: number) =>
      clamp(base + (Math.random() - 0.42) * range * surge, 0, max);

    const pm25 = drift(node.pm25, 12, 500);
    const so2  = drift(node.so2, 6, 200);
    const nox  = drift(node.nox, 8, 300);
    const windDir = (node.windDir + (Math.random() - 0.5) * 15 + 360) % 360;

    return {
      ...node,
      pm25,
      pm10: clamp(node.pm10 + (Math.random() - 0.42) * 18 * surge, 0, 800),
      so2,
      nox,
      co: clamp(node.co + (Math.random() - 0.42) * 0.3 * surge, 0, 30),
      aqi: computeAQI(pm25, so2, nox),
      windDir,
      windSpeed: clamp(node.windSpeed + (Math.random() - 0.5) * 0.8, 0.3, 15),
      windDirLabel: degToLabel(windDir),
      temperature: clamp(node.temperature + (Math.random() - 0.5) * 0.5, 15, 48),
      humidity: clamp(node.humidity + (Math.random() - 0.5) * 2, 20, 100),
      lastSeen: new Date(),
      status: node.status === 'Fault' ? (Math.random() > 0.85 ? 'Active' : 'Fault') : 'Active',
    };
  });

  return _nodes;
}

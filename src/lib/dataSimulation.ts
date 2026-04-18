import type { Sensor, Event, Factory } from "@/types";

// Base coordinates for Vapi/Ankleshwar region
const BASE_LAT = 21.6264;
const BASE_LNG = 73.0033;

export const generateMockFactories = (): Factory[] => [
  { id: 'f1', name: 'Apex Chemicals', location: { lat: 21.6364, lng: 73.0133 }, type: 'Chemical', complianceStatus: 'Warning' },
  { id: 'f2', name: 'Gujarat Paper Mills', location: { lat: 21.6164, lng: 72.9933 }, type: 'Pulp & Paper', complianceStatus: 'Good' },
  { id: 'f3', name: 'Zentis Pharmaceuticals', location: { lat: 21.6464, lng: 73.0233 }, type: 'Pharma', complianceStatus: 'Violation' },
];

export const generateMockSensors = (): Sensor[] => {
  return Array.from({ length: 15 }).map((_, i) => ({
    id: `sensor-${i + 1}`,
    name: `CAAQMS Station ${i + 1}`,
    location: { 
      lat: BASE_LAT + (Math.random() - 0.5) * 0.1, 
      lng: BASE_LNG + (Math.random() - 0.5) * 0.1 
    },
    status: Math.random() > 0.9 ? 'Offline' : (Math.random() > 0.8 ? 'Fault' : 'Active'),
    lastSeen: new Date(),
    pm25: 40 + Math.random() * 40,
    pm10: 80 + Math.random() * 60,
    so2: 10 + Math.random() * 15,
    nox: 20 + Math.random() * 30,
    aqi: 60 + Math.random() * 40
  }));
};

export const simulateReadingTick = (sensors: Sensor[]): { sensors: Sensor[], newEvent: Event | null } => {
  let newEvent: Event | null = null;
  
  // 10% chance to spawn an event
  if (Math.random() < 0.1) {
    const isCritical = Math.random() > 0.7;
    const types: Event['type'][] = ['Gas Leak', 'Industrial Spillage', 'Agricultural Burn'];
    
    newEvent = {
      id: `evt-${Date.now()}`,
      type: types[Math.floor(Math.random() * types.length)],
      severity: isCritical ? 'Critical' : (Math.random() > 0.5 ? 'High' : 'Medium'),
      location: { 
        lat: BASE_LAT + (Math.random() - 0.5) * 0.05, 
        lng: BASE_LNG + (Math.random() - 0.5) * 0.05 
      },
      radiusKm: 2 + Math.random() * 3,
      timestamp: new Date(),
      description: 'Anomalous toxic gas levels detected in industrial zone.',
      confidenceScore: 0.8 + Math.random() * 0.19
    };
  }

  const updatedSensors = sensors.map(s => {
    if (s.status !== 'Active') return s;
    
    let spike = 1;
    // Apply event proximity effect
    if (newEvent) {
      const dist = Math.sqrt(Math.pow(s.location.lat - newEvent.location.lat, 2) + Math.pow(s.location.lng - newEvent.location.lng, 2));
      if (dist < 0.03) spike = 3; // Huge spike if very close!
    }

    return {
      ...s,
      pm25: Math.min(500, Math.max(0, s.pm25 + (Math.random() - 0.4) * 10 * spike)),
      pm10: Math.min(800, Math.max(0, s.pm10 + (Math.random() - 0.4) * 15 * spike)),
      so2: Math.min(200, Math.max(0, s.so2 + (Math.random() - 0.4) * 5 * spike)),
      aqi: Math.min(500, Math.max(0, s.aqi + (Math.random() - 0.4) * 12 * spike)),
      lastSeen: new Date()
    };
  });

  return { sensors: updatedSensors, newEvent };
};

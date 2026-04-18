/**
 * ③ Wind Vector + Industrial Schedule → Source Direction Inference
 * Back-trajectory analysis: traces pollution back to its probable origin.
 */

import type { SensorNode } from './sensorIngestion';

export interface SourceInferenceResult {
  bearingDeg: number;          // direction TO the source from centroid
  windFromDeg: number;         // prevailing wind direction (where wind is blowing FROM)
  estimatedSourceLat: number;
  estimatedSourceLng: number;
  windVectorLabel: string;     // e.g., "SW → NE"
  confidence: number;          // 0–1
  distanceKm: number;          // estimated distance to source
  primarySensorId: string;     // sensor with highest reading
  corroboratingSensors: number;
  description: string;
}

function degToRad(d: number) { return d * Math.PI / 180; }

function compassLabel(deg: number): string {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

export function inferSourceDirection(nodes: SensorNode[]): SourceInferenceResult | null {
  const active = nodes.filter(n => n.status === 'Active' && n.pm25 > 0);
  if (active.length < 2) return null;

  // Weight each sensor by its PM2.5 + SO2 reading (heavier = more upwind influence)
  const weights = active.map(n => n.pm25 * 0.6 + n.so2 * 0.4);
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  // Weighted centroid of sensor positions
  const centroidLat = active.reduce((s, n, i) => s + n.location.lat * weights[i], 0) / totalWeight;
  const centroidLng = active.reduce((s, n, i) => s + n.location.lng * weights[i], 0) / totalWeight;

  // Prevailing wind direction = average over active sensors
  const avgWindDirRad = Math.atan2(
    active.reduce((s, n) => s + Math.sin(degToRad(n.windDir)), 0) / active.length,
    active.reduce((s, n) => s + Math.cos(degToRad(n.windDir)), 0) / active.length,
  );
  const avgWindDeg = (avgWindDirRad * 180 / Math.PI + 360) % 360;
  const avgWindSpeed = active.reduce((s, n) => s + n.windSpeed, 0) / active.length;

  // Source is UPWIND from the centroid (opposite of wind direction = where wind is blowing FROM)
  const sourceBearing = (avgWindDeg + 180) % 360; // upwind direction

  // Estimate distance: proportional to max concentration / wind speed
  const maxPM25 = Math.max(...active.map(n => n.pm25));
  const distanceKm = Math.min(20, Math.max(0.5, maxPM25 / (avgWindSpeed * 15)));

  // Project source location upwind
  const latDeg = 0.009; // ~1 km per 0.009 degrees lat
  const sourceLat = centroidLat + distanceKm * latDeg * Math.cos(degToRad(sourceBearing));
  const sourceLng = centroidLng + distanceKm * latDeg * Math.sin(degToRad(sourceBearing));

  // Confidence: higher if sensors agree on wind direction
  const windDirVariance = active.reduce((s, n) => {
    const diff = Math.abs(n.windDir - avgWindDeg);
    return s + Math.min(diff, 360 - diff);
  }, 0) / active.length;
  const confidence = Math.max(0.3, Math.min(0.97, 1 - windDirVariance / 90));

  // Primary sensor (highest PM2.5)
  const primary = active.reduce((a, b) => a.pm25 > b.pm25 ? a : b);

  return {
    bearingDeg: Math.round(sourceBearing),
    windFromDeg: Math.round(avgWindDeg),
    estimatedSourceLat: parseFloat(sourceLat.toFixed(4)),
    estimatedSourceLng: parseFloat(sourceLng.toFixed(4)),
    windVectorLabel: `${compassLabel(avgWindDeg)} → ${compassLabel((avgWindDeg + 180) % 360)}`,
    confidence: parseFloat(confidence.toFixed(2)),
    distanceKm: parseFloat(distanceKm.toFixed(1)),
    primarySensorId: primary.id,
    corroboratingSensors: active.length,
    description: `Wind blowing from ${compassLabel(avgWindDeg)} at ${avgWindSpeed.toFixed(1)} m/s. Estimated pollution source ~${distanceKm.toFixed(1)} km to the ${compassLabel(sourceBearing)}.`,
  };
}

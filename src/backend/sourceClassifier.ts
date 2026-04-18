/**
 * ④ Industrial Surge vs Agricultural/Seasonal Source Classifier
 * Rule-based classifier using pollutant fingerprints + schedule correlation.
 */

import type { SensorNode } from './sensorIngestion';
import type { ActiveSchedule } from './industrialSchedule';
import type { SourceInferenceResult } from './sourceInference';

export type SourceType =
  | 'Industrial Surge'
  | 'Agricultural Burn'
  | 'Seasonal/Meteorological'
  | 'Mixed/Ambiguous'
  | 'Background';

export interface SourceClassification {
  type: SourceType;
  confidence: number;        // 0–1
  rationale: string[];
  scores: Record<SourceType, number>;
  dominantPollutant: string;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
}

function getMonth(): number { return new Date().getMonth() + 1; } // 1–12
function getHour(): number { return new Date().getHours(); }

export function classifySource(
  nodes: SensorNode[],
  schedules: ActiveSchedule[],
  _inference: SourceInferenceResult | null
): SourceClassification {
  const active = nodes.filter(n => n.status === 'Active');
  if (!active.length) {
    return {
      type: 'Background',
      confidence: 0.5,
      rationale: ['No active sensor nodes'],
      scores: { 'Industrial Surge': 0, 'Agricultural Burn': 0, 'Seasonal/Meteorological': 0, 'Mixed/Ambiguous': 0, 'Background': 1 },
      dominantPollutant: 'N/A',
      riskLevel: 'Low',
    };
  }

  const avg = {
    pm25: active.reduce((s, n) => s + n.pm25, 0) / active.length,
    so2:  active.reduce((s, n) => s + n.so2, 0)  / active.length,
    nox:  active.reduce((s, n) => s + n.nox, 0)  / active.length,
    co:   active.reduce((s, n) => s + n.co, 0)   / active.length,
    ws:   active.reduce((s, n) => s + n.windSpeed, 0) / active.length,
  };

  const scores: Record<SourceType, number> = {
    'Industrial Surge': 0,
    'Agricultural Burn': 0,
    'Seasonal/Meteorological': 0,
    'Mixed/Ambiguous': 0,
    'Background': 0,
  };
  const rationale: string[] = [];

  // ── Industrial Surge Rules ─────────────────────────────
  const activeFactories = schedules.filter(s => s.isActive);
  if (activeFactories.length > 0) {
    scores['Industrial Surge'] += 0.3;
    rationale.push(`${activeFactories.length} factory shift(s) active: ${activeFactories.map(f => f.factoryName).join(', ')}.`);
  }
  const maxMultiplier = Math.max(1, ...activeFactories.map(f => f.emissionMultiplier));
  if (maxMultiplier > 2.0) {
    scores['Industrial Surge'] += 0.25;
    rationale.push(`Peak emission multiplier ${maxMultiplier.toFixed(1)}x detected (high-load shift).`);
  }
  if (avg.so2 > 60) {
    scores['Industrial Surge'] += 0.2;
    rationale.push(`SO₂ = ${avg.so2.toFixed(0)} µg/m³ — indicative of industrial combustion/chemical process.`);
  }
  if (avg.nox > 80) {
    scores['Industrial Surge'] += 0.1;
    rationale.push(`NOx = ${avg.nox.toFixed(0)} µg/m³ — consistent with thermal industrial processes.`);
  }

  // ── Agricultural Burn Rules ────────────────────────────
  const month = getMonth();
  const isHarvestSeason = [3, 4, 10, 11].includes(month); // Mar-Apr, Oct-Nov
  if (isHarvestSeason) {
    scores['Agricultural Burn'] += 0.3;
    rationale.push(`Month ${month}: harvest/post-harvest season — crop burning risk elevated.`);
  }
  // Agri burns: PM2.5 >> SO2, CO elevated, low wind speed
  if (avg.pm25 > 150 && avg.so2 < 30) {
    scores['Agricultural Burn'] += 0.25;
    rationale.push(`PM2.5/SO₂ ratio ${(avg.pm25/Math.max(avg.so2,1)).toFixed(0)}:1 — biomass burn fingerprint.`);
  }
  if (avg.co > 2.0) {
    scores['Agricultural Burn'] += 0.15;
    rationale.push(`CO = ${avg.co.toFixed(1)} mg/m³ — elevated, consistent with incomplete combustion.`);
  }
  if (avg.ws < 2 && isHarvestSeason) {
    scores['Agricultural Burn'] += 0.1;
    rationale.push(`Low wind speed (${avg.ws.toFixed(1)} m/s) trapping smoke near source.`);
  }

  // ── Seasonal/Meteorological Rules ─────────────────────
  const hour = getHour();
  const isInversionHour = hour >= 4 && hour <= 8; // early morning inversion
  if (isInversionHour && avg.pm25 > 80) {
    scores['Seasonal/Meteorological'] += 0.3;
    rationale.push(`Early morning (${hour}:00) atmospheric inversion — pollutants trapped near ground.`);
  }
  if (avg.ws < 1.5) {
    scores['Seasonal/Meteorological'] += 0.15;
    rationale.push(`Very low wind speed (${avg.ws.toFixed(1)} m/s) — stagnant air conditions.`);
  }

  // ── Background ─────────────────────────────────────────
  if (avg.pm25 < 60 && avg.so2 < 20 && avg.nox < 40) {
    scores['Background'] += 0.6;
    rationale.push('Pollutant levels within background range — no significant event detected.');
  }

  // Normalize
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  (Object.keys(scores) as SourceType[]).forEach(k => { scores[k] = parseFloat((scores[k] / total).toFixed(2)); });

  // Ambiguity check
  const sorted = (Object.entries(scores) as [SourceType, number][]).sort((a, b) => b[1] - a[1]);
  if (sorted[0][1] - sorted[1][1] < 0.15) {
    scores['Mixed/Ambiguous'] = Math.max(scores['Mixed/Ambiguous'], 0.2);
  }

  const topType = sorted[0][0];
  const confidence = sorted[0][1];

  const dominantPollutant =
    avg.so2 > avg.pm25 && avg.so2 > avg.nox ? 'SO₂' :
    avg.nox > avg.pm25 ? 'NOx' : 'PM2.5';

  const totalAQI = active.reduce((s, n) => s + n.aqi, 0) / active.length;
  const riskLevel: SourceClassification['riskLevel'] =
    totalAQI > 300 ? 'Critical' :
    totalAQI > 150 ? 'High' :
    totalAQI > 80  ? 'Moderate' : 'Low';

  return { type: topType, confidence, rationale, scores, dominantPollutant, riskLevel };
}

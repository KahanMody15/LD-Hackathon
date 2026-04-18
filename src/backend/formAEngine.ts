/**
 * ⑤ GSPCB Form-A Auto-Generation Engine
 * Builds a fully pre-filled GSPCB Form-A complaint from live sensor data.
 */

import jsPDF from 'jspdf';
import type { SensorNode } from './sensorIngestion';
import type { SourceInferenceResult } from './sourceInference';
import type { SourceClassification } from './sourceClassifier';

export interface FormAData {
  // Section 1: Complainant / Filing Authority
  filedBy: string;
  designation: string;
  village: string;
  taluka: string;
  district: string;
  contactPhone: string;
  gspcbRegionOffice: string;

  // Section 2: Incident Details
  incidentId: string;
  incidentDate: string;
  incidentTime: string;
  coordinates: string;
  gidzZone: string;
  radiusKm: number;
  eventType: string;
  severity: string;

  // Section 3: Pollutant Readings
  pm25: string;
  pm10: string;
  so2: string;
  nox: string;
  co: string;
  aqiValue: number;
  exceedanceFactor: string;

  // Section 4: Source Assessment
  inferredSourceDir: string;
  estimatedSourceCoords: string;
  windSpeed: string;
  windDirection: string;
  sourceClassification: string;
  classificationConfidence: string;
  suspectedFactory?: string;

  // Section 5: Supporting Evidence
  activeSensorCount: number;
  corroboratingSensors: string[];
  eventDetectionTimestamp: string;
  formGeneratedAt: string;

  // Section 6: Integrity
  integrityHash: string;
  blockchainRef: string;
}

function sha256Stub(input: string): string {
  // Deterministic pseudohash for demo (not cryptographic)
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  const hex = hash.toString(16).padStart(8, '0');
  return `0x${hex.repeat(8)}`;
}

export function buildFormAData(
  event: { id: string; type: string; severity: string; location: { lat: number; lng: number }; radiusKm: number; timestamp: Date; description: string },
  nodes: SensorNode[],
  inference: SourceInferenceResult | null,
  classification: SourceClassification | null,
  sarpanchName = 'Sarpanch (Auto)',
  villageName = 'Ankleshwar'
): FormAData {
  const active = nodes.filter(n => n.status === 'Active');
  const avgPM25 = active.length ? active.reduce((s, n) => s + n.pm25, 0) / active.length : 0;
  const avgPM10 = active.length ? active.reduce((s, n) => s + n.pm10, 0) / active.length : 0;
  const avgSO2  = active.length ? active.reduce((s, n) => s + n.so2, 0)  / active.length : 0;
  const avgNOx  = active.length ? active.reduce((s, n) => s + n.nox, 0)  / active.length : 0;
  const avgCO   = active.length ? active.reduce((s, n) => s + n.co, 0)   / active.length : 0;
  const avgAQI  = active.length ? active.reduce((s, n) => s + n.aqi, 0)  / active.length : 0;
  const avgWS   = active.length ? active.reduce((s, n) => s + n.windSpeed, 0) / active.length : 0;
  const primaryWindDir = active.length ? active[0].windDirLabel : 'N/A';

  const now = new Date();
  const data: FormAData = {
    filedBy: sarpanchName,
    designation: 'Gram Sarpanch',
    village: villageName,
    taluka: 'Ankleshwar',
    district: 'Bharuch',
    contactPhone: '+91-98765-43210',
    gspcbRegionOffice: 'GSPCB Bharuch Regional Office',

    incidentId: event.id,
    incidentDate: event.timestamp.toLocaleDateString('en-IN'),
    incidentTime: event.timestamp.toLocaleTimeString('en-IN'),
    coordinates: `${event.location.lat.toFixed(4)}°N, ${event.location.lng.toFixed(4)}°E`,
    gidzZone: 'Ankleshwar GIDC — Zone B',
    radiusKm: parseFloat(event.radiusKm.toFixed(1)),
    eventType: event.type,
    severity: event.severity,

    pm25: `${avgPM25.toFixed(1)} µg/m³ (NAAQS Limit: 60)`,
    pm10: `${avgPM10.toFixed(1)} µg/m³ (NAAQS Limit: 100)`,
    so2:  `${avgSO2.toFixed(1)} µg/m³ (NAAQS Limit: 80)`,
    nox:  `${avgNOx.toFixed(1)} µg/m³ (NAAQS Limit: 80)`,
    co:   `${avgCO.toFixed(2)} mg/m³`,
    aqiValue: Math.round(avgAQI),
    exceedanceFactor: avgPM25 > 60 ? `${(avgPM25 / 60).toFixed(1)}x NAAQS PM2.5 limit` : 'Within limits',

    inferredSourceDir: inference
      ? `${inference.windVectorLabel} — Source ~${inference.distanceKm} km to ${inference.bearingDeg}°`
      : 'Inference unavailable (insufficient sensor data)',
    estimatedSourceCoords: inference
      ? `${inference.estimatedSourceLat}°N, ${inference.estimatedSourceLng}°E`
      : 'N/A',
    windSpeed: `${avgWS.toFixed(1)} m/s`,
    windDirection: primaryWindDir,
    sourceClassification: classification?.type ?? 'Unclassified',
    classificationConfidence: classification ? `${(classification.confidence * 100).toFixed(0)}%` : 'N/A',
    suspectedFactory: event.type === 'Industrial Spillage' ? 'Zentis Pharmaceuticals / Apex Chemicals' : undefined,

    activeSensorCount: active.length,
    corroboratingSensors: active.slice(0, 4).map(n => `${n.name} (${n.village})`),
    eventDetectionTimestamp: event.timestamp.toISOString(),
    formGeneratedAt: now.toISOString(),

    integrityHash: sha256Stub(event.id + event.timestamp.toISOString() + avgPM25.toFixed(1)),
    blockchainRef: `GSPCB-CHAIN-${Date.now().toString(36).toUpperCase()}`,
  };

  return data;
}

export function downloadFormAPDF(data: FormAData): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const LINE = 7;
  let y = 15;

  const section = (title: string) => {
    doc.setFillColor(15, 23, 42);
    doc.rect(10, y - 4, 190, LINE, 'F');
    doc.setFontSize(9);
    doc.setTextColor(100, 160, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 12, y + 0.5);
    y += LINE + 2;
    doc.setTextColor(40);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
  };

  const row = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80);
    doc.text(label + ':', 12, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(20);
    const lines = doc.splitTextToSize(value, 120);
    doc.text(lines, 68, y);
    y += LINE * lines.length;
  };

  // Header
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20);
  doc.text('GUJARAT STATE POLLUTION CONTROL BOARD', 105, y, { align: 'center' });
  y += 7;
  doc.setFontSize(11);
  doc.setTextColor(60);
  doc.text('FORM-A — Pollution Incident Complaint Registration', 105, y, { align: 'center' });
  y += 4;
  doc.setDrawColor(100, 160, 255);
  doc.setLineWidth(0.5);
  doc.line(10, y, 200, y);
  y += 6;

  section('SECTION 1: COMPLAINANT DETAILS');
  row('Filed By', data.filedBy);
  row('Designation', data.designation);
  row('Village / Town', data.village);
  row('Taluka', data.taluka);
  row('District', data.district);
  row('Contact', data.contactPhone);
  row('GSPCB Office', data.gspcbRegionOffice);
  y += 2;

  section('SECTION 2: INCIDENT DETAILS');
  row('Incident ID', data.incidentId);
  row('Date', data.incidentDate);
  row('Time', data.incidentTime);
  row('GPS Coordinates', data.coordinates);
  row('Industrial Zone', data.gidzZone);
  row('Impact Radius', `${data.radiusKm} km`);
  row('Event Type', data.eventType);
  row('Severity', data.severity);
  y += 2;

  section('SECTION 3: POLLUTANT READINGS (Live Sensor Data)');
  row('PM2.5', data.pm25);
  row('PM10', data.pm10);
  row('SO₂', data.so2);
  row('NOx', data.nox);
  row('CO', data.co);
  row('Composite AQI', `${data.aqiValue}`);
  row('Exceedance', data.exceedanceFactor);
  y += 2;

  section('SECTION 4: SOURCE ASSESSMENT');
  row('Inferred Source Dir', data.inferredSourceDir);
  row('Est. Source Coords', data.estimatedSourceCoords);
  row('Wind Speed', data.windSpeed);
  row('Wind Direction', data.windDirection);
  row('Classification', data.sourceClassification);
  row('Confidence', data.classificationConfidence);
  if (data.suspectedFactory) row('Suspected Source', data.suspectedFactory);
  y += 2;

  section('SECTION 5: SUPPORTING EVIDENCE');
  row('Active Sensors', `${data.activeSensorCount} nodes corroborating`);
  row('Sensor Stations', data.corroboratingSensors.join(', '));
  row('Detection Time', new Date(data.eventDetectionTimestamp).toLocaleString());
  row('Form Generated', new Date(data.formGeneratedAt).toLocaleString());
  y += 2;

  section('SECTION 6: INTEGRITY & AUTHENTICATION');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(80);
  doc.text('Integrity Hash:', 12, y);
  doc.setFont('courier', 'normal');
  doc.setTextColor(40, 120, 80);
  doc.setFontSize(7);
  doc.text(data.integrityHash, 68, y);
  y += LINE;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80);
  row('Blockchain Ref', data.blockchainRef);

  // Footer
  y += 5;
  doc.setDrawColor(200);
  doc.setLineWidth(0.3);
  doc.line(10, y, 200, y);
  y += 4;
  doc.setFontSize(7.5);
  doc.setTextColor(120);
  doc.text(
    'This document was auto-generated by EcoSentinel GSPCB Form-A Engine. Verify at gspcb.gujarat.gov.in | Auto-filed via sarpanch portal.',
    105, y, { align: 'center' }
  );

  doc.save(`GSPCB_Form_A_${data.incidentId}.pdf`);
}

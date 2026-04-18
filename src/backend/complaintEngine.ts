/**
 * ⑥ One-Step Sarpanch Complaint Submission Engine
 * Enables sub-60-second complaint filing from event detection.
 */

import type { SensorNode } from './sensorIngestion';
import type { SourceInferenceResult } from './sourceInference';
import type { SourceClassification } from './sourceClassifier';
import { buildFormAData, downloadFormAPDF } from './formAEngine';

export interface SarpanchInfo {
  name: string;
  village: string;
  phoneNumber: string;
  gramPanchayatId: string;
}

export type ComplaintStatus = 'Draft' | 'Submitted' | 'Acknowledged' | 'UnderInvestigation' | 'Resolved';

export interface ComplaintRecord {
  id: string;
  incidentId: string;
  eventType: string;
  severity: string;
  village: string;
  sarpanchName: string;
  sarpanchPhone: string;
  detectionTimestamp: Date;
  submittedTimestamp: Date | null;
  secondsToSubmit: number | null;
  status: ComplaintStatus;
  gspcbTicketNumber: string | null;
  formAData: ReturnType<typeof buildFormAData> | null;
  acknowledged: boolean;
  coordinates: { lat: number; lng: number };
  aqiAtEvent: number;
  pm25AtEvent: number;
  so2AtEvent: number;
  classificationLabel: string;
}

const STORAGE_KEY = 'ecosentinel_complaints';

function loadComplaints(): ComplaintRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    // Revive Date objects
    return JSON.parse(raw, (key, val) => {
      if ((key === 'detectionTimestamp' || key === 'submittedTimestamp') && val) {
        return new Date(val);
      }
      return val;
    });
  } catch {
    return [];
  }
}

function saveComplaints(complaints: ComplaintRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
}

export function getComplaints(): ComplaintRecord[] {
  return loadComplaints();
}

export function draftComplaint(
  event: { id: string; type: string; severity: string; location: { lat: number; lng: number }; radiusKm: number; timestamp: Date; description: string },
  nodes: SensorNode[],
  _inference: SourceInferenceResult | null,
  classification: SourceClassification | null,
  sarpanch: SarpanchInfo
): ComplaintRecord {
  const active = nodes.filter(n => n.status === 'Active');
  const avgAQI  = active.length ? active.reduce((s, n) => s + n.aqi, 0) / active.length : 0;
  const avgPM25 = active.length ? active.reduce((s, n) => s + n.pm25, 0) / active.length : 0;
  const avgSO2  = active.length ? active.reduce((s, n) => s + n.so2, 0)  / active.length : 0;

  const draft: ComplaintRecord = {
    id: `complaint-${Date.now()}`,
    incidentId: event.id,
    eventType: event.type,
    severity: event.severity,
    village: sarpanch.village,
    sarpanchName: sarpanch.name,
    sarpanchPhone: sarpanch.phoneNumber,
    detectionTimestamp: event.timestamp,
    submittedTimestamp: null,
    secondsToSubmit: null,
    status: 'Draft',
    gspcbTicketNumber: null,
    formAData: null,
    acknowledged: false,
    coordinates: event.location,
    aqiAtEvent: Math.round(avgAQI),
    pm25AtEvent: parseFloat(avgPM25.toFixed(1)),
    so2AtEvent: parseFloat(avgSO2.toFixed(1)),
    classificationLabel: classification?.type ?? 'Unclassified',
  };

  return draft;
}

export function submitComplaint(
  draft: ComplaintRecord,
  event: { id: string; type: string; severity: string; location: { lat: number; lng: number }; radiusKm: number; timestamp: Date; description: string },
  nodes: SensorNode[],
  inference: SourceInferenceResult | null,
  classification: SourceClassification | null
): ComplaintRecord {
  const now = new Date();
  const secs = Math.round((now.getTime() - draft.detectionTimestamp.getTime()) / 1000);

  const formAData = buildFormAData(
    event,
    nodes,
    inference,
    classification,
    draft.sarpanchName,
    draft.village
  );

  const gspcbTicket = `GSPCB-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

  const submitted: ComplaintRecord = {
    ...draft,
    submittedTimestamp: now,
    secondsToSubmit: secs,
    status: 'Submitted',
    gspcbTicketNumber: gspcbTicket,
    formAData,
    acknowledged: false,
  };

  // Persist
  const complaints = loadComplaints();
  const existing = complaints.findIndex(c => c.id === draft.id);
  if (existing >= 0) complaints[existing] = submitted;
  else complaints.unshift(submitted);
  saveComplaints(complaints.slice(0, 50)); // keep last 50

  return submitted;
}

export function downloadComplaintPDF(record: ComplaintRecord) {
  if (!record.formAData) return;
  downloadFormAPDF(record.formAData);
}

export function acknowledgeComplaint(id: string): void {
  const complaints = loadComplaints();
  const idx = complaints.findIndex(c => c.id === id);
  if (idx >= 0) {
    complaints[idx].acknowledged = true;
    complaints[idx].status = 'Acknowledged';
    saveComplaints(complaints);
  }
}

// ── Public Complaint (resident-filed) ─────────────────────────────────────

export interface PublicComplaintInput {
  residentName: string;
  village: string;
  phone: string;
  description: string;
  pollutantConcern: string; // e.g. "Smoke", "Bad odour", "Water discolouration"
  currentAQI: number;
  pm25: number;
  so2: number;
}

export function submitPublicComplaint(input: PublicComplaintInput): ComplaintRecord {
  const now = new Date();
  const gspcbTicket = `RES-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

  const record: ComplaintRecord = {
    id: `pub-${Date.now()}`,
    incidentId: `pub-event-${Date.now()}`,
    eventType: `Resident Report: ${input.pollutantConcern}`,
    severity: input.currentAQI > 200 ? 'High' : 'Moderate',
    village: input.village,
    sarpanchName: input.residentName,
    sarpanchPhone: input.phone,
    detectionTimestamp: now,
    submittedTimestamp: now,
    secondsToSubmit: 0,
    status: 'Submitted',
    gspcbTicketNumber: gspcbTicket,
    formAData: null,
    acknowledged: false,
    coordinates: { lat: 21.6264, lng: 73.0033 },
    aqiAtEvent: input.currentAQI,
    pm25AtEvent: input.pm25,
    so2AtEvent: input.so2,
    classificationLabel: 'Resident Report',
    // Store resident description in eventType
  };

  const complaints = loadComplaints();
  complaints.unshift(record);
  saveComplaints(complaints.slice(0, 100));
  return record;
}

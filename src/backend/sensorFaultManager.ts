/**
 * ⑧ Sensor Node Fault Reporting & Maintenance Dispatch Workflow
 */

import type { SensorNode } from './sensorIngestion';

export type FaultType =
  | 'Offline'
  | 'NoData'
  | 'OutOfRange'
  | 'SpikeAnomaly'
  | 'CommunicationError'
  | 'CalibrationDrift';

export type Priority = 'P1-Critical' | 'P2-High' | 'P3-Normal';
export type TicketStatus = 'Open' | 'Dispatched' | 'InProgress' | 'Resolved';

export interface FaultReport {
  sensorId: string;
  sensorName: string;
  village: string;
  faultType: FaultType;
  priority: Priority;
  detectedAt: Date;
  description: string;
  lastValidReading?: number;
}

export interface MaintenanceTicket {
  id: string;
  faultReport: FaultReport;
  status: TicketStatus;
  assignedTo: string;
  createdAt: Date;
  dispatchedAt: Date | null;
  resolvedAt: Date | null;
  etaMinutes: number;
  notes: string;
}

const STORAGE_KEY = 'ecosentinel_maintenance';

function loadTickets(): MaintenanceTicket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw, (key, val) => {
      if (['createdAt', 'dispatchedAt', 'resolvedAt', 'detectedAt'].includes(key) && val) return new Date(val);
      return val;
    });
  } catch { return []; }
}

function saveTickets(tickets: MaintenanceTicket[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

const MAINTENANCE_ENGINEERS = [
  'Rajesh Kumar (Ankleshwar)',
  'Suresh Patel (Panoli)',
  'Dinesh Shah (Bharuch HQ)',
  'Mohan Verma (Mobile Unit)',
];

function getPriority(faultType: FaultType): Priority {
  if (faultType === 'Offline' || faultType === 'CommunicationError') return 'P1-Critical';
  if (faultType === 'OutOfRange' || faultType === 'SpikeAnomaly') return 'P2-High';
  return 'P3-Normal';
}

function getFaultDescription(node: SensorNode): { type: FaultType; desc: string } {
  if (node.status === 'Offline') {
    return { type: 'Offline', desc: `Station completely offline since ${node.lastSeen.toLocaleTimeString()}. No telemetry received.` };
  }
  if (node.status === 'Fault') {
    // Determine specific fault sub-type from readings
    if (node.pm25 > 450) return { type: 'OutOfRange', desc: `PM2.5 reading ${node.pm25.toFixed(0)} µg/m³ exceeds sensor range. Likely contamination or sensor drift.` };
    if (node.so2 > 180) return { type: 'OutOfRange', desc: `SO₂ reading ${node.so2.toFixed(0)} µg/m³ out of calibrated range.` };
    return { type: 'CommunicationError', desc: 'Intermittent telemetry — partial data packets received. Communication fault suspected.' };
  }
  // Check for spike anomaly on active sensors
  if (node.pm25 > 380) return { type: 'SpikeAnomaly', desc: `Unusual PM2.5 spike: ${node.pm25.toFixed(0)} µg/m³. May indicate sensor malfunction or real event.` };
  return { type: 'CalibrationDrift', desc: 'Gradual baseline drift detected. Scheduled calibration required.' };
}

export function detectFaults(nodes: SensorNode[]): FaultReport[] {
  const faults: FaultReport[] = [];

  for (const node of nodes) {
    if (node.status !== 'Active') {
      const { type, desc } = getFaultDescription(node);
      faults.push({
        sensorId: node.id,
        sensorName: node.name,
        village: node.village,
        faultType: type,
        priority: getPriority(type),
        detectedAt: new Date(),
        description: desc,
        lastValidReading: node.pm25,
      });
    } else if (node.pm25 > 380) {
      const { type, desc } = getFaultDescription(node);
      if (type === 'SpikeAnomaly') {
        faults.push({
          sensorId: node.id,
          sensorName: node.name,
          village: node.village,
          faultType: 'SpikeAnomaly',
          priority: 'P2-High',
          detectedAt: new Date(),
          description: desc,
          lastValidReading: node.pm25,
        });
      }
    }
  }

  return faults;
}

export function dispatchMaintenance(fault: FaultReport): MaintenanceTicket {
  const tickets = loadTickets();

  // Check if an open ticket already exists for this sensor
  const existing = tickets.find(t => t.faultReport.sensorId === fault.sensorId && t.status !== 'Resolved');
  if (existing) return existing;

  const engineer = MAINTENANCE_ENGINEERS[Math.floor(Math.random() * MAINTENANCE_ENGINEERS.length)];
  const eta = fault.priority === 'P1-Critical' ? 30 : fault.priority === 'P2-High' ? 90 : 240;

  const ticket: MaintenanceTicket = {
    id: `MT-${Date.now().toString(36).toUpperCase()}`,
    faultReport: fault,
    status: 'Dispatched',
    assignedTo: engineer,
    createdAt: new Date(),
    dispatchedAt: new Date(),
    resolvedAt: null,
    etaMinutes: eta,
    notes: `${fault.priority} dispatch. Auto-assigned to ${engineer}. ETA: ${eta} min.`,
  };

  tickets.unshift(ticket);
  saveTickets(tickets.slice(0, 100));
  return ticket;
}

export function resolveTicket(ticketId: string, notes = ''): void {
  const tickets = loadTickets();
  const idx = tickets.findIndex(t => t.id === ticketId);
  if (idx >= 0) {
    tickets[idx].status = 'Resolved';
    tickets[idx].resolvedAt = new Date();
    if (notes) tickets[idx].notes += ` | Resolution: ${notes}`;
    saveTickets(tickets);
  }
}

export function getMaintenanceTickets(): MaintenanceTicket[] {
  return loadTickets();
}

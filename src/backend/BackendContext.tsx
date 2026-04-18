/**
 * BackendContext — Central backend engine context
 * All 8 backend modules wired together; all pages use useBackend()
 */

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { initSensorNodes, tickSensorNodes } from './sensorIngestion';
import type { SensorNode } from './sensorIngestion';
import { getAllActiveSchedules } from './industrialSchedule';
import type { ActiveSchedule } from './industrialSchedule';
import { inferSourceDirection } from './sourceInference';
import type { SourceInferenceResult } from './sourceInference';
import { classifySource } from './sourceClassifier';
import type { SourceClassification } from './sourceClassifier';
import { buildFormAData } from './formAEngine';
import type { FormAData } from './formAEngine';
import {
  draftComplaint,
  submitComplaint,
  getComplaints,
  downloadComplaintPDF,
} from './complaintEngine';
import type { ComplaintRecord, SarpanchInfo } from './complaintEngine';
import {
  detectFaults,
  dispatchMaintenance,
  resolveTicket,
  getMaintenanceTickets,
} from './sensorFaultManager';
import type { FaultReport, MaintenanceTicket } from './sensorFaultManager';

// ── Types re-exported for convenience ────────────────────────────────
export type { SensorNode } from './sensorIngestion';
export type { ActiveSchedule } from './industrialSchedule';
export type { SourceInferenceResult } from './sourceInference';
export type { SourceClassification } from './sourceClassifier';
export type { FormAData } from './formAEngine';
export type { ComplaintRecord, SarpanchInfo } from './complaintEngine';
export type { FaultReport, MaintenanceTicket } from './sensorFaultManager';

// ── Context shape ─────────────────────────────────────────────────────
export interface BackendContextValue {
  // ① Sensor data
  nodes: SensorNode[];
  // ② Industrial schedules
  schedules: ActiveSchedule[];
  // ③ Source inference
  inference: SourceInferenceResult | null;
  // ④ Source classification
  classification: SourceClassification | null;
  // ⑥ Complaints
  complaints: ComplaintRecord[];
  pendingDraft: ComplaintRecord | null;
  // ⑧ Sensor faults
  faultReports: FaultReport[];
  tickets: MaintenanceTicket[];

  // Actions
  buildFormA: (
    event: { id: string; type: string; severity: string; location: { lat: number; lng: number }; radiusKm: number; timestamp: Date; description: string },
    sarpanchName?: string,
    villageName?: string
  ) => FormAData;

  createDraft: (
    event: { id: string; type: string; severity: string; location: { lat: number; lng: number }; radiusKm: number; timestamp: Date; description: string },
    sarpanch: SarpanchInfo
  ) => void;

  submitPendingComplaint: (
    event: { id: string; type: string; severity: string; location: { lat: number; lng: number }; radiusKm: number; timestamp: Date; description: string }
  ) => ComplaintRecord | null;

  downloadComplaint: (record: ComplaintRecord) => void;

  dispatch: (fault: FaultReport) => MaintenanceTicket;

  resolve: (ticketId: string, notes?: string) => void;

  refreshTickets: () => void;
}

const BackendContext = createContext<BackendContextValue | null>(null);

export function BackendProvider({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<SensorNode[]>(() => initSensorNodes());
  const [schedules, setSchedules] = useState<ActiveSchedule[]>(() => getAllActiveSchedules());
  const [inference, setInference] = useState<SourceInferenceResult | null>(null);
  const [classification, setClassification] = useState<SourceClassification | null>(null);
  const [complaints, setComplaints] = useState<ComplaintRecord[]>(() => getComplaints());
  const [pendingDraft, setPendingDraft] = useState<ComplaintRecord | null>(null);
  const [faultReports, setFaultReports] = useState<FaultReport[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(() => getMaintenanceTickets());

  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

  const inferenceRef = useRef(inference);
  inferenceRef.current = inference;

  const classificationRef = useRef(classification);
  classificationRef.current = classification;

  useEffect(() => {
    const tick = () => {
      // ① Tick sensors
      const newNodes = tickSensorNodes();
      setNodes([...newNodes]);

      // ② Update schedules
      const newSchedules = getAllActiveSchedules();
      setSchedules(newSchedules);

      // ③ Infer source direction
      const newInference = inferSourceDirection(newNodes);
      setInference(newInference);

      // ④ Classify source
      const newClass = classifySource(newNodes, newSchedules, newInference);
      setClassification(newClass);

      // ⑧ Detect faults
      const faults = detectFaults(newNodes);
      setFaultReports(faults);
    };

    tick(); // Initial tick
    const interval = setInterval(tick, 5000);
    return () => clearInterval(interval);
  }, []);

  const buildFormA = (
    event: Parameters<BackendContextValue['buildFormA']>[0],
    sarpanchName?: string,
    villageName?: string
  ): FormAData => {
    return buildFormAData(
      event,
      nodesRef.current,
      inferenceRef.current,
      classificationRef.current,
      sarpanchName,
      villageName
    );
  };

  const createDraft = (
    event: Parameters<BackendContextValue['createDraft']>[0],
    sarpanch: SarpanchInfo
  ) => {
    const draft = draftComplaint(
      event,
      nodesRef.current,
      inferenceRef.current,
      classificationRef.current,
      sarpanch
    );
    setPendingDraft(draft);
  };

  const submitPendingComplaint = (
    event: Parameters<BackendContextValue['submitPendingComplaint']>[0]
  ): ComplaintRecord | null => {
    if (!pendingDraft) return null;
    const submitted = submitComplaint(
      pendingDraft,
      event,
      nodesRef.current,
      inferenceRef.current,
      classificationRef.current
    );
    setComplaints(getComplaints());
    setPendingDraft(null);
    return submitted;
  };

  const downloadComplaint = (record: ComplaintRecord) => {
    downloadComplaintPDF(record);
  };

  const dispatch = (fault: FaultReport): MaintenanceTicket => {
    const ticket = dispatchMaintenance(fault);
    setTickets(getMaintenanceTickets());
    return ticket;
  };

  const resolve = (ticketId: string, notes = '') => {
    resolveTicket(ticketId, notes);
    setTickets(getMaintenanceTickets());
  };

  const refreshTickets = () => {
    setTickets(getMaintenanceTickets());
    setComplaints(getComplaints());
  };

  return (
    <BackendContext.Provider
      value={{
        nodes,
        schedules,
        inference,
        classification,
        complaints,
        pendingDraft,
        faultReports,
        tickets,
        buildFormA,
        createDraft,
        submitPendingComplaint,
        downloadComplaint,
        dispatch,
        resolve,
        refreshTickets,
      }}
    >
      {children}
    </BackendContext.Provider>
  );
}

export function useBackend(): BackendContextValue {
  const ctx = useContext(BackendContext);
  if (!ctx) throw new Error('useBackend must be used inside <BackendProvider>');
  return ctx;
}

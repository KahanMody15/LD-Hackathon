export type Role = 'Resident' | 'Sarpanch' | 'Inspector';

export interface Sensor {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  status: 'Active' | 'Fault' | 'Offline';
  lastSeen: Date;
  pm25: number;
  pm10: number;
  so2: number;
  nox: number;
  aqi: number;
}

export interface Reading {
  sensorId: string;
  timestamp: Date;
  pm25: number;
  pm10: number;
  so2: number;
  nox: number;
  aqi: number;
}

export interface Prediction {
  sensorId: string;
  predictedAqi: number;
  confidence: number;
  timeWindowMin: number;
}

export interface Event {
  id: string;
  type: 'Gas Leak' | 'Industrial Spillage' | 'Agricultural Burn';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  location: { lat: number; lng: number };
  radiusKm: number;
  timestamp: Date;
  description: string;
  sourceFactoryId?: string;
  confidenceScore: number;
}

export interface Alert {
  id: string;
  eventId: string;
  targetRole: Role;
  message: string;
  isRead: boolean;
  timestamp: Date;
}

export interface Factory {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  type: string;
  complianceStatus: 'Good' | 'Warning' | 'Violation';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

/**
 * ② Industrial Activity Schedule Correlation Engine
 * Models factory shift schedules and correlates them with live sensor readings.
 */

export interface FactoryShift {
  name: string;
  startHour: number;   // 0–23
  endHour: number;     // 0–23
  emissionMultiplier: number; // 1.0 = baseline, >1 = higher emissions
}

export interface FactorySchedule {
  factoryId: string;
  factoryName: string;
  location: { lat: number; lng: number };
  shifts: FactoryShift[];
  weekendActive: boolean;
  maintenanceWindowHours?: [number, number]; // e.g., [02, 04] = 2am-4am
}

export interface ActiveSchedule {
  factoryId: string;
  factoryName: string;
  isActive: boolean;
  shiftName: string;
  emissionMultiplier: number;
  nextShiftIn: number; // minutes
  location: { lat: number; lng: number };
}

export interface CorrelationResult {
  factoryId: string;
  factoryName: string;
  correlationScore: number;  // 0–1
  surgeDetected: boolean;
  explanation: string;
}

const FACTORY_SCHEDULES: FactorySchedule[] = [
  {
    factoryId: 'f1',
    factoryName: 'Apex Chemicals',
    location: { lat: 21.6364, lng: 73.0133 },
    weekendActive: false,
    maintenanceWindowHours: [2, 4],
    shifts: [
      { name: 'Morning Shift',   startHour: 6,  endHour: 14, emissionMultiplier: 1.8 },
      { name: 'Afternoon Shift', startHour: 14, endHour: 22, emissionMultiplier: 2.2 },
      { name: 'Night Shift',     startHour: 22, endHour: 6,  emissionMultiplier: 1.1 },
    ],
  },
  {
    factoryId: 'f2',
    factoryName: 'Gujarat Paper Mills',
    location: { lat: 21.6164, lng: 72.9933 },
    weekendActive: true,
    shifts: [
      { name: 'Day Shift',  startHour: 7,  endHour: 19, emissionMultiplier: 1.4 },
      { name: 'Night Shift', startHour: 19, endHour: 7, emissionMultiplier: 0.9 },
    ],
  },
  {
    factoryId: 'f3',
    factoryName: 'Zentis Pharmaceuticals',
    location: { lat: 21.6464, lng: 73.0233 },
    weekendActive: true,
    maintenanceWindowHours: [0, 2],
    shifts: [
      { name: 'Production-A', startHour: 6,  endHour: 14, emissionMultiplier: 2.8 },
      { name: 'Production-B', startHour: 14, endHour: 22, emissionMultiplier: 3.1 },
      { name: 'Night Run',    startHour: 22, endHour: 6,  emissionMultiplier: 1.5 },
    ],
  },
];

function isHourInShift(hour: number, shift: FactoryShift): boolean {
  if (shift.startHour < shift.endHour) {
    return hour >= shift.startHour && hour < shift.endHour;
  }
  // Overnight shift
  return hour >= shift.startHour || hour < shift.endHour;
}

export function getActiveSchedule(factoryId: string, ts: Date = new Date()): ActiveSchedule {
  const schedule = FACTORY_SCHEDULES.find(s => s.factoryId === factoryId);
  const fallback: ActiveSchedule = {
    factoryId,
    factoryName: 'Unknown',
    isActive: false,
    shiftName: 'No Schedule',
    emissionMultiplier: 1.0,
    nextShiftIn: 0,
    location: { lat: 0, lng: 0 },
  };
  if (!schedule) return fallback;

  const hour = ts.getHours();
  const dayOfWeek = ts.getDay(); // 0=Sun, 6=Sat
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const inMaintenance = schedule.maintenanceWindowHours
    ? hour >= schedule.maintenanceWindowHours[0] && hour < schedule.maintenanceWindowHours[1]
    : false;

  if (inMaintenance) {
    return {
      factoryId,
      factoryName: schedule.factoryName,
      location: schedule.location,
      isActive: false,
      shiftName: 'Maintenance Window',
      emissionMultiplier: 0.2,
      nextShiftIn: (schedule.maintenanceWindowHours![1] - hour) * 60,
    };
  }

  if (isWeekend && !schedule.weekendActive) {
    return {
      factoryId,
      factoryName: schedule.factoryName,
      location: schedule.location,
      isActive: false,
      shiftName: 'Weekend Shutdown',
      emissionMultiplier: 0.1,
      nextShiftIn: (7 - dayOfWeek) * 24 * 60,
    };
  }

  const activeShift = schedule.shifts.find(s => isHourInShift(hour, s));
  if (activeShift) {
    const minutesPast = (hour - activeShift.startHour + 24) % 24 * 60 + ts.getMinutes();
    const shiftLen = ((activeShift.endHour - activeShift.startHour + 24) % 24) * 60;
    return {
      factoryId,
      factoryName: schedule.factoryName,
      location: schedule.location,
      isActive: true,
      shiftName: activeShift.name,
      emissionMultiplier: activeShift.emissionMultiplier,
      nextShiftIn: shiftLen - minutesPast,
    };
  }

  return { ...fallback, factoryName: schedule.factoryName, location: schedule.location };
}

export function getAllActiveSchedules(ts: Date = new Date()): ActiveSchedule[] {
  return FACTORY_SCHEDULES.map(s => getActiveSchedule(s.factoryId, ts));
}

export function correlateWithReadings(
  nodeReadings: { pm25: number; so2: number; nox: number }[],
  schedules: ActiveSchedule[]
): CorrelationResult[] {
  const avgPM25 = nodeReadings.reduce((a, b) => a + b.pm25, 0) / nodeReadings.length;
  const avgSO2  = nodeReadings.reduce((a, b) => a + b.so2, 0)  / nodeReadings.length;
  const avgNOx  = nodeReadings.reduce((a, b) => a + b.nox, 0)  / nodeReadings.length;

  return schedules.map(sched => {
    if (!sched.isActive) {
      return {
        factoryId: sched.factoryId,
        factoryName: sched.factoryName,
        correlationScore: 0.05,
        surgeDetected: false,
        explanation: `${sched.factoryName} is inactive (${sched.shiftName}). Low correlation expected.`,
      };
    }

    // Higher emission multiplier factories correlate more with elevated readings
    const baseScore = Math.min(1, (sched.emissionMultiplier - 1) / 3);
    const pollutantBoost = Math.min(0.4,
      (avgSO2 / 80 + avgPM25 / 300 + avgNOx / 200) / 3 * 0.4
    );
    const score = Math.min(1, baseScore + pollutantBoost);
    const surgeDetected = sched.emissionMultiplier > 2.0 && avgPM25 > 100;

    return {
      factoryId: sched.factoryId,
      factoryName: sched.factoryName,
      correlationScore: parseFloat(score.toFixed(2)),
      surgeDetected,
      explanation: surgeDetected
        ? `${sched.factoryName} ${sched.shiftName} running at ${sched.emissionMultiplier}x — correlates with PM2.5 surge of ${avgPM25.toFixed(0)} µg/m³.`
        : `${sched.factoryName} in ${sched.shiftName} (${sched.emissionMultiplier}x emissions). Moderate correlation.`,
    };
  });
}

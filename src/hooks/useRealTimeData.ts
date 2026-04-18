import { useState, useEffect } from 'react';
import type { Sensor, Event, Factory } from "@/types";
import { generateMockSensors, generateMockFactories, simulateReadingTick } from "../lib/dataSimulation";

export function useRealTimeData() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [activeEvents, setActiveEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Initial load
    setSensors(generateMockSensors());
    setFactories(generateMockFactories());

    // Simulation loop
    const interval = setInterval(() => {
      setSensors(currentSensors => {
        const { sensors: newSensors, newEvent } = simulateReadingTick(currentSensors);
        
        if (newEvent) {
          setActiveEvents(prev => [newEvent, ...prev].slice(0, 5)); // Keep last 5 events
        }
        
        return newSensors;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return { sensors, factories, activeEvents };
}

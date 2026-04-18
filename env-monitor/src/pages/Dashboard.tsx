import { useState } from "react";
import { TopNav } from "@/components/dashboard/TopNav";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { MapPanel } from "@/components/dashboard/MapPanel";
import { MetricsPanel } from "@/components/dashboard/MetricsPanel";
import { SensorHealthPanel } from "@/components/dashboard/SensorHealthPanel";
import { ChatAssistant } from "@/components/dashboard/ChatAssistant";
import { FormAModal } from "@/components/dashboard/FormAModal";
import { BroadcastModal } from "@/components/dashboard/BroadcastModal";
import { useRealTimeData } from "@/hooks/useRealTimeData";
import type { Role, Event } from "@/types";

export default function Dashboard() {
  const [role, setRole] = useState<Role>('Resident');
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [formModalEvent, setFormModalEvent] = useState<Event | null>(null);

  const { sensors, factories, activeEvents } = useRealTimeData();

  return (
    <div className="min-h-screen bg-dark-base flex flex-col overflow-hidden relative">
      <TopNav 
        role={role} 
        setRole={setRole} 
        onBroadcastClick={() => setShowBroadcast(true)} 
      />

      <div className="flex-1 overflow-y-auto">
        <AlertBanner events={activeEvents} />

        <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-theme('spacing.16')-theme('spacing.20'))]">
          {/* Left Column: Map */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="flex-1 glass-panel rounded-xl flex border-white/5 relative">
              <MapPanel sensors={sensors} factories={factories} activeEvents={activeEvents} />
              
              {/* Overlay Actions on Map depending on Role and Events */}
              {role !== 'Resident' && activeEvents.length > 0 && activeEvents[0].severity === 'Critical' && (
                <div className="absolute bottom-6 right-6">
                  <button 
                    onClick={() => setFormModalEvent(activeEvents[0])}
                    className="bg-danger text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-danger-dark animate-bounce"
                  >
                    Generate GSPCB Form-A
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Metrics & Health */}
          <div className="lg:col-span-1 flex flex-col gap-6 h-full">
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6">
              <MetricsPanel sensors={sensors} />
              <div className="flex-1 min-h-[300px]">
                <SensorHealthPanel sensors={sensors} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ChatAssistant />

      {showBroadcast && (
        <BroadcastModal 
          onClose={() => setShowBroadcast(false)}
          onSend={() => setShowBroadcast(false)}
        />
      )}

      {formModalEvent && (
        <FormAModal 
          event={formModalEvent}
          onClose={() => setFormModalEvent(null)}
        />
      )}
    </div>
  );
}

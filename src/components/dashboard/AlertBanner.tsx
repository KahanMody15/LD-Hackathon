import { AlertTriangle, ShieldAlert } from "lucide-react";
import type { Event } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface AlertBannerProps {
  events: Event[];
}

export function AlertBanner({ events }: AlertBannerProps) {
  const activeEvent = events[0];

  return (
    <AnimatePresence>
      {activeEvent && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="mx-6 mt-4 p-4 rounded-lg bg-danger-dark/10 border border-danger-dark/30 flex items-start gap-4"
        >
          <div className="shrink-0 mt-0.5">
            {activeEvent.severity === 'Critical' ? (
              <ShieldAlert className="w-6 h-6 text-danger animate-pulse" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-warning" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-danger font-semibold flex items-center gap-2">
              ACTIVE PRIORITY EVENT
              <span className="px-2 py-0.5 rounded text-xs bg-danger text-white uppercase tracking-wider font-bold">
                {activeEvent.severity}
              </span>
            </h4>
            <p className="text-slate-300 text-sm mt-1">
              <span className="font-semibold">{activeEvent.type}</span> detected near Lat/Lng: {activeEvent.location.lat.toFixed(4)}, {activeEvent.location.lng.toFixed(4)}.
              Affected Radius: {activeEvent.radiusKm.toFixed(1)} km. {activeEvent.description}
            </p>
          </div>
          <div className="shrink-0 text-slate-500 text-xs">
            {activeEvent.timestamp.toLocaleTimeString()}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

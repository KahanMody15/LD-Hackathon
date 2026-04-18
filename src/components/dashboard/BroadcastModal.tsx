import { X, Radio, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface BroadcastModalProps {
  onClose: () => void;
  onSend: () => void;
}

export function BroadcastModal({ onClose, onSend }: BroadcastModalProps) {
  const [msg, setMsg] = useState("");

  const handleSend = () => {
    if(!msg.trim()) return;
    onSend();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-dark-base border border-danger-dark/30 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="bg-danger-dark/20 p-4 border-b border-danger-dark/30 flex justify-between items-center">
          <div className="flex items-center gap-2 text-danger font-bold">
            <Radio className="w-5 h-5 animate-pulse" />
            Emergency Broadcast
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="bg-warning/10 border border-warning/20 p-3 rounded-lg flex items-start gap-3 mb-6">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300">
              Only use this for verified critical events. Alerts will bypass normal channels and trigger mobile sirens for residents in the selected zone.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Target Zone</label>
              <select className="w-full bg-slate-800 border border-white/10 rounded-md p-2 text-sm text-white focus:outline-none focus:border-danger">
                <option>All Zones (Global)</option>
                <option>Vapi Estate Only</option>
                <option>Ankleshwar Corridors</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Message Payload</label>
              <textarea 
                rows={3} 
                className="w-full bg-slate-800 border border-white/10 rounded-md p-2 text-sm text-white focus:outline-none focus:border-danger placeholder:text-slate-500"
                placeholder="Describe the emergency..."
                value={msg}
                onChange={e => setMsg(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button 
              onClick={handleSend}
              className="px-4 py-2 rounded-md bg-danger text-white text-sm font-medium hover:bg-danger-dark transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(231,76,60,0.4)]"
            >
              <Radio className="w-4 h-4" />
              Transmit Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

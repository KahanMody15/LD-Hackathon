import { X, Radio, AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";

interface BroadcastModalProps {
  onClose: () => void;
  onSend: () => void;
}

export function BroadcastModal({ onClose, onSend }: BroadcastModalProps) {
  const [msg, setMsg] = useState("");
  const [targetNumber, setTargetNumber] = useState("+918401782327");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if(!msg.trim() || !targetNumber.trim()) return;
    
    setLoading(true);
    try {
      const accountSid = import.meta.env.VITE_TWILIO_SID;
      const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
      const twilioNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER;
      
      const formData = new URLSearchParams();
      formData.append('To', targetNumber);
      formData.append('From', twilioNumber);
      formData.append('Body', `[EcoSentinel Alert]\n${msg}`);

      // We use the Vite proxy mapping /twilio-api to https://api.twilio.com
      const response = await fetch(`/twilio-api/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`)
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Twilio Error:", errorData);
        alert(`Failed to send SMS: ${errorData.message}`);
      } else {
        const successData = await response.json();
        console.log("SMS sent successfully! SID:", successData.sid);
        onSend(); // close the modal on success
      }
    } catch (err) {
      console.error(err);
      alert("Error sending SMS. Ensure Vite server proxy is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#030914] border border-red-500/30 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="bg-red-950/30 p-4 border-b border-red-500/30 flex justify-between items-center">
          <div className="flex items-center gap-2 text-red-500 font-bold">
            <Radio className="w-5 h-5 animate-pulse" />
            Emergency SMS Broadcast
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg flex items-start gap-3 mb-6">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300">
              Only use this for verified critical events. Alerts will bypass normal channels and trigger an SMS directly to local authorities or residents via Twilio.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Target Phone Number</label>
              <input 
                type="text"
                className="w-full bg-slate-800 border border-white/10 rounded-md p-2 text-sm text-white focus:outline-none focus:border-red-500 placeholder:text-slate-500"
                placeholder="+918401782327"
                value={targetNumber}
                onChange={e => setTargetNumber(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Message Payload</label>
              <textarea 
                rows={3} 
                className="w-full bg-slate-800 border border-white/10 rounded-md p-2 text-sm text-white focus:outline-none focus:border-red-500 placeholder:text-slate-500"
                placeholder="Describe the emergency..."
                value={msg}
                onChange={e => setMsg(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} disabled={loading} className="px-4 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button 
              onClick={handleSend}
              disabled={loading || !msg.trim() || !targetNumber.trim()}
              className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.4)] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Radio className="w-4 h-4" />
              )}
              {loading ? 'Transmitting...' : 'Transmit Alert'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

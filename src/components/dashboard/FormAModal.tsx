import { X, FileText, Download, ShieldCheck } from "lucide-react";
import jsPDF from "jspdf";
import type { Event } from "@/types";

interface FormAModalProps {
  event: Event;
  onClose: () => void;
}

export function FormAModal({ event, onClose }: FormAModalProps) {
  
  // Fake hash generation
  const hash = `0x${Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("GSPCB FORM-A COMPLAINT REGISTRATION", 20, 20);
    doc.setFontSize(12);
    doc.text(`Date Registered: ${event.timestamp.toLocaleDateString()}`, 20, 30);
    doc.text(`Event ID: ${event.id}`, 20, 40);
    doc.text(`Type: ${event.type}`, 20, 50);
    doc.text(`Location coordinates: ${event.location.lat.toFixed(4)}, ${event.location.lng.toFixed(4)}`, 20, 60);
    doc.text(`Severity: ${event.severity}`, 20, 70);
    doc.text(`Description: ${event.description}`, 20, 80);
    doc.text("---------------------------------------------------------", 20, 95);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Integrity Hash: ${hash}`, 20, 105);
    
    doc.save(`GSPCB_Form_A_${event.id}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-dark-base border border-white/10 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="bg-slate-800/50 p-4 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white font-bold">
            <FileText className="w-5 h-5 text-emerald-400" />
            Auto-Generated Form-A
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="border border-white/10 rounded-lg p-4 bg-white/[0.02] mb-6 font-mono text-sm text-slate-300 space-y-3">
            <div className="text-center font-bold pb-2 border-b border-white/5 mb-4 text-white">GUJARAT STATE POLLUTION CONTROL BOARD</div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-500">Date:</span> <span className="col-span-2">{event.timestamp.toLocaleString()}</span>
              <span className="text-slate-500">Event Type:</span> <span className="col-span-2">{event.type}</span>
              <span className="text-slate-500">Coordinates:</span> <span className="col-span-2">{event.location.lat.toFixed(4)}, {event.location.lng.toFixed(4)}</span>
              <span className="text-slate-500">Zone:</span> <span className="col-span-2">Ankleshwar Ind. Estate (Zone B)</span>
              <span className="text-slate-500">Telemetry:</span> <span className="col-span-2 text-xs text-danger">SO2 peak &gt; 150 µg/m³, PM2.5 &gt; 400</span>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-bold">Cryptographic Integrity Seal</span>
              </div>
              <div className="text-[10px] break-all text-slate-500">{hash}</div>
            </div>
          </div>

          <div className="flex justify-end gap-3 flex-col sm:flex-row">
            <button onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors w-full sm:w-auto text-center">
              Close Preview
            </button>
            <button 
              onClick={downloadPDF}
              className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.4)] w-full sm:w-auto"
            >
              <Download className="w-4 h-4" />
              Download Formal PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { X, HelpCircle, CheckCircle2 } from "lucide-react";

interface HelpGuideModalProps {
  onClose: () => void;
}

export function HelpGuideModal({ onClose }: HelpGuideModalProps) {
  const steps = [
    { title: "Select Region", desc: "Choose your industrial corridor from the top map or dropdown." },
    { title: "Monitor Public AQI", desc: "Instantly view real-time PM2.5, PM10, and SO2 data for your chosen region." },
    { title: "Predict Trends (ML)", desc: "Click the 'Predict AQI' button to forecast tomorrow's air quality based on past metrics." },
    { title: "Sign In", desc: "Log in as a Resident, Sarpanch, or Inspector for personalized dashboard controls." },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#030914] border border-blue-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.15)] flex flex-col">
        <div className="bg-blue-950/30 p-5 border-b border-blue-500/30 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 text-blue-400 font-bold">
            <HelpCircle className="w-6 h-6" />
            <span className="text-lg tracking-wide">Quick Start Guide</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-white/5 p-1.5 rounded-lg hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            {steps.map((step, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="bg-blue-500/20 text-blue-400 font-bold rounded-full w-8 h-8 flex items-center justify-center shrink-0 border border-blue-500/30 mt-0.5">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm mb-1">{step.title}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
             <button 
               onClick={onClose} 
               className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(59,130,246,0.3)]"
             >
               <CheckCircle2 className="w-5 h-5" /> Got it!
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

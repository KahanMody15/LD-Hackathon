import { useState } from "react";
import { X, Activity, Calculator, Calendar, BrainCircuit, AlertTriangle } from "lucide-react";
import { generateFeaturesAndPredict } from "@/lib/mlPredictor";
import type { ModelResult } from "@/lib/mlPredictor";

interface AqiPredictorModalProps {
  onClose: () => void;
}

export function AqiPredictorModal({ onClose }: AqiPredictorModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ModelResult | null>(null);

  const handlePredict = () => {
    try {
      setError("");
      setResult(null);

      // Parse comma separated values
      const parts = inputValue.split(',').map(s => s.trim()).filter(s => s !== "");
      if (parts.length < 30) {
        throw new Error(`Need at least 30 days of data. You provided exactly ${parts.length}.`);
      }

      const numArr = parts.map(s => {
        const n = parseFloat(s);
        if (isNaN(n)) throw new Error(`Invalid number found: "${s}"`);
        return n;
      });

      // Target Date is tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const prediction = generateFeaturesAndPredict(numArr, tomorrow);
      setResult(prediction);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred parsing your input.");
    }
  };

  const tomorrowStr = new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#030914] border border-emerald-500/30 rounded-2xl w-full max-w-xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.15)] flex flex-col max-h-[90vh]">
        <div className="bg-emerald-950/30 p-5 border-b border-emerald-500/30 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 text-emerald-400 font-bold">
            <BrainCircuit className="w-6 h-6" />
            <span className="text-lg tracking-wide">AQI ML Predictor Engine</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-white/5 p-1.5 rounded-lg hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {!result ? (
            <div className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-4">
                <Calculator className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">XGBoost Trend Model Input</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Please paste exactly <strong>30 days</strong> of contiguous daily AQI average values separated by commas. 
                    The predictor will compute 33 structural ML features (moving averages, lag offsets, EWM) and forecast tomorrow's state-wide trend.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Historical AQI Array (30 values)
                </label>
                <textarea 
                  rows={5} 
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 placeholder:text-slate-600 transition-all font-mono"
                  placeholder="Example: 85.2, 82.1, 79.5, 78.0, 80.5, ..."
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                />
                <div className="mt-2 text-[10px] text-slate-500 flex justify-between">
                  <span>Comma-separated floats</span>
                  <span className={inputValue.split(',').filter(x=>x.trim()).length < 30 ? "text-amber-500" : "text-emerald-500"}>
                    Count: {inputValue.split(',').filter(x=>x.trim()).length}
                  </span>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-xs text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <button 
                onClick={handlePredict}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold tracking-wide hover:from-emerald-500 hover:to-cyan-500 transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
              >
                <Activity className="w-5 h-5" />
                Initialize Feature Engineering & Predict
              </button>
            </div>
          ) : (
             <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
               <div className="text-center space-y-2">
                 <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-2">
                   <BrainCircuit className="w-8 h-8 text-emerald-400" />
                 </div>
                 <h3 className="text-2xl font-bold text-white">Prediction Complete</h3>
                 <p className="text-slate-400 text-sm">Successfully extracted {result.featuresExtracted} features</p>
               </div>

               <div className="grid grid-cols-1 gap-3 bg-slate-900 border border-white/5 p-1 rounded-2xl">
                 <div className="bg-black/40 p-4 rounded-xl flex items-center justify-between border border-white/5">
                   <div className="flex items-center gap-3">
                     <Calendar className="w-5 h-5 text-blue-400" />
                     <span className="text-sm font-semibold text-slate-300">Target Date</span>
                   </div>
                   <span className="text-sm text-white font-mono">{tomorrowStr}</span>
                 </div>

                 <div className="bg-black/40 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between border border-white/5 gap-4">
                   <div className="flex items-center gap-3">
                     <Activity className="w-5 h-5 text-emerald-400" />
                     <span className="text-sm font-semibold text-slate-300">Predicted AQI Profile</span>
                   </div>
                   <div className="flex items-center gap-4">
                     <span className="text-4xl font-extrabold text-white tracking-tighter">
                       {result.predictedAqi.toFixed(1)}
                     </span>
                     <span className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap bg-white/10 border border-white/10 ${
                        result.categoryCode === 'good' ? 'text-emerald-400 border-emerald-500/30' :
                        result.categoryCode === 'satisfactory' ? 'text-amber-300 border-amber-300/30' :
                        result.categoryCode === 'moderate' ? 'text-orange-400 border-orange-400/30' :
                        result.categoryCode === 'poor' ? 'text-red-400 border-red-400/30' :
                        'text-red-600 border-red-600/30'
                     }`}>
                       {result.category}
                     </span>
                   </div>
                 </div>

                 <div className="bg-black/40 p-4 rounded-xl flex items-center justify-between border border-white/5">
                   <div className="flex items-center gap-3">
                     <BrainCircuit className="w-5 h-5 text-purple-400" />
                     <span className="text-sm font-semibold text-slate-300">Surrogate Confidence</span>
                   </div>
                   <span className="text-sm text-purple-300 font-bold">{(result.confidence * 100).toFixed(1)}%</span>
                 </div>
               </div>

               <div className="flex gap-3 pt-4 border-t border-white/10">
                 <button 
                   onClick={() => setResult(null)} 
                   className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
                 >
                   Run Another Array
                 </button>
                 <button 
                   onClick={onClose} 
                   className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                 >
                   Close Predictor
                 </button>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

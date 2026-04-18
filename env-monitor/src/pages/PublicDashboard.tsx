import { useState, useMemo } from "react";
import { Activity, MapPin, Wind, Droplets, Thermometer, Eye, AlertTriangle, ChevronDown, ArrowLeft, MessageSquare, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRealTimeData } from "@/hooks/useRealTimeData";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { HeaderActions } from "@/components/dashboard/HeaderActions";
import { saveComplaint, getCurrentSession } from "@/lib/store";

const REGIONS = [
  { id: "vapi", name: "Vapi GIDC", lat: 20.3893, lng: 72.9106, defaultAQI: 142 },
  { id: "ankleshwar", name: "Ankleshwar", lat: 21.6264, lng: 73.0033, defaultAQI: 168 },
  { id: "surat", name: "Surat Industrial", lat: 21.1702, lng: 72.8311, defaultAQI: 95 },
  { id: "bharuch", name: "Bharuch", lat: 21.7051, lng: 72.9959, defaultAQI: 120 },
  { id: "vadodara", name: "Vadodara", lat: 22.3072, lng: 73.1812, defaultAQI: 88 },
  { id: "gandhinagar", name: "Gandhinagar", lat: 23.2156, lng: 72.6369, defaultAQI: 62 },
];

function getAQILevel(aqi: number) {
  if (aqi <= 50) return { label: "Good", color: "#22c55e", bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400", advice: "Air quality is satisfactory. Enjoy outdoor activities!" };
  if (aqi <= 100) return { label: "Moderate", color: "#eab308", bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", advice: "Acceptable air quality. Sensitive groups should limit prolonged outdoor exertion." };
  if (aqi <= 150) return { label: "Unhealthy for Sensitive Groups", color: "#f97316", bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", advice: "Sensitive individuals should avoid prolonged outdoor activities." };
  if (aqi <= 200) return { label: "Unhealthy", color: "#ef4444", bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", advice: "Everyone should reduce outdoor activities. Wear masks if going out." };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "#a855f7", bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", advice: "Health alert! Avoid outdoor activities. Keep windows closed." };
  return { label: "Hazardous", color: "#991b1b", bg: "bg-red-900/20", border: "border-red-800/50", text: "text-red-300", advice: "EMERGENCY: Stay indoors. Evacuate if instructed by authorities." };
}

function AQIGauge({ aqi }: { aqi: number }) {
  const max = 500;
  const pct = Math.min(aqi / max, 1);
  const level = getAQILevel(aqi);
  const angle = -135 + pct * 270;
  const r = 80;
  const cx = 100, cy = 100;

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const arcPath = (startAngle: number, endAngle: number, r: number) => {
    const s = polarToCartesian(cx, cy, r, startAngle);
    const e = polarToCartesian(cx, cy, r, endAngle);
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const needle = polarToCartesian(cx, cy, 65, angle);

  return (
    <svg viewBox="0 0 200 160" className="w-full max-w-[220px]">
      {/* Track */}
      <path d={arcPath(-135, 135, r)} fill="none" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" />
      {/* Good */}
      <path d={arcPath(-135, -81, r)} fill="none" stroke="#22c55e" strokeWidth="14" strokeLinecap="round" opacity="0.8" />
      {/* Moderate */}
      <path d={arcPath(-81, -27, r)} fill="none" stroke="#eab308" strokeWidth="14" strokeLinecap="round" opacity="0.8" />
      {/* Unhealthy SG */}
      <path d={arcPath(-27, 27, r)} fill="none" stroke="#f97316" strokeWidth="14" strokeLinecap="round" opacity="0.8" />
      {/* Unhealthy */}
      <path d={arcPath(27, 81, r)} fill="none" stroke="#ef4444" strokeWidth="14" strokeLinecap="round" opacity="0.8" />
      {/* Very Unhealthy */}
      <path d={arcPath(81, 108, r)} fill="none" stroke="#a855f7" strokeWidth="14" strokeLinecap="round" opacity="0.8" />
      {/* Hazardous */}
      <path d={arcPath(108, 135, r)} fill="none" stroke="#991b1b" strokeWidth="14" strokeLinecap="round" opacity="0.8" />

      {/* Needle */}
      <line x1={cx} y1={cy} x2={needle.x} y2={needle.y} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="5" fill="white" />

      {/* AQI number */}
      <text x={cx} y={cy + 30} textAnchor="middle" fill="white" fontSize="28" fontWeight="bold">{aqi}</text>
      <text x={cx} y={cy + 48} textAnchor="middle" fill={level.color} fontSize="9" fontWeight="600">{level.label}</text>
    </svg>
  );
}

export default function PublicDashboard() {
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState<typeof REGIONS[0] | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportIssueData, setReportIssueData] = useState({ issue: '', severity: 'Medium' as any });
  const { sensors } = useRealTimeData();
  const session = getCurrentSession();

  const handleReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRegion) {
      alert("Please select a region first");
      return;
    }
    saveComplaint({
      id: crypto.randomUUID(),
      resident: session?.name || "Anonymous Resident",
      village: selectedRegion.name,
      issue: reportIssueData.issue,
      severity: reportIssueData.severity as any,
      status: 'Pending',
      time: 'Just now'
    });
    setShowReportModal(false);
    setReportIssueData({ issue: '', severity: 'Medium' });
    alert("Issue reported successfully to the Sarpanch!");
  };

  const regionData = useMemo(() => {
    if (!selectedRegion) return null;
    const avgAQI = selectedRegion.defaultAQI + Math.floor(Math.sin(Date.now() / 10000) * 15);
    const avgPM25 = (avgAQI * 0.35).toFixed(1);
    const avgPM10 = (avgAQI * 0.55).toFixed(1);
    const avgSO2 = (avgAQI * 0.08).toFixed(1);
    const avgNOx = (avgAQI * 0.12).toFixed(1);

    const trendData = Array.from({ length: 12 }, (_, i) => ({
      time: `${(10 + i) % 24}:00`,
      aqi: Math.max(30, avgAQI + Math.floor((Math.random() - 0.4) * 40)),
    }));

    return { avgAQI, avgPM25, avgPM10, avgSO2, avgNOx, trendData };
  }, [selectedRegion]);

  const level = regionData ? getAQILevel(regionData.avgAQI) : null;

  return (
    <div className="min-h-screen bg-[#030914] text-white font-sans">
      {/* Gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-white/5 bg-black/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg hover:bg-white/5 transition-colors mr-1">
              <ArrowLeft className="w-4 h-4 text-slate-400" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight">EcoSentinel</div>
              <div className="text-xs text-emerald-400 font-medium">Public AQI Dashboard</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-800/50 px-3 py-1.5 rounded-full border border-white/5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Data
            </div>
            <HeaderActions />
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3">
            Know Your Air Quality
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Select your region below to instantly view real-time AQI levels and health advisories.
          </p>
        </div>

        {/* Region Selector */}
        <div className="flex flex-col items-center mb-10 gap-4">
          <div className="flex w-full max-w-md gap-3">
            <div className="relative flex-1">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between bg-slate-800/80 border border-white/10 rounded-xl px-5 py-3.5 text-sm font-medium hover:border-emerald-500/40 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className={selectedRegion ? "text-white" : "text-slate-400"}>
                  {selectedRegion ? selectedRegion.name : "Select a Region..."}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                {REGIONS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { setSelectedRegion(r); setDropdownOpen(false); }}
                    className={`w-full flex items-center justify-between px-5 py-3 text-sm hover:bg-emerald-500/10 transition-colors ${selectedRegion?.id === r.id ? "bg-emerald-500/15 text-emerald-300" : "text-slate-300"}`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500/60" />
                      {r.name}
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getAQILevel(r.defaultAQI).bg} ${getAQILevel(r.defaultAQI).text} ${getAQILevel(r.defaultAQI).border} border`}>
                      AQI {r.defaultAQI}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button 
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-3.5 rounded-xl font-semibold hover:bg-amber-500/20 transition-all whitespace-nowrap"
          >
            <MessageSquare className="w-4 h-4" />
            Report Issue
          </button>
        </div>

          {/* Quick region pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {REGIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRegion(r)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  selectedRegion?.id === r.id
                    ? "bg-emerald-500 border-emerald-500 text-black"
                    : "bg-slate-800/50 border-white/10 text-slate-400 hover:border-emerald-500/30 hover:text-emerald-400"
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>

        {/* Data Display */}
        {!selectedRegion ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-800/50 border border-white/5 flex items-center justify-center mb-6">
              <MapPin className="w-10 h-10 text-slate-600" />
            </div>
            <p className="text-slate-400 text-lg font-medium">Select a region above</p>
            <p className="text-slate-600 text-sm mt-1">Your AQI dashboard will appear instantly</p>
          </div>
        ) : (
          <div className="space-y-6" key={selectedRegion.id}>
            {/* AQI Hero Card */}
            <div className={`rounded-2xl border ${level!.border} ${level!.bg} p-6 backdrop-blur-sm`}>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <AQIGauge aqi={regionData!.avgAQI} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400 text-sm">{selectedRegion.name}, Gujarat</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-1">
                    Air Quality: <span className={level!.text}>{level!.label}</span>
                  </h2>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${level!.bg} border ${level!.border} mt-2 mb-4`}>
                    <AlertTriangle className={`w-4 h-4 ${level!.text}`} />
                    <p className={`text-sm font-medium ${level!.text}`}>{level!.advice}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    {[
                      { label: "PM2.5", value: `${regionData!.avgPM25} µg/m³`, icon: Wind },
                      { label: "PM10", value: `${regionData!.avgPM10} µg/m³`, icon: Droplets },
                      { label: "SO₂", value: `${regionData!.avgSO2} ppb`, icon: Thermometer },
                      { label: "NOx", value: `${regionData!.avgNOx} ppb`, icon: Eye },
                    ].map((m) => (
                      <div key={m.label} className="bg-black/30 rounded-xl p-3 border border-white/5">
                        <m.icon className="w-4 h-4 text-slate-400 mb-1" />
                        <div className="text-xs text-slate-500 uppercase tracking-wider">{m.label}</div>
                        <div className="text-lg font-bold text-white mt-0.5">{m.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* AQI Trend Chart */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">AQI Trend (Last 12 Hours)</h3>
                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">Live</span>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={regionData!.trendData}>
                    <defs>
                      <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={level!.color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={level!.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 300]} stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '10px', fontSize: '12px' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Area type="monotone" dataKey="aqi" name="AQI" stroke={level!.color} strokeWidth={2} fill="url(#aqiGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AQI Scale Reference */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">AQI Reference Scale</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { range: "0–50", label: "Good", color: "bg-green-500", desc: "Little or no risk" },
                  { range: "51–100", label: "Moderate", color: "bg-yellow-500", desc: "Acceptable quality" },
                  { range: "101–150", label: "Unhealthy (Sensitive)", color: "bg-orange-500", desc: "Sensitive groups affected" },
                  { range: "151–200", label: "Unhealthy", color: "bg-red-500", desc: "General health effects" },
                  { range: "201–300", label: "Very Unhealthy", color: "bg-purple-500", desc: "Health alert for all" },
                  { range: "301+", label: "Hazardous", color: "bg-red-900", desc: "Emergency conditions" },
                ].map((s) => (
                  <div key={s.range} className={`rounded-xl p-3 border border-white/5 flex items-start gap-3 ${regionData!.avgAQI >= parseInt(s.range) && regionData!.avgAQI <= parseInt(s.range.split("–")[1] || "999") ? "ring-2 ring-white/30 bg-white/5" : "bg-slate-800/30"}`}>
                    <div className={`w-3 h-3 rounded-full mt-0.5 flex-shrink-0 ${s.color}`} />
                    <div>
                      <div className="text-xs font-bold text-slate-200">{s.label}</div>
                      <div className="text-[10px] text-slate-500">{s.range} · {s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby Stations */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">
                Nearby CAAQMS Stations ({sensors.filter(s => s.status === 'Active').length} Active)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {sensors.slice(0, 6).map((s) => {
                  const sl = getAQILevel(s.aqi);
                  return (
                    <div key={s.id} className={`rounded-xl p-3 border ${sl.border} ${sl.bg}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300">{s.name}</span>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${sl.bg} ${sl.text}`}>
                          {s.status === 'Active' ? `AQI ${s.aqi.toFixed(0)}` : s.status}
                        </span>
                      </div>
                      <div className={`text-[10px] mt-1 ${sl.text}`}>{s.status === 'Active' ? sl.label : 'Station Offline'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Report Issue Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-800/30">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-lg">Report Environmental Issue</h3>
              </div>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleReportIssue} className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider font-semibold">Selected Region</label>
                <div className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-slate-300 text-sm">
                  {selectedRegion ? selectedRegion.name : "Please select a region on the dashboard first."}
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider font-semibold">Issue Description</label>
                <textarea 
                  required
                  rows={3}
                  value={reportIssueData.issue}
                  onChange={(e) => setReportIssueData({...reportIssueData, issue: e.target.value})}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50 resize-none"
                  placeholder="E.g. Visible smoke from factory chimney, Foul smell near water source..."
                ></textarea>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider font-semibold">Severity</label>
                <select 
                  value={reportIssueData.severity}
                  onChange={(e) => setReportIssueData({...reportIssueData, severity: e.target.value as any})}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50 appearance-none"
                >
                  <option value="Low">Low (Minor disturbance)</option>
                  <option value="Medium">Medium (Noticeable continuous issue)</option>
                  <option value="High">High (Impacting health/environment clearly)</option>
                  <option value="Critical">Critical (Immediate emergency)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowReportModal(false)} className="flex-1 py-3 text-slate-300 font-semibold bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!selectedRegion}
                  className="flex-1 py-3 text-black font-bold bg-gradient-to-r from-amber-500 to-orange-400 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

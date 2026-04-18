import { useState } from "react";
import { Activity, ArrowLeft, Bell, AlertTriangle, FileText, Users, Map, Radio, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRealTimeData } from "@/hooks/useRealTimeData";
import { BroadcastModal } from "@/components/dashboard/BroadcastModal";
import { FormAModal } from "@/components/dashboard/FormAModal";
import type { Event } from "@/types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const VILLAGES = [
  "Ankleshwar", "Panoli", "Jhagadia", "Amod", "Vagra", "Jambusar"
];

const COMPLAINTS = [
  { id: 1, resident: "Ramubhai Patel", village: "Panoli", issue: "Foul smell from factory near School Rd", time: "2h ago", status: "Pending", severity: "High" },
  { id: 2, resident: "Sushila Desai", village: "Ankleshwar", issue: "Visible smoke from industrial chimney", time: "3h ago", status: "In Progress", severity: "Medium" },
  { id: 3, resident: "Harishbhai Modi", village: "Jhagadia", issue: "Skin rashes reported near Zentis plant", time: "5h ago", status: "Resolved", severity: "Critical" },
  { id: 4, resident: "Kanta Ben", village: "Amod", issue: "Black water discharge near community well", time: "1d ago", status: "Pending", severity: "High" },
];

const WELFARE_SCHEMES = [
  { name: "Clean Village Initiative", status: "Active", beneficiaries: 1240, budget: "₹2.4L" },
  { name: "Women & Child Health Drive", status: "Active", beneficiaries: 680, budget: "₹1.1L" },
  { name: "Pollution Shield Kit Distribution", status: "Upcoming", beneficiaries: 0, budget: "₹80K" },
];

function getStatusStyle(status: string) {
  if (status === "Resolved") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  if (status === "In Progress") return "text-blue-400 bg-blue-500/10 border-blue-500/30";
  return "text-amber-400 bg-amber-500/10 border-amber-500/30";
}

function getSeverityStyle(sev: string) {
  if (sev === "Critical") return "text-red-400 bg-red-500/10";
  if (sev === "High") return "text-orange-400 bg-orange-500/10";
  return "text-yellow-400 bg-yellow-500/10";
}

const villageAQIData = VILLAGES.map(v => ({
  name: v.slice(0, 6),
  aqi: 60 + Math.floor(Math.random() * 140),
}));

export default function SarpanchDashboard() {
  const navigate = useNavigate();
  const { sensors, factories, activeEvents } = useRealTimeData();
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [formModalEvent, setFormModalEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "complaints" | "schemes" | "alerts">("overview");
  const [notifications] = useState(3);

  const criticalEvents = activeEvents.filter(e => e.severity === 'Critical' || e.severity === 'High');
  const avgAQI = sensors.length ? Math.round(sensors.filter(s => s.status === 'Active').reduce((a, b) => a + b.aqi, 0) / sensors.filter(s => s.status === 'Active').length) : 0;
  const faultySensors = sensors.filter(s => s.status !== 'Active').length;

  return (
    <div className="min-h-screen bg-[#030914] text-white font-sans">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-amber-600/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg hover:bg-white/5 transition-colors mr-1">
              <ArrowLeft className="w-4 h-4 text-slate-400" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Activity className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight">EcoSentinel</div>
              <div className="text-xs text-amber-400 font-medium">Sarpanch Command Dashboard</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {criticalEvents.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                {criticalEvents.length} Active Alert{criticalEvents.length > 1 ? 's' : ''}
              </div>
            )}
            <button
              onClick={() => setShowBroadcast(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 text-xs font-semibold transition-all"
            >
              <Radio className="w-3.5 h-3.5" />
              Broadcast
            </button>
            <div className="relative">
              <Bell className="w-5 h-5 text-slate-400" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center font-bold">{notifications}</span>
              )}
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-orange-400 flex items-center justify-center text-black text-sm font-bold">S</div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {([
              { id: "overview", label: "Overview", icon: Map },
              { id: "complaints", label: "Complaints", icon: Users },
              { id: "schemes", label: "Welfare", icon: FileText },
              { id: "alerts", label: "Alerts", icon: AlertTriangle },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-all ${activeTab === tab.id ? "border-amber-400 text-amber-400" : "border-transparent text-slate-500 hover:text-slate-300"}`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.id === "complaints" && COMPLAINTS.filter(c => c.status === "Pending").length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-500 text-[9px] flex items-center justify-center">
                    {COMPLAINTS.filter(c => c.status === "Pending").length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Village Avg AQI", value: avgAQI, sub: avgAQI > 150 ? "⚠ Unhealthy" : "Moderate", valueClass: avgAQI > 150 ? "text-red-400" : "text-amber-400" },
            { label: "Active Sensors", value: sensors.filter(s => s.status === 'Active').length, sub: `${faultySensors} need attention`, valueClass: "text-emerald-400" },
            { label: "Open Complaints", value: COMPLAINTS.filter(c => c.status === "Pending").length, sub: "Awaiting response", valueClass: "text-orange-400" },
            { label: "Active Factories", value: factories.length, sub: `${factories.filter(f => f.complianceStatus === 'Violation').length} violations`, valueClass: "text-blue-400" },
          ].map((s) => (
            <div key={s.label} className="bg-slate-900/50 border border-white/5 rounded-xl p-4">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{s.label}</div>
              <div className={`text-3xl font-bold ${s.valueClass}`}>{s.value}</div>
              <div className="text-xs text-slate-600 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Village AQI Bar Chart */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Village-wise AQI Overview</h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={villageAQIData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                    <XAxis dataKey="name" stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} domain={[0, 300]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="aqi" name="AQI" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Factory Compliance */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Nearby Factory Compliance</h3>
              <div className="space-y-3">
                {factories.map(f => (
                  <div key={f.id} className="flex items-center justify-between bg-slate-800/30 rounded-xl p-3 border border-white/5">
                    <div>
                      <div className="text-sm font-semibold text-slate-200">{f.name}</div>
                      <div className="text-xs text-slate-500">{f.type}</div>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-lg border ${f.complianceStatus === 'Good' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : f.complianceStatus === 'Warning' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-red-400 bg-red-500/10 border-red-500/30'}`}>
                      {f.complianceStatus === 'Good' ? <CheckCircle className="w-3 h-3" /> : f.complianceStatus === 'Warning' ? <AlertTriangle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {f.complianceStatus}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Alerts */}
            {criticalEvents.length > 0 && (
              <div className="lg:col-span-2 bg-red-950/30 border border-red-500/20 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Active Emergency Events
                </h3>
                <div className="space-y-3">
                  {criticalEvents.map(evt => (
                    <div key={evt.id} className="bg-black/30 border border-red-500/20 rounded-xl p-4 flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-white">{evt.type}</div>
                        <div className="text-sm text-slate-400 mt-0.5">{evt.description}</div>
                        <div className="text-xs text-slate-500 mt-1">Radius: {evt.radiusKm.toFixed(1)} km · Confidence: {(evt.confidenceScore * 100).toFixed(0)}%</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${getSeverityStyle(evt.severity)}`}>{evt.severity}</span>
                        {evt.severity === 'Critical' && (
                          <button onClick={() => setFormModalEvent(evt)} className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg font-semibold hover:bg-red-600 transition-colors">
                            File Form-A
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "complaints" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-white">Resident Complaints</h2>
              <span className="text-xs text-slate-500">{COMPLAINTS.filter(c => c.status === "Pending").length} pending · {COMPLAINTS.filter(c => c.status === "Resolved").length} resolved</span>
            </div>
            {COMPLAINTS.map(c => (
              <div key={c.id} className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-white">{c.resident}</span>
                    <span className="text-xs text-slate-500">· {c.village}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${getSeverityStyle(c.severity)}`}>{c.severity}</span>
                  </div>
                  <p className="text-slate-400 text-sm">{c.issue}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
                    <Clock className="w-3 h-3" />
                    {c.time}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 ml-4">
                  <span className={`text-xs px-2 py-1 rounded-lg border font-semibold ${getStatusStyle(c.status)}`}>{c.status}</span>
                  {c.status !== "Resolved" && (
                    <button className="text-xs text-amber-400 hover:underline">Escalate →</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "schemes" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white mb-4">Welfare & Relief Schemes</h2>
            {WELFARE_SCHEMES.map((scheme, i) => (
              <div key={i} className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-white">{scheme.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Budget: {scheme.budget} · {scheme.beneficiaries.toLocaleString()} beneficiaries</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${scheme.status === 'Active' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-slate-400 bg-slate-800 border-white/10'}`}>
                    {scheme.status}
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all"
                    style={{ width: scheme.status === 'Active' ? `${60 + i * 15}%` : '0%' }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Progress</span>
                  <span>{scheme.status === 'Active' ? `${60 + i * 15}%` : 'Not started'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white mb-4">
              Environmental Alerts
              <TrendingUp className="inline w-5 h-5 text-red-400 ml-2" />
            </h2>
            {activeEvents.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-600/50" />
                <p>No active environmental alerts at this time</p>
              </div>
            ) : (
              activeEvents.map(evt => (
                <div key={evt.id} className={`rounded-2xl p-5 border ${evt.severity === 'Critical' ? 'border-red-500/30 bg-red-950/20' : evt.severity === 'High' ? 'border-orange-500/30 bg-orange-950/20' : 'border-yellow-500/30 bg-yellow-950/20'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className={`w-4 h-4 ${evt.severity === 'Critical' ? 'text-red-400' : 'text-orange-400'}`} />
                        <span className="font-bold text-white">{evt.type}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${getSeverityStyle(evt.severity)}`}>{evt.severity}</span>
                      </div>
                      <p className="text-slate-400 text-sm">{evt.description}</p>
                      <p className="text-xs text-slate-600 mt-1">Location: {evt.location.lat.toFixed(4)}, {evt.location.lng.toFixed(4)} · Radius: {evt.radiusKm.toFixed(1)} km</p>
                    </div>
                    <button
                      onClick={() => setShowBroadcast(true)}
                      className="text-xs text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg hover:bg-amber-500/10 transition-colors flex-shrink-0 ml-4"
                    >
                      Broadcast Alert
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {showBroadcast && <BroadcastModal onClose={() => setShowBroadcast(false)} onSend={() => setShowBroadcast(false)} />}
      {formModalEvent && <FormAModal event={formModalEvent} onClose={() => setFormModalEvent(null)} />}
    </div>
  );
}

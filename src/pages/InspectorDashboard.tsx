import { useState } from "react";
import { ArrowLeft, Bell, AlertTriangle, FileText, BarChart2, Radio, CheckCircle, XCircle, Shield, Download, Filter, Zap, Wind, Wrench, Cpu, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBackend } from "@/backend/BackendContext";
import { getSession, logout } from "@/backend/authStore";
import { BroadcastModal } from "@/components/dashboard/BroadcastModal";
import { FormAModal } from "@/components/dashboard/FormAModal";
import type { Event } from "@/types";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

const FACTORIES_EXTENDED = [
  { id: 'f1', name: 'Apex Chemicals', type: 'Chemical', consent: 'CTE-2024', expiry: '2025-03-01', pm25: 145, so2: 78, nox: 92, compliance: 'Warning', lastInspection: '2024-12-10' },
  { id: 'f2', name: 'Gujarat Paper Mills', type: 'Pulp & Paper', consent: 'CTE-2023', expiry: '2025-07-15', pm25: 62, so2: 22, nox: 38, compliance: 'Good', lastInspection: '2024-11-20' },
  { id: 'f3', name: 'Zentis Pharmaceuticals', type: 'Pharma', consent: 'CTE-2022', expiry: '2024-12-31', pm25: 312, so2: 145, nox: 188, compliance: 'Violation', lastInspection: '2024-09-05' },
];

const INSPECTION_HISTORY = [
  { date: "2025-02", compliance: 72 },
  { date: "2025-03", compliance: 65 },
  { date: "2025-04", compliance: 58 },
  { date: "2025-05", compliance: 80 },
  { date: "2025-06", compliance: 74 },
];

function getPollutantRadarData(factory: typeof FACTORIES_EXTENDED[0]) {
  return [
    { pollutant: "PM2.5", value: Math.min(100, (factory.pm25 / 300) * 100) },
    { pollutant: "SO₂", value: Math.min(100, (factory.so2 / 150) * 100) },
    { pollutant: "NOx", value: Math.min(100, (factory.nox / 200) * 100) },
    { pollutant: "PM10", value: Math.min(100, (factory.pm25 * 1.4 / 400) * 100) },
    { pollutant: "CO", value: Math.min(100, Math.random() * 60) },
  ];
}

function ComplianceColor(status: string) {
  if (status === 'Good') return { badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle, color: "text-emerald-400" };
  if (status === 'Warning') return { badge: "text-amber-400 bg-amber-500/10 border-amber-500/30", icon: AlertTriangle, color: "text-amber-400" };
  return { badge: "text-red-400 bg-red-500/10 border-red-500/30", icon: XCircle, color: "text-red-400" };
}

export default function InspectorDashboard() {
  const navigate = useNavigate();
  const session = getSession();
  const { nodes, inference, classification, faultReports, tickets, dispatch, resolve } = useBackend();
  const sensors = nodes;
  const activeEvents: Event[] = [];
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [formModalEvent, setFormModalEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "factories" | "reports" | "enforcement" | "faults">("overview");
  const [selectedFactory, setSelectedFactory] = useState<typeof FACTORIES_EXTENDED[0] | null>(null);

  const criticalEvents = activeEvents.filter(e => e.severity === 'Critical');
  const violatingFactories = FACTORIES_EXTENDED.filter(f => f.compliance === 'Violation').length;
  const avgAQI = sensors.length ? Math.round(sensors.filter(s => s.status === 'Active').reduce((a, b) => a + b.aqi, 0) / sensors.filter(s => s.status === 'Active').length) : 0;

  return (
    <div className="min-h-screen bg-[#030914] text-white font-sans">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-600/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-[120px]" />
        {criticalEvents.length > 0 && <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-red-600/5 rounded-full blur-[120px]" />}
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg hover:bg-white/5 transition-colors mr-1">
              <ArrowLeft className="w-4 h-4 text-slate-400" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight">EcoSentinel</div>
              <div className="text-xs text-blue-400 font-medium">GSPCB Inspector Command Center</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {criticalEvents.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold animate-pulse">
                <Zap className="w-3.5 h-3.5" />
                {criticalEvents.length} Critical Event{criticalEvents.length > 1 ? 's' : ''}
              </div>
            )}
            <button
              onClick={() => setShowBroadcast(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 text-xs font-semibold transition-all"
            >
              <Radio className="w-3.5 h-3.5" />
              Emergency Broadcast
            </button>
            <Bell className="w-5 h-5 text-slate-400 cursor-pointer" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-violet-400 flex items-center justify-center text-white text-sm font-bold">
              {session?.name?.[0] ?? 'I'}
            </div>
            <button onClick={() => { logout(); navigate('/auth'); }} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" title="Sign out">
              <LogOut className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {([
              { id: "overview", label: "Command Overview", icon: BarChart2 },
              { id: "factories", label: "Factory Audit", icon: Shield },
              { id: "reports", label: "Reports & Forms", icon: FileText },
              { id: "enforcement", label: "Enforcement", icon: AlertTriangle },
              { id: "faults", label: "Sensor Faults", icon: Cpu },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-all ${activeTab === tab.id ? "border-blue-400 text-blue-400" : "border-transparent text-slate-500 hover:text-slate-300"}`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Zone Avg AQI", value: avgAQI, sub: avgAQI > 150 ? "⚠ Unhealthy" : "Under Control", valueClass: avgAQI > 150 ? "text-red-400" : "text-blue-400" },
            { label: "Active Sensors", value: sensors.filter(s => s.status === 'Active').length, sub: `${sensors.filter(s => s.status !== 'Active').length} issues`, valueClass: "text-emerald-400" },
            { label: "Violations", value: violatingFactories, sub: "Require action now", valueClass: "text-red-400" },
            { label: "Critical Events", value: criticalEvents.length, sub: "In monitored zone", valueClass: criticalEvents.length > 0 ? "text-red-400 animate-pulse" : "text-slate-400" },
          ].map((s) => (
            <div key={s.label} className={`bg-slate-900/50 border rounded-xl p-4 ${s.label === 'Violations' && violatingFactories > 0 ? 'border-red-500/20' : 'border-white/5'}`}>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{s.label}</div>
              <div className={`text-3xl font-bold ${s.valueClass}`}>{s.value}</div>
              <div className="text-xs text-slate-600 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Trend */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Zone Compliance Score Trend (%)</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={INSPECTION_HISTORY}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                    <XAxis dataKey="date" stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis domain={[40, 100]} stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '8px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="compliance" name="Compliance %" stroke="#60a5fa" strokeWidth={2.5} dot={{ r: 4, fill: '#60a5fa' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Factories Quick View */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Factory Compliance Status</h3>
              <div className="space-y-3">
                {FACTORIES_EXTENDED.map(f => {
                  const { badge, icon: Icon } = ComplianceColor(f.compliance);
                  return (
                    <button
                      key={f.id}
                      onClick={() => { setSelectedFactory(f); setActiveTab("factories"); }}
                      className="w-full flex items-center justify-between bg-slate-800/30 hover:bg-slate-800/60 rounded-xl p-3 border border-white/5 transition-all text-left"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-200">{f.name}</div>
                        <div className="text-xs text-slate-500">{f.type} · Consent: {f.consent}</div>
                      </div>
                      <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border ${badge}`}>
                        <Icon className="w-3 h-3" />
                        {f.compliance}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Events */}
            {activeEvents.length > 0 && (
              <div className="lg:col-span-2 bg-red-950/20 border border-red-500/15 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Live Incident Feed
                  </h3>
                  <button onClick={() => setShowBroadcast(true)} className="text-xs text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/10 flex items-center gap-1.5">
                    <Radio className="w-3 h-3" /> Broadcast
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeEvents.map(evt => (
                    <div key={evt.id} className="bg-black/30 p-4 rounded-xl border border-red-500/15">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-semibold text-white text-sm">{evt.type}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${evt.severity === 'Critical' ? 'bg-red-500/20 text-red-400' : evt.severity === 'High' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{evt.severity}</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{evt.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">Confidence: {(evt.confidenceScore * 100).toFixed(0)}%</span>
                        {evt.severity === 'Critical' && (
                          <button onClick={() => setFormModalEvent(evt)} className="text-[10px] bg-red-500 text-white px-2 py-1 rounded font-bold hover:bg-red-600">
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

        {activeTab === "factories" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Factory List */}
            <div className="lg:col-span-1 space-y-3">
              {FACTORIES_EXTENDED.map(f => {
                const { badge, icon: Icon } = ComplianceColor(f.compliance);
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFactory(selectedFactory?.id === f.id ? null : f)}
                    className={`w-full bg-slate-900/50 rounded-2xl p-4 border text-left transition-all ${selectedFactory?.id === f.id ? 'border-blue-500/40 bg-blue-500/5' : 'border-white/5 hover:border-white/10'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-white">{f.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{f.type}</div>
                      </div>
                      <span className={`flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 rounded border ${badge}`}>
                        <Icon className="w-3 h-3" />
                        {f.compliance}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-2">Consent: {f.consent} · Exp: {f.expiry}</div>
                    <div className="text-xs text-slate-600">Last Inspection: {f.lastInspection}</div>
                  </button>
                );
              })}
            </div>

            {/* Factory Detail */}
            <div className="lg:col-span-2">
              {selectedFactory ? (
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white">{selectedFactory.name}</h2>
                      <p className="text-xs text-slate-500 mt-0.5">{selectedFactory.type} · Consent: {selectedFactory.consent} · Expires: {selectedFactory.expiry}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${ComplianceColor(selectedFactory.compliance).badge}`}>
                      {selectedFactory.compliance}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { label: "PM2.5", value: selectedFactory.pm25, unit: "µg/m³", limit: 100 },
                      { label: "SO₂", value: selectedFactory.so2, unit: "µg/m³", limit: 80 },
                      { label: "NOx", value: selectedFactory.nox, unit: "µg/m³", limit: 80 },
                    ].map(m => (
                      <div key={m.label} className={`rounded-xl p-3 border ${m.value > m.limit ? 'bg-red-950/30 border-red-500/20' : 'bg-slate-800/30 border-white/5'}`}>
                        <div className="text-xs text-slate-500 mb-1">{m.label}</div>
                        <div className={`text-2xl font-bold ${m.value > m.limit ? 'text-red-400' : 'text-emerald-400'}`}>{m.value}</div>
                        <div className="text-[10px] text-slate-600">{m.unit} · Limit: {m.limit}</div>
                        {m.value > m.limit && <div className="text-[10px] text-red-400 font-bold mt-0.5">⚠ EXCEEDS LIMIT</div>}
                      </div>
                    ))}
                  </div>

                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Pollutant Radar Profile</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={getPollutantRadarData(selectedFactory)}>
                        <PolarGrid stroke="#ffffff10" />
                        <PolarAngleAxis dataKey="pollutant" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <Radar name="Emissions" dataKey="value" stroke={selectedFactory.compliance === 'Violation' ? '#ef4444' : '#60a5fa'} fill={selectedFactory.compliance === 'Violation' ? '#ef4444' : '#60a5fa'} fillOpacity={0.2} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '8px', fontSize: '12px' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex gap-3 mt-5">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-sm font-semibold hover:bg-blue-500/20 transition-colors">
                      <Download className="w-4 h-4" />
                      Download Report
                    </button>
                    {selectedFactory.compliance === 'Violation' && (
                      <button
                        onClick={() => setFormModalEvent(activeEvents[0] || {
                          id: `f-${selectedFactory.id}`,
                          type: 'Industrial Spillage',
                          severity: 'Critical',
                          location: { lat: 21.6264, lng: 73.0033 },
                          radiusKm: 2,
                          timestamp: new Date(),
                          description: `Norms violation at ${selectedFactory.name}`,
                          confidenceScore: 0.99,
                        })}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        Issue Form-A
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-80 flex flex-col items-center justify-center text-center bg-slate-900/30 rounded-2xl border border-white/5">
                  <Shield className="w-12 h-12 text-slate-700 mb-4" />
                  <p className="text-slate-500">Select a factory from the list to view its audit details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Reports & Compliance Forms</h2>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-800 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                  <Filter className="w-3 h-3" />
                  Filter
                </button>
                <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                  <Download className="w-3 h-3" />
                  Export All
                </button>
              </div>
            </div>
            {[
              { name: "Monthly Ambient Air Quality Report", factory: "Zone-wide", date: "Apr 2025", status: "Ready", type: "PDF" },
              { name: "Factory Violation Notice - Zentis Pharma", factory: "Zentis Pharmaceuticals", date: "Apr 2025", status: "Pending Signature", type: "Form-A" },
              { name: "Quarterly Compliance Summary", factory: "All Factories", date: "Q1 2025", status: "Ready", type: "PDF" },
              { name: "Public Health Advisory - Vapi Zone", factory: "Public", date: "Mar 2025", status: "Published", type: "Advisory" },
            ].map((r, i) => (
              <div key={i} className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{r.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{r.factory} · {r.date} · {r.type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-lg border font-medium ${r.status === 'Ready' || r.status === 'Published' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>{r.status}</span>
                  <button className="text-xs text-blue-400 flex items-center gap-1 hover:underline">
                    <Download className="w-3 h-3" /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "enforcement" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">Enforcement Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Show Cause Notices Issued", value: 2, icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
                { label: "Factory Shutdowns Ordered", value: 1, icon: XCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
                { label: "Consent Renewals Pending", value: 3, icon: Shield, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
              ].map(s => (
                <div key={s.label} className={`rounded-2xl p-5 border ${s.bg}`}>
                  <s.icon className={`w-6 h-6 ${s.color} mb-3`} />
                  <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            {FACTORIES_EXTENDED.filter(f => f.compliance !== 'Good').map(f => {
              const { badge, icon: Icon, color } = ComplianceColor(f.compliance);
              return (
                <div key={f.id} className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${color}`} />
                      <div>
                        <div className="font-bold text-white">{f.name}</div>
                        <div className="text-xs text-slate-500">{f.type}</div>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${badge}`}>{f.compliance}</span>
                  </div>
                  <div className="text-sm text-slate-400 mb-3">
                    {f.compliance === 'Violation' ? `Critical norms violation detected. PM2.5 at ${f.pm25} µg/m³ (300% over limit). Immediate action required.` : `Minor compliance warning. PM2.5 at ${f.pm25} µg/m³ (45% over limit). Notice issued.`}
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors">Issue Notice</button>
                    {f.compliance === 'Violation' && (
                      <button
                        onClick={() => setFormModalEvent({
                          id: `enforcement-${f.id}`,
                          type: 'Industrial Spillage',
                          severity: 'Critical',
                          location: { lat: 21.6264, lng: 73.0033 },
                          radiusKm: 2,
                          timestamp: new Date(),
                          description: `Severe pollution at ${f.name}`,
                          confidenceScore: 0.99,
                        })}
                        className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                      >
                        File Form-A
                      </button>
                    )}
                    <button onClick={() => setShowBroadcast(true)} className="px-3 py-1.5 text-xs bg-slate-800 border border-white/10 text-slate-400 rounded-lg hover:bg-slate-700 transition-colors">Broadcast Alert</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "faults" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-400" /> Sensor Fault Management
              </h2>
              <span className="text-xs px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg">
                {faultReports.filter(f => f.priority === 'P1-Critical').length} Critical faults
              </span>
            </div>

            {/* Source Inference Panel */}
            {inference && (
              <div className="bg-slate-900/50 border border-sky-500/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Wind className="w-4 h-4 text-sky-400" />
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Source Inference (Wind Back-Trajectory)</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Wind from', value: inference.windVectorLabel },
                    { label: 'Source bearing', value: `${inference.bearingDeg}°` },
                    { label: 'Est. distance', value: `${inference.distanceKm} km` },
                    { label: 'Confidence', value: `${(inference.confidence * 100).toFixed(0)}%` },
                  ].map(item => (
                    <div key={item.label} className="bg-slate-800/50 rounded-xl p-3">
                      <div className="text-xs text-slate-500">{item.label}</div>
                      <div className="text-sm font-bold text-white mt-0.5">{item.value}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 rounded-xl bg-sky-500/5 border border-sky-500/20 text-xs text-sky-300">{inference.description}</div>
                {classification && (
                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <span className="text-slate-500">Classification:</span>
                    <span className="font-bold text-white">{classification.type}</span>
                    <span className={`px-2 py-0.5 rounded-lg font-bold border ${
                      classification.riskLevel === 'Critical' ? 'text-red-400 bg-red-500/10 border-red-500/30' :
                      classification.riskLevel === 'High' ? 'text-orange-400 bg-orange-500/10 border-orange-500/30' :
                      'text-amber-400 bg-amber-500/10 border-amber-500/30'
                    }`}>{classification.riskLevel} Risk</span>
                    <span className="text-slate-500 ml-auto">{(classification.confidence * 100).toFixed(0)}% confidence</span>
                  </div>
                )}
              </div>
            )}

            {/* Active Faults */}
            {faultReports.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-600/50" />
                <p>All sensor nodes operating normally</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active Faults ({faultReports.length})</h3>
                {faultReports.map(fault => (
                  <div key={fault.sensorId} className={`rounded-2xl p-5 border ${
                    fault.priority === 'P1-Critical' ? 'border-red-500/30 bg-red-950/20' :
                    fault.priority === 'P2-High' ? 'border-orange-500/30 bg-orange-950/20' :
                    'border-yellow-500/30 bg-yellow-950/10'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Cpu className={`w-4 h-4 ${fault.priority === 'P1-Critical' ? 'text-red-400' : 'text-orange-400'}`} />
                          <span className="font-bold text-white">{fault.sensorName}</span>
                          <span className="text-xs text-slate-500">· {fault.village}</span>
                        </div>
                        <div className="text-sm text-slate-400 mt-1">{fault.description}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${
                          fault.priority === 'P1-Critical' ? 'text-red-400 bg-red-500/10 border-red-500/30' :
                          fault.priority === 'P2-High' ? 'text-orange-400 bg-orange-500/10 border-orange-500/30' :
                          'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
                        }`}>{fault.priority}</span>
                        <span className="text-xs text-slate-600">{fault.faultType}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => dispatch(fault)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-colors"
                      >
                        <Wrench className="w-3 h-3" /> Dispatch Engineer
                      </button>
                      <button onClick={() => setShowBroadcast(true)} className="px-3 py-1.5 text-xs bg-slate-800 border border-white/10 text-slate-400 rounded-lg hover:bg-slate-700 transition-colors">
                        Broadcast Alert
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Maintenance Ticket Queue */}
            {tickets.length > 0 && (
              <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Maintenance Ticket Queue</h3>
                <div className="space-y-3">
                  {tickets.slice(0, 8).map(ticket => (
                    <div key={ticket.id} className="bg-slate-800/30 rounded-xl p-4 flex items-center justify-between border border-white/5">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-200 text-sm">{ticket.id}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            ticket.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-400' :
                            ticket.status === 'InProgress' ? 'bg-blue-500/20 text-blue-400' :
                            ticket.status === 'Dispatched' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-slate-500/20 text-slate-400'
                          }`}>{ticket.status}</span>
                        </div>
                        <div className="text-xs text-slate-500">{ticket.faultReport.sensorName} · {ticket.assignedTo}</div>
                        <div className="text-xs text-slate-600">ETA: {ticket.etaMinutes} min</div>
                      </div>
                      {ticket.status !== 'Resolved' && (
                        <button
                          onClick={() => resolve(ticket.id, 'Resolved by inspector')}
                          className="text-xs bg-emerald-600 text-white px-2 py-1 rounded-lg hover:bg-emerald-500 transition-colors font-semibold"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {showBroadcast && <BroadcastModal onClose={() => setShowBroadcast(false)} onSend={() => setShowBroadcast(false)} />}
      {formModalEvent && <FormAModal event={formModalEvent} onClose={() => setFormModalEvent(null)} />}
    </div>
  );
}

import { useState } from "react";
import { Activity, ArrowLeft, Bell, AlertTriangle, FileText, BarChart2, Radio, CheckCircle, XCircle, Shield, Download, Filter, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRealTimeData } from "@/hooks/useRealTimeData";
import { BroadcastModal } from "@/components/dashboard/BroadcastModal";
import { FormAModal } from "@/components/dashboard/FormAModal";
import type { Event } from "@/types";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

import { HeaderActions } from "@/components/dashboard/HeaderActions";
import { getExtendedFactories, getInspectorStats, updateInspectorStats, saveExtendedFactory, updateExtendedFactory } from "@/lib/store";
import jsPDF from "jspdf";

function getPollutantRadarData(factory: any) {
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
  const { sensors, activeEvents } = useRealTimeData();
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showAddFactory, setShowAddFactory] = useState(false);
  const [newFactoryData, setNewFactoryData] = useState({ name: '', type: 'Chemical', pm25: 50, so2: 30, nox: 40 });
  const [formModalEvent, setFormModalEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "factories" | "reports" | "enforcement">("overview");
  const [selectedFactory, setSelectedFactory] = useState<any>(null);

  const FACTORIES_EXTENDED = getExtendedFactories();
  const inspectorStats = getInspectorStats();

  const complianceScore = Math.floor((FACTORIES_EXTENDED.filter((f: any) => f.compliance === 'Good').length / Math.max(1, FACTORIES_EXTENDED.length)) * 100);
  const INSPECTION_HISTORY = [
    { date: "2025-02", compliance: 72 },
    { date: "2025-03", compliance: 65 },
    { date: "2025-04", compliance: 58 },
    { date: "2025-05", compliance: 80 },
    { date: "2025-06", compliance: complianceScore },
  ];

  const criticalEvents = activeEvents.filter(e => e.severity === 'Critical');
  const violatingFactories = FACTORIES_EXTENDED.filter((f: any) => f.compliance === 'Violation').length;
  const avgAQI = sensors.length ? Math.round(sensors.filter(s => s.status === 'Active').reduce((a, b) => a + b.aqi, 0) / Math.max(1, sensors.filter(s => s.status === 'Active').length)) : 0;

  const generatePDF = (factory: any) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(`Quality Report: ${factory.name}`, 14, 22);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Date of Report: ${new Date().toLocaleDateString()}`, 14, 32);
    doc.text(`Factory Type: ${factory.type}`, 14, 40);
    doc.text(`Consent Info: ${factory.consent} (Exp: ${factory.expiry})`, 14, 48);

    doc.setFont("helvetica", "bold");
    doc.text(`Pollutant Readings:`, 14, 60);
    doc.setFont("helvetica", "normal");
    doc.text(`PM2.5 Level: ${factory.pm25} µg/m³`, 14, 68);
    doc.text(`SO2 Level: ${factory.so2} µg/m³`, 14, 76);
    doc.text(`NOx Level: ${factory.nox} µg/m³`, 14, 84);

    doc.setFont("helvetica", "bold");
    doc.text(`COMPLIANCE STATUS: ${factory.compliance.toUpperCase()}`, 14, 100);

    if (factory.compliance === "Violation") {
      doc.setTextColor(255, 0, 0);
      doc.text(`WARNING: This facility requires immediate action.`, 14, 110);
    }

    doc.save(`${factory.name.replace(/\s+/g, '_')}_AQI_Report.pdf`);
  };

  const handleAddFactory = (e: React.FormEvent) => {
    e.preventDefault();
    const compliance = newFactoryData.pm25 > 150 ? (newFactoryData.pm25 > 250 ? 'Violation' : 'Warning') : 'Good';
    saveExtendedFactory({
      id: `f-${Math.random().toString(36).substr(2, 9)}`,
      name: newFactoryData.name || 'Unknown Factory',
      type: newFactoryData.type,
      consent: 'CTE-2026',
      expiry: '2027-01-01',
      pm25: newFactoryData.pm25,
      so2: newFactoryData.so2,
      nox: newFactoryData.nox,
      compliance: compliance,
      lastInspection: new Date().toISOString().split('T')[0]
    });
    setShowAddFactory(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background text-foreground text-foreground font-sans">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-600/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-[120px]" />
        {criticalEvents.length > 0 && <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-red-600/5 rounded-full blur-[120px]" />}
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-border-light bg-background backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg hover:bg-white/5 transition-colors mr-1">
              <ArrowLeft className="w-4 h-4 text-secondary" />
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
              className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 text-xs font-semibold transition-all mr-2"
            >
              <Radio className="w-3.5 h-3.5" />
              Emergency Broadcast
            </button>
            <HeaderActions />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="relative z-10 border-b border-border-light bg-background backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {([
              { id: "overview", label: "Command Overview", icon: BarChart2 },
              { id: "factories", label: "Factory Audit", icon: Shield },
              { id: "reports", label: "Reports & Forms", icon: FileText },
              { id: "enforcement", label: "Enforcement", icon: AlertTriangle },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-all ${activeTab === tab.id ? "border-blue-400 text-blue-400" : "border-transparent text-secondary hover:text-slate-300"}`}
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
            { label: "Critical Events", value: criticalEvents.length, sub: "In monitored zone", valueClass: criticalEvents.length > 0 ? "text-red-400 animate-pulse" : "text-secondary" },
          ].map((s) => (
            <div key={s.label} className={`bg-background border border-border-light shadow-sm border rounded-xl p-4 ${s.label === 'Violations' && violatingFactories > 0 ? 'border-red-500/20' : 'border-border-light'}`}>
              <div className="text-xs text-secondary uppercase tracking-wider mb-1">{s.label}</div>
              <div className={`text-3xl font-bold ${s.valueClass}`}>{s.value}</div>
              <div className="text-xs text-slate-600 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Trend */}
            <div className="bg-background border border-border-light shadow-sm border border-border-light rounded-2xl p-5">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Zone Compliance Score Trend (%)</h3>
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
            <div className="bg-background border border-border-light shadow-sm border border-border-light rounded-2xl p-5">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Factory Compliance Status</h3>
              <div className="space-y-3">
                {FACTORIES_EXTENDED.map((f: any) => {
                  const { badge, icon: Icon } = ComplianceColor(f.compliance);
                  return (
                    <button
                      key={f.id}
                      onClick={() => { setSelectedFactory(f); setActiveTab("factories"); }}
                      className="w-full flex items-center justify-between bg-slate-800/30 hover:bg-slate-800/60 rounded-xl p-3 border border-border-light transition-all text-left"
                    >
                      <div>
                        <div className="text-sm font-semibold text-foreground">{f.name}</div>
                        <div className="text-xs text-secondary">{f.type} · Consent: {f.consent}</div>
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
                    <div key={evt.id} className="bg-background p-4 rounded-xl border border-red-500/15">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-semibold text-foreground text-sm">{evt.type}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${evt.severity === 'Critical' ? 'bg-red-500/20 text-red-400' : evt.severity === 'High' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{evt.severity}</span>
                      </div>
                      <p className="text-xs text-secondary mb-2">{evt.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">Confidence: {(evt.confidenceScore * 100).toFixed(0)}%</span>
                        {evt.severity === 'Critical' && (
                          <button onClick={() => setFormModalEvent(evt)} className="text-[10px] bg-red-500 text-foreground px-2 py-1 rounded font-bold hover:bg-red-600">
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
          <div className="space-y-4">
            <div className="flex justify-between items-end mb-2">
              <h2 className="text-lg font-bold text-foreground">Registered Factories</h2>
              <button onClick={() => setShowAddFactory(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-foreground text-xs font-semibold rounded-lg transition-colors">
                + Register Factory
              </button>
            </div>

            {showAddFactory && (
              <div className="bg-background border border-border-light shadow-sm border border-border-light rounded-xl p-4 mb-4">
                <h3 className="text-sm font-bold text-foreground mb-3">New Factory Audit Registry</h3>
                <form onSubmit={handleAddFactory} className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <input type="text" placeholder="Factory Name" value={newFactoryData.name} onChange={e => setNewFactoryData({ ...newFactoryData, name: e.target.value })} className="col-span-2 md:col-span-2 bg-slate-800 text-foreground text-xs p-2 rounded border border-border-light" required />
                  <select value={newFactoryData.type} onChange={e => setNewFactoryData({ ...newFactoryData, type: e.target.value })} className="bg-slate-800 text-foreground text-xs p-2 rounded border border-border-light" required>
                    <option>Chemical</option> <option>Pharma</option> <option>Pulp & Paper</option>
                  </select>
                  <input type="number" placeholder="PM2.5" value={newFactoryData.pm25} onChange={e => setNewFactoryData({ ...newFactoryData, pm25: +e.target.value })} className="bg-slate-800 text-foreground text-xs p-2 rounded border border-border-light" required />
                  <div className="flex gap-2 col-span-2 md:col-span-1">
                    <button type="submit" className="flex-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs hover:bg-emerald-500/30">Save</button>
                    <button type="button" onClick={() => setShowAddFactory(false)} className="flex-1 bg-slate-800 text-secondary border border-border-light rounded text-xs hover:text-foreground">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Factory List */}
              <div className="lg:col-span-1 space-y-3">
                {FACTORIES_EXTENDED.map((f: any) => {
                  const { badge, icon: Icon } = ComplianceColor(f.compliance);
                  return (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFactory(selectedFactory?.id === f.id ? null : f)}
                      className={`w-full bg-background border border-border-light shadow-sm rounded-2xl p-4 border text-left transition-all ${selectedFactory?.id === f.id ? 'border-blue-500/40 bg-blue-500/5' : 'border-border-light hover:border-border-light'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-foreground">{f.name}</div>
                          <div className="text-xs text-secondary mt-0.5">{f.type}</div>
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
                  <div className="bg-background border border-border-light shadow-sm border border-border-light rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-foreground">{selectedFactory.name}</h2>
                        <p className="text-xs text-secondary mt-0.5">{selectedFactory.type} · Consent: {selectedFactory.consent} · Expires: {selectedFactory.expiry}</p>
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
                        <div key={m.label} className={`rounded-xl p-3 border ${m.value > m.limit ? 'bg-red-950/30 border-red-500/20' : 'bg-slate-800/30 border-border-light'}`}>
                          <div className="text-xs text-secondary mb-1">{m.label}</div>
                          <div className={`text-2xl font-bold ${m.value > m.limit ? 'text-red-400' : 'text-emerald-400'}`}>{m.value}</div>
                          <div className="text-[10px] text-slate-600">{m.unit} · Limit: {m.limit}</div>
                          {m.value > m.limit && <div className="text-[10px] text-red-400 font-bold mt-0.5">⚠ EXCEEDS LIMIT</div>}
                        </div>
                      ))}
                    </div>

                    <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-3">Pollutant Radar Profile</h3>
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
                      <button onClick={() => generatePDF(selectedFactory)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-sm font-semibold hover:bg-blue-500/20 transition-colors">
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
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500 text-foreground rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          Issue Form-A
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-80 flex flex-col items-center justify-center text-center bg-background border border-border-light shadow-sm rounded-2xl border border-border-light">
                    <Shield className="w-12 h-12 text-slate-700 mb-4" />
                    <p className="text-secondary">Select a factory from the list to view its audit details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Reports & Compliance Forms</h2>
              <div className="flex gap-2">
                <button onClick={() => {
                  const doc = new jsPDF();
                  doc.text("All Reports Data", 14, 22);
                  doc.save("all_reports.pdf");
                }} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-500 text-foreground rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                  <Download className="w-3 h-3" />
                  Download Report
                </button>
              </div>
            </div>
            {[
              { name: "Monthly Ambient Air Quality Report", factory: "Zone-wide", date: "Apr 2025", status: "Ready", type: "PDF" },
              { name: "Factory Violation Notice - Zentis Pharma", factory: "Zentis Pharmaceuticals", date: "Apr 2025", status: "Pending Signature", type: "Form-A" },
              { name: "Quarterly Compliance Summary", factory: "All Factories", date: "Q1 2025", status: "Ready", type: "PDF" },
              { name: "Public Health Advisory - Vapi Zone", factory: "Public", date: "Mar 2025", status: "Published", type: "Advisory" },
            ].map((r, i) => (
              <div key={i} className="bg-background border border-border-light shadow-sm border border-border-light rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{r.name}</div>
                    <div className="text-xs text-secondary mt-0.5">{r.factory} · {r.date} · {r.type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-lg border font-medium ${r.status === 'Ready' || r.status === 'Published' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>{r.status}</span>
                  <button onClick={() => {
                    const doc = new jsPDF();
                    doc.text("Report: " + r.name, 14, 22);
                    doc.save(r.name.replace(/\s+/g, '_') + '.pdf');
                  }} className="text-xs text-blue-400 flex items-center gap-1 hover:underline">
                    <Download className="w-3 h-3" /> Download Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "enforcement" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-foreground">Enforcement Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Show Cause Notices Issued", value: inspectorStats.showCauseNotices, icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", field: 'showCauseNotices' },
                { label: "Factory Shutdowns Ordered", value: inspectorStats.shutdowns, icon: XCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", field: 'shutdowns' },
                { label: "Consent Renewals Pending", value: inspectorStats.renewals, icon: Shield, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", field: 'renewals' },
              ].map(s => (
                <div key={s.label} className={`rounded-2xl p-5 border relative ${s.bg}`}>
                  <button onClick={() => { updateInspectorStats({ [s.field]: s.value + 1 }); window.location.reload(); }} className={`absolute top-4 right-4 ${s.color} hover:bg-white/10 rounded border border-border-light w-6 h-6 flex items-center justify-center font-bold text-lg bg-white/5`} title="Add">+
                  </button>
                  <s.icon className={`w-6 h-6 ${s.color} mb-3`} />
                  <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-secondary mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            {FACTORIES_EXTENDED.filter((f: any) => f.compliance !== 'Good').map((f: any) => {
              const { badge, icon: Icon, color } = ComplianceColor(f.compliance);
              return (
                <div key={f.id} className="bg-background border border-border-light shadow-sm border border-border-light rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${color}`} />
                      <div>
                        <div className="font-bold text-foreground">{f.name}</div>
                        <div className="text-xs text-secondary">{f.type}</div>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${badge}`}>{f.compliance}</span>
                  </div>
                  <div className="text-sm text-secondary mb-3">
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
                        className="px-3 py-1.5 text-xs bg-red-500 text-foreground rounded-lg hover:bg-red-600 transition-colors font-semibold"
                      >
                        File Form-A
                      </button>
                    )}
                    <button onClick={() => setShowBroadcast(true)} className="px-3 py-1.5 text-xs bg-slate-800 border border-border-light text-secondary rounded-lg hover:bg-slate-700 transition-colors">Broadcast Alert</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showBroadcast && <BroadcastModal onClose={() => setShowBroadcast(false)} onSend={() => setShowBroadcast(false)} />}
      {formModalEvent && <FormAModal event={formModalEvent} onClose={() => setFormModalEvent(null)} />}
    </div>
  );
}

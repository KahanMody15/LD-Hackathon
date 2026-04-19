import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Shield, Bell, Radio, AlertTriangle, CheckCircle, XCircle, BarChart2, FileText, Anchor, Download, Filter, Plus, FileSignature } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getCurrentSession, clearSession, getExtendedFactories, saveExtendedFactory, getInspectorStats, updateInspectorStats, getSarpanchStats } from "@/lib/store";

const lineData = [
  { name: "2025-02", score: 73 },
  { name: "2025-03", score: 68 },
  { name: "2025-04", score: 62 },
  { name: "2025-05", score: 81 },
  { name: "2025-06", score: 38 },
];

export default function InspectorDashboard() {
  const navigate = useNavigate();
  const session = getCurrentSession();
  const factoriesList = getExtendedFactories();
  const stats = getInspectorStats();
  const sarpanchStats = getSarpanchStats(); // Added

  const [activeTab, setActiveTab] = useState("Command Overview");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifyMenuRef = useRef<HTMLDivElement>(null);

  const [selectedFactoryId, setSelectedFactoryId] = useState<string | null>(null);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isForm2AModalOpen, setIsForm2AModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState<{type: 'Notice' | 'Shutdown' | 'Renewal'} | null>(null);

  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastNumbers, setBroadcastNumbers] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState<{type: 'success'|'error', msg: string} | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifyMenuRef.current && !notifyMenuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!session || session.role !== 'Inspector') {
      navigate('/auth');
    }
  }, [session, navigate]);

  const handleLogout = () => {
    clearSession();
    navigate('/auth');
  };

  const getZoneAQI = () => {
    if (activeTab === "Factory Audit") return 152;
    if (activeTab === "Reports & Forms") return 159;
    if (activeTab === "Enforcement") return 169;
    return 79; // Command Overview
  };

  const aqiColor = getZoneAQI() > 100 ? "text-red-400" : "text-[#3B82F6]";
  const aqiStatus = getZoneAQI() > 100 ? "Unhealthy" : "Under Control";

  const handleDownloadPDF = (reportName: string) => {
    const text = `GSPCB Official Document\n\nReport: ${reportName}\nGenerated on: ${new Date().toLocaleString()}\nBy: ${session?.name}\n\n[CONFIDENTIAL]`;
    const blob = new Blob([text], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRegisterFactory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newFac = {
      id: `f${Date.now()}`,
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      consent: formData.get('consent') as string,
      expiry: formData.get('expiry') as string,
      pm25: 0, so2: 0, nox: 0,
      compliance: 'Warning',
      lastInspection: new Date().toISOString().split('T')[0]
    };
    saveExtendedFactory(newFac);
    setIsRegisterModalOpen(false);
  };

  const handleActionForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isActionModalOpen?.type === 'Notice') {
      updateInspectorStats({ showCauseNotices: stats.showCauseNotices + 1 });
    } else if (isActionModalOpen?.type === 'Shutdown') {
      updateInspectorStats({ shutdowns: stats.shutdowns + 1 });
    } else if (isActionModalOpen?.type === 'Renewal') {
      updateInspectorStats({ renewals: stats.renewals + 1 });
    }
    setIsActionModalOpen(null);
  };

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setBroadcastStatus(null);
    
    // Split by comma and clean up whitespace
    const numbers = broadcastNumbers.split(',').map(n => n.strip ? n.strip() : n.trim()).filter(n => n);
    
    if (numbers.length === 0) {
      setBroadcastStatus({ type: 'error', msg: 'Please provide at least one valid phone number.' });
      setIsSending(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numbers, message: broadcastMessage })
      });
      const data = await res.json();
      
      if (data.errors && data.errors.length > 0) {
         const errorDetails = data.errors.map((e:any) => `${e.number} (${e.error})`).join(', ');
         setBroadcastStatus({ type: 'error', msg: `Failed to send. Reason: ${errorDetails}`});
      } else {
         setBroadcastStatus({ type: 'success', msg: `Successfully broadcasted to ${data.success.length} numbers!` });
         setTimeout(() => {
           setIsBroadcastModalOpen(false);
           setBroadcastNumbers("");
           setBroadcastMessage("");
           setBroadcastStatus(null);
         }, 2000);
      }
    } catch (err) {
      setBroadcastStatus({ type: 'error', msg: 'Failed to connect to the broadcasting server.' });
    }
    setIsSending(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Command Overview":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="lg:col-span-2 bg-[#0D1322] border border-[#1A2234] rounded-2xl p-6 shadow-lg min-h-[400px]">
              <h3 className="text-sm font-bold text-white tracking-widest uppercase mb-8">Zone Compliance Score Trend (%)</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1A2234" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 10}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 10}} dx={-10} domain={[30, 100]} ticks={[33, 53, 73, 100]} />
                    <Tooltip cursor={{fill: '#14223A', strokeWidth: 2}} contentStyle={{backgroundColor: '#0A0F1A', border: '1px solid #1E3050', borderRadius: '8px'}} />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', stroke: '#0D1322', strokeWidth: 2}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-1 bg-[#0D1322] border border-[#1A2234] rounded-2xl p-6 shadow-lg">
              <h3 className="text-sm font-bold text-white tracking-widest uppercase mb-6">Factory Compliance Status</h3>
              <div className="space-y-3">
                {factoriesList.map((f: any) => (
                  <div key={f.id} className="bg-[#141C2C] border border-[#1E293B] p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{f.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{f.type} · Consent: {f.consent}</p>
                    </div>
                    {f.compliance === 'Good' && <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-md text-xs font-semibold"><CheckCircle className="w-3.5 h-3.5" /> Good</div>}
                    {f.compliance === 'Warning' && <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-md text-xs font-semibold"><AlertTriangle className="w-3.5 h-3.5" /> Warning</div>}
                    {f.compliance === 'Violation' && <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-xs font-semibold"><XCircle className="w-3.5 h-3.5" /> Violation</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "Factory Audit":
        return (
          <div className="animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Registered Factories</h3>
              <button 
                onClick={() => setIsRegisterModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-blue-500/20"
              >
                + Register Factory
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-1 space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {factoriesList.map((f: any) => (
                  <div 
                    key={f.id} 
                    onClick={() => setSelectedFactoryId(f.id)}
                    className={`bg-[#0D1322] border rounded-2xl p-5 cursor-pointer transition-colors shadow-lg relative overflow-hidden group ${selectedFactoryId === f.id ? 'border-blue-500/50 bg-[#14223A]' : 'border-[#1A2234] hover:border-gray-600'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-gray-100 text-base">{f.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{f.type}</p>
                      </div>
                      {f.compliance === 'Good' && <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-md text-[10px] font-bold"><CheckCircle className="w-3 h-3" /> Good</div>}
                      {f.compliance === 'Warning' && <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md text-[10px] font-bold"><AlertTriangle className="w-3 h-3" /> Warning</div>}
                      {f.compliance === 'Violation' && <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-[10px] font-bold"><XCircle className="w-3 h-3" /> Violation</div>}
                    </div>
                    <div className="text-xs text-gray-400 flex flex-col gap-1">
                      <span>Consent: {f.consent} · Exp: {f.expiry}</span>
                      <span>Last Inspection: {f.lastInspection}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-2">
                {selectedFactoryId ? (() => {
                  const fac = factoriesList.find((f: any) => f.id === selectedFactoryId);
                  return (
                    <div className="bg-[#0D1322] border border-[#1A2234] rounded-2xl shadow-lg p-8 h-full min-h-[400px]">
                      <div className="flex justify-between items-start border-b border-[#1A2234] pb-6 mb-6">
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-2">{fac.name}</h2>
                          <p className="text-sm text-gray-400">ID: {fac.id} | Reg Type: {fac.type}</p>
                        </div>
                        <button 
                          onClick={() => setIsForm2AModalOpen(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 rounded-lg text-sm font-bold transition-colors"
                        >
                          <FileSignature className="w-4 h-4" />
                          Auto-fill Form 2A
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-6 mb-8">
                        <div className="bg-[#141C2C] p-4 rounded-xl border border-[#1E293B]">
                          <p className="text-xs text-gray-500 uppercase font-bold mb-1">Consent Limit</p>
                          <p className="text-lg text-white">{fac.consent}</p>
                        </div>
                        <div className="bg-[#141C2C] p-4 rounded-xl border border-[#1E293B]">
                          <p className="text-xs text-gray-500 uppercase font-bold mb-1">Expiry Date</p>
                          <p className="text-lg text-white">{fac.expiry}</p>
                        </div>
                        <div className="bg-[#141C2C] p-4 rounded-xl border border-[#1E293B]">
                          <p className="text-xs text-gray-500 uppercase font-bold mb-1">Latest Compliance</p>
                          <p className="text-lg text-white">{fac.compliance}</p>
                        </div>
                      </div>

                      <h4 className="font-bold text-white mb-4">Live Emissions Telemetry</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs text-gray-400 mb-1"><span>PM2.5 (µg/m³)</span> <span>{fac.pm25}</span></div>
                          <div className="w-full bg-[#1A2234] rounded-full h-1.5"><div className="bg-orange-500 h-1.5 rounded-full" style={{width: `${Math.min((fac.pm25/300)*100, 100)}%`}}></div></div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-gray-400 mb-1"><span>SO2 (µg/m³)</span> <span>{fac.so2}</span></div>
                          <div className="w-full bg-[#1A2234] rounded-full h-1.5"><div className="bg-yellow-500 h-1.5 rounded-full" style={{width: `${Math.min((fac.so2/150)*100, 100)}%`}}></div></div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-gray-400 mb-1"><span>NOx (µg/m³)</span> <span>{fac.nox}</span></div>
                          <div className="w-full bg-[#1A2234] rounded-full h-1.5"><div className="bg-red-500 h-1.5 rounded-full" style={{width: `${Math.min((fac.nox/200)*100, 100)}%`}}></div></div>
                        </div>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="bg-[#0D1322] border border-[#1A2234] rounded-2xl shadow-lg flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                    <Shield className="w-16 h-16 text-gray-700 mb-4" />
                    <p className="text-gray-400">Select a factory from the list to view its audit details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "Reports & Forms":
        return (
          <div className="animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Reports & Compliance Forms</h3>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-[#1A2234] bg-[#0D1322] text-gray-300 hover:text-white rounded-lg text-sm font-semibold transition-colors">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button 
                  onClick={() => handleDownloadPDF("Batch Export")}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-blue-500/20"
                >
                  <Download className="w-4 h-4" />
                  Export All
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { name: "Monthly Ambient Air Quality Report", desc: "Zone-wide · Apr 2025 · PDF", status: "Ready" },
                { name: "Factory Violation Notice - Zentis Pharma", desc: "Zentis Pharmaceuticals · Apr 2025 · Form-A", status: "Pending Signature" },
                { name: "Quarterly Compliance Summary", desc: "All Factories · Q1 2025 · PDF", status: "Ready" },
                { name: "Public Health Advisory - Vapi Zone", desc: "Public · Mar 2025 · Advisory", status: "Published" },
              ].map((report, i) => {
                let statusColor = "emerald";
                if(report.status === "Pending Signature") statusColor = "amber";
                
                return (
                  <div key={i} className="bg-[#0D1322] border border-[#1A2234] rounded-2xl p-5 flex items-center justify-between shadow-lg hover:border-[#1E3050] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#14223A] border border-[#1E3050] flex items-center justify-center text-blue-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-100">{report.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{report.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className={`text-[10px] bg-${statusColor}-500/10 text-${statusColor}-500 border border-${statusColor}-500/20 px-2.5 py-1 rounded-md font-bold`}>
                        {report.status}
                      </span>
                      <button 
                        onClick={() => handleDownloadPDF(report.name)}
                        className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                      >
                        <Download className="w-4 h-4" /> Download
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        );

      case "Enforcement":
        return (
          <div className="animate-in fade-in duration-300 space-y-6">
            <h3 className="text-lg font-bold text-white mb-2">Enforcement Actions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 shadow-lg relative">
                <button 
                  onClick={() => setIsActionModalOpen({type: 'Notice'})}
                  className="absolute top-4 right-4 w-6 h-6 rounded-full bg-amber-500/20 hover:bg-amber-500/40 text-amber-500 flex items-center justify-center transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <AlertTriangle className="w-6 h-6 text-amber-500 mb-4" />
                <span className="text-4xl font-extrabold text-amber-500">{stats.showCauseNotices}</span>
                <p className="text-xs text-gray-400 mt-2 font-medium">Show Cause Notices Issued</p>
              </div>

              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 shadow-lg relative">
                <button 
                  onClick={() => setIsActionModalOpen({type: 'Shutdown'})}
                  className="absolute top-4 right-4 w-6 h-6 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-500 flex items-center justify-center transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <XCircle className="w-6 h-6 text-red-500 mb-4" />
                <span className="text-4xl font-extrabold text-red-500">{stats.shutdowns}</span>
                <p className="text-xs text-gray-400 mt-2 font-medium">Factory Shutdowns Ordered</p>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 shadow-lg relative">
                <button 
                  onClick={() => setIsActionModalOpen({type: 'Renewal'})}
                  className="absolute top-4 right-4 w-6 h-6 rounded-full bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 flex items-center justify-center transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <Shield className="w-6 h-6 text-blue-400 mb-4" />
                <span className="text-4xl font-extrabold text-blue-400">{stats.renewals}</span>
                <p className="text-xs text-gray-400 mt-2 font-medium">Consent Renewals Pending</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#0D1322] border border-[#1A2234] rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <div>
                      <h4 className="font-bold text-gray-100 text-base">Apex Chemicals</h4>
                      <p className="text-xs text-gray-500">Chemical</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-md font-bold">Warning</span>
                </div>
                <p className="text-sm text-gray-300 mb-6">Minor compliance warning. PM2.5 at 145 µg/m³ (45% over limit). Notice issued.</p>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-[#14223A] border border-[#1E3050] text-blue-400 rounded-lg text-xs font-semibold hover:bg-[#1E3050] transition-colors">Issue Notice</button>
                  <button className="px-4 py-2 bg-[#14223A] border border-[#1A2234] text-gray-400 rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors">Broadcast Alert</button>
                </div>
              </div>

              <div className="bg-[#0D1322] border border-[#1A2234] rounded-2xl p-6 shadow-lg opacity-70">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <div>
                      <h4 className="font-bold text-gray-100 text-base">Zentis Pharmaceuticals</h4>
                      <p className="text-xs text-gray-500">Pharma</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-md font-bold">Violation</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#080B13] text-white font-sans overflow-hidden flex flex-col relative">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#0A0F1A] border-b border-[#1A2234]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Shield className="w-6 h-6 text-blue-500" />
          </div>
          
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white leading-tight">EcoSentinel</span>
            <span className="text-xs text-blue-400 font-medium tracking-wide">GSPCB Inspector Command Center</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 border border-red-500/30 bg-red-500/10 text-red-400 rounded-lg text-xs font-semibold">
            <Radio className="w-3.5 h-3.5" />
            2 Critical Events
          </div>

          <button 
            onClick={() => setIsBroadcastModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-sm font-semibold transition-colors"
          >
            <Radio className="w-4 h-4" />
            Emergency Broadcast
          </button>
          
          <div className="relative" ref={notifyMenuRef}>
            <div 
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 rounded-full bg-[#14223A] border border-[#1E3050] flex items-center justify-center relative cursor-pointer hover:bg-[#1E3050] transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0A0F1A]" />
            </div>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-[#0A0F1A] border border-[#1E3050] rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-[#1A2234]">
                  <h4 className="font-bold text-white">Notifications</h4>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="px-4 py-3 border-b border-[#1A2234] hover:bg-[#14223A] transition-colors cursor-pointer">
                    <p className="text-sm font-semibold text-white">Critical Alert: Gas Leak</p>
                    <p className="text-xs text-red-400 mt-1">Anomalous levels detected in industrial zone.</p>
                    <p className="text-[10px] text-gray-500 mt-1">10 mins ago</p>
                  </div>
                  <div className="px-4 py-3 border-b border-[#1A2234] hover:bg-[#14223A] transition-colors cursor-pointer">
                    <p className="text-sm font-semibold text-white">New Sensor Warning</p>
                    <p className="text-xs text-gray-400 mt-1">PM2.5 sensor offline in Vagra.</p>
                    <p className="text-[10px] text-gray-500 mt-1">1 hour ago</p>
                  </div>
                </div>
                <button className="w-full py-2 text-xs font-bold text-blue-400 hover:text-blue-300 border-t border-[#1A2234] bg-[#14223A]/50">
                  Mark all as read
                </button>
              </div>
            )}
          </div>

          <div className="relative" ref={profileMenuRef}>
             <button 
               onClick={() => setShowProfileMenu(!showProfileMenu)}
               className="w-10 h-10 rounded-full bg-emerald-400 flex items-center justify-center text-black font-bold uppercase text-lg hover:scale-105 transition-transform border border-emerald-500/50"
             >
               {session ? session.name.charAt(0) : "I"}
             </button>

             {showProfileMenu && (
               <div className="absolute right-0 mt-2 w-64 bg-[#0A0F1A] border border-[#1E3050] rounded-xl shadow-2xl overflow-hidden z-50">
                 <div className="px-4 py-3 border-b border-[#1A2234]">
                   <div className="font-semibold text-white text-base truncate">{session?.name || 'Guest User'}</div>
                   <div className="text-xs text-gray-400 mt-0.5 truncate">{session?.email || 'Not logged in'}</div>
                   {session && (
                     <div className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                       {session.role}
                     </div>
                   )}
                 </div>
                 <button
                   onClick={handleLogout}
                   className="w-full text-left px-4 py-3 text-red-400 text-sm hover:bg-[#14223A] flex items-center gap-2 transition-colors font-medium border-t border-[#1A2234]"
                 >
                   <ArrowLeft className="w-4 h-4" /> Sign Out
                 </button>
               </div>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-20">
        <div className="max-w-[1400px] mx-auto space-y-6">
          
          {/* Sub Navigation */}
          <div className="flex items-center gap-8 border-b border-[#1A2234] pb-0">
            {["Command Overview", "Factory Audit", "Reports & Forms", "Enforcement"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative pb-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === tab ? "text-blue-400" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {tab === "Command Overview" && <BarChart2 className="w-4 h-4" />}
                {tab === "Factory Audit" && <Shield className="w-4 h-4" />}
                {tab === "Reports & Forms" && <FileText className="w-4 h-4" />}
                {tab === "Enforcement" && <Anchor className="w-4 h-4" />}
                
                {tab}

                {activeTab === tab && (
                  <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-blue-400" />
                )}
              </button>
            ))}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#0D1322] border border-[#1A2234] rounded-2xl p-5 flex flex-col justify-between shadow-lg">
              <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Zone Avg AQI</span>
              <div className="mt-2">
                <span className={`text-4xl font-extrabold ${aqiColor}`}>{getZoneAQI()}</span>
                <p className="text-xs text-gray-400 mt-1">{aqiStatus}</p>
              </div>
            </div>

            <div className="bg-[#0D1322] border border-[#1A2234] rounded-2xl p-5 flex flex-col justify-between shadow-lg">
              <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Active Sensors</span>
              <div className="mt-2">
                <span className="text-4xl font-extrabold text-emerald-400">{sarpanchStats.activeSensors || 11}</span>
                <p className="text-xs text-gray-400 mt-1">4 issues</p>
              </div>
            </div>

            <div className="bg-[#0D1322] border border-[#1A2234] rounded-2xl p-5 flex flex-col justify-between shadow-lg border-red-500/10">
              <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Violations</span>
              <div className="mt-2">
                <span className="text-4xl font-extrabold text-red-500">1</span>
                <p className="text-xs text-red-400/80 mt-1">Require action now</p>
              </div>
            </div>

            <div className="bg-[#0D1322] border border-[#1A2234] rounded-2xl p-5 flex flex-col justify-between shadow-lg">
              <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Critical Events</span>
              <div className="mt-2">
                <span className="text-4xl font-extrabold text-red-400">2</span>
                <p className="text-xs text-gray-400 mt-1">In monitored zone</p>
              </div>
            </div>
          </div>

          {renderTabContent()}
        </div>
      </div>

      {/* Modals */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0A0F1A] border border-[#1A2234] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Register New Factory</h3>
            <form onSubmit={handleRegisterFactory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Factory Name</label>
                <input required name="name" className="w-full bg-[#141C2C] border border-[#1E293B] rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" placeholder="e.g. Acme Industries" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Industry Type</label>
                <input required name="type" className="w-full bg-[#141C2C] border border-[#1E293B] rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" placeholder="e.g. Chemical" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Consent ID</label>
                  <input required name="consent" className="w-full bg-[#141C2C] border border-[#1E293B] rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" placeholder="CTE-XXXX" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Expiry Date</label>
                  <input required type="date" name="expiry" className="w-full bg-[#141C2C] border border-[#1E293B] rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-[#1A2234]">
                <button type="button" onClick={() => setIsRegisterModalOpen(false)} className="flex-1 py-2 rounded-lg font-bold text-gray-400 bg-[#141C2C] hover:bg-[#1E293B] transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-lg font-bold text-white bg-blue-500 hover:bg-blue-600 transition-colors">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isForm2AModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0A0F1A] border border-[#1A2234] rounded-2xl w-full max-w-xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">GSPCB Form-2A</h3>
                <p className="text-xs text-gray-400">Pre-filled Data Extracted from Audit</p>
              </div>
              <button className="text-gray-400 hover:text-white" onClick={() => setIsForm2AModalOpen(false)}><XCircle className="w-6 h-6" /></button>
            </div>
            <div className="bg-[#141C2C] border border-[#1E293B] rounded-lg p-4 font-mono text-xs text-green-400 h-64 overflow-y-auto mb-6">
              <div>{'>'} EXTRACTING FACTORY CONTEXT...</div>
              <div>{'>'} INITIALIZING FORM TEMPLATE...</div>
              <br/>
              <div>{"PART A: GENERAL INFORMATION"}</div>
              <div className="text-gray-300">{"1. Name of the Industry: " + (factoriesList.find((f:any)=>f.id===selectedFactoryId)?.name || 'UNKNOWN')}</div>
              <div className="text-gray-300">{"2. Category & Consent: " + (factoriesList.find((f:any)=>f.id===selectedFactoryId)?.consent || 'UNKNOWN')}</div>
              <div className="text-gray-300">{"3. Inspector ID: " + session?.id}</div>
              <br/>
              <div>{"PART B: EMISSION LOGS"}</div>
              <div className="text-gray-300">{"PM2.5 Level: LOGGED OVER LIMIT -> TRIGGER WARNING CLAUSE 4.A"}</div>
              <div className="text-gray-300">{"SO2 Level: VERIFIED BELOW THRESHOLD"}</div>
              <br />
              <div className="text-yellow-400">{'>'} READY FOR DIGITAL SIGNATURE</div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsForm2AModalOpen(false)} className="flex-1 py-2 rounded-lg font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> Submit Form 2A
              </button>
            </div>
          </div>
        </div>
      )}

      {isActionModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
           <div className="bg-[#0A0F1A] border border-[#1A2234] rounded-2xl w-full max-w-md p-6 shadow-2xl">
             <h3 className="text-xl font-bold text-white mb-2">Create {isActionModalOpen.type} Entry</h3>
             <p className="text-sm text-gray-400 mb-6">This will log a new enforcement action.</p>
            <form onSubmit={handleActionForm} className="space-y-4">
               <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Target Description</label>
                  <input required className="w-full bg-[#141C2C] border border-[#1E293B] rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" placeholder="Describe the action..." />
               </div>
               <div className="flex gap-3 pt-4 border-t border-[#1A2234]">
                  <button type="button" onClick={() => setIsActionModalOpen(null)} className="flex-1 py-2 rounded-lg font-bold text-gray-400 bg-[#141C2C] hover:bg-[#1E293B] transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-2 rounded-lg font-bold text-white bg-blue-500 hover:bg-blue-600 transition-colors">Confirm Action</button>
               </div>
             </form>
           </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0A0F1A] border border-[#1A2234] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Emergency SMS Alert</h3>
            <p className="text-sm text-gray-400 mb-6">Dispatch SMS directives immediately.</p>
            
            {broadcastStatus && (
              <div className={`p-3 rounded-lg mb-4 text-xs font-semibold ${broadcastStatus.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                {broadcastStatus.msg}
              </div>
            )}

            <form onSubmit={handleBroadcastSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Phone Numbers (comma separated)</label>
                <input 
                  required 
                  value={broadcastNumbers}
                  onChange={(e) => setBroadcastNumbers(e.target.value)}
                  className="w-full bg-[#141C2C] border border-[#1E293B] rounded-lg px-4 py-2 text-white outline-none focus:border-red-500" 
                  placeholder="+918401782327, +91900000000" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Message Body</label>
                <textarea 
                  required 
                  rows={4}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full bg-[#141C2C] border border-[#1E293B] rounded-lg px-4 py-2 text-white outline-none focus:border-red-500 resize-none" 
                  placeholder="Official GSPCB Alert..." 
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-[#1A2234]">
                <button type="button" onClick={() => setIsBroadcastModalOpen(false)} className="flex-1 py-2 rounded-lg font-bold text-gray-400 bg-[#141C2C] hover:bg-[#1E293B] transition-colors">Cancel</button>
                <button type="submit" disabled={isSending} className="flex-1 py-2 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50">
                  {isSending ? 'Transmitting...' : 'Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

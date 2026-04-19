import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Activity, Bell, RadioTower, AlertTriangle, CheckCircle, XCircle, Users, LogOut, TrendingUp, CheckCircle2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getComplaints, updateComplaintStatus, getCurrentSession, clearSession, getSarpanchStats, updateSarpanchStats } from "@/lib/store";

const barData = [
  { name: "Ankles", aqi: 70 },
  { name: "Panoli", aqi: 85 },
  { name: "Jhagad", aqi: 75 },
  { name: "Amod", aqi: 75 },
  { name: "Vagra", aqi: 80 },
  { name: "Jambus", aqi: 73 },
];

export default function SarpanchDashboard() {
  const navigate = useNavigate();
  const session = getCurrentSession();
  const [complaintsList, setComplaintsList] = useState(getComplaints());
  const pendingCount = complaintsList.filter(c => c.status === 'Pending' || c.status === 'In Progress').length;
  const awaitedCount = complaintsList.filter(c => c.status === 'Pending').length;
  const resolvedCount = complaintsList.filter(c => c.status === 'Resolved').length;

  const [activeTab, setActiveTab] = useState("Overview");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifyMenuRef = useRef<HTMLDivElement>(null);

  const [stats, setStats] = useState(getSarpanchStats());

  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastNumbers, setBroadcastNumbers] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState<{type: 'success'|'error', msg: string} | null>(null);

  const [welfareList, setWelfareList] = useState([
    { name: "Clean Village Initiative", budget: "₹2.4L", beneficiaries: 1240, status: "Active", progress: 60 },
    { name: "Women & Child Health Drive", budget: "₹1.1L", beneficiaries: 680, status: "Active", progress: 75 },
    { name: "Pollution Shield Kit Distribution", budget: "₹80K", beneficiaries: 0, status: "Upcoming", progress: 0 },
  ]);
  const [isAddWelfareOpen, setIsAddWelfareOpen] = useState(false);

  const [alertsList, setAlertsList] = useState([
    { type: "Gas Leak", severity: "Critical", desc: "Anomalous toxic gas levels detected in industrial zone.", loc: "21.6090, 73.0107", radius: "4.6 km" },
    { type: "Gas Leak", severity: "Medium", desc: "Anomalous toxic gas levels detected in industrial zone.", loc: "21.6426, 72.9975", radius: "3.9 km" },
    { type: "Gas Leak", severity: "Critical", desc: "Anomalous toxic gas levels detected in industrial zone.", loc: "21.6039, 73.0131", radius: "2.8 km" },
  ]);
  const [isAddAlertOpen, setIsAddAlertOpen] = useState(false);

  // Close menus if clicked outside
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

  // Authentication Guard
  useEffect(() => {
    if (!session || session.role !== 'Sarpanch') {
      navigate('/auth');
    }
  }, [session, navigate]);

  const handleLogout = () => {
    clearSession();
    navigate('/auth');
  };

  const handleAddSensor = () => {
    const updated = updateSarpanchStats({ activeSensors: stats.activeSensors + 1 });
    setStats(updated);
  };

  const handleAddFactory = () => {
    const updated = updateSarpanchStats({ activeFactories: stats.activeFactories + 1 });
    setStats(updated);
  };

  const handleStatusUpdate = (id: string, newStatus: 'Pending' | 'In Progress' | 'Resolved') => {
    updateComplaintStatus(id, newStatus);
    setComplaintsList(getComplaints()); // Refresh
  };

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setBroadcastStatus(null);
    
    // Split by comma and clean up whitespace
    const numbers = broadcastNumbers.split(',').map(n => n.trim()).filter(n => n);
    
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
         setBroadcastStatus({ type: 'error', msg: `Failed to send to some numbers: ${data.errors.map((e:any)=>e.number).join(', ')}`});
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

  const handleAddWelfare = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setWelfareList(prev => [{
      name: formData.get('name') as string,
      budget: formData.get('budget') as string,
      beneficiaries: Number(formData.get('beneficiaries')),
      status: formData.get('status') as string,
      progress: Number(formData.get('progress'))
    }, ...prev]);
    setIsAddWelfareOpen(false);
  };

  const handleAddAlert = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setAlertsList(prev => [{
      type: formData.get('type') as string,
      severity: formData.get('severity') as string,
      desc: formData.get('desc') as string,
      loc: formData.get('loc') as string,
      radius: formData.get('radius') as string,
    }, ...prev]);
    setIsAddAlertOpen(false);
  };

  // Dynamic AQI based on tab for presentation (simulating the screenshots)
  const getAvgAQI = () => {
    if (activeTab === "Welfare") return 89;
    if (activeTab === "Alerts") return 95;
    if (activeTab === "Complaints") return 84;
    return 78;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {/* Chart Area */}
            <div className="lg:col-span-2 bg-[#0D1322] border border-[#1A2234] rounded-2xl p-6 shadow-lg min-h-[400px]">
              <h3 className="text-sm font-bold text-white tracking-widest uppercase mb-8">Village-Wise AQI Overview</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1A2234" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 10}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 10}} dx={-10} domain={[0, 300]} ticks={[0, 75, 150, 225, 300]} />
                    <Tooltip cursor={{fill: '#14223A'}} contentStyle={{backgroundColor: '#0A0F1A', border: '1px solid #1E3050', borderRadius: '8px'}} />
                    <Bar dataKey="aqi" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Compliance List */}
            <div className="lg:col-span-1 bg-[#0D1322] border border-[#1A2234] rounded-2xl p-6 shadow-lg">
              <h3 className="text-sm font-bold text-white tracking-widest uppercase mb-6">Nearby Factory Compliance</h3>
              
              <div className="space-y-3">
                <div className="bg-[#141C2C] border border-[#1E293B] p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Apex Chemicals</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Chemical</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-md text-xs font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Warning
                  </div>
                </div>

                <div className="bg-[#141C2C] border border-[#1E293B] p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Gujarat Paper Mills</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Pulp & Paper</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-md text-xs font-semibold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Good
                  </div>
                </div>

                <div className="bg-[#141C2C] border border-[#1E293B] p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Zentis Pharmaceuticals</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Pharma</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-xs font-semibold">
                    <XCircle className="w-3.5 h-3.5" />
                    Violation
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "Complaints":
        return (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Resident Complaints</h3>
              <span className="text-sm text-gray-400">{pendingCount} pending · {resolvedCount} resolved</span>
            </div>

            {complaintsList.map((comp) => {
               const isHigh = comp.severity === 'High';
               const isMedium = comp.severity === 'Medium';
               const isCritical = comp.severity === 'Critical';
               const isResolved = comp.status === 'Resolved';
               const isPending = comp.status === 'Pending';

               let severityColor = "gray-500";
               if(isHigh) severityColor = "orange-500";
               if(isMedium) severityColor = "yellow-500";
               if(isCritical) severityColor = "red-500";

               let statusColor = "gray-500";
               if(isPending) statusColor = "amber-500";
               if(comp.status === 'In Progress') statusColor = "blue-400";
               if(isResolved) statusColor = "emerald-400";

               return (
                 <div key={comp.id} className="bg-[#0D1322] border border-[#1A2234] rounded-2xl p-5 flex items-center shadow-lg relative overflow-hidden transition-colors hover:border-[#1E3050]">
                   <div className="flex-1">
                     <div className="flex items-center gap-3 mb-2">
                       <h4 className="font-bold text-gray-100">{comp.resident}</h4>
                       <span className="text-xs text-gray-500 tracking-wide uppercase">· {comp.village}</span>
                       <span className={`text-[10px] bg-${severityColor.split('-')[0]}-500/10 text-${severityColor} border border-${severityColor.split('-')[0]}-500/20 px-2 py-0.5 rounded-md font-bold`}>
                         {comp.severity}
                       </span>
                     </div>
                     <p className="text-gray-300 text-sm mb-3">{comp.issue}</p>
                     <div className="text-xs text-gray-500 flex items-center gap-1">
                       <span>🕒 {comp.time}</span>
                     </div>
                   </div>
                   <div className="flex flex-col items-end gap-3">
                     <span className={`bg-${statusColor.split('-')[0]}-500/10 border border-${statusColor.split('-')[0]}-500/20 text-${statusColor} text-xs font-bold px-3 py-1 rounded-lg`}>
                       {comp.status}
                     </span>
                     {!isResolved && (
                       <div className="flex items-center gap-2">
                         {isPending && <button onClick={() => handleStatusUpdate(comp.id, 'In Progress')} className="text-xs text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-2 py-1 rounded">Mark In Progress</button>}
                         <button onClick={() => handleStatusUpdate(comp.id, 'Resolved')} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 px-2 py-1 rounded flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Resolve</button>
                       </div>
                     )}
                   </div>
                 </div>
               )
            })}
          </div>
        );

      case "Welfare":
        return (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Welfare & Relief Schemes</h3>
              <button 
                onClick={() => setIsAddWelfareOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border border-[#1A2234] bg-[#14223A] text-orange-400 hover:bg-[#1E3050] rounded-lg text-sm font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Scheme
              </button>
            </div>
            
            {welfareList.map((scheme, i) => (
              <div key={i} className={`bg-[#0D1322] border border-[#1A2234] rounded-2xl p-5 shadow-lg ${scheme.status === 'Upcoming' ? 'opacity-70' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-gray-100 text-base">{scheme.name}</h4>
                    <p className="text-xs text-gray-400 mt-1">Budget: {scheme.budget} · {scheme.beneficiaries} beneficiaries</p>
                  </div>
                  <span className={`border text-xs font-bold px-3 py-1 rounded-md ${scheme.status === 'Active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-gray-500/10 border-gray-500/20 text-gray-400'}`}>
                    {scheme.status}
                  </span>
                </div>
                <div className="relative w-full h-2 bg-[#1A2234] rounded-full overflow-hidden mb-2">
                  <div className="absolute top-0 left-0 h-full bg-orange-400 rounded-full" style={{ width: `${scheme.progress}%` }} />
                </div>
                <div className="flex justify-between text-[11px] text-gray-500 font-medium">
                  <span>Progress</span>
                  <span>{scheme.progress > 0 ? `${scheme.progress}%` : 'Not started'}</span>
                </div>
              </div>
            ))}
          </div>
        );

      case "Alerts":
        return (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Environmental Alerts <TrendingUp className="w-4 h-4 text-red-500" />
              </h3>
              <button 
                onClick={() => setIsAddAlertOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border border-[#1A2234] bg-[#14223A] text-orange-400 hover:bg-[#1E3050] rounded-lg text-sm font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Alert
              </button>
            </div>

            {alertsList.map((alert, i) => {
              const isCrit = alert.severity === 'Critical';
              const colorPrefix = isCrit ? 'red' : 'amber';
              return (
                <div key={i} className={`bg-${colorPrefix}-500/5 border border-${colorPrefix}-500/20 rounded-2xl p-5 flex items-start justify-between shadow-lg relative overflow-hidden`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className={`w-4 h-4 text-${colorPrefix}-400`} />
                      <h4 className="font-bold text-gray-100">{alert.type}</h4>
                      <span className={`bg-${colorPrefix}-500/20 text-${colorPrefix}-400 text-[10px] font-bold px-2 py-0.5 rounded-full`}>{alert.severity}</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{alert.desc}</p>
                    <p className="text-xs text-gray-500">Location: {alert.loc} · Radius: {alert.radius}</p>
                  </div>
                  <button className="text-xs text-orange-400 hover:text-orange-300 font-semibold transition-colors mt-1">
                    Broadcast Alert
                  </button>
                </div>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#080B13] text-white font-sans overflow-hidden flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#0A0F1A] border-b border-[#1A2234]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <Activity className="w-6 h-6 text-orange-500" />
          </div>
          
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white leading-tight">EcoSentinel</span>
            <span className="text-xs text-orange-400 font-medium tracking-wide">Sarpanch Command Dashboard</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {(activeTab === "Welfare" || activeTab === "Alerts") && (
            <div className="flex items-center gap-2 px-3 py-1 border border-red-500/30 bg-red-500/10 text-red-400 rounded-lg text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              3 Active Alerts
            </div>
          )}

          <button 
            onClick={() => setIsBroadcastModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 rounded-lg text-sm font-semibold transition-colors"
          >
            <RadioTower className="w-4 h-4" />
            Broadcast
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
                    <p className="text-sm font-semibold text-white">New Complaint Filed</p>
                    <p className="text-xs text-gray-400 mt-1">Sushila Desai reported visible smoke.</p>
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
              {session ? session.name.charAt(0) : "S"}
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-[#0A0F1A] border border-[#1E3050] rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-[#1A2234]">
                  <div className="font-semibold text-white text-base truncate">{session?.name || 'Guest User'}</div>
                  <div className="text-xs text-gray-400 mt-0.5 truncate">{session?.email || 'Not logged in'}</div>
                  {session && (
                    <div className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      {session.role}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-400 text-sm hover:bg-[#14223A] flex items-center gap-2 transition-colors font-medium border-t border-[#1A2234]"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
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
            {["Overview", "Complaints", "Welfare", "Alerts"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative pb-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === tab ? "text-orange-400" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {tab === "Overview" && <Activity className="w-4 h-4" />}
                {tab === "Complaints" && (
                  <>
                    <Users className="w-4 h-4" /> Complaints
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block mb-1 opacity-80 animate-pulse" />
                  </>
                )}
                {tab !== "Complaints" && tab !== "Overview" && tab}
                {tab === "Overview" && "Overview"}

                {activeTab === tab && (
                  <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-orange-400" />
                )}
              </button>
            ))}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#0D1322] border border-[#1A2234] rounded-2xl p-5 flex flex-col justify-between shadow-lg">
              <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Village Avg AQI</span>
              <div className="mt-2">
                <span className="text-4xl font-extrabold text-orange-400">{getAvgAQI()}</span>
                <p className="text-xs text-gray-400 mt-1">Moderate</p>
              </div>
            </div>

            <div className="bg-[#0D1322] border border-[#1A2234] rounded-2xl p-5 flex flex-col justify-between shadow-lg relative">
              <button onClick={handleAddSensor} className="absolute top-4 right-4 bg-white/5 border border-white/10 text-gray-300 text-[10px] px-2 py-0.5 rounded-full hover:bg-white/10 transition-colors">+ Add</button>
              <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Active Sensors</span>
              <div className="mt-2">
                <span className="text-4xl font-extrabold text-emerald-400">{stats.activeSensors || 12}</span>
                <p className="text-xs text-gray-400 mt-1">3 need attention</p>
              </div>
            </div>

            <div className="bg-[#0D1322] border border-[#1A2234] rounded-2xl p-5 flex flex-col justify-between shadow-lg">
              <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Open Complaints</span>
              <div className="mt-2">
                <span className="text-4xl font-extrabold text-orange-500">{awaitedCount}</span>
                <p className="text-xs text-gray-400 mt-1">Awaiting response</p>
              </div>
            </div>

            <div className="bg-[#0D1322] border border-[#1A2234] rounded-2xl p-5 flex flex-col justify-between shadow-lg relative">
              <button onClick={handleAddFactory} className="absolute top-4 right-4 bg-white/5 border border-white/10 text-gray-300 text-[10px] px-2 py-0.5 rounded-full hover:bg-white/10 transition-colors">+ Add</button>
              <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Active Factories</span>
              <div className="mt-2">
                <span className="text-4xl font-extrabold text-[#3B82F6]">{stats.activeFactories || 3}</span>
                <p className="text-xs text-gray-400 mt-1">1 violations</p>
              </div>
            </div>
          </div>

          {renderTabContent()}
          
        </div>
      </div>

      {/* Broadcast Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0A0F1A] border border-[#1A2234] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Broadcast SMS Alert</h3>
            <p className="text-sm text-gray-400 mb-6">Send an immediate message to residents or staff via Twilio.</p>
            
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
                  className="w-full bg-[#141C2C] border border-[#1E293B] rounded-lg px-4 py-2 text-white outline-none focus:border-orange-500" 
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
                  className="w-full bg-[#141C2C] border border-[#1E293B] rounded-lg px-4 py-2 text-white outline-none focus:border-orange-500 resize-none" 
                  placeholder="Hello from EcoSentinel 🚀..." 
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-[#1A2234]">
                <button type="button" onClick={() => setIsBroadcastModalOpen(false)} className="flex-1 py-2 rounded-lg font-bold text-gray-400 bg-[#141C2C] hover:bg-[#1E293B] transition-colors">Cancel</button>
                <button type="submit" disabled={isSending} className="flex-1 py-2 rounded-lg font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors disabled:opacity-50">
                  {isSending ? 'Sending...' : 'Send Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Welfare Modal */}
      {isAddWelfareOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0A0F1A] border border-[#1A2234] rounded-2xl w-full max-w-md p-6 shadow-2xl">
             <h3 className="text-xl font-bold text-white mb-6">Add Welfare Scheme</h3>
             <form onSubmit={handleAddWelfare} className="space-y-4">
               <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Scheme Name</label>
                  <input required name="name" className="w-full bg-[#141C2C] border border-[#1E293B] rounded-lg px-4 py-2 text-white outline-none focus:border-orange-500" placeholder="e.g. Clean Village Drive" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Budget</label>
                    <input required name="budget" className="w-full bg-[#141C2C] border border-[#1E293B] rounded-lg px-4 py-2 text-white outline-none focus:border-orange-500" placeholder="e.g. ₹1.5L" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Beneficiaries</label>
                    <input required type="number" name="beneficiaries" className="w-full bg-[#141C2C] border border-[#1E293B] rounded-lg px-4 py-2 text-white outline-none focus:border-orange-500" placeholder="0" />
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Status</label>
                    <select required name="status" className="w-full bg-[#141C2C] border border-[#1E293B] rounded-lg px-4 py-2 text-white outline-none focus:border-orange-500">
                      <option value="Active">Active</option>
                      <option value="Upcoming">Upcoming</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Progress (%)</label>
                    <input required type="number" name="progress" max="100" min="0" className="w-full bg-[#141C2C] border border-[#1E293B] rounded-lg px-4 py-2 text-white outline-none focus:border-orange-500" placeholder="0-100" />
                 </div>
               </div>
               <div className="flex gap-3 pt-4 border-t border-[#1A2234]">
                 <button type="button" onClick={() => setIsAddWelfareOpen(false)} className="flex-1 py-2 rounded-lg font-bold text-gray-400 bg-[#141C2C] hover:bg-[#1E293B] transition-colors">Cancel</button>
                 <button type="submit" className="flex-1 py-2 rounded-lg font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors">Add Scheme</button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* Add Alert Modal */}
      {isAddAlertOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0A0F1A] border border-[#1A2234] rounded-2xl w-full max-w-md p-6 shadow-2xl">
             <h3 className="text-xl font-bold text-white mb-6">Create Environmental Alert</h3>
             <form onSubmit={handleAddAlert} className="space-y-4">
               <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Alert Type</label>
                  <input required name="type" className="w-full bg-[#141C2C] border border-[#1E293B] rounded-lg px-4 py-2 text-white outline-none focus:border-orange-500" placeholder="e.g. Toxins High" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label>
                  <textarea required name="desc" className="w-full bg-[#141C2C] border border-[#1E293B] rounded-lg px-4 py-2 text-white outline-none focus:border-orange-500 resize-none" placeholder="Details..."></textarea>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Radius</label>
                    <input required name="radius" className="w-full bg-[#141C2C] border border-[#1E293B] rounded-lg px-4 py-2 text-white outline-none focus:border-orange-500" placeholder="e.g. 5.1 km" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Location</label>
                    <input required name="loc" className="w-full bg-[#141C2C] border border-[#1E293B] rounded-lg px-4 py-2 text-white outline-none focus:border-orange-500" placeholder="Lat, Lng" />
                 </div>
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Severity</label>
                  <select required name="severity" className="w-full bg-[#141C2C] border border-[#1E293B] rounded-lg px-4 py-2 text-white outline-none focus:border-orange-500">
                    <option value="Critical">Critical</option>
                    <option value="Medium">Medium</option>
                  </select>
               </div>
               <div className="flex gap-3 pt-4 border-t border-[#1A2234]">
                 <button type="button" onClick={() => setIsAddAlertOpen(false)} className="flex-1 py-2 rounded-lg font-bold text-gray-400 bg-[#141C2C] hover:bg-[#1E293B] transition-colors">Cancel</button>
                 <button type="submit" className="flex-1 py-2 rounded-lg font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors">Dispatch Alert</button>
               </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}

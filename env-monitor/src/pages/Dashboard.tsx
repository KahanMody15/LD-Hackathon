import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Bell, Eye, Users, Shield, ArrowRight } from "lucide-react";
import { useRealTimeData } from "@/hooks/useRealTimeData";
import { getCurrentSession, clearSession } from "@/lib/store";
import type { Role } from "@/types";

const DASHBOARD_CARDS = [
  {
    role: "Resident" as Role,
    route: "/public-dashboard",
    title: "Public AQI Dashboard",
    subtitle: "Resident View",
    description: "Check real-time air quality for your region. Get AQI levels, health advisories, and nearby station data instantly after selecting your area.",
    icon: Eye,
    features: ["Live AQI by region", "PM2.5 / PM10 / SO₂ data", "AQI trend charts", "Health advisories"],
    cardBg: "bg-[#0b1715]",
    cardBorder: "border-[#154634]",
    tag: "PUBLIC",
    tagColor: "bg-[#103024] text-[#10b981]",
    btnColor: "bg-[#10b981] hover:bg-[#059669] text-black",
  },
  {
    role: "Sarpanch" as Role,
    route: "/sarpanch-dashboard",
    title: "Sarpanch Dashboard",
    subtitle: "Village Admin View",
    description: "Manage village-level environmental complaints, monitor factory compliance nearby, track welfare schemes and broadcast emergency alerts to residents.",
    icon: Users,
    features: ["Resident complaints", "Factory compliance", "Welfare schemes", "Village AQI overview"],
    cardBg: "bg-[#1f1307]",
    cardBorder: "border-[#69390a]",
    tag: "VILLAGE ADMIN",
    tagColor: "bg-[#382005] text-[#f59e0b]",
    btnColor: "bg-[#f59e0b] hover:bg-[#d97706] text-black",
  },
  {
    role: "Inspector" as Role,
    route: "/inspector-dashboard",
    title: "Inspector Console",
    subtitle: "GSPCB Official View",
    description: "Full command center for GSPCB inspectors. Audit factory emissions, generate Form-A notices, issue enforcement orders, and broadcast emergency alerts.",
    icon: Shield,
    features: ["Factory emission audits", "Form-A generation", "Enforcement actions", "Emergency broadcast"],
    cardBg: "bg-[#0c142e]",
    cardBorder: "border-[#1e3a8a]",
    tag: "GSPCB OFFICIAL",
    tagColor: "bg-[#172554] text-[#3b82f6]",
    btnColor: "bg-[#3b82f6] hover:bg-[#2563eb] text-white",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("Resident");
  const { sensors, activeEvents } = useRealTimeData();
  const session = getCurrentSession();

  useEffect(() => {
    if (session) {
      setRole(session.role);
    }
  }, [session]);

  const handleDashboardClick = (e: React.MouseEvent, card: typeof DASHBOARD_CARDS[0]) => {
    e.stopPropagation();
    if (!session || session.role !== card.role) {
      clearSession();
      navigate('/auth', { state: { requiredRole: card.role } });
    } else {
      navigate(card.route);
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-[#060B12] text-white flex flex-col font-sans overflow-x-hidden">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#0A0F1A] border-b border-[#1A2234]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#14223A] flex items-center justify-center border border-[#1E3050]">
            <Activity className="w-6 h-6 text-[#3B82F6]" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">EcoSentinel Console</span>
        </div>

        <div className="flex items-center gap-4">
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value as Role)}
            className="bg-[#14223A] border border-[#1E3050] text-sm text-gray-300 rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="Resident">Resident</option>
            <option value="Sarpanch">Sarpanch</option>
            <option value="Inspector">Inspector</option>
          </select>
          
          <button className="p-2 bg-[#14223A] hover:bg-[#1E3050] rounded-full transition-colors relative">
            <Bell className="w-5 h-5 text-gray-400" />
            {activeEvents.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#14223A]" />
            )}
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center text-black font-bold uppercase text-lg border-2 border-[#1E3050] hover:scale-105 transition-transform"
          >
            {session ? session.name.charAt(0) : "R"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center py-16 px-6 relative z-10">
        
        {/* Glow ambient */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-900/10 blur-[150px] pointer-events-none rounded-full" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#14223A]/80 border border-[#1E3050] text-[11px] text-emerald-400 mb-8 backdrop-blur-sm shadow-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {sensors.filter(s => s.status === 'Active').length} sensors live · {activeEvents.length} active events
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-teal-300 mb-4 tracking-tight drop-shadow-md">
          Choose Your Dashboard
        </h1>
        <p className="text-gray-400 text-sm max-w-xl text-center mb-16 leading-relaxed">
          EcoSentinel provides three specialized dashboards — each tailored to your
          role in the environmental monitoring ecosystem.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {DASHBOARD_CARDS.map((card) => (
            <div
              key={card.role}
              className={`relative rounded-2xl border ${card.cardBg} ${card.cardBorder} p-6 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-xl`}
              onClick={(e) => handleDashboardClick(e, card)}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-bold px-2 py-1.5 rounded-md uppercase tracking-wider ${card.tagColor}`}>
                  {card.tag}
                </span>
                <div className={`w-1.5 h-1.5 rounded-full bg-current opacity-80 ${card.tagColor.split(' ')[1]}`} />
              </div>

              <div className="flex items-center gap-3">
                <card.icon className={`w-8 h-8 ${card.tagColor.split(' ')[1]}`} strokeWidth={1.5} />
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">{card.title}</h2>
                  <p className={`text-[11px] ${card.tagColor.split(' ')[1]}`}>{card.subtitle}</p>
                </div>
              </div>

              <p className="text-[13px] text-gray-400 leading-relaxed min-h-[60px]">
                {card.description}
              </p>

              <div className="space-y-3 flex-1 mt-2">
                {card.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-[12px] text-gray-400">
                    <span className="text-gray-600 font-bold">•</span>
                    {f}
                  </div>
                ))}
              </div>

              <button
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-[13px] transition-all hover:gap-3 mt-4 ${card.btnColor}`}
                onClick={(e) => handleDashboardClick(e, card)}
              >
                Enter Dashboard
                <ArrowRight className="w-4 h-4 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </main>
      
      {/* Absolute Chat Button replica for consistency if needed, though FloatingChatbot covers it globally */}
    </div>
  );
}

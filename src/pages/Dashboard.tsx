import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Shield, Eye, ArrowRight } from "lucide-react";
import { TopNav } from "@/components/dashboard/TopNav";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { ChatAssistant } from "@/components/dashboard/ChatAssistant";
import { BroadcastModal } from "@/components/dashboard/BroadcastModal";
import { FormAModal } from "@/components/dashboard/FormAModal";
import { useBackend } from "@/backend/BackendContext";
import type { Role, Event } from "@/types";

const DASHBOARD_CARDS = [
  {
    role: "Resident" as Role,
    route: "/public-dashboard",
    title: "Public AQI Dashboard",
    subtitle: "Resident View",
    description: "Check real-time air quality for your region. Get AQI levels, health advisories, and nearby station data instantly after selecting your area.",
    icon: Eye,
    color: "emerald",
    features: ["Live AQI by region", "PM2.5 / PM10 / SO₂ data", "AQI trend charts", "Health advisories"],
    gradient: "from-emerald-900/40 to-teal-900/20",
    border: "border-emerald-500/20",
    glow: "shadow-[0_0_60px_rgba(16,185,129,0.08)]",
    iconBg: "bg-emerald-500/20 border-emerald-500/40",
    iconColor: "text-emerald-400",
    tag: "Public",
    tagColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    btnColor: "bg-emerald-500 hover:bg-emerald-400 text-black",
  },
  {
    role: "Sarpanch" as Role,
    route: "/sarpanch-dashboard",
    title: "Sarpanch Dashboard",
    subtitle: "Village Admin View",
    description: "Manage village-level environmental complaints, monitor factory compliance nearby, track welfare schemes and broadcast emergency alerts to residents.",
    icon: Users,
    color: "amber",
    features: ["Resident complaints", "Factory compliance", "Welfare schemes", "Village AQI overview"],
    gradient: "from-amber-900/30 to-orange-900/20",
    border: "border-amber-500/20",
    glow: "shadow-[0_0_60px_rgba(245,158,11,0.06)]",
    iconBg: "bg-amber-500/20 border-amber-500/40",
    iconColor: "text-amber-400",
    tag: "Village Admin",
    tagColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    btnColor: "bg-amber-500 hover:bg-amber-400 text-black",
  },
  {
    role: "Inspector" as Role,
    route: "/inspector-dashboard",
    title: "Inspector Console",
    subtitle: "GSPCB Official View",
    description: "Full command center for GSPCB inspectors. Audit factory emissions, generate Form-A notices, issue enforcement orders, and broadcast emergency alerts.",
    icon: Shield,
    color: "blue",
    features: ["Factory emission audits", "Form-A generation", "Enforcement actions", "Emergency broadcast"],
    gradient: "from-blue-900/30 to-indigo-900/20",
    border: "border-blue-500/20",
    glow: "shadow-[0_0_60px_rgba(96,165,250,0.06)]",
    iconBg: "bg-blue-500/20 border-blue-500/40",
    iconColor: "text-blue-400",
    tag: "GSPCB Official",
    tagColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    btnColor: "bg-blue-500 hover:bg-blue-400 text-white",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("Resident");
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [formModalEvent, setFormModalEvent] = useState<Event | null>(null);
  const { nodes, faultReports } = useBackend();
  const activeCount = nodes.filter(s => s.status === 'Active').length;
  const faultCount = faultReports.length;

  return (
    <div className="min-h-screen bg-[#030914] flex flex-col overflow-hidden relative">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-amber-600/4 rounded-full blur-[120px]" />
      </div>

      <TopNav
        role={role}
        setRole={(r) => {
          setRole(r);
          // Navigate to the role-specific dashboard on selection
          const card = DASHBOARD_CARDS.find(c => c.role === r);
          if (card) navigate(card.route);
        }}
        onBroadcastClick={() => setShowBroadcast(true)}
      />

      <AlertBanner events={[]} />

      <div className="flex-1 overflow-y-auto relative z-10">
        {/* Hero */}
        <div className="text-center pt-12 pb-8 px-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/60 border border-white/10 text-xs text-slate-400 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {activeCount} sensors live · {faultCount} faults detected
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent mb-4 leading-tight">
            Choose Your Dashboard
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            EcoSentinel provides three specialized dashboards — each tailored to your role in the environmental monitoring ecosystem.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="max-w-6xl mx-auto px-6 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DASHBOARD_CARDS.map((card) => (
              <div
                key={card.role}
                className={`relative group rounded-2xl border ${card.border} bg-gradient-to-br ${card.gradient} p-6 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${card.glow} cursor-pointer backdrop-blur-sm`}
                onClick={() => navigate(card.route)}
              >
                {/* Tag */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${card.tagColor}`}>
                    {card.tag}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 opacity-60 animate-pulse" />
                </div>

                {/* Icon + Title */}
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${card.iconBg} border flex items-center justify-center flex-shrink-0`}>
                    <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">{card.title}</h2>
                    <p className={`text-xs font-medium ${card.iconColor} mt-0.5`}>{card.subtitle}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-400 text-sm leading-relaxed">{card.description}</p>

                {/* Features */}
                <div className="space-y-1.5 flex-1">
                  {card.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-slate-400">
                      <div className={`w-1 h-1 rounded-full ${card.iconColor}`} />
                      {f}
                    </div>
                  ))}
                </div>

                {/* Button */}
                <button
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${card.btnColor} group-hover:gap-3`}
                  onClick={(e) => { e.stopPropagation(); navigate(card.route); }}
                >
                  Enter Dashboard
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ChatAssistant />

      {showBroadcast && (
        <BroadcastModal onClose={() => setShowBroadcast(false)} onSend={() => setShowBroadcast(false)} />
      )}
      {formModalEvent && (
        <FormAModal event={formModalEvent} onClose={() => setFormModalEvent(null)} />
      )}
    </div>
  );
}

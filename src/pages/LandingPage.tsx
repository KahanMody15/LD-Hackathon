import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { GlowCard } from "@/components/ui/spotlight-card";
import { RippleBackground } from "@/components/landing/RippleBackground";
import { BoxReveal } from "@/components/landing/BoxReveal";
import { MapPanel } from "@/components/dashboard/MapPanel";
import { useRealTimeData } from "@/hooks/useRealTimeData";
import { MoveRight, Activity, Zap, Palette, Puzzle, Book, Package, Brain, Phone, Mail, MapPin } from "lucide-react";

// Regional dynamic data simulation parameters
const regionDataMap: Record<string, { pm25: number, pm10: number, so2: number, alertCount: number, status: string, color: string }> = {
  "Ahmedabad": { pm25: 112, pm10: 165, so2: 34, alertCount: 3, status: "Hazardous", color: "text-red-500" },
  "Surat": { pm25: 58, pm10: 102, so2: 18, alertCount: 1, status: "Moderate", color: "text-warning" },
  "Vadodara": { pm25: 35, pm10: 68, so2: 11, alertCount: 0, status: "Good", color: "text-emerald-400" },
  "Rajkot": { pm25: 84, pm10: 130, so2: 26, alertCount: 2, status: "Poor", color: "text-orange-500" }
};

export default function LandingPage() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const [selectedRegion, setSelectedRegion] = useState("");
  const { sensors, factories, activeEvents } = useRealTimeData();

  useEffect(() => {
    if (selectedRegion) {
      setTimeout(() => {
        document.getElementById("public-dashboard")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [selectedRegion]);

  const currentRegionData = regionDataMap[selectedRegion] || {
    pm25: 45, pm10: 82, so2: 12, alertCount: 0, status: "Moderate", color: "text-emerald-400"
  };

  return (
    <div className="min-h-screen bg-dark-base relative overflow-hidden flex flex-col font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/20 via-dark-base to-dark-base pointer-events-none"></div>
      <RippleBackground />
      
      {/* Nav */}
      <nav className="relative z-50 flex items-center justify-between p-6 md:px-12 border-b border-white/5 bg-dark-base/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">EcoSentinel</span>
        </div>
        {/* Sign In button moved down as requested */}
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-32 pb-24 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center hero-content cosmos-content gap-6">
          <BoxReveal boxColor="#10b981" duration={0.6}>
            <h1 ref={titleRef} className="hero-title text-5xl md:text-7xl font-bold text-white tracking-tight">
              Hyperlocal Pollution Evidence Engine
            </h1>
          </BoxReveal>

          <BoxReveal boxColor="#10b981" duration={0.8}>
            <div ref={subtitleRef} className="hero-subtitle cosmos-subtitle text-gray-400 text-xl max-w-2xl mx-auto">
              <p className="subtitle-line mt-2">
                Detect Pollution. Prove It.
              </p>
              <p className="subtitle-line mt-1">
                Take Action with Data.
              </p>
            </div>
          </BoxReveal>

          <BoxReveal boxColor="#3b82f6" duration={1.0}>
            <div className="flex flex-col sm:flex-row shadow-2xl items-center gap-4 mt-8">
              {/* Region Dropdown */}
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 pointer-events-none" />
                <select
                  className="pl-12 pr-6 py-4 rounded-xl bg-zinc-900/80 text-white border border-zinc-700/50 hover:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-lg font-medium appearance-none min-w-[200px] cursor-pointer transition-colors"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  <option value="">Select Region</option>
                  <option value="Ahmedabad">Ahmedabad</option>
                  <option value="Surat">Surat</option>
                  <option value="Vadodara">Vadodara</option>
                  <option value="Rajkot">Rajkot</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
              
              <button
                onClick={() => {
                  const el = document.getElementById("sign-in-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] shadow-emerald-500/20"
              >
                Get Started
              </button>
            </div>
          </BoxReveal>
        </div>
      </main>

      {/* Dynamic Public AQI Dashboard Section */}
      {selectedRegion && (
        <section id="public-dashboard" className="relative z-10 py-16 px-6 md:px-12 bg-emerald-950/20 border-y border-emerald-900/30 scroll-mt-24">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <MapPin className="text-emerald-500 w-8 h-8" /> 
                  Public AQI Dashboard: {selectedRegion}
                </h2>
                <p className="text-emerald-200/60 mt-2">Live environmental compliance data for citizens.</p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center gap-3 bg-zinc-900/50 px-4 py-2 rounded-lg border border-zinc-800">
                <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${currentRegionData.color.replace('text-', 'bg-')}`}></div>
                <span className={`text-sm font-medium ${currentRegionData.color}`}>Live Status: {currentRegionData.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-zinc-900/60 p-6 rounded-2xl border border-white/5">
                <p className="text-gray-400 text-sm mb-1">PM2.5</p>
                <p className="text-3xl font-bold text-white">{currentRegionData.pm25}<span className="text-sm text-gray-500 font-normal ml-1">µg/m³</span></p>
              </div>
              <div className="bg-zinc-900/60 p-6 rounded-2xl border border-white/5">
                <p className="text-gray-400 text-sm mb-1">PM10</p>
                <p className="text-3xl font-bold text-white">{currentRegionData.pm10}<span className="text-sm text-gray-500 font-normal ml-1">µg/m³</span></p>
              </div>
              <div className="bg-zinc-900/60 p-6 rounded-2xl border border-white/5">
                <p className="text-gray-400 text-sm mb-1">SO2</p>
                <p className="text-3xl font-bold text-white">{currentRegionData.so2}<span className="text-sm text-gray-500 font-normal ml-1">ppb</span></p>
              </div>
              <div className={`bg-zinc-900/60 p-6 rounded-2xl border ${currentRegionData.alertCount > 0 ? 'border-warning/50' : 'border-white/5'}`}>
                <p className={`${currentRegionData.alertCount > 0 ? 'text-warning' : 'text-gray-400'} text-sm mb-1 font-medium`}>Active Alerts</p>
                <p className={`text-2xl font-bold ${currentRegionData.alertCount > 0 ? 'text-warning' : 'text-emerald-500'} flex items-center gap-2`}>
                  <Zap className={`w-5 h-5 ${currentRegionData.alertCount > 0 ? 'fill-warning text-warning' : 'fill-emerald-500 text-emerald-500'}`} /> {currentRegionData.alertCount} Warning{currentRegionData.alertCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <div className="mt-8 bg-zinc-900/40 border border-white/5 rounded-2xl p-6 hidden md:block">
               <div className="h-[400px] w-full rounded-xl flex items-center justify-center border border-zinc-700/50 relative overflow-hidden">
                 <MapPanel sensors={sensors} factories={factories} activeEvents={activeEvents} />
               </div>
            </div>
          </div>
        </section>
      )}

      {/* Air Quality Index - Modern SaaS Section */}
      <section className="relative z-10 py-24 px-6 md:px-12 bg-black/40 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Air Quality Index Features</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Explore dynamic insights into air quality data driven by interconnected sensor endpoints. Focus on clarity, health, and precision tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 cursor-crosshair">
            
            {/* Feature 1 */}
            <GlowCard glowColor="blue" size="md" customSize className="bg-zinc-900/60 w-full h-full p-8 border-transparent">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-5">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">Real-Time Sync</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Lightning fast updates from sensor arrays directly into the monitoring engine without delay.
              </p>
            </GlowCard>

            {/* Feature 2 */}
            <GlowCard glowColor="purple" size="md" customSize className="bg-zinc-900/60 w-full h-full p-8 border-transparent">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-5">
                <Palette className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">Visual Reporting</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Color-coded indicators and rich map integrations make interpreting hazard zones effortless.
              </p>
            </GlowCard>

            {/* Feature 3 */}
            <GlowCard glowColor="green" size="md" customSize className="bg-zinc-900/60 w-full h-full p-8 border-transparent">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-5">
                <Puzzle className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">Module Integrations</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Connect external reporting tools, compliance checkers, and alert webhooks flawlessly.
              </p>
            </GlowCard>

            {/* Feature 4 */}
            <GlowCard glowColor="orange" size="md" customSize className="bg-zinc-900/60 w-full h-full p-8 border-transparent">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-5">
                <Book className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">Compliant Ledgers</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Cryptographically secured log generations ensure your data is always audit-ready.
              </p>
            </GlowCard>

            {/* Feature 5 */}
            <GlowCard glowColor="blue" size="md" customSize className="bg-zinc-900/60 w-full h-full p-8 border-transparent">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center mb-5">
                <Package className="w-6 h-6 text-sky-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">Sensor Packages</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Ready-made hardware configuration definitions for rapid scaling of environmental monitoring areas.
              </p>
            </GlowCard>

            {/* Feature 6 */}
            <GlowCard glowColor="red" size="md" customSize className="bg-zinc-900/60 w-full h-full p-8 border-transparent">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-5">
                <Brain className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">AI Diagnostics</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Embedded assistant utilizes linear regression thresholds to identify anomalies accurately.
              </p>
            </GlowCard>

          </div>

          {/* Sign In Button Moved Below Features */}
          <div id="sign-in-section" className="mt-20 flex flex-col items-center justify-center text-center scroll-mt-32">
            <h3 className="text-2xl font-bold text-white mb-6">Ready to manage your fleet?</h3>
            <Link 
              to="/auth" 
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-indigo-600 rounded-xl overflow-hidden shadow-2xl transition-transform hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></div>
              <span className="relative flex items-center gap-2">
                Sign In to Dashboard <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Modern Responsive Footer */}
      <footer className="relative z-10 bg-black pt-16 pb-8 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            
            {/* Left Column - Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-black" />
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">EcoSentinel</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                Providing actionable environmental telemetry to industrial corridors. We empower civil bodies with irrefutable, AI-analyzed pollution data.
              </p>
            </div>

            {/* Right Column - Navigation & Contact */}
            <div className="grid grid-cols-2 gap-8 md:justify-items-end">
              
              {/* Links */}
              <div className="space-y-4">
                <h4 className="text-gray-200 font-semibold text-sm uppercase tracking-wider">Company</h4>
                <nav className="flex flex-col space-y-3">
                  <Link to="/" className="text-sm text-gray-500 hover:text-white transition-colors">Home</Link>
                  <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">About Us</a>
                  <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Contact Us</a>
                  <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Privacy Policy</a>
                </nav>
              </div>

              {/* Contact */}
              <div className="space-y-4">
                <h4 className="text-gray-200 font-semibold text-sm uppercase tracking-wider">Contact</h4>
                <div className="flex flex-col space-y-3">
                  <a href="mailto:support@ecosentinel.io" className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-2">
                    <Mail className="w-4 h-4" /> support@ecosentinel.io
                  </a>
                  <a href="tel:+919876543210" className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-2">
                    <Phone className="w-4 h-4" /> +91 98765 43210
                  </a>
                </div>
              </div>

            </div>
          </div>

          <div className="pt-8 border-t border-zinc-800 text-center flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-zinc-600">
              © 2026 EcoSentinel Inc. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-zinc-600 hover:text-emerald-500 transition-colors">Terms of Service</a>
              <a href="#" className="text-zinc-600 hover:text-emerald-500 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

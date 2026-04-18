import { useState, useMemo } from "react";
import { Activity, MapPin, Wind, AlertTriangle, ArrowLeft, Compass, Send, MessageSquarePlus, CheckCircle, Loader2, ChevronDown, ChevronUp, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBackend } from "@/backend/BackendContext";
import { WindCompass } from "@/components/dashboard/WindCompass";
import { submitPublicComplaint, getComplaints } from "@/backend/complaintEngine";
import type { PublicComplaintInput } from "@/backend/complaintEngine";
import { logout } from "@/backend/authStore";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function aqiLevel(aqi: number) {
  if (aqi <= 50)  return { label:"Good", color:"#22c55e", bg:"bg-green-500/10", border:"border-green-500/30", text:"text-green-400" };
  if (aqi <= 100) return { label:"Moderate", color:"#eab308", bg:"bg-yellow-500/10", border:"border-yellow-500/30", text:"text-yellow-400" };
  if (aqi <= 150) return { label:"Unhealthy (SG)", color:"#f97316", bg:"bg-orange-500/10", border:"border-orange-500/30", text:"text-orange-400" };
  if (aqi <= 200) return { label:"Unhealthy", color:"#ef4444", bg:"bg-red-500/10", border:"border-red-500/30", text:"text-red-400" };
  if (aqi <= 300) return { label:"Very Unhealthy", color:"#a855f7", bg:"bg-purple-500/10", border:"border-purple-500/30", text:"text-purple-400" };
  return { label:"Hazardous", color:"#991b1b", bg:"bg-red-900/20", border:"border-red-800/50", text:"text-red-300" };
}

function AQIGauge({ aqi }: { aqi: number }) {
  const pct = Math.min(aqi / 500, 1);
  const level = aqiLevel(aqi);
  const angle = -135 + pct * 270;
  const cx = 100, cy = 100, r = 80;
  const pt = (cx: number, cy: number, r: number, a: number) => {
    const rad = ((a - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const arc = (s: number, e: number) => {
    const sp = pt(cx, cy, r, s), ep = pt(cx, cy, r, e);
    return `M ${sp.x} ${sp.y} A ${r} ${r} 0 ${e - s > 180 ? 1 : 0} 1 ${ep.x} ${ep.y}`;
  };
  const needle = pt(cx, cy, 65, angle);
  return (
    <svg viewBox="0 0 200 160" className="w-full max-w-[200px]">
      <path d={arc(-135,135)} fill="none" stroke="#1e293b" strokeWidth="16" strokeLinecap="round"/>
      {[[-135,-81,"#22c55e"],[-81,-27,"#eab308"],[-27,27,"#f97316"],[27,81,"#ef4444"],[81,108,"#a855f7"],[108,135,"#991b1b"]].map(([s,e,c])=>(
        <path key={String(s)} d={arc(Number(s),Number(e))} fill="none" stroke={String(c)} strokeWidth="14" strokeLinecap="round" opacity="0.8"/>
      ))}
      <line x1={cx} y1={cy} x2={needle.x} y2={needle.y} stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r="5" fill="white"/>
      <text x={cx} y={cy+28} textAnchor="middle" fill="white" fontSize="26" fontWeight="bold">{Math.round(aqi)}</text>
      <text x={cx} y={cy+46} textAnchor="middle" fill={level.color} fontSize="8.5" fontWeight="600">{level.label}</text>
    </svg>
  );
}

const VILLAGES = ["Ankleshwar","Panoli","Jhagadia","Amod","Vagra","Jambusar"];
const CONCERNS = ["Black smoke / soot","Chemical odour","Burning eyes / irritation","Effluent in water body","Noise from factory","Dust / particulate matter","Other"];

export default function PublicDashboard() {
  const navigate = useNavigate();
  const { nodes, inference } = useBackend();

  // Complaint form state
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [complaints, setComplaints] = useState(() => getComplaints());
  const [showComplaints, setShowComplaints] = useState(false);
  const [form, setForm] = useState<PublicComplaintInput>({
    residentName: '', village: '', phone: '', description: '',
    pollutantConcern: '', currentAQI: 0, pm25: 0, so2: 0,
  });

  const active = nodes.filter(n => n.status === 'Active');
  const avgAQI  = active.length ? Math.round(active.reduce((s,n) => s+n.aqi,0)/active.length) : 0;
  const avgPM25 = active.length ? +(active.reduce((s,n) => s+n.pm25,0)/active.length).toFixed(1) : 0;
  const avgSO2  = active.length ? +(active.reduce((s,n) => s+n.so2,0)/active.length).toFixed(1) : 0;
  const avgWS   = active.length ? +(active.reduce((s,n) => s+n.windSpeed,0)/active.length).toFixed(1) : 0;
  const level   = aqiLevel(avgAQI);

  // Fake trend from current reading
  const trend = useMemo(() => {
    const base = avgAQI || 100;
    return Array.from({length:8},(_,i)=>({ t:`${7-i}m ago`, aqi: Math.round(base + Math.sin(i*0.8)*18 + (Math.random()-0.5)*12) })).reverse();
  }, [avgAQI]);

  const handleFormChange = (field: keyof typeof form, val: string) =>
    setForm(prev => ({ ...prev, [field]: val }));

  const handleSubmitComplaint = async () => {
    if (!form.residentName || !form.village || !form.pollutantConcern) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 700));
    const record = submitPublicComplaint({ ...form, currentAQI: avgAQI, pm25: avgPM25, so2: avgSO2 });
    setComplaints(getComplaints());
    setSubmitSuccess(record.gspcbTicketNumber ?? 'Submitted');
    setSubmitting(false);
    setShowForm(false);
    setShowComplaints(true);
    setForm({ residentName:'', village:'', phone:'', description:'', pollutantConcern:'', currentAQI:0, pm25:0, so2:0 });
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all";

  return (
    <div className="min-h-screen bg-[#030914] text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#030914]/80 backdrop-blur-lg border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
          <ArrowLeft className="w-4 h-4 text-slate-400" />
        </button>
        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
          <Activity className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">EcoSentinel</div>
          <div className="text-[10px] text-emerald-400">Public AQI Dashboard</div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400 font-semibold">Live Data</span>
          </div>
          <button
            onClick={() => { logout(); navigate('/auth'); }}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Submit success toast */}
        {submitSuccess && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <div className="text-sm font-bold text-emerald-400">Complaint filed successfully!</div>
              <div className="text-xs text-slate-400">Ticket: <span className="font-mono text-emerald-300">{submitSuccess}</span> · Forwarded to Sarpanch dashboard</div>
            </div>
            <button onClick={() => setSubmitSuccess(null)} className="ml-auto text-slate-500 hover:text-white text-lg leading-none">&times;</button>
          </div>
        )}

        {/* AQI Overview row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label:'Avg AQI', value: avgAQI, unit:'', color: level.text },
            { label:'PM2.5', value: avgPM25, unit:'µg/m³', color:'text-sky-400' },
            { label:'SO₂', value: avgSO2, unit:'µg/m³', color:'text-amber-400' },
            { label:'Wind Speed', value: avgWS, unit:'m/s', color:'text-violet-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-900/50 border border-white/5 rounded-2xl p-4">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{s.label}</div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-slate-600 mt-0.5">{s.unit}</div>
            </div>
          ))}
        </div>

        {/* AQI Gauge + Wind Compass */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 flex flex-col items-center">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 self-start">Zone AQI</h3>
            <AQIGauge aqi={avgAQI} />
            <div className={`mt-3 text-xs font-semibold px-3 py-1 rounded-full ${level.bg} ${level.border} border ${level.text}`}>
              {level.label}
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">Based on {active.length} active sensor nodes</p>
          </div>

          <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-sky-400" /> Wind &amp; Source Compass
            </h3>
            <WindCompass nodes={nodes} inference={inference} />
          </div>
        </div>

        {/* AQI Trend */}
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">AQI Trend (last 8 ticks)</h3>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="aqiG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={level.color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={level.color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" stroke="#ffffff20" fontSize={9} tickLine={false} axisLine={false}/>
                <YAxis stroke="#ffffff20" fontSize={9} tickLine={false} axisLine={false} domain={['auto','auto']}/>
                <Tooltip contentStyle={{ backgroundColor:'#0f172a', border:'1px solid #ffffff10', borderRadius:'8px', fontSize:'12px' }}/>
                <Area type="monotone" dataKey="aqi" stroke={level.color} fill="url(#aqiG)" strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Sensor Nodes */}
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Live Sensor Stations ({nodes.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {nodes.map(n => {
              const lv = aqiLevel(n.aqi);
              return (
                <div key={n.id} className={`rounded-xl p-3 border ${lv.border} ${lv.bg}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-bold text-white">{n.name}</div>
                      <div className="text-[10px] text-slate-500">{n.village}</div>
                    </div>
                    <div className={`text-xs font-bold px-2 py-0.5 rounded ${lv.bg} ${lv.text} border ${lv.border}`}>
                      {n.status === 'Active' ? `AQI ${Math.round(n.aqi)}` : n.status}
                    </div>
                  </div>
                  {n.status === 'Active' && (
                    <div className="mt-2 grid grid-cols-3 gap-1 text-[10px]">
                      <div><span className="text-slate-500">PM2.5 </span><span className="text-white font-semibold">{n.pm25.toFixed(0)}</span></div>
                      <div><span className="text-slate-500">SO₂ </span><span className="text-white font-semibold">{n.so2.toFixed(0)}</span></div>
                      <div><span className="text-slate-500">Wind </span><span className="text-white font-semibold">{n.windDirLabel}</span></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Source inference */}
        {inference && (
          <div className="bg-slate-900/50 border border-orange-500/20 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Wind className="w-3.5 h-3.5 text-orange-400" /> Pollution Source Inference
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {[
                { label:'Wind from', value: inference.windVectorLabel, color:'text-sky-400' },
                { label:'Source bearing', value: `${inference.bearingDeg}°`, color:'text-orange-400' },
                { label:'Est. distance', value: `${inference.distanceKm} km`, color:'text-white' },
                { label:'Confidence', value: `${(inference.confidence*100).toFixed(0)}%`, color:'text-white' },
              ].map(it => (
                <div key={it.label} className="bg-slate-800/50 rounded-xl p-3">
                  <div className="text-[10px] text-slate-500 mb-0.5">{it.label}</div>
                  <div className={`font-bold ${it.color}`}>{it.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 rounded-xl bg-orange-500/5 border border-orange-500/15 text-xs text-orange-300">{inference.description}</div>
          </div>
        )}

        {/* Complaint section */}
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowForm(f => !f)}
            className="w-full flex items-center justify-between p-5 hover:bg-white/2 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                <MessageSquarePlus className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-white">File a Pollution Complaint</div>
                <div className="text-xs text-slate-500">Directly forwarded to Sarpanch &amp; GSPCB dashboard</div>
              </div>
            </div>
            {showForm ? <ChevronUp className="w-4 h-4 text-slate-400"/> : <ChevronDown className="w-4 h-4 text-slate-400"/>}
          </button>

          {showForm && (
            <div className="px-5 pb-5 space-y-3 border-t border-white/5 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">Your Name *</label>
                  <input className={inputCls} placeholder="Full name" value={form.residentName} onChange={e=>handleFormChange('residentName',e.target.value)}/>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">Village *</label>
                  <select className={inputCls} value={form.village} onChange={e=>handleFormChange('village',e.target.value)}>
                    <option value="">Select village</option>
                    {VILLAGES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">Phone</label>
                  <input className={inputCls} placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e=>handleFormChange('phone',e.target.value)}/>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">Concern *</label>
                  <select className={inputCls} value={form.pollutantConcern} onChange={e=>handleFormChange('pollutantConcern',e.target.value)}>
                    <option value="">Select type</option>
                    {CONCERNS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">Description</label>
                <textarea className={`${inputCls} resize-none`} rows={3} placeholder="Describe what you observed, when it started, location details…" value={form.description} onChange={e=>handleFormChange('description',e.target.value)}/>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <div className="text-xs text-slate-500">Current readings will be auto-attached: AQI {avgAQI} · PM2.5 {avgPM25} · SO₂ {avgSO2}</div>
                <button
                  onClick={handleSubmitComplaint}
                  disabled={submitting || !form.residentName || !form.village || !form.pollutantConcern}
                  className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold rounded-xl text-sm transition-all flex-shrink-0"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Send className="w-3.5 h-3.5"/>}
                  {submitting ? 'Submitting…' : 'Submit Complaint'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Complaints list */}
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
          <button
            onClick={() => { setComplaints(getComplaints()); setShowComplaints(c => !c); }}
            className="w-full flex items-center justify-between p-5 hover:bg-white/2 transition-colors"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-orange-400"/>
              <span className="text-sm font-bold text-white">Filed Complaints</span>
              {complaints.length > 0 && (
                <span className="text-xs px-2 py-0.5 bg-orange-500/15 text-orange-400 border border-orange-500/25 rounded-full font-semibold">{complaints.length}</span>
              )}
            </div>
            {showComplaints ? <ChevronUp className="w-4 h-4 text-slate-400"/> : <ChevronDown className="w-4 h-4 text-slate-400"/>}
          </button>

          {showComplaints && (
            <div className="border-t border-white/5">
              {complaints.length === 0 ? (
                <div className="text-center py-10 text-slate-600 text-sm">No complaints filed yet.</div>
              ) : (
                <div className="divide-y divide-white/5">
                  {complaints.slice(0,10).map(c => (
                    <div key={c.id} className="px-5 py-4 flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{c.eventType}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {c.village} · {c.sarpanchName} · {c.submittedTimestamp?.toLocaleString() ?? '—'}
                        </div>
                        {c.aqiAtEvent > 0 && (
                          <div className="text-[10px] text-slate-600 mt-0.5">AQI {c.aqiAtEvent} · PM2.5 {c.pm25AtEvent} · SO₂ {c.so2AtEvent}</div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-400' :
                          c.status === 'Submitted' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>{c.status}</span>
                        {c.gspcbTicketNumber && <span className="text-[10px] font-mono text-slate-500">{c.gspcbTicketNumber}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

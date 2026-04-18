import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import {
  Activity, Eye, Users, Shield, AlertCircle, CheckCircle, Loader2,
} from "lucide-react";
import { registerUser, loginUser, seedDemoUsers, logout } from '@/backend/authStore';
import type { User } from '@/backend/authStore';

type FormData = {
  name: string;
  email: string;
  password: string;
  role: User['role'] | '';
  village: string;
};

const ROLE_ROUTES: Record<string, string> = {
  Resident: '/public-dashboard',
  Sarpanch: '/sarpanch-dashboard',
  Inspector: '/inspector-dashboard',
};

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '', email: '', password: '', role: '', village: '',
  });

  // Visiting /auth always means the user wants to (re)login — clear any stale session
  useEffect(() => {
    seedDemoUsers();
    logout(); // clear existing session so we never auto-redirect
  }, []);

  const handle = (field: keyof FormData) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
      setError('');
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.role) { setError('Please select your dashboard role.'); return; }
    if (!formData.email) { setError('Email is required.'); return; }
    if (!formData.password) { setError('Password is required.'); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 600)); // simulate async

    if (isLogin) {
      const result = loginUser(formData.email, formData.password, formData.role as User['role']);
      if (!result.ok) { setError(result.error); setLoading(false); return; }
      setSuccess(`Welcome back, ${result.session.name}!`);
      await new Promise(r => setTimeout(r, 800));
      navigate(ROLE_ROUTES[result.session.role] || '/dashboard');
    } else {
      if (!formData.name.trim()) { setError('Full name is required.'); setLoading(false); return; }
      const result = registerUser(
        formData.name, formData.email, formData.password,
        formData.role as User['role'], formData.village || undefined
      );
      if (!result.ok) { setError(result.error); setLoading(false); return; }
      // Auto-login after register
      const loginResult = loginUser(formData.email, formData.password, formData.role as User['role']);
      if (loginResult.ok) {
        setSuccess(`Account created! Welcome, ${result.user.name}!`);
        await new Promise(r => setTimeout(r, 800));
        navigate(ROLE_ROUTES[result.user.role] || '/dashboard');
      }
    }
    setLoading(false);
  };

  // 3D Tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all";
  const labelCls = "block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5";

  return (
    <div className='min-h-screen bg-[#030914] relative flex items-center justify-center p-6 overflow-hidden'>
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-transparent to-black pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Logo */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Activity className="w-7 h-7 text-emerald-500" />
        <span className="text-lg font-bold text-white tracking-tight">EcoSentinel</span>
      </div>

      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { x.set(0); y.set(0); }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative z-10 w-full max-w-md"
      >
        <div style={{ transform: "translateZ(50px)" }}
          className="bg-black/40 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.5)] overflow-hidden relative group">
          {/* Shine */}
          <div className="absolute top-0 left-[-100%] w-[200%] h-full bg-gradient-to-r from-transparent via-white/4 to-transparent skew-x-[-45deg] group-hover:left-[100%] transition-all duration-[1500ms] pointer-events-none" />

          {/* Dashboard badges */}
          <div className="mb-6">
            <div className="text-center text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-3">3 Specialized Dashboards</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Eye, label: 'Public', sub: 'Live AQI', color: 'emerald' },
                { icon: Users, label: 'Sarpanch', sub: 'Village admin', color: 'amber' },
                { icon: Shield, label: 'Inspector', sub: 'GSPCB HQ', color: 'blue' },
              ].map(({ icon: Icon, label, sub, color }) => (
                <div key={label} className={`flex flex-col items-center gap-1 p-2.5 rounded-xl bg-${color}-500/5 border border-${color}-500/20 text-center`}>
                  <Icon className={`w-4 h-4 text-${color}-400`} />
                  <span className={`text-[10px] font-bold text-${color}-300`}>{label}</span>
                  <span className="text-[9px] text-slate-500 leading-tight">{sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl">
            {['Sign In', 'Sign Up'].map((tab, i) => (
              <button
                key={tab}
                onClick={() => { setIsLogin(i === 0); setError(''); setSuccess(''); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${isLogin === (i === 0) ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className={labelCls}>Full Name</label>
                <input className={inputCls} type="text" placeholder="Enter your full name" value={formData.name} onChange={handle('name')} />
              </div>
            )}

            <div>
              <label className={labelCls}>Email</label>
              <input className={inputCls} type="email" placeholder="you@example.com" value={formData.email} onChange={handle('email')} />
            </div>

            <div>
              <label className={labelCls}>Password</label>
              <input className={inputCls} type="password" placeholder={isLogin ? 'Enter your password' : 'Min 6 characters'} value={formData.password} onChange={handle('password')} />
            </div>

            <div>
              <label className={labelCls}>Dashboard Role</label>
              <select className={inputCls} value={formData.role} onChange={handle('role')}>
                <option value="">Select your role</option>
                <option value="Resident">Resident (Public AQI Dashboard)</option>
                <option value="Sarpanch">Sarpanch (Village Admin)</option>
                <option value="Inspector">Inspector (GSPCB Official)</option>
              </select>
            </div>

            {!isLogin && formData.role === 'Sarpanch' && (
              <div>
                <label className={labelCls}>Village Name</label>
                <input className={inputCls} type="text" placeholder="e.g. Ankleshwar, Panoli" value={formData.village} onChange={handle('village')} />
              </div>
            )}

            {/* Error / Success */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Please wait…' : isLogin ? 'Sign In' : 'Create Account'}
            </button>

            {/* Demo hint */}
            <div className="text-center text-[11px] text-slate-600 mt-2">
              Demo: <span className="text-slate-400">resident@demo.com</span> · <span className="text-slate-400">sarpanch@demo.com</span> · <span className="text-slate-400">inspector@demo.com</span><br />
              Password: <span className="text-slate-400">demo123</span>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

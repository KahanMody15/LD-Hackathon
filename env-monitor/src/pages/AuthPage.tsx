import { useState, useEffect } from "react";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
=======
import { ArrowLeft, Activity, Users, ShieldCheck, Building } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
>>>>>>> 49bfb2f (save before pull)
import { setCurrentSession, clearSession } from '@/lib/store';
import { Eye, Users, ShieldAlert, EyeOff, ArrowLeft } from "lucide-react";

type Role = 'Resident' | 'Sarpanch' | 'Inspector';

export default function AuthPage() {
  const navigate = useNavigate();
<<<<<<< HEAD
  const [selectedRole, setSelectedRole] = useState<Role>('Resident');
  const [isSignIn, setIsSignIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
=======
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<'Resident' | 'Sarpanch' | 'Inspector'>('Resident');
>>>>>>> 49bfb2f (save before pull)

  useEffect(() => {
    clearSession();
  }, []);

  const handleAuth = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("Email") as string;
    const name = formData.get("Name") as string;
    
<<<<<<< HEAD
    // Auth Logic
    setCurrentSession({
      id: `usr-${Date.now()}`,
      name: name || email.split('@')[0],
      email: email,
=======
    setCurrentSession({
      id: `usr-${Date.now()}`,
      name: email ? email.split('@')[0] : selectedRole,
      email: email || `${selectedRole.toLowerCase()}@demo.com`,
>>>>>>> 49bfb2f (save before pull)
      role: selectedRole
    });

    if (selectedRole === 'Sarpanch') navigate('/sarpanch-dashboard');
    else if (selectedRole === 'Inspector') navigate('/inspector-dashboard');
    else navigate('/public-dashboard');
  };

  // The AuthTabs component from modern-animated-sign-in will automatically handle the form rendering.
  // We need to pass googleLogin string to it, but the type in AuthTabs limits us. We'll reconstruct the page to ensure googleLogin renders!
  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-[#0A0F1A] text-white flex flex-col items-center py-12 relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-0 left-[-20%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-[-20%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Home Button */}
      <div className="absolute top-8 left-8 flex items-center gap-3 w-full px-6 z-20">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" /> Go to Landing Page
        </button>
      </div>

      {/* Role Selection Container */}
      <div className="z-10 mb-12 flex flex-col items-center">
        <p className="text-emerald-400 font-bold tracking-widest text-xs mb-4 uppercase">
          3 Specialized Dashboards
        </p>
        <div className="flex gap-4">
          {/* Public Button */}
          <button
            type="button"
            onClick={() => setSelectedRole('Resident')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
              selectedRole === 'Resident' 
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
            } w-32`}
          >
            <Eye className="w-5 h-5 mb-2" />
            <span className="font-semibold text-sm text-white mb-1">Public</span>
            <span className="text-[10px] text-center opacity-80">Live AQI by region</span>
          </button>
=======
    <div className='min-h-screen bg-dark-base flex flex-col items-center justify-center p-6 font-sans text-slate-200 transition-colors relative overflow-hidden'>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-dark-base to-dark-base pointer-events-none"></div>
      
      {/* Floating Orbs in Background */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full mix-blend-screen filter blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/10 rounded-full mix-blend-screen filter blur-3xl animate-float-delayed"></div>

      <div className="absolute top-8 left-8 z-10">
        <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300 transform hover:-translate-x-2 text-sm font-medium hover:shadow-lg bg-zinc-900/50 px-4 py-2 rounded-xl border border-zinc-800 hover:border-zinc-700 backdrop-blur-md">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <div className="w-full max-w-[420px] bg-zinc-900/40 border border-white/10 rounded-2xl p-[40px] shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl relative z-10 group perspective-[1000px] transition-all duration-500 hover:border-indigo-500/30 hover:shadow-[0_0_50px_rgba(79,70,229,0.15)]">
        
        <div className="flex justify-center mb-8 relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full scale-150 animate-pulse"></div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border border-white/20 shadow-lg relative z-10 transform group-hover:rotate-12 transition-transform duration-500">
             <Activity className="w-7 h-7 text-white" />
          </div>
        </div>
>>>>>>> 49bfb2f (save before pull)

          {/* Sarpanch Button */}
          <button
            type="button"
            onClick={() => setSelectedRole('Sarpanch')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
              selectedRole === 'Sarpanch' 
                ? 'bg-orange-500/10 border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
            } w-32`}
          >
            <Users className="w-5 h-5 mb-2" />
            <span className="font-semibold text-sm text-white mb-1">Sarpanch</span>
            <span className="text-[10px] text-center opacity-80">Village admin tools</span>
          </button>

          {/* Inspector Button */}
          <button
            type="button"
            onClick={() => setSelectedRole('Inspector')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
              selectedRole === 'Inspector' 
                ? 'bg-blue-500/10 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
            } w-32`}
          >
            <ShieldAlert className="w-5 h-5 mb-2" />
            <span className="font-semibold text-sm text-white mb-1">Inspector</span>
            <span className="text-[10px] text-center opacity-80">GSPCB command center</span>
          </button>
        </div>
      </div>

      {/* Main Auth Form area */}
      <div className="z-10 bg-black/20 backdrop-blur-md border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
<<<<<<< HEAD
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
            {isSignIn ? "Welcome to EcoSentinel" : "Join EcoSentinel"}
          </h2>
          <p className="text-gray-400 text-sm">
            {isSignIn 
              ? "Select your Role to access the dedicated dashboard view"
              : "Create your account to start monitoring"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isSignIn && (
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input 
                name="Name"
                type="text" 
                required
                placeholder="Enter your full name" 
                className="w-full bg-white text-black px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input 
              name="Email"
              type="email" 
              required
              placeholder="Enter your email address" 
              className="w-full bg-white text-black px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
=======
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">Welcome back</h1>
          <p className="text-[16px] text-gray-400">Choose your role to continue</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { id: 'Resident', icon: Users, label: 'Public' },
            { id: 'Sarpanch', icon: Building, label: 'Sarpanch' },
            { id: 'Inspector', icon: ShieldCheck, label: 'Inspector' }
          ].map((r) => {
            const isSelected = selectedRole === r.id;
            const Icon = r.icon;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRole(r.id as any)}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all duration-300 hover:scale-105 group relative overflow-hidden ${
                  isSelected 
                    ? 'bg-indigo-500/20 border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.4)] transform -translate-y-1' 
                    : 'bg-zinc-900/50 border-white/5 hover:border-indigo-400/50 hover:bg-zinc-800/80 hover:shadow-[0_5px_15px_rgba(79,70,229,0.2)]'
                }`}
              >
                {isSelected && <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-xl"></div>}
                <Icon className={`w-6 h-6 mb-2 transition-colors duration-300 relative z-10 ${isSelected ? 'text-indigo-400' : 'text-gray-400 group-hover:text-indigo-300'}`} />
                <span className={`text-xs font-semibold relative z-10 ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{r.label}</span>
              </button>
            )
          })}
        </div>

        <form onSubmit={handleSignIn} className="space-y-5">
          <div className="space-y-2 flex flex-col items-start group/input relative">
            <label className="text-sm font-medium text-gray-300">Email Address</label>
            <input 
              type="text" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="sarpanch@ or inspector@" 
              className="w-full bg-black/40 border border-zinc-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
>>>>>>> 49bfb2f (save before pull)
            />
            <div className="absolute inset-0 -z-10 bg-indigo-500/5 blur-md rounded-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity"></div>
          </div>

<<<<<<< HEAD
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input 
                name="Password"
                type={showPassword ? "text" : "password"} 
                required
                placeholder={isSignIn ? "Enter your password" : "Create a password (min 6 chars)"} 
                className="w-full bg-white text-black px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
=======
          <div className="space-y-2 flex flex-col items-start group/input relative">
            <label className="text-sm font-medium text-gray-300">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-black/40 border border-zinc-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
            />
            <div className="absolute inset-0 -z-10 bg-indigo-500/5 blur-md rounded-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity"></div>
>>>>>>> 49bfb2f (save before pull)
          </div>

          <button 
            type="submit"
<<<<<<< HEAD
            className="w-full mt-4 bg-gray-200 text-black font-semibold py-2.5 rounded-lg hover:bg-white transition-colors"
=======
            className="w-full py-3.5 px-4 mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-[0_5px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_10px_30px_rgba(79,70,229,0.5)] transform hover:-translate-y-1 transition-all duration-300"
>>>>>>> 49bfb2f (save before pull)
          >
            {isSignIn ? "Sign in →" : "Create Account →"}
          </button>
<<<<<<< HEAD

          <div className="mt-4 text-left">
            <button 
              type="button" 
              onClick={() => setIsSignIn(!isSignIn)}
              className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
            >
              {isSignIn ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
=======
>>>>>>> 49bfb2f (save before pull)
        </form>
      </div>
    </div>
  );
}

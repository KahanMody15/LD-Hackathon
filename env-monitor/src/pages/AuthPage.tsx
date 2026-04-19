import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setCurrentSession, clearSession } from '@/lib/store';
import { Eye, Users, ShieldAlert, EyeOff, ArrowLeft } from "lucide-react";

type Role = 'Resident' | 'Sarpanch' | 'Inspector';

export default function AuthPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role>('Resident');
  const [isSignIn, setIsSignIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    clearSession();
  }, []);

  const handleAuth = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("Email") as string;
    const name = formData.get("Name") as string;
    
    // Auth Logic
    setCurrentSession({
      id: `usr-${Date.now()}`,
      name: name || email.split('@')[0],
      email: email,
      role: selectedRole
    });

    if (selectedRole === 'Sarpanch') navigate('/sarpanch-dashboard');
    else if (selectedRole === 'Inspector') navigate('/inspector-dashboard');
    else navigate('/public-dashboard');
  };

  // The AuthTabs component from modern-animated-sign-in will automatically handle the form rendering.
  // We need to pass googleLogin string to it, but the type in AuthTabs limits us. We'll reconstruct the page to ensure googleLogin renders!
  return (
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
            />
          </div>

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
          </div>

          <button 
            type="submit"
            className="w-full mt-4 bg-gray-200 text-black font-semibold py-2.5 rounded-lg hover:bg-white transition-colors"
          >
            {isSignIn ? "Sign in →" : "Create Account →"}
          </button>

          <div className="mt-4 text-left">
            <button 
              type="button" 
              onClick={() => setIsSignIn(!isSignIn)}
              className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
            >
              {isSignIn ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

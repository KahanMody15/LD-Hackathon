import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { AuthTabs } from '@/components/ui/modern-animated-sign-in';
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Activity, Eye, Users, Shield, ArrowLeft, Home } from "lucide-react";
import { saveUser, getStoredUsers, setCurrentSession } from '@/lib/store';

type FormData = {
  name?: string;
  email: string;
  password: string;
  role: string;
};

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [authError, setAuthError] = useState<string | undefined>(undefined);
  const [selectedRole, setSelectedRole] = useState<'Resident' | 'Sarpanch' | 'Inspector'>(
    location.state?.requiredRole || 'Resident'
  );
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    role: '',
  });

  const goToAlternative = (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    event.preventDefault();
    setAuthError(undefined);
    setIsLogin(!isLogin);
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    name: keyof FormData
  ) => {
    const value = event.target.value;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(undefined);
    
    const users = getStoredUsers();

    if (isLogin) {
      // Login flow
      const user = users.find(u => u.email === formData.email && u.password === formData.password && u.role === selectedRole);
      if (!user) {
        setAuthError('Invalid credentials or role mismatch.');
        return;
      }
      setCurrentSession(user);
    } else {
      // Sign up flow
      if (users.some(u => u.email === formData.email)) {
        setAuthError('Account with this email already exists.');
        return;
      }
      const newUser = {
        id: crypto.randomUUID(),
        name: formData.name || 'User',
        email: formData.email,
        password: formData.password,
        role: selectedRole as any,
      };
      saveUser(newUser);
      setCurrentSession(newUser);
    }

    // Route to the role-specific dashboard
    const roleRoutes: Record<string, string> = {
      'Resident': '/public-dashboard',
      'Sarpanch': '/sarpanch-dashboard',
      'Inspector': '/inspector-dashboard',
    };
    const destination = roleRoutes[selectedRole] || '/dashboard';
    navigate(destination);
  };

  const loginFields = {
    header: 'Welcome to EcoSentinel',
    subHeader: 'Select your Role to access the dedicated dashboard view',
    errorField: authError,
    fields: [
      {
        label: 'Email',
        required: true,
        type: 'email' as const,
        placeholder: 'Enter your email address',
        onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
          handleInputChange(event, 'email'),
      },
      {
        label: 'Password',
        required: true,
        type: 'password' as const,
        placeholder: 'Enter your password',
        onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
          handleInputChange(event, 'password'),
      },
    ],
    submitButton: 'Sign in',
    textVariantButton: "Don't have an account? Sign up",
  };

  const signupFields = {
    header: 'Join EcoSentinel',
    subHeader: 'Create your account to start monitoring',
    errorField: authError,
    fields: [
      {
        label: 'Name',
        required: true,
        type: 'text' as const,
        placeholder: 'Enter your full name',
        onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
          handleInputChange(event, 'name'),
      },
      {
        label: 'Email',
        required: true,
        type: 'email' as const,
        placeholder: 'Enter your email address',
        onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
          handleInputChange(event, 'email'),
      },
      {
        label: 'Password',
        required: true,
        type: 'password' as const,
        placeholder: 'Create a password (min 6 chars)',
        onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
          handleInputChange(event, 'password'),
      },
    ],
    submitButton: 'Create Account',
    textVariantButton: "Already have an account? Sign in",
  };

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className='min-h-screen bg-dark-base relative flex items-center justify-center p-6 perspective-[1000px] overflow-hidden'>
      {/* Background Deep Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-dark-base to-black pointer-events-none"></div>

      {/* Floating abstract decorative objects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-pulse delay-1000"></div>

      <button onClick={() => navigate('/')} className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-colors border border-white/10 text-white group">
        <Home className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
        <span className="font-semibold text-sm">Home</span>
      </button>

      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative z-10 w-full max-w-md h-auto"
      >
        <div 
          style={{ transform: "translateZ(50px)" }}
          className="bg-black/40 backdrop-blur-2xl p-10 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all overflow-hidden relative group"
        >
          {/* Subtle shine effect on top of card */}
          <div className="absolute top-0 left-[-100%] w-[200%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-45deg] group-hover:left-[100%] transition-all duration-[1500ms] pointer-events-none"></div>

          {/* Context Note about the 3 Dashboards */}
          <div className="mb-6">
            <div className="text-center text-xs text-emerald-400 font-bold uppercase tracking-widest mb-3">3 Specialized Dashboards</div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setSelectedRole('Resident')} type="button" className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all ${selectedRole === 'Resident' ? 'bg-emerald-500/20 border-emerald-500 scale-105 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10'} text-center`}>
                <Eye className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-300">Public</span>
                <span className="text-[9px] text-slate-500 leading-tight">Live AQI by region</span>
              </button>
              <button onClick={() => setSelectedRole('Sarpanch')} type="button" className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all ${selectedRole === 'Sarpanch' ? 'bg-amber-500/20 border-amber-500 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10'} text-center`}>
                <Users className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-bold text-amber-300">Sarpanch</span>
                <span className="text-[9px] text-slate-500 leading-tight">Village admin tools</span>
              </button>
              <button onClick={() => setSelectedRole('Inspector')} type="button" className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all ${selectedRole === 'Inspector' ? 'bg-blue-500/20 border-blue-500 scale-105 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10'} text-center`}>
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-bold text-blue-300">Inspector</span>
                <span className="text-[9px] text-slate-500 leading-tight">GSPCB command center</span>
              </button>
            </div>
          </div>

          <AuthTabs
            formFields={isLogin ? loginFields : signupFields}
            goTo={goToAlternative}
            handleSubmit={handleSubmit}
          />
        </div>
      </motion.div>
    </div>
  );
}

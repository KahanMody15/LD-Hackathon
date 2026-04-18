import { useState, useEffect } from "react";
import { ArrowLeft, Activity } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { setCurrentSession, clearSession } from '@/lib/store';

export default function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    clearSession();
  }, []);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    
    const lowerEmail = email.toLowerCase();
    let role: 'Resident' | 'Sarpanch' | 'Inspector' = 'Resident';
    
    if (lowerEmail.includes("sarpanch")) role = 'Sarpanch';
    if (lowerEmail.includes("inspector")) role = 'Inspector';

    setCurrentSession({
      id: `usr-${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      role: role
    });

    if (role === 'Sarpanch') navigate('/sarpanch-dashboard');
    else if (role === 'Inspector') navigate('/inspector-dashboard');
    else navigate('/public-dashboard');
  };

  return (
    <div className='min-h-screen bg-background flex flex-col items-center justify-center p-6 font-sans text-foreground transition-colors'>
      <div className="absolute top-8 left-8">
        <Link to="/" className="flex items-center gap-2 text-secondary hover:text-foreground transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <div className="w-full max-w-[400px] bg-background border border-border-light rounded-card p-[32px] shadow-sm">
        <div className="flex justify-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center border border-border-light">
             <Activity className="w-6 h-6 text-foreground" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="title-heading text-foreground mb-2">Welcome back</h1>
          <p className="text-[16px] text-secondary">Sign in to continue to your dashboard</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-1.5 flex flex-col items-start">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input 
              type="text" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="sarpanch@ demo.com or inspector@" 
              className="w-full bg-background border border-border-light rounded-[6px] px-[12px] py-[10px] text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all soft-shadow"
            />
          </div>

          <div className="space-y-1.5 flex flex-col items-start">
            <label className="text-sm font-medium text-foreground">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-background border border-border-light rounded-[6px] px-[12px] py-[10px] text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all soft-shadow"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-[10px] px-[16px] mt-4 bg-foreground text-btn-text rounded-[6px] font-medium inset-shadow-primary hover:opacity-90 transition-opacity"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-secondary">
            Use <span className="font-semibold text-foreground">inspector@demo.com</span> for the Inspector dashboard, or <span className="font-semibold text-foreground">sarpanch@</span> for Village Admin. Any other logs to Resident.
          </p>
        </div>
      </div>
    </div>
  );
}

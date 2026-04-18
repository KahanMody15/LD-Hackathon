import { Activity, RadioTower } from "lucide-react";
import type { Role } from "@/types";
import { HeaderActions } from "./HeaderActions";

interface TopNavProps {
  role: Role;
  setRole: (r: Role) => void;
  onBroadcastClick: () => void;
}

export function TopNav({ role, setRole, onBroadcastClick }: TopNavProps) {
  return (
    <header className="h-16 border-b border-white/5 bg-dark-base flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary-500/20 border border-primary-500/50 flex items-center justify-center">
          <Activity className="w-5 h-5 text-primary-400" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">EcoSentinel Console</span>
      </div>

      <div className="flex items-center gap-4">
        {role === 'Inspector' && (
          <button 
            onClick={onBroadcastClick}
            className="flex items-center gap-2 px-3 py-1.5 bg-danger-dark/20 text-danger border border-danger-dark/50 rounded-md hover:bg-danger-dark/40 transition-colors text-sm font-medium"
          >
            <RadioTower className="w-4 h-4" />
            Emergency Broadcast
          </button>
        )}

        <div className="relative">
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value as Role)}
            className="appearance-none bg-slate-800 text-sm text-slate-200 border border-white/10 rounded-md py-1.5 pl-3 pr-8 focus:outline-none focus:border-primary-500"
          >
            <option value="Resident">Resident</option>
            <option value="Sarpanch">Sarpanch</option>
            <option value="Inspector">Inspector</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>

        <HeaderActions />
      </div>
    </header>
  );
}

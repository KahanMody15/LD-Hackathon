import { useState } from 'react';
import { Bell, User, LogOut } from 'lucide-react';
import { getCurrentSession, clearSession } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import { useRealTimeData } from '@/hooks/useRealTimeData';

export function HeaderActions() {
  const navigate = useNavigate();
  const session = getCurrentSession();
  const { activeEvents } = useRealTimeData();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    clearSession();
    window.location.href = '/auth';
  };

  return (
    <div className="flex items-center gap-4">
      {/* Home Button */}
      <button
        onClick={() => navigate('/')}
        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        title="Home"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => {
            setShowNotifications(!showNotifications);
            setShowProfile(false);
          }}
          className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-slate-300" />
          {activeEvents.length > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-black animate-pulse" />
          )}
        </button>

        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-white/5 font-semibold text-slate-200">
              Notifications ({activeEvents.length})
            </div>
            <div className="max-h-64 overflow-y-auto">
              {activeEvents.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-slate-500">
                  No new notifications
                </div>
              ) : (
                [...activeEvents].reverse().map((evt: any) => (
                  <div key={evt.id} className="px-4 py-3 hover:bg-white/5 border-b border-white/5 transition-colors">
                    <div className="text-sm font-medium text-slate-200">{evt.type} Alert</div>
                    <div className="text-xs text-slate-400 mt-0.5">{evt.description}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="relative">
        <button
          onClick={() => {
            setShowProfile(!showProfile);
            setShowNotifications(false);
          }}
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-black font-bold uppercase text-lg border-2 border-emerald-500/20 hover:scale-105 transition-transform"
        >
          {session ? session.name.charAt(0) : <User className="w-5 h-5 text-black" />}
        </button>

        {showProfile && (
          <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-white/5">
              <div className="font-semibold text-white text-base">{session?.name || 'Guest User'}</div>
              <div className="text-xs text-slate-400 mt-0.5">{session?.email || 'Not logged in'}</div>
              {session && (
                <div className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {session.role}
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-red-400 text-sm hover:bg-white/5 flex items-center gap-2 transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

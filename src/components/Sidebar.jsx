import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Users, 
  Footprints, 
  Bot, 
  ShieldCheck,
  LogOut,
  Zap,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'training', label: 'Volume Latihan', icon: BarChart3 },
    { id: 'progress', label: 'Tren Kebugaran', icon: TrendingUp },
    { id: 'plans', label: 'Rencana Lari', icon: Calendar },
    { id: 'coaching', label: 'Coaching AI', icon: Bot },
    { id: 'social', label: 'Feed Komunitas', icon: Users },
    { id: 'gear', label: 'Rak Sepatu', icon: Footprints },
  ];

  // Admin Panel appears ONLY if user is truly admin! No simulation.
  if (user && user.role === 'admin') {
    menuItems.push({ id: 'admin', label: 'Kelola Member', icon: ShieldCheck });
  }

  return (
    <aside className="w-64 bg-white/70 backdrop-blur-xl border-r border-slate-200/60 flex flex-col h-full shrink-0 z-30 shadow-sm">
      {/* Brand Logo - Matches screenshot's premium modern style */}
      <div className="h-20 flex items-center px-6 border-b border-slate-100 gap-3">
        <div className="bg-gradient-to-br from-violet-500 via-fuchsia-400 to-indigo-500 p-2 rounded-xl shadow-md shadow-violet-500/10">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-lg text-slate-800 tracking-tight">Pace<span className="text-violet-600">Pilot</span></span>
          <span className="block text-[9px] text-violet-500/80 font-bold uppercase tracking-widest mt-0.5">AI Coach Core</span>
        </div>
      </div>

      {/* User Mini-Profile */}
      <div className="p-5 border-b border-slate-100 bg-white/30">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 flex items-center justify-center font-extrabold text-violet-600 text-sm shadow-sm relative">
            {user.name.split(' ').map(n => n[0]).join('')}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full"></span>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-800 truncate">{user.name}</h4>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`px-2 py-0.5 text-[8px] font-extrabold rounded-full uppercase tracking-wider ${
                user.level === 'pro' 
                  ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' 
                  : user.level === 'intermediate'
                  ? 'bg-violet-500/10 text-violet-600 border border-violet-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
              }`}>
                {user.level}
              </span>
              {user.role === 'admin' && (
                <span className="px-2 py-0.5 text-[8px] font-extrabold rounded-full uppercase tracking-wider bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-300 group ${
                isActive
                  ? 'pill-active transform scale-[1.02]'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-violet-500/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-violet-500'}`} />
                <span>{item.label}</span>
              </div>
              <ChevronRight className={`h-3 w-3 transition-transform duration-300 ${isActive ? 'text-white opacity-90' : 'text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'}`} />
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-100 bg-white/20">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-500/5 transition-all duration-300"
        >
          <LogOut className="h-4.5 w-4.5 text-slate-400 group-hover:text-rose-500" />
          <span>Keluar Sesi</span>
        </button>
      </div>
    </aside>
  );
}

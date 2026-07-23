import React from 'react';
import { Bot, Droplet, Sparkles, Footprints, Flame, Bell } from 'lucide-react';

export default function Header({ activeTab, user, shoes }) {
  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Utama';
      case 'training': return 'Volume Latihan Tahunan';
      case 'progress': return 'Tren Kebugaran CTL/ATL';
      case 'plans': return 'Rencana Program Latihan';
      case 'social': return 'Feed & Komunitas Lari';
      case 'gear': return 'Gear Tracker Sepatu';
      case 'coaching': return 'Sesi Coaching AI';
      case 'admin': return 'Panel Admin Kelola Member';
      default: return 'PacePilot AI';
    }
  };

  const getSubTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Pantau rangkuman telemetri lari, tidur, dan grafik pemulihan fungsional.';
      case 'training': return 'Visualisasi data olahraga multi-cabang terpadu sepanjang tahun.';
      case 'progress': return 'Formula fisiologis deteksi dini overtraining, kesegaran, dan kebugaran.';
      case 'plans': return 'Program lari 5K s/d Marathon yang terstruktur khusus untuk level Anda.';
      case 'social': return 'Berinteraksi, memberikan Kudos, dan bergabung dengan klub pelari lokal.';
      case 'gear': return 'Pantau umur sol sepatu lari Anda untuk proteksi lutut dari benturan.';
      case 'coaching': return 'Analisis audio, pembaca file TCX/GPX, dan panduan nutrisi olahraga.';
      case 'admin': return 'Kelola level, VO2Max, dan publikasi pengumuman untuk seluruh member platform.';
      default: return 'AI Running Engine';
    }
  };

  const activeShoe = shoes.find(s => s.active);
  const shoeWarning = activeShoe && activeShoe.mileage >= activeShoe.limit - 50;
  
  // Safe read user-keyed VO2Max (0 baseline if clean account)
  const userVo2Max = user.vo2maxHistory && user.vo2maxHistory.length > 0 
    ? user.vo2maxHistory[user.vo2maxHistory.length - 1].value 
    : 0;

  const getVO2MaxStatus = (val) => {
    if (val === 0) return { text: 'Belum Terkalkulasi ⏱️', color: 'text-slate-500 bg-slate-100' };
    if (val > 55) return { text: 'Excellent 🔥', color: 'text-violet-600 bg-violet-100' };
    if (val > 47) return { text: 'Good ⭐', color: 'text-fuchsia-600 bg-fuchsia-100' };
    return { text: 'Average 👍', color: 'text-emerald-600 bg-emerald-100' };
  };

  return (
    <header className="h-20 bg-white/60 backdrop-blur-xl border-b border-slate-200/50 px-8 flex items-center justify-between shrink-0 z-20 shadow-sm">
      
      {/* Title & Subtitle */}
      <div>
        <h2 className="text-base font-extrabold text-slate-800 tracking-tight">{getTitle()}</h2>
        <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{getSubTitle()}</p>
      </div>

      {/* Right Row Metrics */}
      <div className="flex items-center gap-6">
        
        {/* Active Shoe Warning Badge */}
        {shoeWarning && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-full text-[10px] font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Ganti Sol Sepatu! ({Math.round(activeShoe.mileage)} km)</span>
          </div>
        )}

        {/* Dynamic Sync Widget (User-Specific) */}
        <div className="flex items-center gap-5 text-right text-[10px] font-bold">
          
          {/* Active Program */}
          <div className="border-r border-slate-200/60 pr-4">
            <span className="text-slate-400 block uppercase tracking-wider text-[9px]">Program Latihan</span>
            {user.activeProgramId ? (
              <span className="font-extrabold text-violet-600 uppercase tracking-widest text-[11px] mt-0.5 block">
                {user.activeProgramId} Plan
              </span>
            ) : (
              <span className="font-extrabold text-slate-400 mt-0.5 block">BELUM MEMILIH</span>
            )}
          </div>

          {/* VO2Max Widget */}
          <div className="pr-2">
            <span className="text-slate-400 block uppercase tracking-wider text-[9px]">VO2Max Terkoneksi</span>
            <div className="flex items-center justify-end gap-2 mt-0.5">
              <span className="text-slate-800 text-sm font-extrabold">
                {userVo2Max > 0 ? `${userVo2Max} ml/kg` : "--"}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold ${getVO2MaxStatus(userVo2Max).color}`}>
                {getVO2MaxStatus(userVo2Max).text}
              </span>
            </div>
          </div>
        </div>

        {/* Soft Notification Bell */}
        <button className="w-10 h-10 rounded-full border border-slate-200/60 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-all shadow-sm">
          <Bell className="h-4.5 w-4.5" />
        </button>

      </div>
    </header>
  );
}

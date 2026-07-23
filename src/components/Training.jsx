import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid
} from 'recharts';
import { 
  BarChart3, 
  Hourglass, 
  Compass, 
  Activity, 
  Dumbbell 
} from 'lucide-react';

export default function Training({ runs, annualVolume }) {
  const [selectedYear, setSelectedYear] = useState('2026');

  // Sum up totals dynamically from the custom user volume list passed from App.jsx!
  const totalLari = annualVolume.reduce((acc, d) => acc + d.Lari, 0);
  const totalSepeda = annualVolume.reduce((acc, d) => acc + d.Sepeda, 0);
  const totalBebanHours = annualVolume.reduce((acc, d) => acc + d.Beban, 0);
  const totalTSS = annualVolume.reduce((acc, d) => acc + d.TSS, 0);

  const updatedTotalDistance = totalLari + totalSepeda;
  const totalRunHours = totalLari * 5.5 / 60;
  const totalBikeHours = totalSepeda / 20;
  const totalDurationHrs = Math.round(totalRunHours + totalBikeHours + totalBebanHours);

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6 glass-mesh-bg h-full">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-violet-500 font-bold uppercase tracking-widest block">Analisis Data Atlet</span>
          <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2 mt-1">
            <BarChart3 className="h-5 w-5 text-violet-500" />
            <span>Volume Latihan Tahunan</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Bagan akumulasi volume multi-cabang olahraga dipecah berdasarkan porsi bulanan.</p>
        </div>

        <select 
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="bg-white/80 border border-slate-200/60 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 cursor-pointer shadow-sm"
        >
          <option value="2026">2026 (Berjalan)</option>
          <option value="2025">2025 (Arsip)</option>
        </select>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Durasi */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3.5 rounded-xl bg-violet-100 text-violet-600 border border-violet-200/20">
            <Hourglass className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Durasi Akumulatif</span>
            <span className="text-xl font-black text-slate-800 tracking-tight mt-0.5 block">{totalDurationHrs} Jam</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Semua jenis latihan</span>
          </div>
        </div>

        {/* Total Jarak */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3.5 rounded-xl bg-emerald-100 text-emerald-600 border border-emerald-200/20" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <Compass className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Total Jarak Tempuh</span>
            <span className="text-xl font-black text-slate-800 tracking-tight mt-0.5 block">{updatedTotalDistance.toFixed(0)} km</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">
              🏃 {totalLari.toFixed(0)}km Lari | 🚴 {totalSepeda}km Sepeda
            </span>
          </div>
        </div>

        {/* Total TSS */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3.5 rounded-xl bg-violet-100 text-violet-600 border border-violet-200/20">
            <Activity className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Beban Latihan (TSS)</span>
            <span className="text-xl font-black text-slate-800 tracking-tight mt-0.5 block">{totalTSS} TSS</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Training Stress Score</span>
          </div>
        </div>
      </div>

      {/* Main Bar Chart Panel */}
      <div className="glass-card rounded-2xl p-6 shadow-sm border border-slate-200/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-4 gap-2">
          <div>
            <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-widest">Bagan Distribusi Volume Bulanan</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Komparasi visual porsi olahraga Lari (km), Bersepeda (km), dan Latihan Beban (jam).</p>
          </div>
          <div className="flex gap-4 text-[9px] font-bold uppercase tracking-wider">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-violet-500 rounded-full"></span><span className="text-slate-600">Lari (km)</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-400 rounded-full"></span><span className="text-slate-600">Sepeda (km)</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-400 rounded-full"></span><span className="text-slate-600">Beban (Jam)</span></div>
          </div>
        </div>

        {/* Recharts Stacked Bar */}
        <div className="h-[360px] min-h-0 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={annualVolume} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                labelClassName="text-slate-500 font-bold"
              />
              <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              <Bar dataKey="Lari" name="Volume Lari (km)" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Sepeda" name="Volume Sepeda (km)" stackId="a" fill="#60a5fa" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Beban" name="Beban Otot (Jam)" stackId="a" fill="#fbbf24" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Info Card */}
      <div className="glass-card rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-5 border border-slate-200/50">
        <div className="p-3.5 rounded-xl bg-violet-100 text-violet-600 border border-violet-200/10 shrink-0 w-fit">
          <Dumbbell className="h-6 w-6" />
        </div>
        <div>
          <h5 className="font-extrabold text-xs text-slate-700 uppercase tracking-widest">Pentingnya Keseimbangan Cross-Training</h5>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-semibold">
            Program lari sehat didukung oleh cross-training aktif bersepeda dan latihan beban untuk melatih power otot paha dan glutes serta meminimalkan gesekan sol aspal pada sendi lutut.
          </p>
        </div>
      </div>

    </div>
  );
}

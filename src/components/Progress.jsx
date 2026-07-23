import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import { 
  TrendingUp, 
  HelpCircle,
  Trophy,
  Activity,
  Sparkles,
  Zap,
  Lock
} from 'lucide-react';

export default function Progress({ progressMetrics, user }) {
  const currentMetrics = progressMetrics.length > 0 
    ? progressMetrics[progressMetrics.length - 1] 
    : { CTL: 0, ATL: 0, TSB: 0 };

  const getFormZoneInfo = (tsb) => {
    if (tsb > 5) return { text: "Fresh (Fresnes/Tapering) 🍃", desc: "Kondisi sangat segar! Sangat ideal untuk hari balapan atau uji coba Personal Best (PB).", color: "text-amber-700 bg-amber-100 border-amber-200" };
    if (tsb >= -10 && tsb <= 5) return { text: "Optimal (Peningkatan Kebugaran) 🚀", desc: "Zona lari paling produktif! Tubuh beradaptasi dengan baik terhadap stimulus beban lari.", color: "text-emerald-700 bg-emerald-100 border-emerald-200" };
    if (tsb >= -25 && tsb < -10) return { text: "Overreaching (Kelelahan Sedang) ⚠️", desc: "Akumulasi kelelahan sedang tinggi. Butuh lari pemulihan (easy recovery) atau istirahat ekstra.", color: "text-orange-700 bg-orange-100 border-orange-200" };
    return { text: "Injury Risk (Bahaya Cedera!) 🚨", desc: "Sangat rawan cedera otot & sendi. Kurangi volume lari segera dan lakukan pemulihan total.", color: "text-red-700 bg-red-100 border-red-200" };
  };

  const zoneInfo = getFormZoneInfo(currentMetrics.TSB);

  // --- UPGRADE #3: DYNAMIC RACE TIME PREDICTOR (PB PREDICTOR) ---
  const userVo2Max = user.vo2maxHistory && user.vo2maxHistory.length > 0 
    ? user.vo2maxHistory[user.vo2maxHistory.length - 1].value 
    : 0;

  // Calculate predicted times in minutes based on VO2Max
  const calculatePredictions = (v) => {
    if (v <= 0) return null;
    
    // 5K: minutes = 15 + (70 - v) * 0.45
    const t5k = 15 + (70 - v) * 0.45;
    const p5k = t5k / 5;

    // 10K: minutes = t5k * 2.1
    const t10k = t5k * 2.1;
    const p10k = t10k / 10;

    // Half Marathon: minutes = t10k * 2.22
    const t21k = t10k * 2.22;
    const p21k = t21k / 21.0975;

    // Marathon: minutes = t21k * 2.15
    const t42k = t21k * 2.15;
    const p42k = t42k / 42.195;

    const formatMinSec = (decimalMins) => {
      const mins = Math.floor(decimalMins);
      const secs = Math.round((decimalMins - mins) * 60);
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return [
      { id: '5k', name: '5K Run', time: formatMinSec(t5k), pace: `${formatMinSec(p5k)} /km`, desc: 'Lari Cepat 5 km' },
      { id: '10k', name: '10K Run', time: formatMinSec(t10k), pace: `${formatMinSec(p10k)} /km`, desc: 'Laktat Ambang 10 km' },
      { id: '21k', name: 'Half-Marathon (21.1K)', time: formatMinSec(t21k), pace: `${formatMinSec(p21k)} /km`, desc: 'Ketahanan Lari Jarak Jauh' },
      { id: '42k', name: 'Marathon (42.2K)', time: formatMinSec(t42k), pace: `${formatMinSec(p42k)} /km`, desc: 'Puncak Volume Marathon' }
    ];
  };

  const predictions = calculatePredictions(userVo2Max);

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6 glass-mesh-bg h-full">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] text-violet-500 font-bold uppercase tracking-widest block">Metrik Fisiologis</span>
          <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2 mt-1">
            <TrendingUp className="h-5 w-5 text-violet-500" />
            <span>Tren Kebugaran & Prediksi Waktu</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Analisis kesiapan balapan dan rasio kelelahan menggunakan model pemulihan berbasis TSS.</p>
        </div>

        <div className="flex items-center gap-2.5 bg-violet-100 text-violet-600 border border-violet-200/20 px-3.5 py-1.5 rounded-full text-[10px] font-bold">
          <Activity className="h-3.5 w-3.5 text-violet-500 animate-pulse" />
          <span>TSB Hari Ini: {currentMetrics.TSB}</span>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4.5 rounded-xl shadow-sm border border-slate-200/50">
          <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Fitness (CTL)</span>
          <span className="text-2xl font-black text-violet-600 mt-1.5 block">{currentMetrics.CTL}</span>
          <span className="text-[9px] text-slate-500 block mt-0.5">Beban Kumulatif 42 Hari</span>
        </div>

        <div className="glass-card p-4.5 rounded-xl shadow-sm border border-slate-200/50">
          <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Fatigue (ATL)</span>
          <span className="text-2xl font-black text-blue-500 mt-1.5 block">{currentMetrics.ATL}</span>
          <span className="text-[9px] text-slate-500 block mt-0.5">Kelelahan Akut 7 Hari</span>
        </div>

        <div className="glass-card p-4.5 rounded-xl shadow-sm border border-slate-200/50">
          <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Form (TSB)</span>
          <span className={`text-2xl font-black mt-1.5 block ${currentMetrics.TSB >= 0 ? 'text-emerald-500' : 'text-orange-500'}`}>
            {currentMetrics.TSB}
          </span>
          <span className="text-[9px] text-slate-500 block mt-0.5">Keseimbangan Fisik (CTL - ATL)</span>
        </div>

        <div className={`border rounded-xl p-4.5 flex flex-col justify-between shadow-sm ${zoneInfo.color}`}>
          <span className="text-[9px] uppercase font-bold tracking-wider opacity-90">Pemulihan Hari Ini</span>
          <span className="font-extrabold text-[11px] mt-1.5 block truncate">{zoneInfo.text}</span>
          <span className="text-[9px] opacity-80 leading-snug mt-0.5">{zoneInfo.desc.slice(0, 50)}...</span>
        </div>
      </div>

      {/* --- UPGRADE #3: DYNAMIC RACE TIME PREDICTOR (PB PREDICTOR) DISPLAY --- */}
      <div className="glass-card rounded-2xl p-5 border border-slate-200/50 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500 animate-bounce" />
            <div>
              <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest">Prediksi Waktu Finis Lari (PB Predictor)</h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Estimasi performa waktu terbaik Anda berdasarkan nilai sinkronisasi VO2Max saat ini.</p>
            </div>
          </div>
          {userVo2Max > 0 && (
            <span className="px-2.5 py-1 bg-violet-100 text-violet-700 border border-violet-200/20 rounded-full text-[10px] font-black uppercase">
              VO2Max: {userVo2Max}
            </span>
          )}
        </div>

        {userVo2Max > 0 && predictions ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {predictions.map((p) => (
              <div key={p.id} className="bg-slate-50/60 p-4 rounded-xl border border-slate-150/60 flex flex-col justify-between space-y-3 group hover:border-violet-300 transition-all">
                <div>
                  <span className="text-[8px] text-slate-400 block uppercase font-bold tracking-widest">{p.desc}</span>
                  <h5 className="font-extrabold text-sm text-slate-800 mt-1">{p.name}</h5>
                </div>
                <div>
                  <span className="text-xl font-black text-violet-600 tracking-tight block">{p.time}</span>
                  <span className="text-[10px] text-slate-500 font-bold block mt-1">Pace Target: {p.pace}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center max-w-md mx-auto space-y-3 font-semibold text-slate-400">
            <div className="w-11 h-11 bg-slate-100 text-slate-400 border border-slate-200 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h5 className="text-slate-700 text-xs font-black">Estimasi Waktu Lari Terkunci</h5>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                Sistem AI belum mendeteksi kapasitas VO2Max Anda. Selesaikan lari pertama Anda di tab **Rencana Lari** untuk langsung membuka prediksi waktu finis 5K s/d Marathon otomatis Anda!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Dual line chart & Form chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CTL vs ATL */}
        <div className="glass-card rounded-2xl p-5 flex flex-col h-[340px] shadow-sm border border-slate-200/50">
          <div className="border-b border-slate-100 pb-2 mb-3">
            <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-widest">Keseimbangan Kebugaran (CTL vs ATL)</h4>
            <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Membandingkan kebugaran kardiovaskular (CTL) dengan beban kelelahan otot (ATL).</p>
          </div>

          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getLineData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickLine={false} tickFormatter={(str) => str.slice(5, 10)} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px' }}
                />
                <Legend iconSize={6} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="CTL" name="Fitness (CTL)" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="ATL" name="Fatigue (ATL)" stroke="#3b82f6" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TSB Area chart */}
        <div className="glass-card rounded-2xl p-5 flex flex-col h-[340px] shadow-sm border border-slate-200/50">
          <div className="border-b border-slate-100 pb-2 mb-3">
            <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-widest">Form & Zona Pemulihan (TSB)</h4>
            <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Nilai TSB menentukan kesiapan kompetisi balapan Anda di zona segar.</p>
          </div>

          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getLineData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTsbLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickLine={false} tickFormatter={(str) => str.slice(5, 10)} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} domain={[-40, 25]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px' }}
                />
                <ReferenceLine y={5} stroke="#fbbf24" strokeDasharray="3 3" />
                <ReferenceLine y={-10} stroke="#10b981" strokeDasharray="3 3" />
                <ReferenceLine y={-25} stroke="#ef4444" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="TSB" name="Form Lari (TSB)" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorTsbLight)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}

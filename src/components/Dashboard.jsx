import React, { useState, useEffect, useRef } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Legend,
  ReferenceLine,
  ComposedChart
} from 'recharts';
import { 
  Flame, 
  Timer, 
  Compass, 
  Heart, 
  Moon, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  Play, 
  Pause, 
  RotateCcw,
  Sparkles,
  Zap,
  Bot,
  Target,
  Sun,
  AlertTriangle,
  Volume2,
  Trophy,
  Users,
  Bell,
  CheckCircle2,
  PlusCircle
} from 'lucide-react';
import { 
  SLEEP_DATA, 
  HEART_RATE_HOURLY,
  COMMUNITY_CHALLENGES,
  ACHIEVEMENT_BADGES
} from '../data/mockData';

export default function Dashboard({ runs, user, progressMetrics }) {
  const latestRun = runs && runs.length > 0 ? runs[0] : null;

  // 1. Core States for Upgrades
  const [useGhostRunner, setUseGhostRunner] = useState(false);
  const [isAudioCoachingPlaying, setIsAudioCoachingPlaying] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false); 
  const [currentTheme, setCurrentTheme] = useState('morning'); 

  // Item 13: Route Drawing State
  const [drawnPoints, setDrawnPoints] = useState([]);
  const [isDrawing, setIsRecordingDraw] = useState(false);

  // Item 4: Training Reminder States
  const [reminders, setReminders] = useState(() => {
    const local = localStorage.getItem('plans_reminders');
    return local ? JSON.parse(local) : [
      { id: 'rem_1', day: 'Kamis', time: '06:00', title: 'Interval Run 5x400m' },
      { id: 'rem_2', day: 'Sabtu', time: '05:30', title: 'Long Run Aerobik' }
    ];
  });
  const [newReminder, setNewReminder] = useState({ day: 'Senin', time: '06:00', title: '' });

  // --- ITEM 2: MANUAL WORKOUT LOGGER ---
  const [showManualLogForm, setShowManualLogForm] = useState(false);
  const [manualLog, setManualLog] = useState({ distance: '', duration: '', date: new Date().toISOString().split('T')[0] });
  const [logSuccessMsg, setLogSuccessMsg] = useState('');

  // Calculate total stats from user-isolated runs list
  const totalDistance = runs.reduce((acc, r) => acc + r.distance, 0);
  const totalDurationMin = runs.reduce((acc, r) => acc + Math.round(r.duration / 60), 0);
  const totalDurationHrs = (totalDurationMin / 60).toFixed(1);
  const totalRuns = runs.length;
  const userVo2Max = user.vo2maxHistory[user.vo2maxHistory.length - 1]?.value || 0;

  // Current active shoe metrics
  const activeShoe = user.shoes?.find(s => s.active);
  const shoeMileage = activeShoe ? activeShoe.mileage : 0;
  const shoeLimit = activeShoe ? activeShoe.limit : 500;

  // Playback States
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(2); 
  const playbackTimer = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (playbackTimer.current) clearInterval(playbackTimer.current);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying && latestRun && latestRun.points && latestRun.points.length > 0) {
      playbackTimer.current = setInterval(() => {
        setPlaybackIndex((prevIndex) => {
          if (prevIndex >= latestRun.points.length - 1) {
            setIsPlaying(false);
            return 0; 
          }
          return prevIndex + 1;
        });
      }, 300 / playbackSpeed);
    } else {
      if (playbackTimer.current) {
        clearInterval(playbackTimer.current);
      }
    }
    return () => {
      if (playbackTimer.current) clearInterval(playbackTimer.current);
    };
  }, [isPlaying, latestRun, playbackSpeed]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setPlaybackIndex(0);
  };

  // Dynamic AI TTS Coaching Speech
  const speakCoachingIndonesian = (textToSpeak) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'id-ID'; 
      utterance.rate = 1.05; 
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
      if (idVoice) utterance.voice = idVoice;

      utterance.onend = () => setIsAudioCoachingPlaying(false);
      utterance.onerror = () => setIsAudioCoachingPlaying(false);

      setIsAudioCoachingPlaying(true);
      window.speechSynthesis.speak(utterance);
    } else {
      if (audioRef.current) {
        audioRef.current.play();
        setIsAudioCoachingPlaying(true);
      }
    }
  };

  const playCoachingFeedback = () => {
    if (isAudioCoachingPlaying) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsAudioCoachingPlaying(false);
      return;
    }

    if (!latestRun) {
      speakCoachingIndonesian(
        `Halo ${user.name}! Anda belum menyelesaikan sesi lari harian. Silakan lakukan lari pertama Anda!`
      );
      return;
    }

    const distanceText = latestRun.distance.toFixed(1).replace('.', ',');
    const paceParts = latestRun.avgPace.split(':');
    const paceMins = paceParts[0];
    const paceSecs = paceParts[1] || 'nol';
    const hrValue = latestRun.avgHr;

    const dynamicText = `Halo ${user.name}! Saya Coach AI Anda. Anda telah menempuh lari sejauh ${distanceText} kilometer, dengan rata-rata pace ${paceMins} menit ${paceSecs} detik per kilometer. Detak jantung rata-rata terpantau sangat stabil di angka ${hrValue} kali per menit. Jaga konsistensi berlatih bersama PacePilot AI!`;

    speakCoachingIndonesian(dynamicText);
  };

  // --- ITEM 1 & 21: RECHARTS WEEKLY MILEAGE, PACE PROGRESS & TREND PROJECTION ---
  const getWeeklyProgressData = () => {
    const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
    const baseData = days.map((day, idx) => {
      let lariDistance = 0;
      let avgPaceNum = 0;
      
      if (user.email === 'rio@run.com') {
        const seededDists = [4.2, 0, 6.0, 0, 5.0, 8.0, 0];
        const seededPaces = [5.2, 0, 5.6, 0, 5.4, 5.1, 0];
        lariDistance = seededDists[idx];
        avgPaceNum = seededPaces[idx];
      }

      runs.forEach(run => {
        const d = new Date(run.date);
        let dayIdx = d.getDay() - 1;
        if (dayIdx < 0) dayIdx = 6; 
        if (dayIdx === idx && run.type !== 'Strength') {
          lariDistance += run.distance;
          const parts = run.avgPace.split(':');
          avgPaceNum = parseFloat(parts[0]) + (parseFloat(parts[1] || 0) / 60);
        }
      });

      const trendProy = lariDistance > 0 ? lariDistance * 1.15 : (user.level === 'pro' ? 8.5 : (user.level === 'intermediate' ? 5.2 : 3.0));

      return {
        day,
        "Jarak (KM)": parseFloat(lariDistance.toFixed(1)),
        "Pace (Min/KM)": parseFloat(avgPaceNum.toFixed(2)),
        "Proyeksi (Trend)": parseFloat(trendProy.toFixed(1))
      };
    });
    return baseData;
  };

  const getWeeklyTarget = () => {
    if (user.level === 'pro') return 40;
    if (user.level === 'intermediate') return 20;
    return 10; 
  };

  const weeklyTarget = getWeeklyTarget();
  const completedPercent = Math.min(Math.round((totalDistance / weeklyTarget) * 100), 100);

  // --- UPGRADE #2: AI RUNNING INJURY PREDICTOR ---
  const currentTsb = progressMetrics.length > 0 ? progressMetrics[progressMetrics.length - 1].TSB : 0;
  const isOvertraining = currentTsb < -20;
  const isShoeWorn = activeShoe && shoeMileage >= shoeLimit - 50;
  const showInjuryAlert = isOvertraining || isShoeWorn;

  // Replay calculations
  const activePoint = latestRun && latestRun.points && latestRun.points[playbackIndex] 
    ? latestRun.points[playbackIndex] 
    : (latestRun && latestRun.points ? latestRun.points[0] : null);

  const ghostIndex = latestRun && latestRun.points 
    ? Math.min(Math.round(playbackIndex * 1.08), latestRun.points.length - 1)
    : 0;
  const ghostPoint = latestRun && latestRun.points ? latestRun.points[ghostIndex] : null;

  const getGhostGap = () => {
    if (!latestRun || !activePoint || !ghostPoint || !useGhostRunner) return { text: "Gap: --", isAhead: false };
    const gapDistance = activePoint.dist - ghostPoint.dist; 
    const gapMeters = Math.round(gapDistance * 1000);
    
    if (gapMeters > 0) return { text: `+ ${gapMeters}m Ahead of Ghost 🏃‍♂️`, isAhead: true };
    if (gapMeters < 0) return { text: `${gapMeters}m Behind Ghost 👻`, isAhead: false };
    return { text: "0m Tied with Ghost 🤝", isAhead: true };
  };

  const ghostGapInfo = getGhostGap();

  // --- ITEM 13: SIMULATE ROAD DRAWING AND ESTIMATE STATS ---
  const handleMapClickSimulateDraw = () => {
    if (!isDrawing) {
      setIsRecordingDraw(true);
      setDrawnPoints([{ x: 50, y: 80 }]);
    } else {
      setIsRecordingDraw(false);
    }
  };

  const addDrawnPointSimulate = () => {
    if (drawnPoints.length >= 10) return;
    const last = drawnPoints[drawnPoints.length - 1];
    const newPt = {
      x: last.x + 25 + Math.floor(Math.random() * 15),
      y: last.y + (Math.random() > 0.5 ? 15 : -15) + Math.floor(Math.random() * 10)
    };
    setDrawnPoints([...drawnPoints, newPt]);
  };

  const calculateDrawnDistance = () => {
    return (drawnPoints.length * 1.2).toFixed(1);
  };

  const calculateDrawnElevation = () => {
    return drawnPoints.length * 15;
  };

  // --- ITEM 2: SUBMIT INLINE MANUAL WORKOUT LOG ---
  const handleManualWorkoutSubmit = (e) => {
    e.preventDefault();
    const distanceKm = parseFloat(manualLog.distance);
    const durationMin = parseInt(manualLog.duration);
    if (!distanceKm || !durationMin) return;

    const speedKmh = distanceKm / (durationMin / 60);
    const paceMin = Math.floor(60 / speedKmh);
    const paceSec = Math.floor(((60 / speedKmh) - paceMin) * 60);
    const paceString = `${paceMin}:${paceSec < 10 ? '0' : ''}${paceSec}`;

    const manualRun = {
      id: 'activity_manual_' + Date.now(),
      name: "✍️ Lari Catat Manual Dashboard",
      date: manualLog.date,
      distance: distanceKm,
      duration: durationMin * 60,
      avgPace: paceString,
      avgHr: 140,
      maxHr: 160,
      calories: Math.round(distanceKm * 70),
      elevationGain: 15,
      vo2Max: user.level === 'pro' ? 56 : (user.level === 'intermediate' ? 48 : 41),
      points: [
        { lat: -6.9189, lon: 110.2031, ele: 15, dist: 0 },
        { lat: -6.9189 + 0.005, lon: 110.2031 + 0.005, ele: 20, dist: distanceKm }
      ]
    };

    // Update parent list
    runs.unshift(manualRun);
    localStorage.setItem(`runs_${user.email.toLowerCase()}`, JSON.stringify(runs));

    setLogSuccessMsg("Berhasil Mencatat Lari Manual! 🎉");
    setManualLog({ distance: '', duration: '', date: new Date().toISOString().split('T')[0] });
    setTimeout(() => {
      setLogSuccessMsg('');
      setShowManualLogForm(false);
    }, 2000);
  };

  // SVG route drawing
  const renderSVGRoute = () => {
    if (isDrawing && drawnPoints.length > 0) {
      let pathD = `M ${drawnPoints[0].x} ${drawnPoints[0].y}`;
      drawnPoints.forEach((pt, idx) => {
        if (idx > 0) pathD += ` L ${pt.x} ${pt.y}`;
      });

      return (
        <svg className="w-full h-full text-orange-500 overflow-visible" viewBox="0 0 300 160">
          <path d={pathD} fill="none" stroke="#f97316" strokeWidth="3.5" strokeDasharray="4 4" className="animate-pulse" />
          {drawnPoints.map((pt, idx) => (
            <circle key={idx} cx={pt.x} cy={pt.y} r="3.5" fill="#f97316" stroke="#ffffff" strokeWidth="1" />
          ))}
        </svg>
      );
    }

    if (!latestRun || !latestRun.points || latestRun.points.length === 0) return null;

    const pts = latestRun.points;
    const lats = pts.map(p => p.lat);
    const lons = pts.map(p => p.lon);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    const latSpan = maxLat - minLat || 0.0001;
    const lonSpan = maxLon - minLon || 0.0001;

    const width = 300;
    const height = 160;
    const padding = 20;

    const project = (lat, lon) => {
      const x = padding + ((lon - minLon) / lonSpan) * (width - 2 * padding);
      const y = height - padding - ((lat - minLat) / latSpan) * (height - 2 * padding);
      return { x, y };
    };

    let pathD = "";
    pts.forEach((pt, idx) => {
      const { x, y } = project(pt.lat, pt.lon);
      if (idx === 0) pathD += `M ${x} ${y}`;
      else pathD += ` L ${x} ${y}`;
    });

    const runnerPoint = activePoint ? project(activePoint.lat, activePoint.lon) : project(pts[0].lat, pts[0].lon);
    const startPoint = project(pts[0].lat, pts[0].lon);
    const endPoint = project(pts[pts.length - 1].lat, pts[pts.length - 1].lon);
    const projectedGhost = ghostPoint ? project(ghostPoint.lat, ghostPoint.lon) : null;

    return (
      <svg className="w-full h-full text-violet-600 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        {showHeatmap && (
          <path d={pathD} fill="none" stroke="#a78bfa" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" className="opacity-20 blur-md" />
        )}
        <path d={pathD} fill="none" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="opacity-10 blur-sm" />
        <path d={pathD} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={startPoint.x} cy={startPoint.y} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
        <circle cx={endPoint.x} cy={endPoint.y} r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
        
        {useGhostRunner && projectedGhost && (
          <g transform={`translate(${projectedGhost.x}, ${projectedGhost.y})`}>
            <circle cx="0" cy="0" r="8" fill="#f59e0b" className="ring-pulse opacity-35" />
            <circle cx="0" cy="0" r="4" fill="#ffffff" stroke="#d97706" strokeWidth="2" />
          </g>
        )}

        <g transform={`translate(${runnerPoint.x}, ${runnerPoint.y})`}>
          <circle cx="0" cy="0" r="9" fill="#8b5cf6" className="ring-pulse opacity-30" />
          <circle cx="0" cy="0" r="4.5" fill="#ffffff" stroke="#7c3aed" strokeWidth="2.5" />
        </g>
      </svg>
    );
  };

  const renderCalendar = () => {
    const daysInMonth = 31;
    const startingDayOfWeek = 3; 
    const runDates = runs.map(r => new Date(r.date).getDate());
    const calendarCells = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarCells.push(<div key={`empty-${i}`} className="h-6 w-6"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const hasRun = runDates.includes(day);
      calendarCells.push(
        <div 
          key={`day-${day}`} 
          className={`h-7 w-7 text-[10px] font-bold flex items-center justify-center rounded-full transition-all relative ${
            hasRun 
              ? 'bg-violet-600 text-white shadow shadow-violet-500/20 scale-105 animate-pulse' 
              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
          }`}
          title={hasRun ? "Latihan Selesai! ✔️" : `Hari ke-${day}`}
        >
          {day}
          {hasRun && (
            <span className="absolute bottom-0 w-1 h-1 rounded-full bg-amber-300"></span>
          )}
        </div>
      );
    }

    return (
      <div className="glass-card rounded-2xl p-4 flex flex-col justify-between h-[190px] shadow-sm border border-slate-200/50">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1 shrink-0">
          <div className="flex items-center gap-1.5 text-slate-700 font-extrabold text-[10px] uppercase tracking-wider">
            <CalendarIcon className="h-4 w-4 text-violet-500" />
            <span>Kalender Latihan</span>
          </div>
          <span className="text-[9px] bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full font-extrabold uppercase">Juli 2026</span>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-extrabold text-slate-400 uppercase tracking-widest shrink-0 mb-1">
          <span>Sn</span><span>Sl</span><span>Rb</span><span>Km</span><span>Jm</span><span>Sb</span><span>Mg</span>
        </div>

        <div className="grid grid-cols-7 gap-1 justify-items-center flex-1">
          {calendarCells}
        </div>
      </div>
    );
  };

  const getLineData = () => {
    if (runs.length > 0) return progressMetrics;
    return progressMetrics.map(d => ({
      ...d,
      CTL: user.level === 'pro' ? 50 : (user.level === 'intermediate' ? 40 : 30),
      ATL: user.level === 'pro' ? 45 : (user.level === 'intermediate' ? 35 : 25),
      TSB: 5
    }));
  };

  // Safe checks for empty arrays
  if (!progressMetrics || progressMetrics.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 glass-mesh-bg text-slate-400 font-bold text-xs">
        <div className="text-center space-y-2">
          <div className="animate-spin h-6 w-6 border-2 border-violet-500 border-t-transparent rounded-full mx-auto"></div>
          <p>Memuat Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-y-auto p-8 space-y-6 transition-all duration-700 ${
      currentTheme === 'dusk' 
        ? 'bg-gradient-to-br from-slate-900 via-indigo-950/90 to-purple-950/80 text-purple-100' 
        : 'glass-mesh-bg text-slate-800'
    }`}>
      
      {/* Fallback Audio element */}
      <audio ref={audioRef} src="audio/coach_sample.mp3" onEnded={() => setIsAudioCoachingPlaying(false)} />

      {/* Top Header Row & Theme Switcher (Item 14) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <span className="text-[10px] text-violet-500 font-bold uppercase tracking-widest block">Dashboard Atlet</span>
          <h1 className="text-xl font-extrabold tracking-tight mt-1">
            Hi, {user.name} <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Selamat datang kembali! Mari kita tinjau perkembangan latihan lari Anda hari ini.</p>
        </div>

        {/* Item 14: Theme switcher */}
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-extrabold uppercase text-slate-400">Pilih Tema:</span>
          <div className="bg-white/60 border border-slate-200 p-1 rounded-xl flex gap-1 shadow-sm shrink-0">
            <button
              onClick={() => setCurrentTheme('morning')}
              className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg transition-all ${currentTheme === 'morning' ? 'bg-violet-600 text-white shadow' : 'text-slate-500'}`}
            >
              🌅 Morning
            </button>
            <button
              onClick={() => setCurrentTheme('dusk')}
              className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg transition-all ${currentTheme === 'dusk' ? 'bg-indigo-950 text-white shadow font-semibold' : 'text-slate-500'}`}
            >
              🌌 Dusk
            </button>
          </div>
        </div>
      </div>

      {/* --- ITEM 20: STREAK COUNTER & ACHIEVEMENT BADGES --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0 font-semibold">
        <div className="glass-card rounded-2xl p-4.5 border border-slate-200/50 shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 group-hover:scale-110 transition-transform">
            <Zap className="h-20 w-20 text-orange-500" />
          </div>
          <div className="p-3.5 rounded-xl bg-orange-100 text-orange-600 border border-orange-200/20 glow-pulse">
            <Zap className="h-6 w-6 fill-orange-500 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Streak Konsistensi</span>
            <span className="text-2xl font-black text-slate-800 tracking-tight">4 Hari Berturut</span>
            <span className="text-[9px] text-orange-600 font-extrabold block mt-0.5">Pertahankan konsistensi berlatih! 🔥</span>
          </div>
        </div>

        <div className="md:col-span-2 glass-card rounded-2xl p-4.5 border border-slate-200/50 shadow-sm space-y-3">
          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Trophy className="h-4 w-4 text-violet-500 animate-bounce" />
            <span className="text-[10px] text-slate-700 font-extrabold uppercase tracking-widest">Penghargaan & Badges ({ACHIEVEMENT_BADGES.filter(b => b.unlocked).length}/4)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {ACHIEVEMENT_BADGES.map((b) => (
              <div 
                key={b.id} 
                className={`p-2 rounded-xl border text-center transition-all ${
                  b.unlocked 
                    ? 'bg-violet-50/50 border-violet-200/30' 
                    : 'opacity-40 bg-slate-100 border-slate-200'
                }`}
                title={b.desc}
              >
                <span className="text-xl block mb-1">{b.icon}</span>
                <span className="font-extrabold text-[9px] text-slate-700 block truncate">{b.title}</span>
                <span className="text-[8px] text-slate-400 block truncate font-medium">{b.unlocked ? "Unlocked" : "Locked"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- UPGRADE #2: AI RUNNING INJURY PREDICTOR WARNING BAR --- */}
      {showInjuryAlert && (
        <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm font-semibold">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 text-rose-600 border border-rose-200/30 rounded-xl shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[9px] bg-rose-200 text-rose-800 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">AI Injury Predictor Alert</span>
              <h5 className="font-extrabold text-xs text-slate-800 mt-1">Sinyal Bahaya Cedera Sendi/Otot Terdeteksi!</h5>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-0.5">
                {isOvertraining && "Kondisi Fatigue (ATL) Anda terlalu mendominasi daripada kesegaran Form (TSB: " + currentTsb + "). Tubuh Anda butuh istirahat total. "}
                {isShoeWorn && `Odometer sol sepatu utama Anda (${activeShoe?.model}) telah menyentuh ${Math.round(shoeMileage)} km (hampir aus). Penyerapan benturan berkurang drastis!`}
              </p>
            </div>
          </div>
          <div className="text-[10px] font-bold bg-white text-rose-600 border border-rose-200 px-3 py-1.5 rounded-xl text-center shrink-0 shadow-sm">
            AI Rekomendasi: Lari Easy Recovery / Istirahat
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 font-semibold">
        
        {/* Durasi Total Card */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
          <div className="p-3.5 rounded-xl bg-violet-100 text-violet-600 border border-violet-200/20">
            <Timer className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Durasi Total</span>
            <span className="text-xl font-black text-slate-800 tracking-tight mt-0.5 block">{totalDurationHrs} jam</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">{totalDurationMin} menit lari</span>
          </div>
        </div>

        {/* Jarak Total Card */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
          <div className="p-3.5 rounded-xl bg-violet-100 text-violet-600 border border-violet-200/20">
            <Compass className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Jarak Tempuh</span>
            <span className="text-xl font-black text-slate-800 tracking-tight mt-0.5 block">{totalDistance.toFixed(1)} km</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Rute terpetakan</span>
          </div>
        </div>

        {/* Total Runs Card */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
          <div className="p-3.5 rounded-xl bg-violet-100 text-violet-600 border border-violet-200/20">
            <Zap className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Total Latihan</span>
            <span className="text-xl font-black text-slate-800 tracking-tight mt-0.5 block">{totalRuns} Sesi</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Jadwal terekam</span>
          </div>
        </div>

        {/* VO2Max speedometer card */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
          <div className="p-3.5 rounded-xl bg-violet-100 text-violet-600 border border-violet-200/20">
            <Flame className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Kapasitas VO2Max</span>
            <span className="text-xl font-black text-slate-800 tracking-tight mt-0.5 block">
              {userVo2Max > 0 ? `${userVo2Max} ml/kg` : "--"}
            </span>
            <span className="text-[9px] text-violet-600 font-extrabold block mt-0.5 animate-pulse">
              {userVo2Max > 0 ? "⚡ Sinkron otomatis" : "⏱️ Belum sinkron"}
            </span>
          </div>
        </div>
      </div>

      {/* --- ITEM 1: RECHARTS WEEKLY MILEAGE PROGRESS CARD --- */}
      <div className="glass-card rounded-2xl p-5 border border-slate-200/50 shadow-sm space-y-4 font-semibold">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div>
            <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-violet-500" />
              <span>Analisis Volume Mingguan & Proyeksi Tren 4 Minggu</span>
            </h4>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Memetakan volume lari harian Anda dan memproyeksikan target performa lari (Item 21).</p>
          </div>
          <div className="flex gap-4 text-[9px] font-black uppercase tracking-wider">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-violet-500 rounded-full"></span><span>Jarak (KM)</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-400 rounded-full"></span><span>Tren Proyeksi</span></div>
          </div>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={getWeeklyProgressData()}>
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
              <Bar dataKey="Jarak (KM)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="Proyeksi (Trend)" stroke="#fbbf24" strokeWidth={2} strokeDasharray="4 4" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Middle Row: Playback Map, Calendar, Weather, and Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
        
        {/* Playback Map Widget with Elevation Chart integrated */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 flex flex-col h-[420px] shadow-sm border border-slate-200/50">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2 shrink-0">
            <div>
              <div className="flex items-center gap-2 text-slate-700 font-extrabold text-[10px] uppercase tracking-wider">
                <Compass className="h-4 w-4 text-violet-500" />
                <span>Peta Rute & Profil Ketinggian (3D Elevation synced)</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                {latestRun ? latestRun.name : 'Belum ada rute lari terekam'} {latestRun ? `• ${latestRun.date}` : ''}
              </p>
            </div>
            
            <div className="flex items-center gap-2 font-semibold text-xs text-slate-500">
              {/* Item 13: Draw Paths on Map */}
              <button
                type="button"
                onClick={handleMapClickSimulateDraw}
                className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all shadow-sm ${
                  isDrawing ? 'bg-orange-500 text-white' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
                title="Rencana Rute Baru"
              >
                {isDrawing ? "Batal" : "✏️ Rencana Rute"}
              </button>

              {/* Item 12: Heatmap Overlay Switcher */}
              <button
                type="button"
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all shadow-sm ${
                  showHeatmap ? 'bg-violet-600 text-white shadow-sm' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
                title="Tampilkan peta panas sebaran lari"
              >
                Heatmap paths
              </button>

              {latestRun && (
                <div className="flex items-center gap-1 bg-slate-100/60 p-1 rounded-lg border border-slate-200/50 shadow-inner shrink-0">
                  <button onClick={handlePlayPause} className="p-1 text-slate-600 hover:text-violet-600 hover:bg-white rounded-md transition-all shadow-sm">
                    {isPlaying ? <Pause className="h-3 w-3 text-violet-600" /> : <Play className="h-3 w-3 text-emerald-500" fill="currentColor" />}
                  </button>
                  <button onClick={handleReset} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-white rounded-md transition-all shadow-sm">
                    <RotateCcw className="h-3 w-3" />
                  </button>
                  <button onClick={playCoachingFeedback} className={`p-1 rounded-md shadow-sm ${isAudioCoachingPlaying ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/10' : 'bg-violet-100 text-violet-600 hover:bg-violet-200'}`}>
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0">
            {/* Draw overlay tools helper if actively drawing (Item 13) */}
            {isDrawing && (
              <div className="absolute top-20 left-10 z-10 bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-lg space-y-2 text-[10px] font-extrabold text-slate-600 w-48">
                <span className="text-orange-500 block uppercase tracking-wider text-[8px]">✏️ Route Planning Tool (Item 13)</span>
                <p>• Estimasi Jarak: <strong className="text-slate-800 text-[11px]">{calculateDrawnDistance()} km</strong></p>
                <p>• Elevasi Bukit: <strong className="text-slate-800 text-[11px]">+{calculateDrawnElevation()} m</strong></p>
                <button
                  type="button"
                  onClick={addDrawnPointSimulate}
                  className="w-full mt-2 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-xl text-[9px] font-black uppercase shadow-sm shadow-orange-500/10"
                >
                  Tambahkan Titik Rute
                </button>
              </div>
            )}

            {latestRun || isDrawing ? (
              <>
                <div className="md:col-span-2 flex flex-col justify-between h-full space-y-2 min-h-0">
                  <div className="flex-1 bg-slate-50 border border-slate-200/50 rounded-xl p-2 relative flex items-center justify-center overflow-hidden shadow-inner min-h-[140px]">
                    {renderSVGRoute()}
                    <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                      <span className="px-1.5 py-0.5 text-[8px] font-extrabold uppercase rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200/30">START</span>
                      <span className="px-1.5 py-0.5 text-[8px] font-extrabold uppercase rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200/30">FINISH</span>
                    </div>
                  </div>

                  {/* Elevation Profile Area */}
                  {!isDrawing && (
                    <div className="h-[90px] bg-slate-50 border border-slate-200/50 rounded-xl p-1.5 shadow-inner shrink-0">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block ml-2 mb-0.5">Sloped Elevation Profile (KM vs m)</span>
                      <div className="w-full h-14">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={getElevationData()} margin={{ top: 2, right: 5, left: -25, bottom: 0 }}>
                            <XAxis dataKey="dist" hide />
                            <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                            <Area type="monotone" dataKey="elevation" stroke="#8b5cf6" strokeWidth={1.5} fillOpacity={0.15} fill="#a78bfa" />
                            {latestRun && latestRun.points && (
                              <ReferenceLine x={parseFloat((activePoint ? activePoint.dist : 0).toFixed(2))} stroke="#7c3aed" strokeWidth={2} strokeDasharray="3 3" />
                            )}
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50/40 p-3 rounded-xl border border-slate-200/50 flex flex-col justify-between text-xs space-y-2 h-full">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block border-b border-slate-200 pb-1">
                    Telemetry Live-Stats
                  </span>
                  
                  {/* GHOST GAP TRACKER */}
                  {useGhostRunner && (
                    <div className={`p-2 rounded-lg border text-center font-black text-[10px] uppercase shadow-sm ${
                      ghostGapInfo.isAhead 
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-100 text-amber-700 border-amber-200 animate-pulse'
                    }`}>
                      {ghostGapInfo.text}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">Jarak:</span>
                    <span className="font-extrabold text-slate-800">
                      {activePoint ? activePoint.dist.toFixed(2) : "0.00"} km
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">Pace:</span>
                    <span className="font-extrabold text-violet-600">
                      {activePoint ? activePoint.pace : "--:--"} /km
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">Detak Jantung:</span>
                    <span className="font-extrabold text-red-500 flex items-center gap-1.5">
                      <Heart className="h-3 w-3 fill-red-500 animate-pulse" />
                      {activePoint && activePoint.hr ? `${activePoint.hr} BPM` : "142 BPM"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">Ketinggian:</span>
                    <span className="font-extrabold text-amber-500">
                      {activePoint ? `${Math.round(activePoint.ele)} m` : "0 m"}
                    </span>
                  </div>

                  {latestRun && latestRun.points && (
                    <div className="pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between text-[8px] text-slate-400 font-bold mb-1">
                        <span>SLIDER JALUR</span>
                        <span>{Math.round((playbackIndex / (latestRun.points.length - 1)) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={latestRun.points.length - 1}
                        value={playbackIndex}
                        onChange={(e) => {
                          setIsPlaying(false);
                          setPlaybackIndex(parseInt(e.target.value, 10));
                        }}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="col-span-3 flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full metallic-orb flex items-center justify-center text-white font-extrabold animate-pulse">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h5 className="font-extrabold text-slate-700 text-sm">Belum ada rute terpetakan</h5>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-normal mt-1 font-semibold">
                    Silakan buka tab **Rencana Lari**, daftarkan sebuah program, lalu selesaikan salah satu sesi harian untuk menggambar rute lari Anda di sini!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Balanced Column */}
        <div className="h-[420px] flex flex-col gap-4 justify-between shrink-0 font-semibold text-xs text-slate-600">
          
          {/* Card 1: Calendar Grid */}
          {renderCalendar()}

          {/* AI Weather Pacing Card */}
          <div className="glass-card rounded-2xl p-3 flex items-start gap-3 h-[100px] shadow-sm border border-slate-200/50">
            <div className="p-2 bg-amber-100 text-amber-600 border border-amber-200/20 rounded-xl shrink-0">
              <Sun className="h-4.5 w-4.5 animate-spin" style={{ animationDuration: '15s' }} />
            </div>
            <div className="min-w-0 flex-1 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-[8px] text-amber-600 font-extrabold uppercase tracking-widest block">AI Weather Pacing</span>
                <span className="text-[8px] text-slate-400 font-extrabold">Kendal: 32°C</span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold leading-relaxed line-clamp-2">
                Udara panas & kelembaban tinggi (85%). Kurangi target pace lari Zona 2 Anda sebesar <strong className="text-amber-600 font-extrabold">15 detik/km</strong> untuk proteksi dehidrasi & over-heart.
              </p>
            </div>
          </div>

          {/* Card 3: Weekly Progress Progress & Collapsible Manual Workout Logger (Item 2) */}
          <div className="glass-card rounded-2xl p-4 flex flex-col justify-between h-[110px] shadow-sm border border-slate-200/50 relative overflow-hidden group">
            
            {showManualLogForm ? (
              // Inline Manual Workout Logger Form (Item 2)
              <form onSubmit={handleManualWorkoutSubmit} className="flex-1 flex flex-col justify-between gap-1 text-[10px] font-bold">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] text-violet-500 uppercase tracking-widest">Catat Lari Manual</span>
                  <button type="button" onClick={() => setShowManualLogForm(false)} className="text-red-500 font-black">Batal</button>
                </div>
                {logSuccessMsg ? (
                  <p className="text-emerald-600 text-center animate-bounce">{logSuccessMsg}</p>
                ) : (
                  <div className="flex gap-1">
                    <input 
                      type="number" 
                      placeholder="Jarak (km)" 
                      required 
                      value={manualLog.distance}
                      onChange={(e) => setManualLog({ ...manualLog, distance: e.target.value })}
                      className="bg-slate-50 border border-slate-200 rounded w-16 p-1 text-slate-700" 
                    />
                    <input 
                      type="number" 
                      placeholder="Durasi (m)" 
                      required 
                      value={manualLog.duration}
                      onChange={(e) => setManualLog({ ...manualLog, duration: e.target.value })}
                      className="bg-slate-50 border border-slate-200 rounded w-16 p-1 text-slate-700" 
                    />
                    <button type="submit" className="bg-violet-600 text-white px-2 py-1 rounded text-[8px] font-black uppercase">Simpan</button>
                  </div>
                )}
              </form>
            ) : (
              // Goal progress bar
              <div className="flex-1 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1 shrink-0">
                  <div className="flex items-center gap-1.5 text-slate-700 font-extrabold text-[10px] uppercase tracking-wider">
                    <Target className="h-4 w-4 text-violet-500" />
                    <span>Target Jarak Mingguan</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setShowManualLogForm(true)} 
                    className="text-[8px] text-violet-600 hover:underline uppercase font-extrabold shrink-0"
                  >
                    ✏️ Catat Manual
                  </button>
                </div>

                <div className="flex-1 flex flex-col justify-end gap-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500">Tercapai: <strong className="text-slate-800 font-black">{totalDistance.toFixed(1)} / {weeklyTarget} KM</strong></span>
                    <span className="text-violet-600 font-black text-[11px]">{completedPercent}%</span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50 shadow-inner">
                    <div className="bg-gradient-to-r from-violet-400 to-indigo-500 h-full transition-all duration-500 shadow" style={{ width: `${completedPercent}%` }}></div>
                  </div>

                  <span className="text-[9px] text-slate-400 font-bold block leading-none">
                    {totalDistance > 0 
                      ? `Sisa ${Math.max(0, weeklyTarget - totalDistance).toFixed(1)} km lagi!` 
                      : "⏱️ Lakukan lari pertama untuk progres."}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 3. Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        
        {/* CTL/ATL Fitness Progress Widget */}
        <div className="glass-card rounded-2xl p-5 flex flex-col h-[280px] shadow-sm border border-slate-200/50">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3 shrink-0">
            <div className="flex items-center gap-2 text-slate-700 font-extrabold text-[10px] uppercase tracking-wider">
              <TrendingUp className="h-4 w-4 text-violet-500" />
              <span>Metrik Progres (CTL/ATL/TSB)</span>
            </div>
            <span className="text-[9px] bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full font-bold uppercase">Optimal</span>
          </div>

          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getLineData().slice(-15)}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickLine={false} tickFormatter={(str) => str.slice(8,10)} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} width={15} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }} 
                  labelClassName="text-slate-500 font-bold"
                />
                <Legend iconSize={6} iconType="circle" wrapperStyle={{ fontSize: '9px', paddingTop: '5px' }} />
                <Line type="monotone" dataKey="CTL" stroke="#8b5cf6" strokeWidth={2.5} name="Fitness (CTL)" dot={false} />
                <Line type="monotone" dataKey="ATL" stroke="#3b82f6" strokeWidth={1.5} name="Fatigue (ATL)" dot={false} strokeDasharray="3 3" />
                <Line type="monotone" dataKey="TSB" stroke="#f59e0b" strokeWidth={1.5} name="Form (TSB)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sleep Tracker */}
        <div className="glass-card rounded-2xl p-5 flex flex-col h-[280px] shadow-sm border border-slate-200/50">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3 shrink-0">
            <div className="flex items-center gap-2 text-slate-700 font-extrabold text-[10px] uppercase tracking-wider">
              <Moon className="h-4 w-4 text-violet-500" />
              <span>Sleep Tracker (7 Hari)</span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">Rerata: 7.2 jam</span>
          </div>

          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SLEEP_DATA}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} width={15} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px' }}
                />
                <Legend iconSize={6} iconType="circle" wrapperStyle={{ fontSize: '9px', paddingTop: '5px' }} />
                <Bar dataKey="hours" name="Durasi Tidur" fill="#c084fc" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="deepSleep" name="Deep Sleep" fill="#818cf8" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Heart Rate */}
        <div className="glass-card rounded-2xl p-5 flex flex-col h-[280px] shadow-sm border border-slate-200/50">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3 shrink-0">
            <div className="flex items-center gap-2 text-slate-700 font-extrabold text-[10px] uppercase tracking-wider">
              <Heart className="h-4 w-4 text-violet-500" />
              <span>Heart Rate Harian</span>
            </div>
            <span className="text-[10px] text-emerald-500 font-extrabold">RHR: 48 BPM</span>
          </div>

          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HEART_RATE_HOURLY}>
                <defs>
                  <linearGradient id="colorHrLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c084fc" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#c084fc" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} width={15} domain={[40, 120]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="bpm" name="Detak Jantung" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorHrLight)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}

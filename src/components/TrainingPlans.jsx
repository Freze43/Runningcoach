import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  ChevronRight, 
  Upload, 
  CheckCircle, 
  Clock, 
  Footprints, 
  Dumbbell, 
  Youtube,
  PlayCircle,
  HelpCircle,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Info,
  Target,
  Trophy,
  Sun,
  Play,
  Pause,
  Square,
  Compass,
  Signal,
  Bell,
  Camera,
  Heart,
  Volume2
} from 'lucide-react';
import { PROGRAMS, getScheduleForProgram } from '../data/mockData';
import { generateMockTrack, parseGPX, parseTCX, getDistance } from '../utils/gpxParser';

export default function TrainingPlans({ 
  user, 
  setUser, 
  runs, 
  setRuns, 
  schedules, 
  setSchedules, 
  shoes,
  setShoes,
  addActivityFeed,
  enrollUserInProgram,
  resetUserProgram
}) {
  const [activeSession, setActiveSession] = useState(null);
  const [modalTab, setModalTab] = useState('record');

  // --- REKOD LARI MANDIRI (LIVE GPS RECORDER SIMULATOR - UPGRADE #15 GEOLOCATION) ---
  const [isRecording, setIsRecording] = useState(false);
  const [recTimeSec, setRecTimeSec] = useState(0);
  const [recDist, setRecDist] = useState(0);
  const [recRoute, setRecRoute] = useState([]);
  const [useRealGPS, setUseRealGPS] = useState(false); // Switch between simulated & real mobile Geolocation (Item 15)

  // References for Item 5: Absolute system timestamp timer
  const startTimeRef = useRef(0);
  const totalAccumulatedTimeRef = useRef(0);
  const recordingIntervalRef = useRef(null);
  const geoWatchId = useRef(null);

  // --- UPGRADE #7: POST-RUN CUSTOMIZATION MODAL (Publish to Strava) ---
  const [pendingWorkout, setPendingWorkout] = useState(null);
  const [customTitle, setCustomTitle] = useState("Morning Run around Kendal");
  const [customDesc, setCustomDescription] = useState("Latihan lari yang sangat seru dibimbing oleh Coach AI!");
  const [customPhoto, setCustomPhoto] = useState("");

  // --- UPGRADE #6 (Part 2): HISTORY ITEM VIEW REPLAY THEATER ---
  const [replayRun, setReplayRun] = useState(null);
  const [replayIndex, setReplayIndex] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);
  const replayTimerRef = useRef(null);

  const PRESET_PHOTOS = [
    { name: "Beautiful Sun Road", url: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=600&q=80" },
    { name: "Forest Trail Climb", url: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=600&q=80" },
    { name: "Athletic Track Focus", url: "https://images.unsplash.com/photo-1502224562085-639556652f33?auto=format&fit=crop&w=600&q=80" }
  ];

  // Treadmill stats
  const [treadmillStats, setTreadmillStats] = useState({ steps: 8500, distance: 5.2, duration: 32 });
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadErrorSuccess] = useState('');
  const [expandedTargets, setExpandedTargets] = useState({});

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      if (geoWatchId.current) navigator.geolocation.clearWatch(geoWatchId.current);
      if (replayTimerRef.current) clearInterval(replayTimerRef.current);
    };
  }, []);

  // --- ITEM 5 FIX & ITEM 15 GEOLOCATION TRACKING INTEGRATION ---
  useEffect(() => {
    if (isRecording) {
      startTimeRef.current = Date.now() - (totalAccumulatedTimeRef.current * 1000);
      
      // Timer interval
      recordingIntervalRef.current = setInterval(() => {
        // Calculate elapsed time using system timestamp delta (Item 5 fix background freeze)
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setRecTimeSec(elapsed);

        if (!useRealGPS) {
          // Simulated path accumulation
          const speedFactor = user.level === 'pro' ? 0.0048 : (user.level === 'intermediate' ? 0.0036 : 0.0026);
          setRecDist(d => {
            const nextD = d + speedFactor;
            // append coordinate point
            setRecRoute(route => {
              const centerLat = -6.9189;
              const centerLon = 110.2031;
              const angle = (elapsed * 0.05);
              const radius = 0.001 + (elapsed * 0.00003);
              const lat = centerLat + Math.sin(angle) * radius;
              const lon = centerLon + Math.cos(angle * radius * 4) * radius * 1.5;
              return [
                ...route,
                { lat, lon, ele: 15 + Math.sin(elapsed * 0.1) * 3, time: new Date(), hr: 135 + Math.round(Math.sin(elapsed * 0.05) * 8), dist: nextD }
              ];
            });
            return nextD;
          });
        }
      }, 1000);

      // Real GPS watch position (Item 15)
      if (useRealGPS && navigator.geolocation) {
        geoWatchId.current = navigator.geolocation.watchPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const ele = position.coords.altitude || 12;
            const hr = 138 + Math.floor(Math.random() * 10);

            setRecRoute(prev => {
              let addedDist = 0;
              if (prev.length > 0) {
                const last = prev[prev.length - 1];
                addedDist = getDistance(last.lat, last.lon, lat, lon);
                setRecDist(d => d + addedDist);
              }
              const newPt = { lat, lon, ele, time: new Date(), hr, dist: recDist + addedDist };
              return [...prev, newPt];
            });
          },
          (err) => {
            console.error("GPS Error:", err);
            setUploadError("GPS HP gagal merespon. Mengalihkan kembali ke simulasi.");
            setUseRealGPS(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }

    } else {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      if (geoWatchId.current) {
        navigator.geolocation.clearWatch(geoWatchId.current);
        geoWatchId.current = null;
      }
      totalAccumulatedTimeRef.current = recTimeSec;
    }
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      if (geoWatchId.current) navigator.geolocation.clearWatch(geoWatchId.current);
    };
  }, [isRecording, useRealGPS, user.level]);

  // --- REPLAY TIMER INTERVAL (Item 6 Replay Theater) ---
  useEffect(() => {
    if (isReplaying && replayRun && replayRun.points) {
      replayTimerRef.current = setInterval(() => {
        setReplayIndex(prev => {
          if (prev >= replayRun.points.length - 1) {
            setIsReplaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 200);
    } else {
      if (replayTimerRef.current) clearInterval(replayTimerRef.current);
    }
    return () => {
      if (replayTimerRef.current) clearInterval(replayTimerRef.current);
    };
  }, [isReplaying, replayRun]);

  const toggleExpandTargets = (programId) => {
    setExpandedTargets(prev => ({
      ...prev,
      [programId]: !prev[programId]
    }));
  };

  const handleEnrollClick = (programId) => {
    enrollUserInProgram(programId);
  };

  const handleResetClick = () => {
    if (window.confirm("Apakah Anda yakin ingin membatalkan program lari saat ini?")) {
      resetUserProgram();
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    if (recRoute.length === 0) {
      setRecRoute([{ lat: -6.9189, lon: 110.2031, ele: 15, time: new Date(), hr: 120, dist: 0 }]);
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handleFinishRecording = () => {
    setIsRecording(false);
    if (recDist < 0.05) {
      setUploadError("Jarak terlalu pendek untuk disimpan. Berlarilah beberapa meter lagi!");
      return;
    }

    const paceString = getPaceString(recTimeSec, recDist);

    const recordedRun = {
      id: 'activity_live_' + Date.now(),
      name: customTitle,
      date: new Date().toISOString().split('T')[0],
      distance: parseFloat(recDist.toFixed(2)),
      duration: recTimeSec,
      avgPace: paceString,
      avgHr: 145 + Math.floor(Math.random() * 8),
      maxHr: 172,
      calories: Math.round(recDist * 68),
      elevationGain: Math.round(recDist * 7),
      vo2Max: user.level === 'pro' ? 57 : (user.level === 'intermediate' ? 49 : 42),
      points: recRoute
    };

    // Open Strava Customization Modal (Item 7)
    setPendingWorkout(recordedRun);
    setCustomTitle(`Sesi Lari Sore ${activeSession.title}`);
  };

  const handleFinishUpload = (workoutStats) => {
    // Open Strava Customization Modal (Item 7)
    setPendingWorkout(workoutStats);
    setCustomTitle(workoutStats.name);
  };

  // --- TRIGGER ACTION BROWSER NOTIFICATION (Item 6 part 1) ---
  const triggerBrowserNotification = (msgBody) => {
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("PacePilot AI Latihan Selesai! ✔️", {
            body: msgBody,
            icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>"
          });
        }
      });
    }
  };

  // --- SAVE THE WORKOUT TO GENERAL FEED AND RUNS DIRECTORY (Item 7) ---
  const handlePostToStravaFeed = (e) => {
    e.preventDefault();
    if (!pendingWorkout) return;

    const finalizedRun = {
      ...pendingWorkout,
      name: customTitle,
      programId: user.activeProgramId
    };

    // 1. Save runs
    const updatedRuns = [finalizedRun, ...runs];
    setRuns(updatedRuns);

    // 2. Complete schedules
    const updatedSchedules = schedules.map(s => {
      if (s.id === activeSession.id) {
        return { ...s, isCompleted: true, fileUploaded: finalizedRun.id };
      }
      return s;
    });
    setSchedules(updatedSchedules);

    // 3. Update shoes
    const updatedShoes = shoes.map(s => {
      if (s.active) return { ...s, mileage: s.mileage + finalizedRun.distance };
      return s;
    });
    setShoes(updatedShoes);

    // 4. Update user
    const currentVo2History = user.vo2maxHistory || [];
    const updatedVo2MaxHistory = [...currentVo2History, { date: finalizedRun.date, value: finalizedRun.vo2Max }];

    setUser({ 
      ...user, 
      vo2maxHistory: updatedVo2MaxHistory,
      shoes: updatedShoes
    });

    // 5. Post to community feed with custom text and image url (Item 7)
    addActivityFeed({
      id: 'feed_item_' + Date.now(),
      userName: user.name,
      userLevel: user.level,
      userAvatar: "🏃‍♂️",
      title: finalizedRun.name,
      description: customDesc || "Lari terstruktur selesai dengan panduan PacePilot AI!",
      distance: finalizedRun.distance,
      duration: new Date(finalizedRun.duration * 1000).toISOString().substr(11, 8),
      avgPace: finalizedRun.avgPace,
      avgHr: finalizedRun.avgHr,
      elevationGain: finalizedRun.elevationGain,
      kudos: 0,
      hasKudosed: false,
      comments: [],
      date: "Baru saja",
      photo: customPhoto || null
    });

    // Item 6: Notification upon upload
    triggerBrowserNotification(`Selamat! Latihan "${finalizedRun.name}" (${finalizedRun.distance} km) berhasil disinkronkan ke feed Komunitas.`);

    setUploadErrorSuccess("Latihan Berhasil Diposting ke Feed Strava!");
    setTimeout(() => {
      setPendingWorkout(null);
      setActiveSession(null);
      setUploadErrorSuccess('');
      setTreadmillMode(false);
      setCustomDescription("Latihan lari yang sangat seru dibimbing oleh Coach AI!");
      setCustomPhoto("");
    }, 2000);
  };

  // Replay a clicked log run (Item 6 Replay Theater)
  const handleOpenReplayTheater = (runItem) => {
    setReplayRun(runItem);
    setReplayIndex(0);
    setIsReplaying(true);
  };

  const renderReplaySVGRoute = () => {
    if (!replayRun || !replayRun.points || replayRun.points.length === 0) return null;
    const pts = replayRun.points;
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

    const activePt = pts[replayIndex] ? project(pts[replayIndex].lat, pts[replayIndex].lon) : project(pts[0].lat, pts[0].lon);

    return (
      <svg className="w-full h-full text-violet-600 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <path d={pathD} fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <g transform={`translate(${activePt.x}, ${activePt.y})`}>
          <circle cx="0" cy="0" r="9" fill="#8b5cf6" className="ring-pulse opacity-30" />
          <circle cx="0" cy="0" r="5" fill="#ffffff" stroke="#7c3aed" strokeWidth="2.5" />
        </g>
      </svg>
    );
  };

  const formatTimeHHMMSS = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs < 10 ? '0' : ''}${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getPaceString = (secs, km) => {
    if (km <= 0) return "--:--";
    const speedKmh = km / (secs / 3600);
    const paceMin = Math.floor(60 / speedKmh);
    const paceSec = Math.floor(((60 / speedKmh) - paceMin) * 60);
    return `${paceMin}:${paceSec < 10 ? '0' : ''}${paceSec}`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6 glass-mesh-bg h-full">
      
      {/* Catalog Programs */}
      {!user.activeProgramId ? (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 shadow-sm border border-slate-200/50">
            <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <Target className="h-5.5 w-5.5 text-violet-500" />
              <span>Pilih Rencana Lari Personal Anda</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">
              Rekomendasi rencana latihan cerdas dari Coach AI PacePilot. Semua intensitas, interval lari, dan program penguatan otot dirancang presisi mengikuti level Anda: 
              <span className="text-violet-600 font-black uppercase ml-1">{user.level}</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.values(PROGRAMS).map((program) => {
              const isExpanded = !!expandedTargets[program.id];
              const userTarget = program.targets[user.level];

              return (
                <div 
                  key={program.id} 
                  className="glass-card rounded-2xl overflow-hidden hover:border-violet-300 transition-all duration-300 flex flex-col justify-between group shadow-sm"
                >
                  <div className={`h-2 bg-gradient-to-r ${program.color === 'from-teal-500 to-emerald-500' ? 'from-teal-400 to-emerald-400' : 'from-violet-400 to-indigo-400'}`}></div>
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-lg font-black text-slate-800 group-hover:text-violet-600 transition-colors leading-tight">{program.name}</h4>
                        <span className="text-[10px] text-violet-600 bg-violet-50 border border-violet-100 font-extrabold px-2.5 py-1 rounded-full uppercase shrink-0">
                          {program.durationWeeks} Mgg
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">{program.description}</p>
                      
                      {/* Target Section */}
                      <div className="mt-4 p-3.5 bg-violet-50/60 rounded-xl border border-violet-100/60 space-y-2 font-semibold text-xs text-slate-600 shadow-inner">
                        <div className="flex items-center justify-between border-b border-violet-100/40 pb-1.5 mb-1">
                          <span className="text-[9px] text-violet-600 font-extrabold uppercase tracking-widest block">Target Anda ({user.level.toUpperCase()})</span>
                          <span className="text-[9px] text-slate-400 font-bold">Personalized</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Target Lari Terjauh:</span>
                          <strong className="text-slate-800 font-black">{userTarget.single}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Akumulasi Volume Mingguan:</span>
                          <strong className="text-slate-800 font-black">{userTarget.weekly}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Kekuatan Intensitas:</span>
                          <strong className="text-violet-600 font-black">{userTarget.intensity}</strong>
                        </div>
                      </div>

                      {/* Expandable Comparison */}
                      <div className="mt-3.5">
                        <button
                          type="button"
                          onClick={() => toggleExpandTargets(program.id)}
                          className="text-[9px] font-black uppercase text-violet-600 hover:text-violet-700 flex items-center gap-1 focus:outline-none"
                        >
                          <span>{isExpanded ? "✕ Sembunyikan Perbandingan Level" : "👁️ Tampilkan Target Semua Level"}</span>
                        </button>

                        {isExpanded && (
                          <div className="mt-2.5 p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-3.5 text-[10px] font-bold shadow-inner">
                            <div className="border-l-2 border-emerald-500 pl-2.5">
                              <span className="text-emerald-700 font-extrabold uppercase block text-[9px] tracking-wider">LEVEL BEGINNER</span>
                              <div className="text-slate-500 font-semibold mt-1">
                                <p>• Jarak Terjauh: <strong className="text-slate-700">{program.targets.beginner.single}</strong></p>
                                <p>• Volume Mingguan: <strong className="text-slate-700">{program.targets.beginner.weekly}</strong></p>
                                <p>• Fokus Sesi: <strong className="text-slate-700">{program.targets.beginner.intensity}</strong></p>
                              </div>
                            </div>

                            <div className="border-l-2 border-violet-500 pl-2.5">
                              <span className="text-violet-700 font-extrabold uppercase block text-[9px] tracking-wider">LEVEL INTERMEDIATE</span>
                              <div className="text-slate-500 font-semibold mt-1">
                                <p>• Jarak Terjauh: <strong className="text-slate-700">{program.targets.intermediate.single}</strong></p>
                                <p>• Volume Mingguan: <strong className="text-slate-700">{program.targets.intermediate.weekly}</strong></p>
                                <p>• Fokus Sesi: <strong className="text-slate-700">{program.targets.intermediate.intensity}</strong></p>
                              </div>
                            </div>

                            <div className="border-l-2 border-rose-500 pl-2.5">
                              <span className="text-rose-700 font-extrabold uppercase block text-[9px] tracking-wider">LEVEL PRO ELITE</span>
                              <div className="text-slate-500 font-semibold mt-1">
                                <p>• Jarak Terjauh: <strong className="text-slate-700">{program.targets.pro.single}</strong></p>
                                <p>• Volume Mingguan: <strong className="text-slate-700">{program.targets.pro.weekly}</strong></p>
                                <p>• Fokus Sesi: <strong className="text-slate-700">{program.targets.pro.intensity}</strong></p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>

                    <button
                      onClick={() => handleEnrollClick(program.id)}
                      className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md shadow-violet-500/10 uppercase tracking-widest shrink-0"
                    >
                      Daftar Program Latihan
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        
        // 2. Active program view
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl shadow-sm border border-slate-200/50">
            <div>
              <span className="text-[9px] bg-violet-100 text-violet-600 border border-violet-200/20 px-3 py-1 rounded-full font-extrabold uppercase tracking-widest">
                PROGRAM AKTIF: {PROGRAMS[user.activeProgramId]?.name}
              </span>
              <h3 className="text-xl font-black text-slate-800 mt-2 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-violet-500" />
                <span>Minggu Ke-{user.currentWeek} dari {PROGRAMS[user.activeProgramId]?.durationWeeks}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-semibold">
                Rencana lari terstruktur Anda disesuaikan untuk level <strong className="text-violet-600 uppercase font-bold">{user.level}</strong>. Target Terjauh: <strong className="text-slate-700">{PROGRAMS[user.activeProgramId]?.targets[user.level].single}</strong>.
              </p>
            </div>

            <button
              onClick={handleResetClick}
              className="px-4 py-2 text-xs font-bold bg-white hover:bg-rose-50 text-rose-500 border border-slate-200 hover:border-rose-200 rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Ganti Program</span>
            </button>
          </div>

          {/* Schedule days grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {schedules && schedules.length > 0 ? (
              schedules.map((session) => {
                const isRun = session.type !== 'Strength';
                return (
                  <div
                    key={session.id}
                    onClick={() => setActiveSession(session)}
                    className="glass-card cursor-pointer rounded-2xl p-5 flex flex-col justify-between group transition-all transform hover:-translate-y-1 shadow-sm hover:shadow-md border border-slate-200/50"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2.5">
                        <span className="text-xs font-black text-slate-400">{session.day}</span>
                        {session.isCompleted ? (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 border border-emerald-200/20 rounded-full text-[8px] font-extrabold text-emerald-600 uppercase tracking-wider">
                            <CheckCircle className="h-2.5 w-2.5" />
                            <span>SELESAI</span>
                          </div>
                        ) : (
                          <span className={`text-[8px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            isRun ? 'bg-violet-100 text-violet-600 border border-violet-200/20' : 'bg-amber-100 text-amber-600 border border-amber-200/20'
                          }`}>
                            {session.type}
                          </span>
                        )}
                      </div>

                      <h4 className="font-black text-sm text-slate-700 group-hover:text-violet-600 transition-colors leading-snug">{session.title}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-2 line-clamp-2 leading-relaxed">{session.desc}</p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                      {isRun ? (
                        <div className="flex items-center gap-1 text-slate-700">
                          <Footprints className="h-3.5 w-3.5 text-violet-500" />
                          <span>{session.distanceKm} KM</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-700">
                          <Dumbbell className="h-3.5 w-3.5 text-amber-500" />
                          <span>Kekuatan</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-slate-700">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{session.durationMin} Menit</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-4 py-8 text-center text-slate-400 font-bold text-xs">
                Mempersiapkan jadwal latihan lari Anda...
              </div>
            )}
          </div>

          {/* TCX/GPX History (CLICK TO REPLAY FUNCTIONAL - ITEM 6 part 2!) */}
          <div className="glass-card rounded-2xl p-5 shadow-sm border border-slate-200/50 space-y-4">
            <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
              <Upload className="h-4 w-4 text-violet-500 animate-bounce" />
              <span>Log Riwayat Unggahan Latihan Anda (Klik untuk Replay Maps!)</span>
            </h4>

            {runs.filter(r => r.programId === user.activeProgramId).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                <HelpCircle className="h-8 w-8 mb-2 opacity-50 text-slate-300" />
                <p className="text-[11px] font-semibold">Belum ada riwayat unggahan lari. Silakan klik salah satu jadwal harian di atas!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {runs.filter(r => r.programId === user.activeProgramId).map((run) => (
                  <div 
                    key={run.id} 
                    onClick={() => handleOpenReplayTheater(run)}
                    className="bg-white/50 p-3.5 rounded-xl border border-slate-150 hover:border-violet-400 hover:bg-violet-50/50 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold transition-all shadow-sm group"
                    title="Klik untuk membuka Replay Player & Maps asli!"
                  >
                    <div>
                      <span className="text-[8px] bg-violet-100 text-violet-700 font-extrabold px-2 py-0.5 rounded-full tracking-wide mr-2 uppercase group-hover:bg-violet-600 group-hover:text-white transition-all">REPLAY JALUR 👁️</span>
                      <strong className="text-slate-700 group-hover:text-violet-600 transition-colors">{run.name}</strong>
                      <span className="text-slate-400 block sm:inline sm:ml-3">Terlaksana pada: {run.date}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-600">
                      <span>📏 {run.distance.toFixed(1)} km</span>
                      <span>⏱️ {run.avgPace} /km</span>
                      <span>❤️ {run.avgHr} BPM</span>
                      <span className="text-violet-600 font-extrabold">⚡ VO2Max: {run.vo2Max}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- UPGRADE #7: POST-RUN CUSTOMIZATION DIALOGUE (PUBLISH TO STRAVA FEED) --- */}
      {pendingWorkout && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handlePostToStravaFeed} className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col font-sans text-slate-700">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-orange-500 animate-bounce" />
                <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-widest">Bagikan Aktivitas Lari</h3>
              </div>
            </div>

            <div className="p-5 space-y-4 text-xs font-semibold overflow-y-auto max-h-[380px]">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1.5">Nama Aktivitas Lari</label>
                <input 
                  type="text" 
                  required
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl w-full p-2.5 text-slate-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1.5">Cerita & Status Lari (Status Update)</label>
                <textarea 
                  rows="3"
                  value={customDesc}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl w-full p-2.5 text-slate-700 focus:outline-none"
                  placeholder="Ceritakan pengalaman lari, tanjakan, atau rintangan rute..."
                ></textarea>
              </div>

              {/* Custom Photo Upload Url/Presete selection */}
              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1.5">Lampirkan Foto Kegiatan Anda</label>
                <input
                  type="text"
                  placeholder="Tempel link URL foto bebas..."
                  value={customPhoto}
                  onChange={(e) => setCustomPhoto(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl w-full p-2.5 text-slate-700 focus:outline-none mb-2"
                />
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_PHOTOS.map((ph, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCustomPhoto(ph.url)}
                      className={`border p-1 rounded-xl overflow-hidden transition-all text-left ${customPhoto === ph.url ? 'border-orange-500 bg-orange-50' : 'border-slate-100'}`}
                    >
                      <img src={ph.url} alt={ph.name} className="h-10 w-full object-cover rounded-lg" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button 
                type="submit"
                className="w-full py-3 bg-[#ff5722] hover:bg-[#e64a19] text-white font-black text-xs rounded-xl shadow-lg shadow-orange-500/20 uppercase tracking-widest text-center"
              >
                Posting ke Feed Strava ✔️
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- UPGRADE #6 (Part 2): VISUAL REPLAY THEATER MODAL --- */}
      {replayRun && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col font-sans text-slate-700">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[9px] uppercase font-bold text-violet-500 tracking-widest">Replay Jalur Lari Pasca-Aktivitas</span>
                <h3 className="text-sm font-black text-slate-800 mt-0.5">{replayRun.name}</h3>
              </div>
              <button type="button" onClick={() => { setIsReplaying(false); setReplayRun(null); }} className="text-slate-400 hover:text-slate-700 font-extrabold text-sm">✕</button>
            </div>

            <div className="p-5 space-y-4 flex-1 overflow-y-auto max-h-[440px]">
              {/* Map display */}
              <div className="h-44 bg-slate-50 border border-slate-150 rounded-xl relative overflow-hidden flex items-center justify-center p-1.5 shadow-inner">
                {renderReplaySVGRoute()}
                <div className="absolute top-2.5 left-2.5 bg-violet-600 text-white font-black text-[8px] uppercase px-2.5 py-1 rounded-full shadow shadow-violet-500/15">
                  Live Playback
                </div>
              </div>

              {/* Ticker values */}
              <div className="grid grid-cols-3 gap-2.5 text-center font-bold text-slate-600">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150/60">
                  <span className="text-[8px] text-slate-400 block uppercase">Jarak</span>
                  <strong className="text-xs text-slate-700">{(replayRun.points && replayRun.points[replayIndex]) ? replayRun.points[replayIndex].dist.toFixed(2) : replayRun.distance} km</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150/60">
                  <span className="text-[8px] text-slate-400 block uppercase">Pace</span>
                  <strong className="text-xs text-violet-600">{(replayRun.points && replayRun.points[replayIndex]) ? (replayRun.points[replayIndex].pace || replayRun.avgPace) : replayRun.avgPace} /km</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150/60">
                  <span className="text-[8px] text-slate-400 block uppercase">Detak Nadi</span>
                  <strong className="text-xs text-red-500 flex items-center justify-center gap-1">
                    <Heart className="h-3 w-3 fill-red-500 animate-pulse" />
                    {(replayRun.points && replayRun.points[replayIndex]) ? `${Math.round(replayRun.points[replayIndex].hr)} BPM` : `${replayRun.avgHr} BPM`}
                  </strong>
                </div>
              </div>

              {/* Replay controller */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setIsReplaying(!isReplaying)}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-black text-[9px] rounded-lg shadow uppercase shrink-0"
                >
                  {isReplaying ? "Pause" : "Play Replay"}
                </button>

                <input
                  type="range"
                  min="0"
                  max={(replayRun.points && replayRun.points.length > 0) ? replayRun.points.length - 1 : 0}
                  value={replayIndex}
                  onChange={(e) => {
                    setIsReplaying(false);
                    setReplayIndex(parseInt(e.target.value, 10));
                  }}
                  className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sesi Detail & Recording Simulator Modal */}
      {activeSession && !pendingWorkout && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase font-bold text-violet-500 tracking-widest">
                  Struktur Menu Sesi • {activeSession.day} • {activeSession.type}
                </span>
                <h3 className="text-sm font-black text-slate-800 mt-1">{activeSession.title}</h3>
              </div>
              <button 
                onClick={() => {
                  setActiveSession(null);
                  setTreadmillMode(false);
                  setIsRecording(false);
                }} 
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1 max-h-[480px]">
              
              {/* Option Selector Tabs */}
              {activeSession.type !== 'Strength' && !isRecording && (
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-150 font-bold text-[10px] uppercase shrink-0 shadow-inner">
                  <button
                    onClick={() => setModalTab('record')}
                    className={`py-2 rounded-lg transition-all ${modalTab === 'record' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    📱 Live GPS Recorder
                  </button>
                  <button
                    onClick={() => setModalTab('upload')}
                    className={`py-2 rounded-lg transition-all ${modalTab === 'upload' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    📂 File GPX / TCX Upload
                  </button>
                  <button
                    onClick={() => setModalTab('treadmill')}
                    className={`py-2 rounded-lg transition-all ${modalTab === 'treadmill' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    🏃 Treadmill Mode
                  </button>
                </div>
              )}

              {uploadError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-500 text-xs p-3 rounded-xl flex items-center gap-2 font-semibold">
                  <Info className="h-4 w-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs p-3 rounded-xl flex items-center gap-2 font-semibold animate-bounce">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              {activeSession.isCompleted ? (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center space-y-2">
                  <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto" />
                  <h5 className="font-extrabold text-slate-700 text-xs uppercase tracking-wider">Sesi Latihan Telah Selesai!</h5>
                  <p className="text-xs text-slate-500 font-medium">Kerja bagus! Data lari terekam dan disinkronkan secara otomatis.</p>
                </div>
              ) : activeSession.type === 'Strength' ? (
                
                // Strength layout
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-150/60 p-4 rounded-xl flex items-start gap-4 font-semibold text-xs">
                    <div className="p-2 bg-amber-100 text-amber-600 border border-amber-200/20 rounded-lg">
                      <Dumbbell className="h-5 w-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-700">Rekomendasi Video Pencegahan Cedera</h5>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Mempelajari gerakan kekuatan paha, lutut, dan betis. Klik di bawah untuk mencarinya di YouTube:
                      </p>

                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(activeSession.searchQuery)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-[10px] rounded-lg transition-all"
                      >
                        <Youtube className="h-3.5 w-3.5" />
                        <span>Cari Gerakan di YouTube</span>
                      </a>
                    </div>
                  </div>

                  <button
                    onClick={completeStrengthWorkout}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md shadow-emerald-500/10 uppercase tracking-wider"
                  >
                    Konfirmasi Selesai Latihan Kekuatan
                  </button>
                </div>

              ) : (

                // Run layout options
                <div className="space-y-4">
                  
                  {/* --- UPGRADE #15: GEOLOCATION LIVE RECORDER SMARTPHONE DISPLAY --- */}
                  {modalTab === 'record' && (
                    <div className="w-full max-w-sm mx-auto bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col font-sans text-slate-100 relative">
                      
                      {/* Orange header */}
                      <div className="bg-[#ff5722] text-white px-5 py-3 flex items-center justify-between text-[11px] font-black uppercase tracking-widest shrink-0">
                        <span>Settings</span>
                        <span>RUN RECORDING</span>
                        <button type="button" onClick={() => { setIsRecording(false); setActiveSession(null); }} className="text-white">Close</button>
                      </div>

                      {/* STOPPED / RECORDING banner */}
                      <div className={`text-center py-2 text-[10px] font-black uppercase tracking-widest shrink-0 ${isRecording ? 'bg-emerald-500 text-white animate-pulse' : 'bg-red-500 text-white'}`}>
                        {isRecording ? "● RECORDING LIVE" : "Stopped"}
                      </div>

                      {/* Map canvas */}
                      <div className="h-44 bg-slate-950 flex items-center justify-center relative overflow-hidden shadow-inner border-b border-slate-850">
                        {recRoute.length >= 2 ? (
                          <div className="w-full h-full p-2 flex items-center justify-center">
                            {renderRecordingSVGRoute()}
                          </div>
                        ) : (
                          <div className="text-center p-4 space-y-2">
                            <div className="relative mx-auto flex items-center justify-center">
                              <div className="w-12 h-12 bg-blue-500/20 rounded-full absolute animate-ping" style={{ animationDuration: '3s' }}></div>
                              <div className="w-8 h-8 bg-blue-500/30 rounded-full absolute"></div>
                              <div className="w-3.5 h-3.5 bg-blue-500 border-2 border-white rounded-full absolute shadow shadow-blue-500/50"></div>
                            </div>
                            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block">GPS Signal Connected</span>
                          </div>
                        )}

                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded text-[8px] font-bold">
                          <Signal className="h-3 w-3 text-emerald-400" />
                          <span>HIGH ACCURACY</span>
                        </div>
                      </div>

                      {/* Time display */}
                      <div className="text-center py-4.5 bg-slate-950/40 border-b border-slate-850">
                        <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-widest">ELAPSED TIME</span>
                        <span className="text-3xl font-black text-white tracking-tight block mt-0.5">{formatTimeHHMMSS(recTimeSec)}</span>
                      </div>

                      {/* Pace and Distance dials */}
                      <div className="grid grid-cols-2 text-center divide-x divide-slate-850 bg-slate-950/40 py-4 border-b border-slate-850">
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase font-bold">AVG PACE</span>
                          <span className="text-lg font-black text-white block mt-0.5">{getPaceString(recTimeSec, recDist)} /km</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase font-bold">DISTANCE</span>
                          <span className="text-lg font-black text-[#ff5722] block mt-0.5">{recDist.toFixed(2)} <span className="text-xs text-white">km</span></span>
                        </div>
                      </div>

                      {/* --- ITEM 15 GEOLOCATION TOGGLE SWITCHER --- */}
                      <div className="bg-slate-950/60 p-3.5 border-b border-slate-850 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Lacak GPS HP Riil (Item 15)</span>
                        <button 
                          type="button"
                          onClick={() => setUseRealGPS(!useRealGPS)}
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${useRealGPS ? 'bg-[#ff5722] text-white' : 'bg-slate-800 text-slate-400'}`}
                        >
                          {useRealGPS ? "Riil GPS On" : "Simulasi GPS"}
                        </button>
                      </div>

                      {/* Bottom Controls */}
                      <div className="p-5 flex justify-center items-center gap-6 bg-slate-950/80 shrink-0">
                        {!isRecording && recTimeSec === 0 ? (
                          <button
                            type="button"
                            onClick={handleStartRecording}
                            className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-black text-[10px] rounded-full uppercase tracking-widest shadow-lg shadow-orange-500/20"
                          >
                            Mulai Lari (Start)
                          </button>
                        ) : (
                          <>
                            {isRecording ? (
                              <button
                                type="button"
                                onClick={handleStopRecording}
                                className="w-12 h-12 border-2 border-red-500 hover:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center font-black text-[10px] uppercase transition-all"
                              >
                                Pause
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={handleStartRecording}
                                className="w-12 h-12 border-2 border-emerald-500 hover:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center font-black text-[10px] uppercase transition-all"
                              >
                                Resume
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={handleFinishRecording}
                              className="w-14 h-14 bg-[#ff5722] hover:bg-[#e64a19] text-white rounded-full flex items-center justify-center font-black text-[10px] uppercase transition-all shadow-lg"
                            >
                              Finish
                            </button>
                          </>
                        )}
                      </div>

                    </div>
                  )}

                  {/* FILE UPLOAD MODE */}
                  {modalTab === 'upload' && (
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-slate-200 hover:border-violet-400 rounded-2xl p-6 transition-all flex flex-col items-center justify-center text-center space-y-2 relative bg-slate-50/50 font-semibold text-xs text-slate-600">
                        <Upload className="h-8 w-8 text-violet-500 opacity-60 mb-1" />
                        <div>
                          <span className="font-extrabold text-slate-700 block">Pilih File GPX atau TCX Anda</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Seret file lari Anda atau klik di sini</span>
                        </div>
                        <input
                          type="file"
                          accept=".gpx,.tcx"
                          onChange={handleFileUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>

                      {/* Demo injections */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-150/60 space-y-2">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Sparkles className="h-4 w-4 text-violet-500 animate-spin" style={{ animationDuration: '6s' }} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Gunakan Demo GPS Track (Simulasi Instan)</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Klik rute simulasi di bawah untuk langsung mencoba parsing file lari, menggambar peta GPS, meng-update VO2Max, dan merekam sepatu Anda secara instan:
                        </p>
                        
                        <div className="grid grid-cols-2 gap-2 pt-1 font-bold">
                          <button
                            onClick={() => {
                              const stats = generateMockTrack("Pantai Kendal Coastal Run", activeSession.distanceKm);
                              handleFinishUpload(stats);
                            }}
                            className="bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50 text-slate-600 p-2.5 rounded-xl transition-all text-left flex flex-col shadow-sm"
                          >
                            <span className="text-[11px] text-slate-700">🌊 Pantai Kendal Loop</span>
                            <span className="text-[9px] text-slate-400 font-semibold">Flat Coast • {activeSession.distanceKm} km</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              const stats = generateMockTrack("Jakarta CFD Sudirman", activeSession.distanceKm);
                              handleFinishUpload(stats);
                            }}
                            className="bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50 text-slate-600 p-2.5 rounded-xl transition-all text-left flex flex-col shadow-sm"
                          >
                            <span className="text-[11px] text-slate-700">🏢 Jakarta CFD Sudirman</span>
                            <span className="text-[9px] text-slate-400 font-semibold">City Asphalt • {activeSession.distanceKm} km</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TREADMILL INPUT MODE */}
                  {modalTab === 'treadmill' && (
                    <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-150/60 font-semibold">
                      <span className="text-[9px] text-violet-600 font-bold uppercase tracking-widest block">Formulir Manual Treadmill</span>
                      <div className="grid grid-cols-3 gap-3 text-xs text-slate-600">
                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Jumlah Langkah</label>
                          <input 
                            type="number" 
                            value={treadmillStats.steps}
                            onChange={(e) => setTreadmillStats({ ...treadmillStats, steps: parseInt(e.target.value) || 0 })}
                            className="bg-white border border-slate-200 rounded-lg w-full p-2.5 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Jarak (KM)</label>
                          <input 
                            type="number" 
                            step="0.1" 
                            value={treadmillStats.distance}
                            onChange={(e) => setTreadmillStats({ ...treadmillStats, distance: parseFloat(e.target.value) || 0 })}
                            className="bg-white border border-slate-200 rounded-lg w-full p-2.5 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Durasi (Menit)</label>
                          <input 
                            type="number" 
                            value={treadmillStats.duration}
                            onChange={(e) => setTreadmillStats({ ...treadmillStats, duration: parseInt(e.target.value) || 0 })}
                            className="bg-white border border-slate-200 rounded-lg w-full p-2.5 focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleCompleteTreadmill}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-3 rounded-xl transition-all shadow"
                      >
                        Simpan Latihan Treadmill Selesai
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Droplet, 
  Apple, 
  Heart, 
  Volume2,
  Mic,
  MicOff,
  Play,
  Pause,
  HelpCircle,
  FileText,
  Info,
  Square,
  VolumeX,
  Lock,
  Flame,
  Activity,
  Dumbbell
} from 'lucide-react';

export default function CoachingAI({ user, runs }) {
  const [activeSubTab, setActiveSubTab] = useState('chat'); 
  const [messages, setMessages] = useState([
    { id: '1', role: 'coach', text: `Halo ${user.name}! Saya Coach AI PacePilot Anda. Saya baru saja menyinkronkan profil tingkat lari Anda (${user.level.toUpperCase()}) dan data VO2Max harian.` },
    { id: '2', role: 'coach', text: "Ada pertanyaan seputar pacing lari, latihan interval, program kekuatan otot, atau butuh panduan nutrisi minum untuk lari jarak jauh (long run) hari ini?" }
  ]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  // --- ITEM 3: GEMINI_API_KEY CONECTION ENGINE ---
  const [geminiKey, setGeminiKey] = useState(() => {
    return localStorage.getItem('gemini_api_key') || "";
  });
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Voice player simulated state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  // Voice command states
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("Silakan tekan tombol mikrofon di bawah dan katakan sesuatu...");
  const [voiceReply, setVoiceReply] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'id-ID'; 

      rec.onstart = () => {
        setIsListening(true);
        setVoiceTranscript("Mendengarkan suara Anda...");
        setVoiceReply("");
      };

      rec.onerror = (event) => {
        console.error("Speech recognition error", event);
        setIsListening(false);
        setVoiceTranscript("Gagal merekam suara. Pastikan mikrofon aktif.");
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event) => {
        const resultText = event.results[0][0].transcript;
        setVoiceTranscript(`Anda berkata: "${resultText}"`);
        processVoiceCommand(resultText);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Audio wave playback interval
  useEffect(() => {
    let interval = null;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 5;
        });
      }, 250);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

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

      window.speechSynthesis.speak(utterance);
    }
  };

  const processVoiceCommand = (commandText) => {
    const text = commandText.toLowerCase();
    let reply = "";

    if (text.includes('vo2max') || text.includes('kebugaran') || text.includes('vo2 max')) {
      const latestVo2 = user.vo2maxHistory[user.vo2maxHistory.length - 1]?.value || 0;
      reply = latestVo2 > 0 
        ? `VO2Max Anda saat ini berada di angka ${latestVo2} mililiter per kilogram per menit. Tingkat kebugaran lari Anda berada di kategori ${user.level.toUpperCase()}.`
        : `VO2Max Anda belum terkalkulasi. Segeralah mengunggah rute lari Anda!`;
    } else if (text.includes('minum') || text.includes('nutrisi') || text.includes('makan') || text.includes('long run')) {
      reply = `Untuk lari jarak jauh, minumlah cairan elektrolit seratus lima puluh mili liter setiap lima belas menit lari, dan konsumsi satu buah pisang atau energy gel setiap empat puluh lima menit lari Anda.`;
    } else if (text.includes('cedera') || text.includes('sakit') || text.includes('lutut')) {
      reply = `Jangan memaksakan berlari jika lutut terasa nyeri. AI menyarankan Anda mengambil libur latihan hari ini, melakukan kompres es, dan mengeksekusi sesi latihan kekuatan di hari Rabu depan.`;
    } else {
      reply = `Pertanyaan seputar ${commandText} sangat bagus. Tetaplah berlatih secara konsisten bersama program latihan lari terstruktur PacePilot AI untuk mendapatkan hasil yang terbaik.`;
    }

    setVoiceReply(reply);
    speakCoachingIndonesian(reply);
  };

  const handleToggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        recognitionRef.current.start();
      } else {
        simulateVoiceInput();
      }
    }
  };

  const simulateVoiceInput = () => {
    setIsListening(true);
    setVoiceTranscript("Mendengarkan suara Anda (Simulasi)...");
    
    setTimeout(() => {
      setIsListening(false);
      const simulations = [
        "Berapa VO2Max saya hari ini?",
        "Tolong berikan panduan minum lari jarak jauh",
        "Lutut saya sakit setelah lari"
      ];
      const randomCommand = simulations[Math.floor(Math.random() * simulations.length)];
      setVoiceTranscript(`Simulasi Anda berkata: "${randomCommand}"`);
      processVoiceCommand(randomCommand);
    }, 2500);
  };

  // --- ITEM 3: FETCH GEMINI LIVE CHAT OR FALLBACK SIMULATION ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText || !inputText.trim()) return;

    const userMsg = { id: 'user_' + Date.now(), role: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    const promptText = inputText;
    setInputText('');
    setIsAiTyping(true);

    if (geminiKey && geminiKey.trim()) {
      // Connect Live to Google Gemini API
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `You are Coach AI of PacePilot running app. Answer this running/fitness question for a runner of level ${user.level} named ${user.name}: ${promptText}` }] }]
            })
          }
        );
        const data = await response.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, kunci Gemini API salah atau kuota telah habis.";
        setMessages(prev => [...prev, { id: 'ai_' + Date.now(), role: 'coach', text: replyText }]);
      } catch (err) {
        console.error("Gemini live fetch error:", err);
        setMessages(prev => [...prev, { id: 'ai_' + Date.now(), role: 'coach', text: "Gagal menghubungkan ke server Google Gemini. Periksa koneksi internet Anda." }]);
      } finally {
        setIsAiTyping(false);
      }
    } else {
      // Fallback local smart response simulator
      setTimeout(() => {
        let replyText = "";
        const text = promptText.toLowerCase();

        if (text.includes('minum') || text.includes('nutrisi') || text.includes('long run') || text.includes('makan')) {
          replyText = "Untuk lari jarak jauh (Long Run > 60 menit), rekomendasi hidrasi & nutrisi Coach AI adalah:\n\n" +
            "💧 HIDRASI: Minum 150-200ml cairan elektrolit setiap 15-20 menit. Hindari minum air putih murni dalam jumlah berlebih tanpa garam natrium.\n" +
            "🍌 KARBOHIDRAT: Konsumsi 30-60 gram karbohidrat cepat serap (seperti energy gel, kurma, atau pisang) setiap 45 menit lari.\n" +
            "🧇 SEBELUM LARI: Makan berat kaya karbohidrat kompleks 2-3 jam sebelum lari (misal oatmeal, nasi/roti gandum).\n" +
            "🍗 SETELAH LARI: Konsumsi rasio karbohidrat dan protein 3:1 dalam jendela 45 menit pasca-lari.";
        } else if (text.includes('vo2max') || text.includes('vo2 max') || text.includes('naik')) {
          replyText = `Melihat tingkat VO2Max Anda saat ini, cara terbaik menaikkannya adalah:\n\n` +
            "1. Latihan Interval Vo2Max: Lari 4x800m dengan intensitas keras 90-95% detak jantung maksimal.\n" +
            "2. Konsistensi Volume Aerobik (Lari Zona 2): Lakukan 80% porsi lari mingguan Anda di intensitas rendah untuk memperbanyak pembuluh kapiler darah.\n" +
            "3. Turunkan Berat Badan Sedikit: Karena VO2Max dihitung per kilogram berat badan, menurunkan lemak tubuh akan otomatis menaikkan angka VO2Max Anda.";
        } else if (text.includes('cedera') || text.includes('lutut') || text.includes('sakit')) {
          replyText = "Jika Anda merasakan nyeri persendian lutut atau IT Band, segeralah beristirahat! Pastikan Anda tidak melewatkan sesi Strength Training (Latihan Kekuatan) di hari Rabu. Melatih otot paha depan (quadriceps), bokong (glutes), dan core akan menstabilkan lutut Anda saat membentur aspal.";
        } else {
          replyText = `Pertanyaan yang bagus seputar "${promptText}"! Sebagai pelari level ${user.level.toUpperCase()}, fokus utama Anda saat ini haruslah menjaga konsistensi lari di Zona 2 (Conversational Pace) pada lari harian, dan mengeksekusi latihan interval dengan tertib.`;
        }

        setMessages(prev => [...prev, { id: 'ai_' + Date.now(), role: 'coach', text: replyText }]);
        setIsAiTyping(false);
      }, 1000);
    }
  };

  const saveGeminiKey = (e) => {
    e.preventDefault();
    localStorage.setItem('gemini_api_key', geminiKey);
    setShowKeyInput(false);
  };

  // --- ITEM 8: AI-POWERED 'QUICK TIPS' BASED ON RECENT INTENSITY ---
  const getAiQuickTips = () => {
    if (!runs || runs.length === 0) {
      return {
        title: "Kembangkan Hidrasi Aerobik Dasar",
        desc: "Selesaikan lari pertama Anda agar AI dapat mendeteksi intensitas detak jantung harian Anda."
      };
    }
    const latestAvgHr = runs[0].avgHr || 140;
    if (latestAvgHr > 155) {
      return {
        title: "⚠️ Pemulihan Glikogen & Reduksi Detak Nadi",
        desc: "Lari terakhir Anda berkategori Intensitas Tinggi (HR > 155). AI menyarankan konsumsi 50g karbohidrat dalam 30 menit pasca-lari, lakukan kompres dingin pada otot kaki, dan perbanyak lari Zona 2 untuk melatih katup mitokondria."
      };
    } else if (latestAvgHr >= 135) {
      return {
        title: "⭐ Jaga Cadence & Ritme Efisien",
        desc: "Latihan lari Anda berada di Zona Ambang Batas Sedang (135 - 155). Upayakan untuk mempertahankan Cadence langkah kaki Anda di rentang 170-180 SPM demi meringankan benturan sol aspal pada sendi lutut."
      };
    }
    return {
      title: "🍃 Sesi Easy Recovery Sempurna",
      desc: "Lari santai yang sangat baik! Detak jantung Anda stabil di Zona Pemulihan Aktif (< 135). Ini merangsang aliran oksigen kaya nutrisi ke jaringan serat otot yang lelah untuk mempercepat masa pemulihan."
    };
  };

  const quickTips = getAiQuickTips();

  // --- ITEM 18: AI-POWERED 5-MINUTE PRE-RUN WARMUP SUGGESTIONS ---
  const getWarmUpRoutine = () => {
    if (!runs || runs.length === 0) {
      return [
        { name: "Jalan Cepat Progresif", time: "1 Menit" },
        { name: "Dynamic Hip Rotations", time: "1 Menit" },
        { name: "Arm Swings & Core Twists", time: "1 Menit" },
        { name: "Walking Lunges Perlahan", time: "2 Menit" }
      ];
    }
    const latestAvgHr = runs[0].avgHr || 140;
    // High intensity workout yesterday -> Needs more dynamic activation
    if (latestAvgHr > 155) {
      return [
        { name: "Aktivasi Glute Bridges", time: "1 Menit" },
        { name: "Dynamic Leg Swings (Front/Side)", time: "1 Menit" },
        { name: "Calf Raises Ringan", time: "1 Menit" },
        { name: "Walking Lunges dengan Pilinan Core", time: "2 Menit" }
      ];
    }
    return [
      { name: "Jalan Santai ➡️ Joging Kecil", time: "2 Menit" },
      { name: "Dynamic Knee Hugs", time: "1 Menit" },
      { name: "Dynamic Ankle Rolls & Butt Kicks", time: "2 Menit" }
    ];
  };

  const warmUpRoutine = getWarmUpRoutine();

  const latestRun = runs.length > 0 ? runs[0] : null;

  const hrZones = latestRun && latestRun.avgHr ? {
    z1: Math.round(latestRun.duration * 0.1),
    z2: Math.round(latestRun.duration * 0.55),
    z3: Math.round(latestRun.duration * 0.2),
    z4: Math.round(latestRun.duration * 0.12),
    z5: Math.round(latestRun.duration * 0.03)
  } : { z1: 600, z2: 1800, z3: 500, z4: 200, z5: 40 };

  const formatMinSec = (sec) => {
    const mins = Math.floor(sec / 60);
    return `${mins}m`;
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col glass-mesh-bg h-full">
      
      {/* Sub tabs */}
      <div className="bg-white/60 backdrop-blur-xl border-b border-slate-200/50 px-8 py-2 flex gap-5 shrink-0 z-10">
        <button
          onClick={() => setActiveSubTab('chat')}
          className={`font-extrabold text-xs py-2 border-b-2 uppercase tracking-wider transition-all ${
            activeSubTab === 'chat' ? 'text-violet-600 border-violet-600' : 'text-slate-400 border-transparent hover:text-slate-700'
          }`}
        >
          Coach AI Chatbot
        </button>
        <button
          onClick={() => setActiveSubTab('voice')}
          className={`font-extrabold text-xs py-2 border-b-2 uppercase tracking-wider transition-all ${
            activeSubTab === 'voice' ? 'text-violet-600 border-violet-600' : 'text-slate-400 border-transparent hover:text-slate-700'
          }`}
        >
          🎤 AI Voice Analysis
        </button>
        <button
          onClick={() => setActiveSubTab('analyzer')}
          className={`font-extrabold text-xs py-2 border-b-2 uppercase tracking-wider transition-all ${
            activeSubTab === 'analyzer' ? 'text-violet-600 border-violet-600' : 'text-slate-400 border-transparent hover:text-slate-700'
          }`}
        >
          AI Run GPS File Analyzer
        </button>
        <button
          onClick={() => setActiveSubTab('nutrition')}
          className={`font-extrabold text-xs py-2 border-b-2 uppercase tracking-wider transition-all ${
            activeSubTab === 'nutrition' ? 'text-violet-600 border-violet-600' : 'text-slate-400 border-transparent hover:text-slate-700'
          }`}
        >
          Nutrisi & Hidrasi Long Run
        </button>
      </div>

      {/* CHAT TAB */}
      {activeSubTab === 'chat' && (
        <div className="flex-1 flex overflow-hidden">
          
          <div className="flex-1 flex flex-col bg-white/20">
            {/* Gemini settings indicator bar */}
            <div className="px-6 py-2 bg-violet-50/50 border-b border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500 shrink-0">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-violet-500 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Koneksi Chat: {geminiKey ? "Live Google Gemini Pro ✅" : "PacePilot Offline Simulator"}</span>
              </span>
              <button 
                type="button" 
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="text-violet-600 hover:underline"
              >
                {showKeyInput ? "✕ Sembunyikan" : "⚙️ Pengaturan Kunci Gemini"}
              </button>
            </div>

            {/* Gemini key config input form (Item 3) */}
            {showKeyInput && (
              <form onSubmit={saveGeminiKey} className="p-4 bg-white border-b border-slate-200 flex gap-2 shrink-0 animate-fade-in font-semibold text-xs">
                <input
                  type="password"
                  required
                  placeholder="Tempel GEMINI_API_KEY Anda di sini..."
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex-1 focus:outline-none"
                />
                <button type="submit" className="bg-violet-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase">Simpan</button>
              </form>
            )}

            <div className="flex-1 overflow-y-auto p-6 space-y-4.5">
              
              {/* Voice Player */}
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8.5 h-8.5 rounded-full shrink-0 flex items-center justify-center text-sm border bg-violet-100 border-violet-200/20 text-violet-600">
                  🤖
                </div>
                <div className="bg-slate-900 text-white p-4.5 rounded-2xl rounded-tl-none shadow-md border border-slate-800 space-y-2.5 max-w-sm">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                    <Volume2 className="h-3 w-3 text-violet-400" />
                    <span>Coach AI Voice Note</span>
                  </span>
                  
                  <div className="flex items-center gap-3 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-850">
                    <button 
                      type="button"
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className="w-7 h-7 bg-violet-600 text-white rounded-full flex items-center justify-center hover:bg-violet-500 transition-all shadow-sm shrink-0"
                    >
                      {isPlayingAudio ? (
                        <div className="flex gap-0.5 justify-center items-center">
                          <span className="w-0.5 h-2.5 bg-white rounded-full animate-bounce"></span>
                          <span className="w-0.5 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                          <span className="w-0.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        </div>
                      ) : (
                        <Play className="h-3.5 w-3.5 fill-white" />
                      )}
                    </button>

                    <div className="flex-1 h-6 flex items-center gap-0.5 overflow-hidden opacity-80">
                      {Array.from({ length: 28 }).map((_, i) => {
                        const heights = [12, 18, 8, 22, 14, 6, 16, 24, 10, 18, 12, 14, 20, 8, 18, 12, 22, 14, 6, 16, 24, 10, 18, 12, 14, 20, 8, 12];
                        const h = heights[i % heights.length];
                        const isActive = (i / 28) * 100 <= audioProgress;
                        return (
                          <span 
                            key={i} 
                            className={`w-0.5 rounded-full transition-all duration-300 ${isActive ? 'bg-violet-400 h-full' : 'bg-slate-700 h-[30%]'}`}
                            style={{ height: isActive ? `${h}px` : undefined }}
                          ></span>
                        );
                      })}
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 font-extrabold shrink-0">
                      00:0{isPlayingAudio ? (5 - Math.round(audioProgress/20)) : 5}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                    "Halo Alex, saya baru saja merapikan jadwal latihan minggu depan. Silakan didengarkan analisis voice ini!"
                  </p>
                </div>
              </div>

              {messages.map((m) => (
                <div 
                  key={m.id} 
                  className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`w-8.5 h-8.5 rounded-full shrink-0 flex items-center justify-center text-sm border ${
                    m.role === 'user' 
                      ? 'bg-violet-100 border-violet-200 text-violet-600 shadow-sm' 
                      : 'bg-violet-50 border-violet-100 text-violet-700 shadow-sm'
                  }`}>
                    {m.role === 'user' ? '🏃\u200d♂️' : '🤖'}
                  </div>
                  
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed border shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white border-transparent rounded-tr-none shadow-violet-500/10' 
                      : 'bg-white border-slate-200/60 text-slate-600 rounded-tl-none font-semibold whitespace-pre-line'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}

              {isAiTyping && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8.5 h-8.5 rounded-full shrink-0 flex items-center justify-center text-sm border bg-violet-50 border-violet-100 text-violet-700 shadow-sm">
                    🤖
                  </div>
                  <div className="p-4 rounded-2xl text-xs leading-relaxed border bg-white border-slate-200/60 text-slate-400 font-bold shadow-sm">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-violet-600 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-1.5 h-1.5 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span>Coach AI sedang merumuskan saran...</span>
                    </span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef}></div>
            </div>

            {/* Quick Prompts */}
            <div className="px-6 py-2.5 border-t border-slate-100 bg-white/40 flex gap-2 overflow-x-auto select-none shrink-0 scrollbar-none">
              <button 
                onClick={() => sendQuickPrompt("Berapa takaran minum yang pas saat long run?")}
                className="text-[9px] font-black text-slate-500 hover:text-violet-600 hover:bg-violet-50 bg-white border border-slate-200 px-3.5 py-2 rounded-full shrink-0 transition-all shadow-sm"
              >
                💧 Nutrisi & Minum Long Run
              </button>
              <button 
                onClick={() => sendQuickPrompt("Bagaimana cara meningkatkan VO2Max?")}
                className="text-[9px] font-black text-slate-500 hover:text-violet-600 hover:bg-violet-50 bg-white border border-slate-200 px-3.5 py-2 rounded-full shrink-0 transition-all shadow-sm"
              >
                📈 Tingkatkan VO2Max
              </button>
              <button 
                onClick={() => sendQuickPrompt("Bagaimana menu pencegahan cedera lutut?")}
                className="text-[9px] font-black text-slate-500 hover:text-violet-600 hover:bg-violet-50 bg-white border border-slate-200 px-3.5 py-2 rounded-full shrink-0 transition-all shadow-sm"
              >
                💪 Tips Cegah Cedera
              </button>
            </div>

            {/* Message form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white/60 backdrop-blur-xl shrink-0 flex gap-3 z-10 shadow-lg">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={geminiKey ? "Hubungi langsung Google Gemini..." : "Tanyakan rekomendasi lari kepada Coach AI..."}
                className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/10 font-semibold"
              />
              <button
                type="submit"
                className="px-5 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-violet-500/10 flex items-center justify-center shrink-0"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>

        </div>
      )}

      {/* VOICE COMMANDS TAB */}
      {activeSubTab === 'voice' && (
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center space-y-8 h-full text-center bg-white/20">
          
          <div className="space-y-2 max-w-md">
            <span className="text-[10px] text-violet-500 font-extrabold uppercase tracking-widest block font-sans">AI Voice Assistant Commands</span>
            <h3 className="text-xl font-black text-slate-800">Uji Perintah Suara Pintar</h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Tekan ikon mikrofon di bawah dan katakan perintah seperti <strong className="text-violet-600 font-extrabold">"Berapa VO2Max saya?"</strong> atau <strong className="text-violet-600 font-extrabold">"Tolong rekomendasi minum lari"</strong> dalam bahasa Indonesia. AI akan mendengar dan menjawab secara langsung!
            </p>
          </div>

          <div className="relative flex items-center justify-center">
            <div className={`absolute w-48 h-48 rounded-full border border-violet-300/40 ${isListening ? 'ring-pulse bg-violet-400/5' : ''}`}></div>
            
            <div className="w-36 h-36 rounded-full metallic-orb flex flex-col items-center justify-center text-white p-4 shadow-xl select-none z-10 transition-transform duration-500 hover:scale-105">
              <Sparkles className={`h-8 w-8 text-white ${isListening ? 'animate-spin' : 'animate-pulse'}`} style={{ animationDuration: isListening ? '3s' : '5s' }} />
              <span className="text-[10px] font-black uppercase tracking-wider mt-2">PacePilot</span>
              <span className="text-[8px] opacity-85 uppercase font-bold mt-0.5">{isListening ? "Listening..." : "Idle"}</span>
            </div>
          </div>

          <div className="w-full max-w-md glass-card rounded-2xl p-5 border border-slate-200/50 shadow-sm space-y-4">
            <div className="space-y-1">
              <span className="text-[8px] text-slate-400 block uppercase font-bold tracking-widest">Transcript Real-Time</span>
              <p className="text-sm font-extrabold text-slate-700 leading-snug">{voiceTranscript}</p>
            </div>

            {voiceReply && (
              <div className="bg-violet-50 p-4.5 rounded-xl border border-violet-100/50 text-left space-y-1 text-xs text-slate-600 font-semibold leading-relaxed relative">
                <span className="text-[8px] text-violet-500 font-extrabold uppercase tracking-widest block mb-1">AI Voice Response</span>
                <p>{voiceReply}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleListening}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-all shadow-lg ${
                isListening 
                  ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/10' 
                  : 'bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 shadow-violet-500/10'
              }`}
            >
              {isListening ? <Square className="h-5 w-5 fill-white" /> : <Mic className="h-5.5 w-5.5 fill-white" />}
            </button>

            {voiceReply && (
              <button
                onClick={() => {
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  setVoiceReply("");
                }}
                className="p-3 bg-white hover:bg-slate-100 text-slate-500 rounded-full border border-slate-200 shadow-sm transition-all"
              >
                <VolumeX className="h-5 w-5" />
              </button>
            )}
          </div>

        </div>
      )}

      {/* ANALYZER TAB & ITEM 8 QUICK TIPS */}
      {activeSubTab === 'analyzer' && (
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {/* --- ITEM 8: AI-POWERED 'QUICK TIPS' BASED ON RECENT INTENSITY LEVEL --- */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4.5 flex items-start gap-4 shadow-sm font-semibold">
            <div className="p-2.5 bg-amber-100 text-amber-600 border border-amber-200/20 rounded-xl shrink-0 mt-0.5 glow-pulse">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[8px] text-amber-600 font-extrabold uppercase tracking-widest block">AI Quick Tips (Personalized)</span>
              <h5 className="font-extrabold text-slate-800 text-xs">{quickTips.title}</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">{quickTips.desc}</p>
            </div>
          </div>

          {latestRun ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 space-y-6">
                
                {/* Telemetry card */}
                <div className="glass-card rounded-2xl p-5 shadow-sm border border-slate-200/50 space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[8px] bg-violet-100 text-violet-700 border border-violet-200/20 px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                      LATEST RUN DETECTED
                    </span>
                    <h4 className="font-black text-slate-800 text-sm mt-2">{latestRun.name}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Analisis instan file lari GPS Anda</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-bold">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-150/40">
                      <span className="text-[8px] text-slate-400 block uppercase">Jarak</span>
                      <strong className="text-xs font-black text-slate-700">{latestRun.distance.toFixed(2)} km</strong>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-150/40">
                      <span className="text-[8px] text-slate-400 block uppercase">Pace</span>
                      <strong className="text-xs font-black text-violet-600">{latestRun.avgPace} /km</strong>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-150/40">
                      <span className="text-[8px] text-slate-400 block uppercase">Detak Jantung</span>
                      <strong className="text-xs font-black text-red-500">{latestRun.avgHr} BPM</strong>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-150/40">
                      <span className="text-[8px] text-slate-400 block uppercase">VO2Max</span>
                      <strong className="text-xs font-black text-amber-500">+{latestRun.vo2Max}</strong>
                    </div>
                  </div>
                </div>

                {/* Heart Rate Zones */}
                <div className="glass-card rounded-2xl p-5 shadow-sm border border-slate-200/50 space-y-4">
                  <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-1.5">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>Distribusi Zona Detak Jantung</span>
                  </h4>

                  <div className="space-y-3.5 text-xs font-semibold text-slate-600">
                    <div>
                      <div className="flex justify-between font-bold mb-1 text-[11px]">
                        <span className="text-red-500 font-extrabold">Zone 5 - Anaerobic / VO2Max (&gt;172 BPM)</span>
                        <span className="text-slate-400">{formatMinSec(hrZones.z5)}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
                        <div className="bg-red-500 h-full" style={{ width: '4%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold mb-1 text-[11px]">
                        <span className="text-orange-500 font-extrabold">Zone 4 - Threshold (156 - 172 BPM)</span>
                        <span className="text-slate-400">{formatMinSec(hrZones.z4)}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
                        <div className="bg-orange-500 h-full" style={{ width: '15%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold mb-1 text-[11px]">
                        <span className="text-amber-500 font-extrabold">Zone 3 - Tempo (141 - 155 BPM)</span>
                        <span className="text-slate-400">{formatMinSec(hrZones.z3)}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
                        <div className="bg-amber-500 h-full" style={{ width: '25%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold mb-1 text-[11px]">
                        <span className="text-emerald-500 font-extrabold">Zone 2 - Aerobic (125 - 140 BPM)</span>
                        <span className="text-slate-400">{formatMinSec(hrZones.z2)}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
                        <div className="bg-emerald-500 h-full" style={{ width: '50%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold mb-1 text-[11px]">
                        <span className="text-indigo-400 font-extrabold">Zone 1 - Active Recovery (&lt;125 BPM)</span>
                        <span className="text-slate-400">{formatMinSec(hrZones.z1)}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
                        <div className="bg-indigo-400 h-full" style={{ width: '6%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* AI Diagnostic finding details */}
              <div className="glass-card rounded-2xl p-5 shadow-sm border border-slate-200/50 space-y-4 text-xs font-semibold text-slate-600">
                <div className="border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5 text-violet-500 animate-spin" style={{ animationDuration: '6s' }} />
                  <h4 className="font-extrabold text-[10px] text-slate-700 uppercase tracking-widest">Diagnosis Coach AI</h4>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150/60">
                    <span className="font-black text-emerald-600 block mb-1">✔️ KELEBIHAN:</span>
                    <p className="text-slate-500 leading-relaxed text-[11px] font-semibold">
                      Kontrol pacing lari luar biasa stabil! Distribusi denyut jantung dominan berada di Zona 2 ({Math.round(hrZones.z2/60)} menit), menandakan fondasi aerobik seluler Anda semakin kokoh dan efisien membakar asam lemak.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150/60">
                    <span className="font-black text-orange-500 block mb-1">⚠️ EVALUASI TEKNIS:</span>
                    <p className="text-slate-500 leading-relaxed text-[11px] font-semibold">
                      Terdeteksi lonjakan denyut jantung yang tinggi di kilometer terakhir. Usahakan untuk menjaga cadence tetap stabil di kisaran 170-180 SPM agar tidak mengalami over-fatigue.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150/60 space-y-1.5">
                    <span className="font-black text-violet-600 block">📊 SINKRONISASI VO2MAX:</span>
                    <div className="flex items-center justify-between border-y border-slate-200 py-1.5 text-[11px] text-slate-600 font-bold">
                      <span>VO2Max Terdeteksi:</span>
                      <span className="text-slate-800 font-extrabold">{latestRun.vo2Max} ml/kg/min</span>
                    </div>
                    <p className="text-slate-400 text-[10px] leading-relaxed font-semibold">
                      Sistem kami secara otomatis mendeteksi kenaikan kebugaran Anda dari file GPS ini, lalu segera memperbarui profil Anda tanpa ribet pencatatan manual.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm border border-slate-200/50">
              <FileText className="h-12 w-12 text-slate-300 mx-auto" />
              <div>
                <h4 className="font-extrabold text-slate-700 text-sm">Belum ada file olahraga terunggah</h4>
                <p className="text-xs text-slate-400 leading-normal mt-1.5 font-semibold">
                  Unggah file lari Anda (.gpx/.tcx) melalui menu rencana lari di tab "Rencana Lari" agar AI dapat langsung menyajikan analisis sebaran detak jantung, kelemahan, dan performa Anda di sini.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* NUTRITION & WARM-UP ROUTINES (Item 18) */}
      {activeSubTab === 'nutrition' && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 font-semibold">
          
          {/* --- ITEM 18: AI-POWERED 5-MINUTE DYNAMIC PRE-RUN WARMUP ROUTINE CARD --- */}
          <div className="glass-card rounded-2xl p-5 border border-slate-200/50 shadow-sm space-y-4">
            <h4 className="font-black text-xs text-violet-600 flex items-center gap-1.5 border-b border-slate-100 pb-3 uppercase tracking-wider">
              <Dumbbell className="h-5 w-5 text-violet-500" />
              <span>3. AI-Powered 5-Minute Pre-Run Warmup Routine (Aktivasi Otot)</span>
            </h4>
            <p className="text-xs text-slate-500 mt-1 font-semibold leading-relaxed">
              Berdasarkan tingkat lari terakhir Anda, asisten AI kami menyusun rangkaian pemanasan dinamis 5 menit berikut sebelum melangkahkan kaki Anda ke luar ruangan:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {warmUpRoutine.map((w, idx) => (
                <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-150/60 flex flex-col justify-between group hover:border-violet-300 transition-all font-semibold text-xs shadow-sm">
                  <div>
                    <span className="text-[8px] text-slate-400 block uppercase font-bold">Langkah {idx + 1}</span>
                    <strong className="text-slate-800 text-[11px] block mt-1">{w.name}</strong>
                  </div>
                  <span className="text-[10px] text-violet-600 font-extrabold block mt-2.5">⏳ Durasi: {w.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed font-semibold text-slate-600">
            
            {/* Hydration */}
            <div className="glass-card rounded-2xl p-5 shadow-sm border border-slate-200/50 space-y-4">
              <h4 className="font-black text-xs text-violet-600 flex items-center gap-1.5 border-b border-slate-100 pb-3 uppercase tracking-wider">
                <Droplet className="h-4.5 w-4.5" />
                <span>1. Strategi Hidrasi (Aturan Cairan)</span>
              </h4>

              <div className="space-y-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150/60">
                  <strong className="text-slate-700 font-bold block mb-1">Sebelum Lari (Pre-Hydration):</strong>
                  <p className="text-slate-500 text-[11px]">Minum 500-600ml cairan elektrolit 2 jam sebelum latihan agar sel tubuh sepenuhnya terhidrasi sebelum suhu badan memanas.</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150/60">
                  <strong className="text-slate-700 font-bold block mb-1">Saat Lari Berlangsung (During Run):</strong>
                  <p className="text-slate-500 text-[11px]">Minum 150ml hingga 200ml cairan setiap 15-20 menit lari. Gunakan minuman olahraga ber-elektrolit (Isotonic) untuk menggantikan garam natrium yang hilang lewat keringat.</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150/60">
                  <strong className="text-slate-700 font-bold block mb-1">Setelah Lari Selesai (Post-Hydration):</strong>
                  <p className="text-slate-500 text-[11px]">Ganti setiap 1 kg berat badan yang menyusut pasca-lari dengan meminum 1-1.2 liter air elektrolit/air mineral dingin dalam waktu 2 jam pertama.</p>
                </div>
              </div>
            </div>

            {/* Nutrition */}
            <div className="glass-card rounded-2xl p-5 shadow-sm border border-slate-200/50 space-y-4">
              <h4 className="font-black text-xs text-amber-600 flex items-center gap-1.5 border-b border-slate-100 pb-3 uppercase tracking-wider">
                <Apple className="h-4.5 w-4.5" />
                <span>2. Strategi Energi (Carbo-Loading)</span>
              </h4>

              <div className="space-y-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150/60">
                  <strong className="text-slate-700 font-bold block mb-1">Asupan Glikogen Saat Lari (30-60g Carbs):</strong>
                  <p className="text-slate-500 text-[11px]">Setiap 45 menit lari, tubuh membutuhkan sekitar 30 hingga 60 gram karbohidrat sederhana. Setara dengan:</p>
                  <ul className="list-disc list-inside mt-2 text-violet-600 space-y-0.5 font-bold">
                    <li>1.5 bungkus Energy Gel komersial</li>
                    <li>1 buah pisang ambon berukuran sedang</li>
                    <li>4-5 butir buah kurma manis</li>
                  </ul>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150/60">
                  <strong className="text-slate-700 font-bold block mb-1">Waktu Pengonsumsian Glikogen:</strong>
                  <p className="text-slate-500 text-[11px]">Jangan menunggu sampai lapar atau lemas (bonking). Konsumsilah asupan energi pertama Anda tepat di menit ke-40 atau ke-45 lari Anda.</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150/60">
                  <strong className="text-slate-700 font-bold block mb-1">Prinsip Recovery Otot:</strong>
                  <p className="text-slate-500 text-[11px]">Gunakan rasio 3:1 antara karbohidrat dan protein dalam jendela makan 45 menit pertama setelah lari (misal: susu cokelat ditambah pisang).</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState } from 'react';
import { 
  Zap, 
  Sparkles, 
  HelpCircle, 
  Check, 
  Smile, 
  Rocket, 
  Award,
  ChevronRight,
  User,
  Mail,
  Lock,
  Info
} from 'lucide-react';

export default function AuthModal({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: 'Rio Pratama', email: 'rio@run.com', password: 'password123' });
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [detectedLevel, setDetectedLevel] = useState(null);
  const [loginError, setLoginError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    if (isLogin) {
      const emailLower = formData.email.toLowerCase();
      
      // Default demo account
      if (emailLower === 'rio@run.com') {
        const defaultUser = {
          name: "Rio Pratama",
          email: "rio@run.com",
          level: 'intermediate',
          role: 'member',
          currentPace: "5:15",
          weightKg: 70,
          heightCm: 175,
          registeredAt: "2026-06-01",
          activeProgramId: '10k',
          currentWeek: 3,
          vo2maxHistory: [
            { date: "2026-06-05", value: 45.2 },
            { date: "2026-06-12", value: 45.8 },
            { date: "2026-06-19", value: 46.5 },
            { date: "2026-06-26", value: 47.1 },
            { date: "2026-07-03", value: 47.9 },
            { date: "2026-07-10", value: 48.4 },
            { date: "2026-07-17", value: 49.2 },
          ],
          shoes: [
            { id: "shoe_1", brand: "Nike", model: "Pegasus 41", mileage: 284.5, limit: 500, active: true },
            { id: "shoe_2", brand: "Adidas", model: "Adizero Boston 12", mileage: 92.1, limit: 600, active: false }
          ]
        };
        onLoginSuccess(defaultUser);
        return;
      }

      // Check if custom registered account exists in administrative members list
      const membersStr = localStorage.getItem('admin_members');
      if (membersStr) {
        const members = JSON.parse(membersStr);
        const matched = members.find(m => m.email.toLowerCase() === emailLower);
        if (matched) {
          const matchedUser = {
            name: matched.name,
            email: matched.email,
            level: matched.level,
            role: emailLower === 'admin@run.com' ? 'admin' : 'member',
            currentPace: matched.level === 'pro' ? "4:15" : (matched.level === 'intermediate' ? "5:30" : "7:00"),
            weightKg: 70,
            heightCm: 175,
            registeredAt: new Date().toISOString().split('T')[0],
            activeProgramId: null,
            currentWeek: 1,
            vo2maxHistory: [], // Custom registered starts completely blank/0!
            shoes: []
          };
          onLoginSuccess(matchedUser);
          return;
        }
      }

      setLoginError('Alamat email belum terdaftar. Silakan daftar baru!');
    } else {
      // Registration flow -> Open Diagnostic popup (Req 7)
      setShowDiagnostic(true);
    }
  };

  const DIAGNOSTIC_QUESTIONS = [
    {
      id: 1,
      title: "Berapa kali Anda berlatih lari dalam seminggu saat ini?",
      options: [
        { label: "Jarang, 0 hingga 1 kali seminggu", score: "beginner" },
        { label: "Sedang, rutin 2 hingga 3 kali seminggu", score: "intermediate" },
        { label: "Sering, 4 kali atau lebih seminggu", score: "pro" }
      ]
    },
    {
      id: 2,
      title: "Berapa lama durasi lari nonstop terlama Anda tanpa berjalan kaki?",
      options: [
        { label: "Kurang dari 15 menit", score: "beginner" },
        { label: "15 hingga 40 menit nonstop", score: "intermediate" },
        { label: "Lebih dari 40 menit nonstop", score: "pro" }
      ]
    },
    {
      id: 3,
      title: "Apa target terbesar yang ingin Anda capai di PacePilot?",
      options: [
        { label: "Memulai hidup sehat & lari kecil tanpa cidera", score: "beginner" },
        { label: "Menyelesaikan event lari 10K / Half-Marathon", score: "intermediate" },
        { label: "Memecahkan Personal Best (rekor waktu lari tercepat)", score: "pro" }
      ]
    }
  ];

  const handleAnswerSelect = (score) => {
    const updatedAnswers = [...answers, score];
    setAnswers(updatedAnswers);

    if (currentQuestion < DIAGNOSTIC_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Diagnostic complete -> Calculate level composition (Req 8)
      const counts = { beginner: 0, intermediate: 0, pro: 0 };
      updatedAnswers.forEach(ans => {
        counts[ans] = (counts[ans] || 0) + 1;
      });

      let finalLevel = 'intermediate';
      if (counts.beginner >= 2) finalLevel = 'beginner';
      else if (counts.pro >= 2) finalLevel = 'pro';

      setDetectedLevel(finalLevel);

      // Create new user with calculated level and 0/empty VO2Max history
      const newUser = {
        name: formData.name,
        email: formData.email.toLowerCase(),
        level: finalLevel,
        role: formData.email.toLowerCase().includes('admin') ? 'admin' : 'member',
        currentPace: finalLevel === 'pro' ? "4:15" : (finalLevel === 'intermediate' ? "5:30" : "7:00"),
        weightKg: 70,
        heightCm: 175,
        registeredAt: new Date().toISOString().split('T')[0],
        activeProgramId: null,
        currentWeek: 1,
        vo2maxHistory: [], // STARTS COMPLETELY EMPTY (Calculated on first GPX upload!)
        shoes: [] 
      };

      // Register into admin members list
      const membersStr = localStorage.getItem('admin_members');
      let currentMembers = [];
      if (membersStr) {
        currentMembers = JSON.parse(membersStr);
      } else {
        currentMembers = [
          { id: 'm1', name: 'Naufal Hakim', level: 'pro', vo2max: 58.4, email: 'naufal@run.com', activeProgram: '21k' },
          { id: 'm2', name: 'Adinda Lestari', level: 'beginner', vo2max: 38.2, email: 'adinda@run.com', activeProgram: '5k' },
          { id: 'm3', name: 'Rio Pratama', level: 'intermediate', vo2max: 48.0, email: 'rio@run.com', activeProgram: '10k' }
        ];
      }

      // Add newly registered user to directory with 0 VO2Max
      const memberObj = {
        id: 'member_' + Date.now(),
        name: newUser.name,
        level: newUser.level,
        vo2max: 0.0, // starts completely clean!
        email: newUser.email,
        activeProgram: 'N/A'
      };

      const updatedMembers = currentMembers.filter(m => m.email.toLowerCase() !== newUser.email.toLowerCase());
      updatedMembers.push(memberObj);
      
      localStorage.setItem('admin_members', JSON.stringify(updatedMembers));
      localStorage.setItem('user_active', JSON.stringify(newUser));
      
      // Clear data files
      const emailKey = newUser.email;
      localStorage.setItem(`runs_${emailKey}`, JSON.stringify([]));
      localStorage.setItem(`shoes_${emailKey}`, JSON.stringify([]));
      localStorage.setItem(`schedules_${emailKey}`, JSON.stringify([]));
    }
  };

  const handleDiagnosticDone = () => {
    const savedUser = localStorage.getItem('user_active');
    if (savedUser) {
      onLoginSuccess(JSON.parse(savedUser));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-4 z-50 overflow-hidden select-none">
      
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full filter blur-3xl"></div>

      {/* Main card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 relative overflow-hidden shadow-2xl z-10 flex flex-col justify-between max-h-[92vh]">
        
        {/* DIAGNOSTIC POP-UP PROCESS */}
        {showDiagnostic ? (
          <div className="flex-1 flex flex-col justify-between py-2 text-xs">
            
            {!detectedLevel ? (
              // Questionnaire questions
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-white tracking-wide font-sans">PacePilot AI Diagnostic</h3>
                  <p className="text-[11px] text-slate-400 mt-1">Kami mendeteksi kebiasaan lari Anda untuk memberikan komposisi program latihan lari presisi.</p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <span>Progres Diagnostik</span>
                    <span>Pertanyaan {currentQuestion + 1} dari {DIAGNOSTIC_QUESTIONS.length}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="bg-rose-500 h-full transition-all duration-300" 
                      style={{ width: `${((currentQuestion + 1) / DIAGNOSTIC_QUESTIONS.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Question and Option choices */}
                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm text-slate-200 leading-snug">
                    {DIAGNOSTIC_QUESTIONS[currentQuestion].title}
                  </h4>
                  
                  <div className="space-y-2.5">
                    {DIAGNOSTIC_QUESTIONS[currentQuestion].options.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAnswerSelect(opt.score)}
                        className="w-full text-left bg-slate-950/60 border border-slate-800 hover:border-rose-500/40 hover:bg-rose-500/[0.01] p-3.5 rounded-xl transition-all font-semibold text-slate-300 hover:text-slate-100 flex items-center justify-between group"
                      >
                        <span>{opt.label}</span>
                        <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-rose-500 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Results Presentation Page
              <div className="space-y-6 text-center">
                <div className="w-16 h-12 flex items-center justify-center mx-auto">
                  {detectedLevel === 'pro' && <Award className="h-14 w-14 text-amber-400 animate-bounce" />}
                  {detectedLevel === 'intermediate' && <Rocket className="h-12 w-12 text-rose-500 animate-bounce" />}
                  {detectedLevel === 'beginner' && <Smile className="h-12 w-12 text-emerald-400 animate-bounce" />}
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded font-extrabold uppercase tracking-wider">
                    DIAGNOSTIK SELESAI ✔️
                  </span>
                  <h3 className="text-lg font-extrabold text-white tracking-wide mt-2">Kompetensi Terdeteksi: <span className="text-rose-500 uppercase">{detectedLevel}</span></h3>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed font-medium">
                    Selamat bergabung! Berdasarkan analisis kami, tingkat lari Anda diplot pada level <strong className="text-rose-400 uppercase">{detectedLevel}</strong>.
                  </p>
                </div>

                {/* Compositions Affirmation */}
                <div className="bg-slate-950/60 border border-slate-800/80 p-4.5 rounded-xl text-left space-y-2 max-w-sm mx-auto">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-2">
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="font-bold text-[10px] text-slate-300 uppercase tracking-wider">KOMPOSISI SESI DIATUR ({detectedLevel.toUpperCase()})</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                    Sesuai instruksi kesehatan atlet, <strong className="text-white">SEMUA SESI LATIHAN LARI & KEKUATAN BEBAN</strong> pada platform PacePilot akan dikonfigurasi mengikuti komposisi dan kapasitas level <strong className="text-rose-400 uppercase">{detectedLevel}</strong> Anda.
                  </p>
                </div>

                <button
                  onClick={handleDiagnosticDone}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-rose-600/10 uppercase tracking-wider"
                >
                  Masuk Ke Dashboard Anda
                </button>
              </div>
            )}

          </div>
        ) : (
          
          // REGULAR AUTHENTICATION (LOGIN & REGISTER SCREEN)
          <div className="space-y-6 text-xs font-semibold">
            {/* Logo */}
            <div className="text-center space-y-1.5">
              <div className="inline-flex bg-gradient-to-br from-rose-500 to-amber-500 p-2.5 rounded-xl shadow-lg shadow-rose-500/10 mb-2">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-white font-sans">
                Pace<span className="text-rose-500">Pilot</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">Premium AI Running Engine, Analytics & Training Plans</p>
            </div>

            {/* Error messaging */}
            {loginError && (
              <div className="bg-red-500/10 border border-red-500/25 p-3 rounded-lg text-red-400 font-bold flex items-center gap-2">
                <Info className="h-4 w-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Auth selection */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-1 rounded-lg border border-slate-850">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`py-1.5 rounded-md text-xs font-bold uppercase transition-all ${isLogin ? 'bg-slate-800 text-white shadow' : 'text-slate-500'}`}
              >
                Masuk Akun
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`py-1.5 rounded-md text-xs font-bold uppercase transition-all ${!isLogin ? 'bg-slate-800 text-white shadow' : 'text-slate-500'}`}
              >
                Daftar Baru
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Nama Lengkap</label>
                  <div className="relative">
                    <User className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
                    <input 
                      type="text" 
                      required
                      placeholder="Rio Pratama"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500 w-full"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Alamat Email</label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
                  <input 
                    type="email" 
                    required
                    placeholder="rio@run.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500 w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500 w-full"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all mt-6 shadow-lg shadow-rose-600/10"
              >
                {isLogin ? 'Masuk Sesi Olahraga' : 'Registrasi & Mulai Diagnostik'}
              </button>
            </form>

            {/* Quick Helper */}
            <div className="text-[10px] text-slate-500 text-center flex flex-col items-center justify-center gap-1.5 mt-4 bg-slate-950/40 p-3 rounded-xl border border-slate-850">
              <div className="flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Petunjuk Akun Demo:</span>
              </div>
              <p className="text-[9px] text-slate-400 leading-relaxed">
                Gunakan email <strong className="text-rose-400">rio@run.com</strong> & password apa saja untuk masuk langsung sebagai atlet intermediate demo ber-data lengkap, atau tulis email kustom untuk daftar akun bersih ber-diagnostik.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

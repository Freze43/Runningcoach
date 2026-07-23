// Mock Seed Data with Dynamic Sports-Science Formulas for PacePilot

export const INITIAL_USER = {
  name: "Rio Pratama",
  email: "rio@run.com",
  level: "intermediate", 
  role: "member", 
  currentPace: "5:15", 
  weightKg: 70,
  heightCm: 175,
  registeredAt: "2026-06-01",
  activeProgramId: "10k", 
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

// Program Specifications with structured targets arranged per level
export const PROGRAMS = {
  "5k": {
    id: "5k",
    name: "5K Speed Rocket",
    description: "Kembangkan kecepatan lari 5K Anda atau selesaikan lari 5 km nonstop pertama Anda.",
    durationWeeks: 4,
    sessionsPerWeek: 4, 
    color: "from-teal-500 to-emerald-500",
    targets: {
      beginner: { single: "5 KM nonstop", weekly: "12 - 15 KM", intensity: "Zona 2 Lari/Jalan" },
      intermediate: { single: "5 KM fast finish", weekly: "22 - 28 KM", intensity: "Sub-25 Mins Target" },
      pro: { single: "5 KM elite tempo", weekly: "40 - 45 KM", intensity: "Sub-20 Mins Target" }
    }
  },
  "10k": {
    id: "10k",
    name: "10K Threshold Crusher",
    description: "Kuasai kekuatan ambang batas laktat Anda dan raih catatan waktu terbaik 10 km.",
    durationWeeks: 8,
    sessionsPerWeek: 4, 
    color: "from-blue-500 to-indigo-500",
    targets: {
      beginner: { single: "10 KM safely finish", weekly: "18 - 22 KM", intensity: "Rasio Lari-Jalan Aman" },
      intermediate: { single: "10 KM progressive", weekly: "35 - 40 KM", intensity: "Sub-55 Mins Target" },
      pro: { single: "10 KM threshold", weekly: "55 - 60 KM", intensity: "Sub-45 Mins Target" }
    }
  },
  "21k": {
    id: "21k",
    name: "Half-Marathon Aerobic Engine",
    description: "Membangun stamina dalam jangkauan aerobik panjang untuk menaklukkan rute 21 km.",
    durationWeeks: 12,
    sessionsPerWeek: 5, 
    color: "from-violet-500 to-purple-500",
    targets: {
      beginner: { single: "21.1 KM safely finish", weekly: "28 - 35 KM", intensity: "Fokus Aerobik Dasar" },
      intermediate: { single: "21.1 KM race-pace", weekly: "45 - 50 KM", intensity: "Sub-2 Hours Target" },
      pro: { single: "21.1 KM elite speed", weekly: "65 - 75 KM", intensity: "Sub-90 Mins Target" }
    }
  },
  "42k": {
    id: "42k",
    name: "Marathon Elite Blueprint",
    description: "Puncak tantangan lari jalan raya. Panduan latihan volume tinggi hingga tapering 42 km.",
    durationWeeks: 16,
    sessionsPerWeek: 6, 
    color: "from-rose-500 to-pink-500",
    targets: {
      beginner: { single: "42.195 KM safely finish", weekly: "42 - 50 KM", intensity: "Proteksi Cedera Sendi" },
      intermediate: { single: "42.195 KM race-pace", weekly: "60 - 75 KM", intensity: "Sub-4 Hours Target" },
      pro: { single: "42.195 KM sub-3 goal", weekly: "85 - 110 KM", intensity: "Sub-3 Hours Target" }
    }
  }
};

// Generates weekly schedules dynamically based on program and runner level
export function getScheduleForProgram(programId, level, activeWeek = 1) {
  const baseWorkouts = {
    beginner: {
      warmup: "Pemanasan: 10 menit jalan cepat & dynamic stretching",
      cooldown: "Pendinginan: 10 menit jalan santai & static stretching",
      runs: [
        {
          type: "Easy Run",
          title: "Easy Conversational Run",
          desc: "Lari santai di Zona 2. Kamu harus bisa berbicara dengan kalimat lengkap tanpa terengah-engah.",
          metrics: { distance: 3.5, pace: "6:45 - 7:15 min/km", duration: "25 mins" },
          composition: "Lari santai terus-menerus dengan target detak jantung rendah (Zone 2) untuk membangun daya tahan kardio dasar."
        },
        {
          type: "Intervals",
          title: "Introductory Pace Intervals",
          desc: "Pengenalan lari cepat bergantian dengan jalan kaki untuk memulihkan detak jantung.",
          metrics: { distance: 4.0, pace: "5x 200m at fast pace, recovery walk 90s", duration: "30 mins" },
          composition: "Pemanasan 10 menit, diikuti 5 set interval cepat (200m) dan jalan kaki lambat (90 detik) untuk mengembalikan kestabilan napas, lalu pendinginan 10 menit."
        },
        {
          type: "Long Run",
          title: "Endurance Foundation Long Run",
          desc: "Sesi lari terpanjang minggu ini untuk memperkuat otot, sendi, dan kapasitas paru-paru.",
          metrics: { distance: 5.0, pace: "7:00 min/km", duration: "35 mins" },
          composition: "Lari santai dengan rute datar. Diperbolehkan selingan jalan kaki 1 menit setiap lari 9 menit jika terasa terlalu lelah."
        }
      ],
      strength: {
        type: "Strength",
        title: "Kekuatan Sendi & Pencegahan Cedera (Beginner)",
        desc: "Sesi beban berat tubuh (bodyweight) untuk memperkuat core, glutes, dan betis.",
        metrics: { duration: "20 mins", intensity: "Low" },
        composition: "3 set: 10x Bodyweight Squats, 10x Glute Bridges, 15s Plank, 12x Calf Raises. Lakukan minimal 1x seminggu untuk proteksi lutut.",
        videoTitle: "Strength Training for Beginner Runners - 15 Min Workout for Injury Prevention",
        searchQuery: "Strength Training for Beginner Runners Injury Prevention"
      }
    },
    intermediate: {
      warmup: "Pemanasan: 12 menit lari kecil (jogging) & dynamic stretching",
      cooldown: "Pendinginan: 10 menit jogging sangat santai & foam rolling",
      runs: [
        {
          type: "Easy Run",
          title: "Zone 2 Base Building",
          desc: "Lari aerobik murni. Memperbanyak pembakaran lemak dan meningkatkan densitas kapiler darah.",
          metrics: { distance: 6.0, pace: "5:30 - 5:50 min/km", duration: "35 mins" },
          composition: "Lari konsisten di Zona 2. Pertahankan cadence di kisaran 170-180 SPM."
        },
        {
          type: "Intervals",
          title: "Aerobic Capacity Intervals",
          desc: "Interval dengan intensitas tinggi (Zone 4) untuk menaikkan kapasitas VO2Max.",
          metrics: { distance: 8.0, pace: "5x 400m at 5k pace, recovery jog 60s", duration: "45 mins" },
          composition: "Pemanasan 12 menit, 5x 400m pada target pace lari 5k kamu (kisaran 4:45 min/km), diselingi joging perlahan selama 60 detik sebagai pemulihan aktif. Pendinginan 10 menit."
        },
        {
          type: "Long Run",
          title: "Aerobic Stamina Long Run",
          desc: "Lari jarak jauh terstruktur untuk melatih efisiensi energi dan ketahanan mental.",
          metrics: { distance: 10.0, pace: "5:50 min/km", duration: "60 mins" },
          composition: "Lari santai konstan dengan peningkatan pace (progressive) di 2 kilometer terakhir mendekati pace balapan."
        }
      ],
      strength: {
        type: "Strength",
        title: "Kekuatan Otot & Power Single-Leg (Intermediate)",
        desc: "Latihan penguatan otot menggunakan resistance band atau dumbbell ringan untuk stabilitas pinggul.",
        metrics: { duration: "30 mins", intensity: "Medium" },
        composition: "3 set: 12x Goblet Squats (8kg), 10x Single-Leg Romanian Deadlifts, 30s Side Planks, 12x Single-Leg Calf Raises.",
        videoTitle: "Intermediate Runner Strength & Conditioning Session - Resistance Workout",
        searchQuery: "Intermediate Runner Strength Conditioning Session Workout"
      }
    },
    pro: {
      warmup: "Pemanasan: 15 menit lari aerobik progresif, dynamic stretching & strides",
      cooldown: "Pendinginan: 12 menit joging super lambat & active isolated stretching",
      runs: [
        {
          type: "Easy Run",
          title: "Recovery & Aerobic Maintenance",
          desc: "Lari pemulihan setelah sesi berat kemarin, menjaga aliran darah tetap lancar ke otot.",
          metrics: { distance: 10.0, pace: "4:45 - 5:05 min/km", duration: "50 mins" },
          composition: "Lari santai terkontrol penuh. Rasakan ketegangan otot memudar seiring lari."
        },
        {
          type: "Intervals",
          title: "Vo2Max Threshold Intervals",
          desc: "Interval keras di batas ambang laktat untuk melatih tubuh menoleransi asam laktat tinggi.",
          metrics: { distance: 12.0, pace: "5x 800m at 3k pace, recovery jog 90s", duration: "60 mins" },
          composition: "Pemanasan 15 menit. 5 set interval 800 meter pada target pace di atas VO2Max (kisaran 4:10 min/km). Pemulihan berupa joging pelan 90 detik (bukan jalan kaki). Pendinginan 10 menit."
        },
        {
          type: "Long Run",
          title: "Fast-Finished Aerobic Long Run",
          desc: "Sesi lari panjang dengan target penutupan kecepatan tinggi guna mensimulasikan akhir balapan.",
          metrics: { distance: 16.0, pace: "5:10 min/km, last 3k at 4:30 min/km", duration: "85 mins" },
          composition: "Lari aerobik konstan selama 13 kilometer pertama, lalu segera tekan gas di 3 kilometer terakhir pada target pace kompetisi."
        }
      ],
      strength: {
        type: "Strength",
        title: "Power Elite & Plyometrics (Pro)",
        desc: "Latihan plyometrics dan beban berat untuk meningkatkan running economy dan power ledakan kaki.",
        metrics: { duration: "40 mins", intensity: "High" },
        composition: "4 set: 10x Heavy Barbell Squats, 8x Weighted Step-Ups, 12x Jump Squats, 10x Single-Leg Box Jumps. Fokus pada kontraksi eksplosif.",
        videoTitle: "Elite Runners Strength Training Program - Heavy Lifting & Plyometrics",
        searchQuery: "Elite Runners Strength Training Program Heavy Lifting"
      }
    }
  };

  const levelWorkouts = baseWorkouts[level] || baseWorkouts.intermediate;
  const weekMultiplier = 1 + (activeWeek - 1) * 0.08;
  const sessions = [];
  
  // Session 1: Easy Run
  const s1Dist = parseFloat((levelWorkouts.runs[0].metrics.distance * getProgramMultiplier(programId) * weekMultiplier).toFixed(1));
  const s1Dur = Math.round(s1Dist * (level === 'pro' ? 4.9 : (level === 'intermediate' ? 5.6 : 7.0)));
  sessions.push({
    id: `session_${programId}_w${activeWeek}_s1`,
    day: "Senin",
    type: "Easy Run",
    title: levelWorkouts.runs[0].title,
    desc: levelWorkouts.runs[0].desc,
    warmup: levelWorkouts.warmup,
    cooldown: levelWorkouts.cooldown,
    composition: levelWorkouts.runs[0].composition,
    distanceKm: s1Dist,
    durationMin: s1Dur,
    paceRange: levelWorkouts.runs[0].metrics.pace,
    isCompleted: false,
    fileUploaded: null,
  });

  // Session 2: Strength Training
  sessions.push({
    id: `session_${programId}_w${activeWeek}_s2`,
    day: "Rabu",
    type: "Strength",
    title: levelWorkouts.strength.title,
    desc: levelWorkouts.strength.desc,
    warmup: "Pemanasan: 5 menit mobilisasi sendi panggul dan lutut",
    cooldown: "Pendinginan: 5 menit stretching seluruh tubuh",
    composition: levelWorkouts.strength.composition,
    distanceKm: 0,
    durationMin: parseInt(levelWorkouts.strength.metrics.duration),
    paceRange: "--",
    isCompleted: false,
    fileUploaded: null,
    videoTitle: levelWorkouts.strength.videoTitle,
    searchQuery: levelWorkouts.strength.searchQuery,
  });

  // Session 3: Intervals
  const s3Dist = parseFloat((levelWorkouts.runs[1].metrics.distance * getProgramMultiplier(programId) * weekMultiplier).toFixed(1));
  const s3Dur = Math.round(s3Dist * (level === 'pro' ? 5.1 : (level === 'intermediate' ? 5.8 : 7.2)));
  sessions.push({
    id: `session_${programId}_w${activeWeek}_s3`,
    day: "Kamis",
    type: "Intervals",
    title: levelWorkouts.runs[1].title,
    desc: levelWorkouts.runs[1].desc,
    warmup: levelWorkouts.warmup,
    cooldown: levelWorkouts.cooldown,
    composition: levelWorkouts.runs[1].composition,
    distanceKm: s3Dist,
    durationMin: s3Dur,
    paceRange: levelWorkouts.runs[1].metrics.pace,
    isCompleted: false,
    fileUploaded: null,
  });

  // Session 4: Long Run
  const s4Dist = parseFloat((levelWorkouts.runs[2].metrics.distance * getProgramMultiplier(programId) * weekMultiplier).toFixed(1));
  const s4Dur = Math.round(s4Dist * (level === 'pro' ? 5.0 : (level === 'intermediate' ? 5.8 : 7.0)));
  sessions.push({
    id: `session_${programId}_w${activeWeek}_s4`,
    day: "Sabtu",
    type: "Long Run",
    title: levelWorkouts.runs[2].title,
    desc: levelWorkouts.runs[2].desc,
    warmup: levelWorkouts.warmup,
    cooldown: levelWorkouts.cooldown,
    composition: levelWorkouts.runs[2].composition,
    distanceKm: s4Dist,
    durationMin: s4Dur,
    paceRange: levelWorkouts.runs[2].metrics.pace,
    isCompleted: false,
    fileUploaded: null,
  });

  return sessions;
}

function getProgramMultiplier(programId) {
  switch (programId) {
    case "5k": return 0.8;
    case "10k": return 1.2;
    case "21k": return 2.2;
    case "42k": return 4.0;
    default: return 1.0;
  }
}

// Activity Feed (Strava Style)
export const MOCK_ACTIVITIES = [
  {
    id: "act_1",
    userName: "Naufal Hakim",
    userLevel: "pro",
    userAvatar: "⚡",
    title: "🏃‍♂️ Kendal Harbour Tempo Blast",
    description: "Solid tempo run along the coastline! Feeling strong, pace felt effortless today. Prepping for the 21K next month. Shoes felt brand new!",
    distance: 12.4,
    duration: "0:52:15",
    avgPace: "4:12",
    avgHr: 161,
    elevationGain: 42,
    kudos: 18,
    hasKudosed: false,
    comments: [
      { id: "c1", userName: "Adinda Lestari", text: "Gila pacenya stabil banget kak! 🔥" },
      { id: "c2", userName: "Rio Pratama", text: "Inspirational! Sesi ambang laktat yang mantap." }
    ],
    date: "Hari ini, 06:15",
    photo: null,
    segmentName: "Kendal Seafront Sprint"
  },
  {
    id: "act_2",
    userName: "Adinda Lestari",
    userLevel: "beginner",
    userAvatar: "🌸",
    title: "✨ My First continuous 5K! Yay!",
    description: "Cannot believe I ran the entire 5K without walking! Huge milestone for me. Highly recommend the PacePilot beginner plan! 🥳",
    distance: 5.02,
    duration: "0:34:40",
    avgPace: "6:54",
    avgHr: 145,
    elevationGain: 12,
    kudos: 32,
    hasKudosed: true,
    comments: [
      { id: "c3", userName: "Rio Pratama", text: "Selamat Adinda! Milestone pertama yang luar biasa!" }
    ],
    date: "Kemarin, 17:30",
    photo: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=600&q=80",
    segmentName: "CFD Loop East"
  }
];

// Segments Leaderboard
export const SEGMENTS = [
  {
    id: "seg_1",
    name: "Kendal Seafront Sprint (1.2 km)",
    distance: 1.2,
    avgElevation: "0%",
    leaderboard: [
      { rank: 1, name: "Naufal Hakim", time: "4:02", date: "Jul 20, 2026", level: "pro" },
      { rank: 2, name: "Rio Pratama", time: "4:48", date: "Jul 18, 2026", level: "intermediate" },
      { rank: 3, name: "Budi Santoso", time: "5:15", date: "Jul 15, 2026", level: "intermediate" },
      { rank: 4, name: "Adinda Lestari", time: "6:24", date: "Jul 12, 2026", level: "beginner" }
    ]
  },
  {
    id: "seg_2",
    name: "Kendal Green Hills Climb (2.5 km)",
    distance: 2.5,
    avgElevation: "4.5%",
    leaderboard: [
      { rank: 1, name: "Naufal Hakim", time: "9:15", date: "Jul 19, 2026", level: "pro" },
      { rank: 2, name: "Rio Pratama", time: "11:32", date: "Jul 21, 2026", level: "intermediate" },
      { rank: 3, name: "Farhan Malik", time: "12:10", date: "Jul 14, 2026", level: "intermediate" }
    ]
  }
];

// Platform Clubs
export const CLUBS = [
  { id: "club_1", name: "Kendal Road Runners", members: 254, description: "Klub lari lokal Kendal, rutin CFD & Night Run.", joined: true },
  { id: "club_2", name: "Sub-4 Marathon Elite", members: 48, description: "Komunitas pelari marathon target sub-4 jam.", joined: false },
  { id: "club_3", name: "PacePilot AI Coach Lab", members: 1845, description: "The official tech and training discussions.", joined: true }
];

// Seeded runs for the demo account
export const SEEDED_RUNS = [
  {
    id: "run_seeded_1",
    name: "10K Base Building Run",
    date: "2026-07-20",
    distance: 8.2,
    duration: 2580, 
    avgPace: "5:14",
    avgHr: 148,
    maxHr: 168,
    calories: 580,
    elevationGain: 35,
    vo2Max: 48,
    programId: "10k",
    level: "intermediate"
  },
  {
    id: "run_seeded_2",
    name: "Speed Interval Session (6x400m)",
    date: "2026-07-16",
    distance: 6.5,
    duration: 1980, 
    avgPace: "5:04",
    avgHr: 156,
    maxHr: 178,
    calories: 450,
    elevationGain: 12,
    vo2Max: 49,
    programId: "10k",
    level: "intermediate"
  },
  {
    id: "run_seeded_3",
    name: "Easy Aerobic Run",
    date: "2026-07-13",
    distance: 6.0,
    duration: 2040, 
    avgPace: "5:40",
    avgHr: 139,
    maxHr: 151,
    calories: 410,
    elevationGain: 8,
    vo2Max: 48,
    programId: "10k",
    level: "intermediate"
  },
  {
    id: "run_seeded_4",
    name: "Endurance Sunday Long Run",
    date: "2026-07-09",
    distance: 12.0,
    duration: 4020, 
    avgPace: "5:35",
    avgHr: 145,
    maxHr: 165,
    calories: 840,
    elevationGain: 52,
    vo2Max: 47,
    programId: "10k",
    level: "intermediate"
  }
];

// Daily training metrics generator (CTL/ATL/TSB)
export function getProgressMetricsForUser(userEmail, userRuns, userLevel) {
  const emailKey = userEmail.toLowerCase();
  
  if (emailKey === 'rio@run.com') {
    return Array.from({ length: 30 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const dateString = date.toISOString().split('T')[0];
      
      const isWorkoutDay = i % 3 === 0;
      const baseCtl = 42 + (i * 0.4);
      const atl = isWorkoutDay ? baseCtl + 25 + Math.sin(i) * 5 : baseCtl - 10 + Math.sin(i) * 3;
      const ctl = baseCtl + Math.sin(i / 2) * 2;
      const tsb = Math.round(ctl - atl);

      return {
        date: dateString,
        CTL: Math.round(ctl),
        ATL: Math.round(atl),
        TSB: tsb,
        zone: tsb > 5 ? "Fresh" : (tsb < -10 ? "Injury Risk" : "Optimal Training")
      };
    });
  }

  const metrics = [];
  let currentCtl = 0;
  let currentAtl = 0;

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    let dayTss = 0;
    userRuns.forEach(run => {
      if (run.date === dateString) {
        dayTss += run.type === 'Strength' ? Math.round(run.duration / 60) : Math.round(run.distance * 6.5);
      }
    });

    const ctlFactor = Math.exp(-1 / 42);
    const atlFactor = Math.exp(-1 / 7);

    currentCtl = currentCtl * ctlFactor + dayTss * (1 - ctlFactor);
    currentAtl = currentAtl * atlFactor + dayTss * (1 - atlFactor);
    const tsb = currentCtl - currentAtl;

    metrics.push({
      date: dateString,
      CTL: Math.round(currentCtl),
      ATL: Math.round(currentAtl),
      TSB: Math.round(tsb),
      zone: tsb > 5 ? "Fresh" : (tsb < -10 ? "Injury Risk" : "Optimal Training")
    });
  }

  return metrics;
}

// Monthly training volume accumulator
export function getAnnualVolumeForUser(userEmail, userRuns) {
  const emailKey = userEmail.toLowerCase();
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  
  const seededVolume = [
    { month: "Jan", Lari: 60, Sepeda: 120, Beban: 8, TSS: 320 },
    { month: "Feb", Lari: 75, Sepeda: 140, Beban: 10, TSS: 380 },
    { month: "Mar", Lari: 80, Sepeda: 110, Beban: 12, TSS: 410 },
    { month: "Apr", Lari: 95, Sepeda: 90, Beban: 6, TSS: 350 },
    { month: "Mei", Lari: 110, Sepeda: 130, Beban: 8, TSS: 450 },
    { month: "Jun", Lari: 130, Sepeda: 180, Beban: 14, TSS: 560 },
    { month: "Jul", Lari: 155, Sepeda: 210, Beban: 16, TSS: 680 },
    { month: "Agu", Lari: 0, Sepeda: 0, Beban: 0, TSS: 0 },
    { month: "Sep", Lari: 0, Sepeda: 0, Beban: 0, TSS: 0 },
    { month: "Okt", Lari: 0, Sepeda: 0, Beban: 0, TSS: 0 },
    { month: "Nov", Lari: 0, Sepeda: 0, Beban: 0, TSS: 0 },
    { month: "Des", Lari: 0, Sepeda: 0, Beban: 0, TSS: 0 },
  ];

  return months.map((m, idx) => {
    let lari = 0;
    let sepeda = 0;
    let beban = 0;
    let tss = 0;

    if (emailKey === 'rio@run.com') {
      const match = seededVolume[idx];
      if (match) {
        lari = match.Lari;
        sepeda = match.Sepeda;
        beban = match.Beban;
        tss = match.TSS;
      }
    }

    userRuns.forEach(run => {
      const runDate = new Date(run.date);
      if (runDate.getFullYear() === 2026 && runDate.getMonth() === idx) {
        if (run.type === 'Strength') {
          beban += run.duration / 3600; 
          tss += Math.round((run.duration / 3600) * 12);
        } else {
          lari += run.distance;
          tss += Math.round(run.distance * 6.5);
        }
      }
    });

    return {
      month: m,
      Lari: parseFloat(lari.toFixed(1)),
      Sepeda: sepeda,
      Beban: parseFloat(beban.toFixed(1)),
      TSS: Math.round(tss)
    };
  });
}

// Sleep Tracker details
export const SLEEP_DATA = Array.from({ length: 7 }).map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (6 - i));
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return {
    day: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
    hours: parseFloat((6.5 + Math.sin(i) * 1 + Math.cos(i/2) * 0.5).toFixed(1)),
    deepSleep: parseFloat((1.5 + Math.sin(i) * 0.3 + 0.2).toFixed(1))
  };
});

// Daily Heart Rate Details
export const HEART_RATE_HOURLY = [
  { hour: "00:00", bpm: 52 },
  { hour: "02:00", bpm: 50 },
  { hour: "04:00", bpm: 48 },
  { hour: "06:00", bpm: 110 }, 
  { hour: "08:00", bpm: 72 },
  { hour: "10:00", bpm: 68 },
  { hour: "12:00", bpm: 65 },
  { hour: "14:00", bpm: 70 },
  { hour: "16:00", bpm: 74 },
  { hour: "18:00", bpm: 64 },
  { hour: "20:00", bpm: 58 },
  { hour: "22:00", bpm: 55 }
];

// --- COMMUNITY CHALLENGES (Item 16) ---
export const COMMUNITY_CHALLENGES = [
  { id: "ch_1", name: "Juli Aerobic Mileage", target: "80 KM", progress: 62, participants: 1845, joined: true },
  { id: "ch_2", name: "Lari Beruntun 5 Hari", target: "Streak 5 Hari", progress: 3, participants: 524, joined: false },
  { id: "ch_3", name: "Climb Master Kendal Hills", target: "500m Elevation", progress: 12, participants: 320, joined: false }
];

// --- ACHIEVEMENT BADGES (Item 20) ---
export const ACHIEVEMENT_BADGES = [
  { id: "ach_1", title: "Milestone Pertama", desc: "Menyelesaikan lari pertama", icon: "🥇", unlocked: true },
  { id: "ach_2", title: "Consistency King", desc: "Berlari 3 hari berturut-turut", icon: "🔥", unlocked: true },
  { id: "ach_3", title: "Lari Jauh Mandiri", desc: "Menempuh jarak di atas 10KM", icon: "🌐", unlocked: false },
  { id: "ach_4", title: "Master VO2Max", desc: "Mencapai angka VO2Max di atas 50", icon: "⚡", unlocked: false }
];

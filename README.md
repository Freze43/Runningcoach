# ⚡ PacePilot - Premium AI Running Engine & Coach Platform

PacePilot adalah sebuah aplikasi *full-stack web prototype* super premium yang dirancang khusus untuk pelari dari berbagai tingkatan (**Beginner, Intermediate, Pro**). Aplikasi ini memadukan kekuatan **analisis data GPS (file GPX/TCX)**, **pendeteksian level otomatis**, **pemutaran rute lari interaktif bergaya Strava (GPX Playback)**, **sinkronisasi otomatis VO2Max**, **program latihan terstruktur (5K, 10K, 21K, 42K)**, serta **pendampingan Coach AI**.

---

## 🚀 Fitur Utama & Solusi Masalah

1. **Strava-Style GPX Playback (Peta Interaktif & Animasi)**
   - Saat file olahraga diunggah, peta rute lari Anda akan langsung digambar.
   - Tersedia tombol **Play, Pause, Reset, dan Pengatur Kecepatan (1x, 2x, 5x, 10x)**.
   - Karakter pelari akan meluncur di sepanjang jalur peta diiringi telemetri data detak jantung (HR), pace, elevasi, dan akumulasi jarak yang bergerak mulus secara dinamis!
   - Dilengkapi *vector-fallback drawing* agar visualisasi peta tetap berfungsi normal 100% tanpa internet di lingkungan terbatas (seperti iframe sandboxed).

2. **Alur Latihan GPX/TCX Upload Terstruktur**
   - **Alur Lintas Resource**: Klik Program Latihan (5K, 10K, 21K, atau 42K) ➡️ Lihat Jadwal Mingguan ➡️ Klik Sesi Hari Ini ➡️ Tinjau Komposisi Lari ➡️ Unggah File GPX/TCX (atau gunakan trek simulasi GPS berpresisi tinggi yang sudah kami sediakan) ➡️ Selesai!
   - Setelah selesai, data otomatis diarsipkan ke tab "Riwayat Latihan" dan diposting ke Social Feed komunitas.

3. **Sinkronisasi Otomatis VO2Max (Bukan Manual!)**
   - VO2Max tidak lagi diinput manual secara janggal. Setiap kali Anda menuntaskan lari (mengunggah file GPX/TCX), sistem fisiologis AI PacePilot akan mendeteksi rasio antara kecepatan lari (pace) dan kestabilan detak jantung (average HR) untuk menaksir tingkat kebugaran kardiovaskular baru Anda secara otomatis.
   - Perubahan langsung disinkronkan ke grafis tren VO2Max harian.

4. **Sesi Latihan Kekuatan (Strength Training) & Link YouTube Pintar**
   - Menghadirkan porsi latihan penguatan otot dan pencegahan cedera kaki (lutut, betis, glutes) minimal sekali seminggu di setiap program latihan.
   - Sesuai regulasi, jika tautan Youtube rusak, aplikasi otomatis mengubahnya menjadi pencarian cerdas terarah di YouTube dengan judul gerakan spesifik seperti `youtube.com/results?search_query=Strength+Training+for+Intermediate+Runners...` sehingga pelari pasti menemukan video tutorial yang tepat!

5. **Diagnostic Pop-Up saat Registrasi (Beginner, Intermediate, Pro)**
   - Saat mendaftar akun baru, Anda akan disambut dengan kuesioner singkat interaktif berisi 3 pertanyaan penentu intensitas fisik.
   - Hasil hitung otomatis menempatkan Anda pada salah satu tingkat: **Beginner, Intermediate, atau Pro**.
   - **Prinsip Komposisi Level**: Semua struktur lari (jarak, durasi, repetisi sprint, durasi pemanasan & pendinginan) serta porsi latihan kekuatan beban disesuaikan sepenuhnya dengan ketahanan fisik level Anda tersebut secara konsisten.

6. **Treadmill Mode (Indoor Workout)**
   - Menyediakan opsi sakelar *Treadmill Mode* untuk Anda yang berlatih lari di dalam ruangan. Sesi diselesaikan menggunakan kalkulasi jumlah langkah kaki (*step count*) dan input manual waktu/jarak, sehingga program latihan tetap bisa dilanjutkan.

7. **Fungsionalitas Admin (Kelola Member)**
   - Tersedia tombol simulasi cepat untuk beralih peran sebagai **Admin**.
   - Admin dapat memantau daftar member terdaftar, mengubah level kompetensi atlet secara langsung, menyunting angka VO2Max, melihat statistik total kilometer, serta mempublikasikan memo pengumuman krusial ke papan berita member.

8. **Dasbor Analitik Grid (Tiga Halaman Utama)**
   - **Dashboard Utama**: Berisi widget bergaya grid yang menampilkan Durasi Total, Kalender Aktivitas Bulanan (dengan penanda hari lari), Peta Jalur Lari Terakhir + Playback Control, Metrik Kebugaran CTL/ATL/TSB, Sleep Tracker, dan tren Detak Jantung Harian.
   - **Halaman 'Training' (Volume Tahunan)**: Analitis mendalam menggunakan grafik batang bertumpuk (**Stacked Bar Chart**) Recharts untuk memvisualisasikan volume latihan lari (km), sepeda (km), dan angkat beban (jam) per bulan selama setahun penuh.
   - **Halaman 'Progress' (CTL/ATL/TSB & Recovery Zone)**: Grafik garis ganda canggih membandingkan Fitness (CTL) dan Fatigue (ATL) dari waktu ke waktu, serta grafik area terpisah untuk Form (TSB) yang dilengkapi batas garis pengaman zona pemulihan (*Optimal, Fresh, Injury Risk*).

9. **Coach AI & Analisis Nutrisi Long Run**
   - **Coach AI Chatbot**: Obrolan interaktif seputar kiat menaikkan VO2Max, pencegahan kram lutut, dan taktik pacing.
   - **AI GPS File Reader**: Analisis instan file GPX/TCX yang diunggah untuk membongkar diagram durasi *Heart Rate Zones* (Zone 1 s/d Zone 5) dan menyusun memo umpan balik taktis kelemahan/kelebihan lari Anda.
   - **Long Run Nutrition**: Panduan presisi kebutuhan air (150-200ml cairan isotonic per 15-20 menit) dan karbohidrat penopang energi (30-60 gram glikogen dari energy gel/pisang per 45 menit) untuk durasi lari di atas 1 jam.

---

## 📂 Struktur Komponen UI (React)

Aplikasi dibangun menggunakan modul-modul komponen React yang bersih, terpisah, dan terstruktur dengan baik:

```bash
/home/user/
├── package.json               # Konfigurasi dependensi (Vite, React, Tailwind, Recharts, Lucide)
├── vite.config.js             # Konfigurasi server Vite
├── index.html                 # HTML Entrypoint utama (memuat script Leaflet)
├── src/
│   ├── main.jsx               # React entrypoint render
│   ├── index.css              # Custom styling (scrollbars, dark theme map)
│   ├── App.jsx                # Orchestrator & State router aplikasi
│   ├── data/
│   │   └── mockData.js        # Seed database (announcements, user, sleep data, volume chart)
│   ├── utils/
│   │   └── gpxParser.js       # GPX/TCX Parser (Haversine formula, speed converter, mock GPS track generator)
│   └── components/
│       ├── Sidebar.jsx        # Sidebar navigation bergaya modern
│       ├── Header.jsx         # Header dengan toggle simulasi peran Admin/Member
│       ├── Dashboard.jsx      # Widget grid utama, kalender kegiatan, & Strava Playback map
│       ├── Training.jsx       # Analitik stacked bar chart volume tahunan per cabang olahraga
│       ├── Progress.jsx       # Tren fitness CTL/ATL & zona pemulihan TSB line chart
│       ├── TrainingPlans.jsx  # Jadwal 5k/10k/21k/42k, Treadmill toggle, & menu GPX Upload
│       ├── SocialFeed.jsx     # Feed aktivitas, Kudos (likes), Comments, Klub, & foto upload
│       ├── GearTracker.jsx    # CRUD Sepatu lari, visualisasi retirement meter, & limit sol aus
│       ├── CoachingAI.jsx     # Coach AI Chat, pemeta durasi HR Zone, & nutrisi minum long run
│       ├── AdminPanel.jsx     # Manajemen member admin, pengubah level lari, & penerbit memo
│       └── AuthModal.jsx      # Portal registrasi & pop-up kuesioner tingkat kompetensi otomatis
```

---

## ⚙️ Cara Menjalankan Aplikasi di Komputer Anda

### Persyaratan Sistem:
- **Node.js** (Versi v18 atau lebih tinggi)
- **npm** (Versi v9 atau lebih tinggi)

### Langkah-langkah Instalasi:

1. **Extract/Salin Kode File**
   Salin seluruh direktori proyek ini ke komputer lokal Anda.

2. **Instal Dependensi**
   Buka terminal/command prompt di direktori root proyek tersebut, lalu jalankan perintah:
   ```bash
   npm install
   ```

3. **Jalankan Server Pengembangan (Dev Server)**
   Eksekusi perintah berikut untuk menjalankan server lokal Vite:
   ```bash
   npm run dev
   ```

4. **Buka Aplikasi di Browser**
   Terminal akan menampilkan tautan server lokal (biasanya `http://localhost:3000`). Buka tautan tersebut di browser favorit Anda!

5. **Membuat Build Produksi**
   Jika ingin melakukan kompilasi file statis siap sebar ke hosting, jalankan perintah:
   ```bash
   npm run build
   ```
   Hasil build berupa HTML, CSS, dan JS yang telah dimatangkan akan tersimpan di dalam folder `/dist`.

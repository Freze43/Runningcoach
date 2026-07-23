import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Compass, 
  Flame, 
  Edit2, 
  Plus, 
  Megaphone, 
  Search,
  Check
} from 'lucide-react';

export default function AdminPanel({ user, setUser }) {
  const [members, setMembers] = useState(() => {
    const local = localStorage.getItem('admin_members');
    if (local) return JSON.parse(local);
    const initial = [
      { id: 'm1', name: 'Naufal Hakim', level: 'pro', vo2max: 58.4, email: 'naufal@run.com', activeProgram: '21k' },
      { id: 'm2', name: 'Adinda Lestari', level: 'beginner', vo2max: 38.2, email: 'adinda@run.com', activeProgram: '5k' },
      { id: 'm3', name: 'Rio Pratama', level: user.level, vo2max: user.vo2maxHistory[user.vo2maxHistory.length-1]?.value || 48.0, email: 'rio@run.com', activeProgram: user.activeProgramId || '10k' },
      { id: 'm4', name: 'Budi Santoso', level: 'intermediate', vo2max: 46.5, email: 'budi@run.com', activeProgram: '10k' }
    ];
    localStorage.setItem('admin_members', JSON.stringify(initial));
    return initial;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [editingMember, setEditingMember] = useState(null);
  const [announcements, setAnnouncements] = useState(() => {
    const local = localStorage.getItem('admin_announcements');
    return local ? JSON.parse(local) : [
      "Selamat menyambut Jakarta Half Marathon! Pastikan untuk mendownload rute GPX di tab plans.",
      "Informasi: Sesi kekuatan otot hari Rabu diperbarui dengan video gerakan core-preventing injury baru."
    ];
  });
  const [newAnnouncement, setNewAnnouncement] = useState('');

  const handleEditMember = (member) => {
    setEditingMember({ ...member });
  };

  const handleSaveMember = (e) => {
    e.preventDefault();
    const updated = members.map(m => {
      if (m.id === editingMember.id) {
        if (m.email.toLowerCase() === user.email.toLowerCase()) {
          const userVo2History = [...user.vo2maxHistory];
          userVo2History[userVo2History.length - 1] = { date: new Date().toISOString().split('T')[0], value: parseFloat(editingMember.vo2max) };
          
          setUser({ 
            ...user, 
            level: editingMember.level, 
            vo2maxHistory: userVo2History 
          });
        }
        return editingMember;
      }
      return m;
    });

    setMembers(updated);
    localStorage.setItem('admin_members', JSON.stringify(updated));
    setEditingMember(null);
  };

  const handleAddAnnouncement = (e) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;

    const updated = [newAnnouncement, ...announcements];
    setAnnouncements(updated);
    localStorage.setItem('admin_announcements', JSON.stringify(updated));
    setNewAnnouncement('');
  };

  const handleDeleteAnnouncement = (idx) => {
    const updated = announcements.filter((_, i) => i !== idx);
    setAnnouncements(updated);
    localStorage.setItem('admin_announcements', JSON.stringify(updated));
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalKms = 3524.8;
  const avgVo2Max = (members.reduce((acc, m) => acc + m.vo2max, 0) / members.length).toFixed(1);

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6 glass-mesh-bg h-full">
      
      {/* Title */}
      <div className="glass-card rounded-2xl p-5 shadow-sm border border-slate-200/50">
        <span className="text-[10px] bg-violet-100 text-violet-600 border border-violet-200/20 px-3 py-1 rounded-full font-extrabold uppercase tracking-wider">
          ADMINISTRATOR ACCESS ONLY
        </span>
        <h3 className="text-xl font-extrabold text-slate-800 mt-2.5 flex items-center gap-1.5">
          <ShieldCheck className="h-5.5 w-5.5 text-violet-500" />
          <span>Panel Kontrol Member PacePilot</span>
        </h3>
        <p className="text-xs text-slate-500 font-semibold mt-1">Kelola tingkat lari anggota, perbarui kapasitas VO2Max, dan terbitkan pengumuman sistem.</p>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4.5 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-200/50">
          <div className="p-3 rounded-xl bg-violet-100 text-violet-600 border border-violet-200/20">
            <Users className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block uppercase font-bold">Total Member</span>
            <span className="text-base font-black text-slate-800 block mt-0.5">{members.length} Atlet</span>
          </div>
        </div>

        <div className="glass-card p-4.5 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-200/50">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600 border border-emerald-200/20">
            <Compass className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block uppercase font-bold">Total Kilometer</span>
            <span className="text-base font-black text-slate-800 block mt-0.5">{totalKms} km</span>
          </div>
        </div>

        <div className="glass-card p-4.5 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-200/50">
          <div className="p-3 rounded-xl bg-violet-100 text-violet-600 border border-violet-200/20">
            <Flame className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block uppercase font-bold">Rata-rata VO2Max</span>
            <span className="text-base font-black text-slate-800 block mt-0.5">{avgVo2Max} ml/kg</span>
          </div>
        </div>
      </div>

      {/* Tables and announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Member list */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 shadow-sm border border-slate-200/50 flex flex-col h-[400px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-3">
            <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
              <Users className="h-4 w-4 text-violet-500" />
              <span>Daftar Anggota Aktif</span>
            </h4>

            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Cari anggota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500 w-[180px] font-semibold"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                  <th className="py-2.5">Nama Pelari</th>
                  <th className="py-2.5">Kompetensi</th>
                  <th className="py-2.5">Program</th>
                  <th className="py-2.5">VO2Max</th>
                  <th className="py-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/40">
                    <td className="py-3">
                      <div className="font-black text-slate-700">{m.name}</div>
                      <span className="text-[10px] text-slate-400 font-semibold">{m.email}</span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 text-[8px] font-extrabold rounded-full uppercase tracking-wider ${
                        m.level === 'pro' 
                          ? 'bg-rose-100 text-rose-700' 
                          : m.level === 'intermediate'
                          ? 'bg-violet-100 text-violet-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {m.level}
                      </span>
                    </td>
                    <td className="py-3 font-bold uppercase text-[9px] text-slate-400">{m.activeProgram?.toUpperCase()} Plan</td>
                    <td className="py-3 font-black text-slate-700">{m.vo2max}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleEditMember(m)}
                        className="p-1.5 text-violet-600 hover:text-white hover:bg-violet-600 rounded-lg transition-all border border-violet-100"
                        title="Edit Kompetensi"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Announcements publisher */}
        <div className="glass-card rounded-2xl p-5 shadow-sm border border-slate-200/50 flex flex-col h-[400px]">
          <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
            <Megaphone className="h-4 w-4 text-violet-500" />
            <span>Memo Pengumuman</span>
          </h4>

          <form onSubmit={handleAddAnnouncement} className="flex gap-2 mb-4 shrink-0">
            <input
              type="text"
              placeholder="Memo pengumuman baru..."
              required
              value={newAnnouncement}
              onChange={(e) => setNewAnnouncement(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500 font-semibold"
            />
            <button
              type="submit"
              className="px-3.5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center shrink-0"
            >
              <Plus className="h-4 w-4" />
            </button>
          </form>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {announcements.map((ann, idx) => (
              <div key={idx} className="bg-slate-50/60 p-3 rounded-xl border border-slate-150/60 flex items-start justify-between gap-3 text-xs font-semibold leading-relaxed text-slate-500">
                <p className="flex-1 text-[11px]">{ann}</p>
                <button
                  type="button"
                  onClick={() => handleDeleteAnnouncement(idx)}
                  className="text-red-500 hover:text-red-700 font-bold"
                  title="Hapus"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Edit modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveMember} className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-700 text-xs uppercase tracking-widest">Edit Member</h3>
              <button type="button" onClick={() => setEditingMember(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="p-5 space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1.5">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-xl w-full p-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1.5">Tingkat Kompetensi (Level)</label>
                <select
                  value={editingMember.level}
                  onChange={(e) => setEditingMember({ ...editingMember, level: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-xl w-full p-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer font-bold"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="pro">Pro</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1.5">Kapasitas VO2Max</label>
                <input 
                  type="number" 
                  step="0.1"
                  required
                  value={editingMember.vo2max}
                  onChange={(e) => setEditingMember({ ...editingMember, vo2max: parseFloat(e.target.value) || 30.0 })}
                  className="bg-slate-50 border border-slate-200 rounded-xl w-full p-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setEditingMember(null)}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl"
              >
                Batal
              </button>
              <button 
                type="submit"
                className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-black text-xs rounded-xl shadow"
              >
                Simpan Profil
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

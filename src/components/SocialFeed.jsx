import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  MapPin, 
  Camera, 
  Trophy, 
  Building, 
  Plus, 
  Sparkles,
  Heart,
  Share2
} from 'lucide-react';
import { MOCK_ACTIVITIES, SEGMENTS, CLUBS } from '../data/mockData';

export default function SocialFeed({ user, feed, setFeed }) {
  const [subTab, setSubTab] = useState('feed'); 
  const [newPost, setNewPost] = useState({ title: '', desc: '', distance: '', duration: '', photo: '' });
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});

  const PRESET_PHOTOS = [
    { name: "Beautiful Sun Road", url: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=600&q=80" },
    { name: "Forest Trail Climb", url: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=600&q=80" },
    { name: "Athletic Track Focus", url: "https://images.unsplash.com/photo-1502224562085-639556652f33?auto=format&fit=crop&w=600&q=80" },
    { name: "Coastline Sunset Run", url: "https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=600&q=80" }
  ];

  const handleKudos = (id) => {
    const updated = feed.map(act => {
      if (act.id === id) {
        return {
          ...act,
          kudos: act.hasKudosed ? act.kudos - 1 : act.kudos + 1,
          hasKudosed: !act.hasKudosed
        };
      }
      return act;
    });
    setFeed(updated);
  };

  const handleAddComment = (e, actId) => {
    e.preventDefault();
    const commentText = commentInputs[actId];
    if (!commentText || !commentText.trim()) return;

    const updated = feed.map(act => {
      if (act.id === actId) {
        return {
          ...act,
          comments: [
            ...act.comments,
            { id: 'comment_' + Date.now(), userName: user.name, text: commentText }
          ]
        };
      }
      return act;
    });

    setFeed(updated);
    setCommentInputs({ ...commentInputs, [actId]: '' });
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.distance || !newPost.duration) return;

    const customPost = {
      id: 'custom_act_' + Date.now(),
      userName: user.name,
      userLevel: user.level,
      userAvatar: "🏃",
      title: newPost.title,
      description: newPost.desc || "Sesi lari pagi yang luar biasa bersama PacePilot!",
      distance: parseFloat(newPost.distance),
      duration: newPost.duration,
      avgPace: "5:12", 
      avgHr: 148,
      elevationGain: 15,
      kudos: 0,
      hasKudosed: false,
      comments: [],
      date: "Baru saja",
      photo: newPost.photo || null,
      segmentName: null
    };

    setFeed([customPost, ...feed]);
    setNewPost({ title: '', desc: '', distance: '', duration: '', photo: '' });
    setShowCreatePost(false);
  };

  const [clubsList, setClubsList] = useState(CLUBS);
  const handleToggleJoinClub = (clubId) => {
    setClubsList(clubsList.map(club => {
      if (club.id === clubId) {
        return {
          ...club,
          joined: !club.joined,
          members: club.joined ? club.members - 1 : club.members + 1
        };
      }
      return club;
    }));
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6 glass-mesh-bg h-full">
      
      {/* Sub tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex gap-4">
          <button
            onClick={() => setSubTab('feed')}
            className={`font-extrabold text-xs tracking-wider transition-all pb-3 -mb-3.5 border-b-2 uppercase ${
              subTab === 'feed'
                ? 'text-violet-600 border-violet-600'
                : 'text-slate-400 border-transparent hover:text-slate-700'
            }`}
          >
            Feed Aktivitas
          </button>
          
          <button
            onClick={() => setSubTab('clubs_segments')}
            className={`font-extrabold text-xs tracking-wider transition-all pb-3 -mb-3.5 border-b-2 uppercase ${
              subTab === 'clubs_segments'
                ? 'text-violet-600 border-violet-600'
                : 'text-slate-400 border-transparent hover:text-slate-700'
            }`}
          >
            Klub & Segmen Tercepat
          </button>
        </div>

        {subTab === 'feed' && (
          <button
            onClick={() => setShowCreatePost(true)}
            className="px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-extrabold text-[10px] rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-violet-500/10 uppercase tracking-widest"
          >
            <Plus className="h-4 w-4" />
            <span>Bagikan Lari</span>
          </button>
        )}
      </div>

      {subTab === 'feed' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main stream */}
          <div className="lg:col-span-2 space-y-6">
            {feed.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center text-slate-400 border border-slate-200/50">
                <Users className="h-10 w-10 mx-auto opacity-50 mb-2" />
                <p className="text-xs">Feed kosong. Jadilah yang pertama memposting sesi latihan Anda!</p>
              </div>
            ) : (
              feed.map((act) => (
                <div key={act.id} className="glass-card rounded-2xl p-5 shadow-sm border border-slate-200/50 space-y-4">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-violet-100 border border-violet-200/40 flex items-center justify-center font-extrabold text-violet-600">
                        {act.userAvatar || "🏃"}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-2">
                          <span>{act.userName}</span>
                          <span className={`px-2 py-0.5 text-[8px] font-extrabold rounded-full uppercase tracking-wider ${
                            act.userLevel === 'pro' 
                              ? 'bg-rose-100 text-rose-700' 
                              : act.userLevel === 'intermediate'
                              ? 'bg-violet-100 text-violet-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {act.userLevel}
                          </span>
                        </h4>
                        <span className="text-[9px] text-slate-400 font-semibold">{act.date}</span>
                      </div>
                    </div>

                    {act.segmentName && (
                      <span className="px-2.5 py-1 bg-violet-100 text-violet-700 border border-violet-200/20 rounded-full text-[9px] font-bold flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        <span>Segmen: {act.segmentName.split(' ')[0]}...</span>
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div>
                    <h5 className="font-black text-slate-700 text-sm leading-snug">{act.title}</h5>
                    <p className="text-xs text-slate-500 font-semibold mt-1.5 leading-relaxed">{act.description}</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-2 text-center bg-slate-50 border border-slate-150/40 p-3 rounded-xl font-bold">
                    <div>
                      <span className="text-[8px] text-slate-400 block uppercase">Jarak</span>
                      <span className="text-xs font-black text-slate-700">{act.distance.toFixed(2)} KM</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 block uppercase">Durasi</span>
                      <span className="text-xs font-black text-slate-700">{act.duration}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 block uppercase">Rerata Pace</span>
                      <span className="text-xs font-black text-violet-600">{act.avgPace} /km</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 block uppercase">Elevasi</span>
                      <span className="text-xs font-black text-amber-500">+{act.elevationGain} m</span>
                    </div>
                  </div>

                  {/* Photo */}
                  {act.photo && (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200/50 aspect-[16/9] max-h-[220px]">
                      <img src={act.photo} alt={act.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-6 border-y border-slate-100 py-2.5 text-xs font-bold">
                    <button
                      onClick={() => handleKudos(act.id)}
                      className={`flex items-center gap-1.5 transition-all duration-300 ${act.hasKudosed ? 'text-violet-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <ThumbsUp className={`h-4 w-4 ${act.hasKudosed ? 'fill-violet-500 stroke-violet-600' : ''}`} />
                      <span>{act.kudos} Kudos</span>
                    </button>

                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MessageSquare className="h-4 w-4" />
                      <span>{act.comments.length} Komentar</span>
                    </div>
                  </div>

                  {/* Comments feed */}
                  <div className="space-y-2.5">
                    {act.comments.map((comment) => (
                      <div key={comment.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs font-semibold">
                        <strong className="text-violet-600 mr-2">{comment.userName}</strong>
                        <span className="text-slate-500 leading-normal">{comment.text}</span>
                      </div>
                    ))}

                    <form onSubmit={(e) => handleAddComment(e, act.id)} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Berikan apresiasi atau komentar..."
                        value={commentInputs[act.id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [act.id]: e.target.value })}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500 font-semibold"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors border border-slate-200"
                      >
                        Kirim
                      </button>
                    </form>
                  </div>

                </div>
              ))
            )}
          </div>

          {/* Feed sidebar */}
          <div className="space-y-6">
            
            {/* Athlete panel */}
            <div className="glass-card rounded-2xl p-5 shadow-sm border border-slate-200/50 space-y-4">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Kartu Atlet</span>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-violet-100 border border-violet-200/20 flex items-center justify-center font-extrabold text-xl text-violet-600">
                  ⚡
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-xs">{user.name}</h4>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">{user.level} runner</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between text-center text-xs font-bold">
                <div>
                  <span className="text-slate-400 block text-[8px] uppercase">Kudos Diterima</span>
                  <span className="font-black text-slate-700 text-sm block mt-0.5">32</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[8px] uppercase">Klub Diikuti</span>
                  <span className="font-black text-slate-700 text-sm block mt-0.5">2</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[8px] uppercase">Total Langkah</span>
                  <span className="font-black text-slate-700 text-sm block mt-0.5">14.5k</span>
                </div>
              </div>
            </div>

            {/* Popular segments */}
            <div className="glass-card rounded-2xl p-5 shadow-sm border border-slate-200/50 space-y-3.5">
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                <Trophy className="h-4 w-4 text-violet-500" />
                <h4 className="font-extrabold text-[10px] text-slate-700 uppercase tracking-wider">Segmen Strava Populer</h4>
              </div>

              <div className="space-y-3 text-xs font-semibold">
                {SEGMENTS.map((seg) => (
                  <div key={seg.id} className="bg-slate-50/60 p-3 rounded-xl border border-slate-150/60">
                    <span className="font-extrabold text-slate-700 block truncate">{seg.name}</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Jarak: {seg.distance} km • Elevasi: {seg.avgElevation}</span>
                    
                    <div className="mt-2.5 pt-2 border-t border-slate-150/40 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-amber-600">
                        <span>👑 {seg.leaderboard[0].name} (Pro)</span>
                        <span>{seg.leaderboard[0].time}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>🥈 {seg.leaderboard[1].name}</span>
                        <span>{seg.leaderboard[1].time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Clubs subtab */}
      {subTab === 'clubs_segments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-5 shadow-sm border border-slate-200/50 space-y-4">
            <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <Building className="h-4 w-4 text-violet-500" />
              <span>Komunitas & Klub Lari</span>
            </h4>

            <div className="space-y-3.5 font-semibold">
              {clubsList.map((club) => (
                <div key={club.id} className="bg-slate-50/60 p-4 rounded-xl border border-slate-150/80 flex items-center justify-between gap-4">
                  <div>
                    <h5 className="font-extrabold text-slate-700 text-xs">{club.name}</h5>
                    <p className="text-[11px] text-slate-400 mt-1">{club.description}</p>
                    <span className="text-[9px] font-bold text-slate-400 mt-2 block uppercase">{club.members} Anggota</span>
                  </div>
                  <button
                    onClick={() => handleToggleJoinClub(club.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                      club.joined
                        ? 'bg-slate-100 text-emerald-600 border border-emerald-200'
                        : 'bg-violet-600 hover:bg-violet-500 text-white'
                    }`}
                  >
                    {club.joined ? 'Anggota ✔️' : 'Gabung'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="glass-card rounded-2xl p-5 shadow-sm border border-slate-200/50 space-y-4">
            <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-violet-500" />
              <span>Leaderboard Segmen</span>
            </h4>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {SEGMENTS.map((seg) => (
                <div key={seg.id} className="space-y-2 bg-slate-50/40 p-4 rounded-xl border border-slate-150/60">
                  <div className="flex items-center justify-between font-extrabold text-[11px] text-slate-700">
                    <span>{seg.name}</span>
                    <span className="text-violet-600">{seg.distance} km</span>
                  </div>

                  <div className="mt-2 text-xs space-y-1 font-semibold">
                    {seg.leaderboard.map((runner) => (
                      <div key={runner.rank} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold w-4 text-center ${runner.rank === 1 ? 'text-amber-500' : (runner.rank === 2 ? 'text-slate-400' : 'text-slate-500')}`}>
                            {runner.rank}
                          </span>
                          <span className="text-slate-600">{runner.name}</span>
                          <span className="text-[8px] bg-slate-100 px-1.5 py-0.5 rounded-full text-slate-400 font-extrabold uppercase">{runner.level}</span>
                        </div>
                        <span className="font-extrabold text-slate-700">{runner.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Write manual post modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreatePost} className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-700 text-xs uppercase tracking-widest">Bagikan Berita Lari</h3>
              <button type="button" onClick={() => setShowCreatePost(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="p-5 space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1.5">Nama Kegiatan</label>
                <input 
                  type="text" 
                  placeholder="Misal: Morning Run with Friends" 
                  required
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-xl w-full p-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1.5">Catatan Lari</label>
                <textarea 
                  placeholder="Ceritakan keseruan lari hari ini..." 
                  rows="3"
                  value={newPost.desc}
                  onChange={(e) => setNewPost({ ...newPost, desc: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-xl w-full p-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1.5">Jarak (KM)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="Misal: 5.0"
                    required
                    value={newPost.distance}
                    onChange={(e) => setNewPost({ ...newPost, distance: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl w-full p-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1.5">Durasi (MM:SS)</label>
                  <input 
                    type="text" 
                    placeholder="Misal: 25:30"
                    required
                    value={newPost.duration}
                    onChange={(e) => setNewPost({ ...newPost, duration: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl w-full p-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1.5">Lampirkan Foto Kegiatan</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {PRESET_PHOTOS.map((ph, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewPost({ ...newPost, photo: ph.url })}
                      className={`bg-slate-50 border p-1 rounded-xl transition-all text-left overflow-hidden ${
                        newPost.photo === ph.url ? 'border-violet-500 bg-violet-50/10' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={ph.url} alt={ph.name} className="h-10 w-full object-cover rounded-lg mb-1" />
                      <span className="text-[8px] text-slate-400 truncate block text-center font-bold">{ph.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setShowCreatePost(false)}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl"
              >
                Batal
              </button>
              <button 
                type="submit"
                className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-black text-xs rounded-xl shadow"
              >
                Posting Berita Lari
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

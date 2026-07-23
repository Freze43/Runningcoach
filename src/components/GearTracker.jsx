import React, { useState } from 'react';
import { 
  Footprints, 
  Plus, 
  Trash2, 
  Edit,
  CheckCircle,
  PlusCircle,
  Check
} from 'lucide-react';

export default function GearTracker({ shoes, setShoes, user, setUser }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingShoe, setEditingShoe] = useState(null);
  const [newShoe, setNewShoe] = useState({ brand: '', model: '', mileage: 0, limit: 500 });

  const handleAddShoe = (e) => {
    e.preventDefault();
    if (!newShoe.brand || !newShoe.model) return;

    const shoeObj = {
      id: 'shoe_' + Date.now(),
      brand: newShoe.brand,
      model: newShoe.model,
      mileage: parseFloat(newShoe.mileage) || 0,
      limit: parseInt(newShoe.limit) || 500,
      active: shoes.length === 0
    };

    const updatedShoes = [...shoes, shoeObj];
    setShoes(updatedShoes);
    setUser({ ...user, shoes: updatedShoes });

    setNewShoe({ brand: '', model: '', mileage: 0, limit: 500 });
    setShowAddModal(false);
  };

  const handleToggleActive = (id) => {
    const updatedShoes = shoes.map(s => {
      return { ...s, active: s.id === id };
    });
    setShoes(updatedShoes);
    setUser({ ...user, shoes: updatedShoes });
  };

  const handleDeleteShoe = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus sepatu ini dari rak perlengkapan?")) {
      const updatedShoes = shoes.filter(s => s.id !== id);
      if (shoes.find(s => s.id === id)?.active && updatedShoes.length > 0) {
        updatedShoes[0].active = true;
      }
      setShoes(updatedShoes);
      setUser({ ...user, shoes: updatedShoes });
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const updatedShoes = shoes.map(s => {
      if (s.id === editingShoe.id) {
        return {
          ...s,
          brand: editingShoe.brand,
          model: editingShoe.model,
          limit: parseInt(editingShoe.limit) || 500,
          mileage: parseFloat(editingShoe.mileage) || 0
        };
      }
      return s;
    });
    setShoes(updatedShoes);
    setUser({ ...user, shoes: updatedShoes });
    setEditingShoe(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6 glass-mesh-bg h-full">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-violet-500 font-bold uppercase tracking-widest block">Manajemen Alat Olahraga</span>
          <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2 mt-1">
            <Footprints className="h-5 w-5 text-violet-500" />
            <span>Gear Tracker (Sepatu Lari)</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Lacak akumulasi jarak tempuh sepatu Anda secara real-time untuk mencegah cedera otot sendi.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-extrabold text-xs py-3 px-5 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-violet-500/10 uppercase tracking-widest"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Sepatu</span>
        </button>
      </div>

      {/* Shoes Grid */}
      {shoes.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm border border-slate-200/50">
          <Footprints className="h-12 w-12 text-slate-300 mx-auto" />
          <div>
            <h4 className="font-extrabold text-slate-700 text-sm">Belum ada sepatu lari terdaftar</h4>
            <p className="text-xs text-slate-400 leading-normal mt-1.5 font-semibold">
              Anda perlu mendaftarkan minimal satu sepatu agar sistem dapat merekam penambahan jarak tempuh sol secara otomatis ketika Anda menyelesaikan jadwal lari Anda.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-2 text-xs font-black text-violet-600 hover:underline inline-flex items-center gap-1.5"
          >
            <span>Daftarkan sepatu pertama sekarang</span>
            <PlusCircle className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shoes.map((shoe) => {
            const ratio = shoe.mileage / shoe.limit;
            const percentage = Math.min(Math.round(ratio * 100), 100);
            
            let barColor = "bg-emerald-500";
            let textColor = "text-emerald-600";
            let warningText = "";

            if (percentage >= 90) {
              barColor = "bg-red-500 animate-pulse";
              textColor = "text-red-600 font-extrabold";
              warningText = "⚠️ Sol kaki aus! Bahaya cedera persendian.";
            } else if (percentage >= 75) {
              barColor = "bg-amber-500";
              textColor = "text-amber-600";
              warningText = "Sol mulai menipis. Rekomendasi ganti.";
            }

            return (
              <div 
                key={shoe.id} 
                className={`glass-card rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group shadow-sm ${
                  shoe.active 
                    ? 'border-violet-300 bg-violet-500/[0.01]' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Active Tag */}
                {shoe.active && (
                  <div className="absolute top-0 right-0 bg-violet-600 text-white font-extrabold text-[8px] uppercase tracking-wider px-3.5 py-1.5 rounded-bl-xl shadow flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    <span>UTAMA</span>
                  </div>
                )}

                <div>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-widest">{shoe.brand}</span>
                  <h4 className="text-sm font-black text-slate-700 mt-1">{shoe.model}</h4>
                  
                  {/* Progress bar */}
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500">Jarak Tempuh: <strong className="text-slate-800 font-black">{shoe.mileage.toFixed(1)} km</strong></span>
                      <span className="text-slate-400">Maks: {shoe.limit} km</span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/50 shadow-inner">
                      <div className={`${barColor} h-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                    </div>

                    <div className="flex items-center justify-between font-bold text-[10px]">
                      <span className="text-slate-400">{percentage}% Sol Terpakai</span>
                      {warningText && (
                        <span className={`${textColor}`}>{warningText}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2.5">
                  <div className="flex gap-2">
                    {!shoe.active && (
                      <button
                        onClick={() => handleToggleActive(shoe.id)}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black rounded-lg transition-all border border-slate-200"
                      >
                        Set Utama
                      </button>
                    )}
                    <button
                      onClick={() => setEditingShoe(shoe)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-lg transition-colors border border-slate-200"
                      title="Edit"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteShoe(shoe.id)}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all border border-rose-100"
                    title="Hapus Sepatu"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Shoe Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddShoe} className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-700 text-xs uppercase tracking-widest">Daftarkan Sepatu Baru</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            
            <div className="p-5 space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1.5">Merek Sepatu (Brand)</label>
                <input 
                  type="text" 
                  placeholder="Misal: Nike, Adidas, Hoka" 
                  required
                  value={newShoe.brand}
                  onChange={(e) => setNewShoe({ ...newShoe, brand: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-xl w-full p-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1.5">Model Sepatu</label>
                <input 
                  type="text" 
                  placeholder="Misal: Pegasus 41, Vaporfly 3" 
                  required
                  value={newShoe.model}
                  onChange={(e) => setNewShoe({ ...newShoe, model: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-xl w-full p-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1.5">Jarak Mulai (km)</label>
                  <input 
                    type="number" 
                    value={newShoe.mileage}
                    onChange={(e) => setNewShoe({ ...newShoe, mileage: parseFloat(e.target.value) || 0 })}
                    className="bg-slate-50 border border-slate-200 rounded-xl w-full p-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1.5">Batas Sol Aus (km)</label>
                  <input 
                    type="number" 
                    value={newShoe.limit}
                    onChange={(e) => setNewShoe({ ...newShoe, limit: parseInt(e.target.value) || 500 })}
                    className="bg-slate-50 border border-slate-200 rounded-xl w-full p-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl"
              >
                Batal
              </button>
              <button 
                type="submit"
                className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-black text-xs rounded-xl shadow"
              >
                Simpan Sepatu
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Shoe Modal */}
      {editingShoe && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleEditSubmit} className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-700 text-xs uppercase tracking-widest">Edit Sepatu</h3>
              <button type="button" onClick={() => setEditingShoe(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            
            <div className="p-5 space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1.5">Merek Sepatu (Brand)</label>
                <input 
                  type="text" 
                  required
                  value={editingShoe.brand}
                  onChange={(e) => setEditingShoe({ ...editingShoe, brand: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-xl w-full p-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1.5">Model Sepatu</label>
                <input 
                  type="text" 
                  required
                  value={editingShoe.model}
                  onChange={(e) => setEditingShoe({ ...editingShoe, model: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-xl w-full p-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1.5">Total Jarak Tempuh (km)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={editingShoe.mileage}
                    onChange={(e) => setEditingShoe({ ...editingShoe, mileage: parseFloat(e.target.value) || 0 })}
                    className="bg-slate-50 border border-slate-200 rounded-xl w-full p-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1.5">Batas Sol Aus (km)</label>
                  <input 
                    type="number" 
                    value={editingShoe.limit}
                    onChange={(e) => setEditingShoe({ ...editingShoe, limit: parseInt(e.target.value) || 500 })}
                    className="bg-slate-50 border border-slate-200 rounded-xl w-full p-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setEditingShoe(null)}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl"
              >
                Batal
              </button>
              <button 
                type="submit"
                className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-black text-xs rounded-xl shadow"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Plus, X } from 'lucide-react';

/**
 * Modal tambah poliklinik.
 *
 * Props:
 *  - open         : boolean, tampilkan / sembunyikan modal
 *  - onClose      : () => void
 *  - onSave       : (nama: string) => void
 *  - existing     : string[] daftar nama poliklinik yang sudah ada (untuk cek duplikat)
 *  - serverError  : string | undefined, pesan error validasi dari Laravel
 */
export default function Create({ open, onClose, onSave, existing = [], serverError }) {
  const [nama, setNama] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Reset isian setiap modal dibuka, lalu fokus ke input
  useEffect(() => {
    if (open) {
      setNama('');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Tutup dengan tombol Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  // Error lokal diutamakan, lalu error dari server
  const shownError = error || serverError;

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = nama.trim();

    if (value === '') {
      setError('Nama poliklinik wajib diisi.');
      return;
    }
    if (value.length > 50) {
      setError('Nama poliklinik maksimal 50 karakter.');
      return;
    }
    if (existing.some((n) => n.toLowerCase() === value.toLowerCase())) {
      setError('Poliklinik ini sudah ada.');
      return;
    }

    onSave(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Card */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Plus size={20} className="text-[#0B5FE8]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 leading-tight">Tambah Poliklinik</h3>
              <p className="text-xs text-slate-500 mt-0.5">Masukkan nama poliklinik baru.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5">
          <label htmlFor="nama_poliklinik" className="block text-xs font-semibold text-slate-600 mb-1.5">
            Nama Poliklinik
          </label>
          <input
            id="nama_poliklinik"
            ref={inputRef}
            type="text"
            value={nama}
            onChange={(e) => {
              setNama(e.target.value);
              if (error) setError('');
            }}
            placeholder="Contoh: Poli Umum"
            className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
              shownError
                ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                : 'border-slate-200 focus:ring-blue-200 focus:border-blue-400'
            }`}
          />
          {shownError && <p className="mt-1.5 text-xs text-red-500">{shownError}</p>}
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-xl bg-[#0B5FE8] hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition flex items-center justify-center gap-2"
          >
            <Plus size={14} />
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
}
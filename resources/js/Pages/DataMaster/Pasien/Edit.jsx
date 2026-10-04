import React, { useState, useEffect, useRef } from 'react';
import { Pencil, X } from 'lucide-react';

/**
 * Modal edit pasien.
 *
 * Props:
 *  - open         : boolean
 *  - pasien       : { id, no_rm, nama }
 *  - onClose      : () => void
 *  - onSave       : (id, { no_rm, nama }) => void
 *  - serverErrors : { no_rm?, nama? } error validasi dari Laravel
 */
export default function Edit({ open, pasien, onClose, onSave, serverErrors = {} }) {
  const [form, setForm] = useState({ no_rm: '', nama: '' });
  const [errors, setErrors] = useState({});
  const inputRef = useRef(null);

  // Isi ulang setiap modal dibuka
  useEffect(() => {
    if (open && pasien) {
      setForm({ no_rm: pasien.no_rm, nama: pasien.nama });
      setErrors({});
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [open, pasien]);

  // Tutup dengan tombol Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !pasien) return null;

  const err = (n) => errors[n] || serverErrors[n];

  const change = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const no_rm = form.no_rm.trim();
    const nama = form.nama.trim();
    const v = {};

    if (no_rm === '') v.no_rm = 'No. RM wajib diisi.';
    else if (no_rm.length > 20) v.no_rm = 'No. RM maksimal 20 karakter.';
    if (nama === '') v.nama = 'Nama pasien wajib diisi.';
    else if (nama.length > 255) v.nama = 'Nama pasien maksimal 255 karakter.';

    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }

    onSave(pasien.id, { no_rm, nama });
  };

  const inputCls = (n) =>
    `w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
      err(n)
        ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
        : 'border-slate-200 focus:ring-blue-200 focus:border-blue-400'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Pencil size={18} className="text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 leading-tight">Edit Pasien</h3>
              <p className="text-xs text-slate-500 mt-0.5">Ubah No. RM atau nama pasien.</p>
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

        <div className="mt-5 flex flex-col gap-4">
          <div>
            <label htmlFor="edit_no_rm" className="block text-xs font-semibold text-slate-600 mb-1.5">
              No. Rekam Medis
            </label>
            <input
              id="edit_no_rm"
              ref={inputRef}
              name="no_rm"
              type="text"
              value={form.no_rm}
              onChange={change}
              placeholder="Contoh: 223515"
              className={inputCls('no_rm')}
            />
            {err('no_rm') && <p className="mt-1.5 text-xs text-red-500">{err('no_rm')}</p>}
          </div>

          <div>
            <label htmlFor="edit_nama_pasien" className="block text-xs font-semibold text-slate-600 mb-1.5">
              Nama Pasien
            </label>
            <input
              id="edit_nama_pasien"
              name="nama"
              type="text"
              value={form.nama}
              onChange={change}
              placeholder="Nama lengkap pasien"
              className={`${inputCls('nama')} uppercase`}
            />
            {err('nama') && <p className="mt-1.5 text-xs text-red-500">{err('nama')}</p>}
          </div>
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
            <Pencil size={14} />
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
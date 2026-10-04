import React, { useState, useEffect, useRef } from 'react';
import { Pencil, X, ChevronDown } from 'lucide-react';

/**
 * Modal edit pengguna (username, NIP, dan role). Password diubah lewat modal "Ubah Password".
 *
 * Props:
 *  - open         : boolean
 *  - pengguna     : { id, username, nip, role }
 *  - onClose      : () => void
 *  - onSave       : (id, { username, nip, role }) => void
 *  - existing     : { id, username }[] semua pengguna (cek duplikat)
 *  - roles        : string[]
 *  - serverErrors : { [field]: string } error validasi dari Laravel
 */
export default function Edit({ open, pengguna, onClose, onSave, existing = [], roles = [], serverErrors = {} }) {
  const [form, setForm] = useState({ username: '', nip: '', role: '' });
  const [errors, setErrors] = useState({});
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && pengguna) {
      setForm({ username: pengguna.username, nip: pengguna.nip || '', role: pengguna.role });
      setErrors({});
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [open, pengguna]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !pengguna) return null;

  // Error dari validasi lokal, atau dari server kalau lokal kosong
  const err = (key) => errors[key] || serverErrors[key];

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: '' }));
  };

  const validate = () => {
    const er = {};
    const username = form.username.trim();
    if (username === '') er.username = 'Username wajib diisi.';
    else if (username.length < 3) er.username = 'Username minimal 3 karakter.';
    else if (/\s/.test(username)) er.username = 'Username tidak boleh mengandung spasi.';
    else if (existing.some((u) => u.id !== pengguna.id && u.username.toLowerCase() === username.toLowerCase()))
      er.username = 'Username sudah dipakai.';

    const nip = form.nip.trim();
    if (nip === '') er.nip = 'NIP wajib diisi.';
    else if (nip.length > 30) er.nip = 'NIP maksimal 30 karakter.';

    if (form.role === '') er.role = 'Role wajib dipilih.';
    return er;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length > 0) return;
    onSave(pengguna.id, { username: form.username.trim(), nip: form.nip.trim(), role: form.role });
  };

  const inputCls = (key) =>
    `w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
      err(key)
        ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
        : 'border-slate-200 focus:ring-blue-200 focus:border-blue-400'
    }`;
  const labelCls = 'block text-xs font-semibold text-slate-600 mb-1.5';
  const errCls = 'mt-1.5 text-xs text-red-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <form onSubmit={handleSubmit} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Pencil size={18} className="text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 leading-tight">Edit Pengguna</h3>
              <p className="text-xs text-slate-500 mt-0.5">Ubah username, NIP, dan role.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition" aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <div>
            <label htmlFor="edit_username" className={labelCls}>Username</label>
            <input
              id="edit_username" ref={inputRef} type="text" autoComplete="off"
              value={form.username} onChange={set('username')} className={inputCls('username')}
            />
            {err('username') && <p className={errCls}>{err('username')}</p>}
          </div>

          <div>
            <label htmlFor="edit_nip" className={labelCls}>NIP</label>
            <input
              id="edit_nip" type="text" autoComplete="off"
              value={form.nip} onChange={set('nip')} className={inputCls('nip')}
            />
            {err('nip') && <p className={errCls}>{err('nip')}</p>}
          </div>

          <div>
            <label htmlFor="edit_role" className={labelCls}>Role</label>
            <div className="relative">
              <select
                id="edit_role" value={form.role} onChange={set('role')}
                className={`${inputCls('role')} appearance-none bg-white pr-9 cursor-pointer`}
              >
                <option value="">Pilih role…</option>
                {roles.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            {err('role') && <p className={errCls}>{err('role')}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-xl bg-[#0B5FE8] hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
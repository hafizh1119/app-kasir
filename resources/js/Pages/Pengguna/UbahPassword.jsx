import React, { useState, useEffect, useRef } from 'react';
import { KeyRound, X } from 'lucide-react';
import PasswordInput from './PasswordInput';

/**
 * Modal ubah password pengguna.
 *
 * Props:
 *  - open         : boolean
 *  - pengguna     : { id, username }
 *  - onClose      : () => void
 *  - onSave       : (id, passwordBaru) => void
 *  - serverErrors : { [field]: string } error validasi dari Laravel
 */
export default function UbahPassword({ open, pengguna, onClose, onSave, serverErrors = {} }) {
  const [password, setPassword] = useState('');
  const [konfirmasi, setKonfirmasi] = useState('');
  const [errors, setErrors] = useState({});
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setPassword('');
      setKonfirmasi('');
      setErrors({});
      setTimeout(() => inputRef.current?.focus(), 50);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const er = {};
    if (password === '') er.password = 'Password baru wajib diisi.';
    else if (password.length < 6) er.password = 'Password minimal 6 karakter.';
    if (konfirmasi !== password) er.konfirmasi = 'Konfirmasi password tidak sama.';
    setErrors(er);
    if (Object.keys(er).length > 0) return;
    onSave(pengguna.id, password);
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
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <KeyRound size={18} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 leading-tight">Ubah Password</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengguna: <span className="font-semibold text-slate-700">{pengguna.username}</span>
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition" aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <div>
            <label htmlFor="pw_baru" className={labelCls}>Password Baru</label>
            <PasswordInput
              id="pw_baru" inputRef={inputRef} autoComplete="new-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((x) => ({ ...x, password: '' })); }}
              placeholder="Minimal 6 karakter" className={inputCls('password')}
            />
            {err('password') && <p className={errCls}>{err('password')}</p>}
          </div>

          <div>
            <label htmlFor="pw_konfirmasi" className={labelCls}>Konfirmasi Password Baru</label>
            <PasswordInput
              id="pw_konfirmasi" autoComplete="new-password"
              value={konfirmasi}
              onChange={(e) => { setKonfirmasi(e.target.value); if (errors.konfirmasi) setErrors((x) => ({ ...x, konfirmasi: '' })); }}
              placeholder="Ulangi password baru" className={inputCls('konfirmasi')}
            />
            {err('konfirmasi') && <p className={errCls}>{err('konfirmasi')}</p>}
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
            Simpan Password
          </button>
        </div>
      </form>
    </div>
  );
}
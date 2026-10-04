import React, { useState, useMemo, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayouts';
import { Search, X, Users, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import Create from './Create';
import Edit from './Edit';
import UbahPassword from './UbahPassword';

// Base URL resource. Ubah kalau route-mu punya prefix (cek: php artisan route:list)
const BASE = '/pengguna';

// Role di tampilan/modal memakai huruf kapital, di database huruf kecil
const ROLES = ['Admin', 'Kasir'];

const ROLE_BADGE = {
  Admin: 'bg-violet-100 text-violet-700',
  Kasir: 'bg-blue-100 text-blue-700',
};

const capitalize = (s = '') => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

// Ubah role ke huruf kecil sebelum dikirim ke server
const toApi = (values) => ({ ...values, role: String(values.role ?? '').toLowerCase() });

// ─── Halaman Utama ────────────────────────────────────────────────────────────
export default function PenggunaIndex({ data: users = [] }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);         // { id, username, nip, role }
  const [passwordTarget, setPasswordTarget] = useState(null); // { id, username }
  const [deleteTarget, setDeleteTarget] = useState(null);     // { id, username }
  const [toast, setToast] = useState(null);                   // { type: 'success' | 'error', text }
  const [formErrors, setFormErrors] = useState({});           // error validasi dari server

  // Tampilkan pesan flash dari controller (success / error)
  useEffect(() => {
    if (flash?.success) setToast({ type: 'success', text: flash.success });
    else if (flash?.error) setToast({ type: 'error', text: flash.error });
  }, [flash]);

  // Sembunyikan notifikasi otomatis
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q === ''
      ? users
      : users.filter(
          (r) =>
            r.username.toLowerCase().includes(q) ||
            (r.role || '').toLowerCase().includes(q) ||
            (r.nip || '').toLowerCase().includes(q)
        );
  }, [users, search]);

  // ── Tutup modal (sekaligus bersihkan error server) ──
  const closeCreate = () => { setShowCreate(false); setFormErrors({}); };
  const closeEdit = () => { setEditTarget(null); setFormErrors({}); };
  const closePassword = () => { setPasswordTarget(null); setFormErrors({}); };

  // Opsi umum request: modal tetap terbuka kalau gagal, error ditampilkan di field
  const visitOptions = (onDone) => ({
    preserveScroll: true,
    onStart: () => setFormErrors({}),
    onSuccess: onDone,
    onError: (errors) => setFormErrors(errors),
  });

  // ── Aksi ke server ──
  const handleCreate = (values) => {
    router.post(
      BASE,
      toApi(values),
      visitOptions(() => {
        closeCreate();
        setSearch('');
      })
    );
  };

  const handleUpdate = (id, values) => {
    router.put(`${BASE}/${id}`, toApi(values), visitOptions(closeEdit));
  };

  const handleChangePassword = (id, passwordBaru) => {
    router.put(`${BASE}/${id}/password`, { password: passwordBaru }, visitOptions(closePassword));
  };

  const handleDelete = () => {
    router.delete(`${BASE}/${deleteTarget.id}`, {
      preserveScroll: true,
      onFinish: () => setDeleteTarget(null),
    });
  };

  const th = 'border border-blue-900 px-3 py-2.5 text-center font-bold';
  const linkBtn = 'px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors';

  return (
    <AdminLayout title="Pengguna">
      <Head title="Pengguna" />

      {/* ── Notifikasi ── */}
      {toast && (
        <div className="fixed top-4 right-4 z-[60]">
          <div
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold shadow-lg ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-red-50 border-red-200 text-red-600'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            {toast.text}
            <button type="button" onClick={() => setToast(null)} className="ml-1 opacity-60 hover:opacity-100">
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* ── Header ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Data Pengguna</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan <span className="font-semibold text-slate-700">{filtered.length}</span> pengguna
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0B5FE8] hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
          >
            <Plus size={14} />
            Tambah Pengguna
          </button>
        </div>

        {/* ── Pencarian ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari username / role / NIP…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* ── Tabel ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse" style={{ minWidth: 600 }}>
              <thead>
                <tr className="bg-[#0B2B4F] text-white">
                  <th className={`${th} w-20`}>NO</th>
                  <th className={`${th} text-left`}>USERNAME</th>
                  <th className={`${th} text-left`}>NIP</th>
                  <th className={th}>ROLE</th>
                  <th className={`${th} w-72`}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-slate-400 text-sm">
                      <Users size={32} className="mx-auto mb-2 text-slate-300" />
                      Pengguna tidak ditemukan
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, idx) => {
                    const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';
                    const roleLabel = capitalize(r.role);
                    return (
                      <tr key={r.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className={`border border-slate-200 px-3 py-2 text-center font-medium text-slate-500 ${rowBg}`}>
                          {idx + 1}
                        </td>
                        <td className={`border border-slate-200 px-3 py-2 text-left font-semibold text-slate-800 ${rowBg}`}>
                          {r.username}
                        </td>
                        <td className={`border border-slate-200 px-3 py-2 text-left text-slate-700 whitespace-nowrap ${rowBg}`}>
                          {r.nip || '-'}
                        </td>
                        <td className={`border border-slate-200 px-3 py-2 text-center ${rowBg}`}>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${ROLE_BADGE[roleLabel] || 'bg-slate-100 text-slate-600'}`}>
                            {roleLabel}
                          </span>
                        </td>
                        <td className={`border border-slate-200 px-3 py-2 text-center ${rowBg}`}>
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setPasswordTarget(r)}
                              className={`${linkBtn} bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200/60`}
                            >
                              Ubah Password
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditTarget({ ...r, role: roleLabel })}
                              className={`${linkBtn} bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200/60`}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(r)}
                              className={`${linkBtn} bg-red-50 text-red-600 hover:bg-red-100 border-red-200/60`}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Modal Tambah ── */}
      <Create
        open={showCreate}
        onClose={closeCreate}
        onSave={handleCreate}
        existing={users.map((r) => r.username)}
        roles={ROLES}
        serverErrors={formErrors}
      />

      {/* ── Modal Edit ── */}
      <Edit
        open={editTarget !== null}
        pengguna={editTarget}
        onClose={closeEdit}
        onSave={handleUpdate}
        existing={users}
        roles={ROLES}
        serverErrors={formErrors}
      />

      {/* ── Modal Ubah Password ── */}
      <UbahPassword
        open={passwordTarget !== null}
        pengguna={passwordTarget}
        onClose={closePassword}
        onSave={handleChangePassword}
        serverErrors={formErrors}
      />

      {/* ── Modal Konfirmasi Hapus ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Hapus Pengguna?</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Anda yakin ingin menghapus pengguna{' '}
              <span className="font-bold text-slate-700">{deleteTarget.username}</span>?
              <br />
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center gap-3 mt-6 w-full">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Tidak
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-sm transition"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
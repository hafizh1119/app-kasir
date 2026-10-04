import React, { useState, useMemo, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayouts';
import { Search, X, DoorOpen, Plus, Pencil, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import Create from './Create';
import Edit from './Edit';

// Sesuai route: Route::prefix('datamaster') + resource('ruangan')
const BASE = '/datamaster/ruangan';

// ─── Halaman Utama ────────────────────────────────────────────────────────────
export default function RuanganIndex({ data: rows = [] }) {
  const { flash } = usePage().props;

  // Kolom di database bernama "ruangan", di halaman ini dipakai sebagai "nama"
  const data = useMemo(() => rows.map((r) => ({ id: r.id, nama: r.ruangan })), [rows]);

  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);     // { id, nama }
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, nama }
  const [toast, setToast] = useState(null);               // { type: 'success' | 'error', text }
  const [formErrors, setFormErrors] = useState({});       // error validasi dari server

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
    return q === '' ? data : data.filter((r) => r.nama.toLowerCase().includes(q));
  }, [data, search]);

  // Tutup modal sekaligus bersihkan error server
  const closeCreate = () => { setShowCreate(false); setFormErrors({}); };
  const closeEdit = () => { setEditTarget(null); setFormErrors({}); };

  // ── Aksi ke server (modal tetap terbuka kalau gagal) ──
  const handleCreate = (nama) => {
    router.post(
      BASE,
      { ruangan: nama },
      {
        preserveScroll: true,
        onStart: () => setFormErrors({}),
        onSuccess: () => {
          closeCreate();
          setSearch('');
        },
        onError: (errors) => setFormErrors(errors),
      }
    );
  };

  const handleUpdate = (id, nama) => {
    router.put(
      `${BASE}/${id}`,
      { ruangan: nama },
      {
        preserveScroll: true,
        onStart: () => setFormErrors({}),
        onSuccess: closeEdit,
        onError: (errors) => setFormErrors(errors),
      }
    );
  };

  const handleDelete = () => {
    router.delete(`${BASE}/${deleteTarget.id}`, {
      preserveScroll: true,
      onFinish: () => setDeleteTarget(null),
    });
  };

  const th = 'border border-blue-900 px-3 py-2.5 text-center font-bold';

  return (
    <AdminLayout title="Ruangan">
      <Head title="Ruangan" />

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
            <h2 className="text-lg font-bold text-slate-800">Data Master Ruangan</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan <span className="font-semibold text-slate-700">{filtered.length}</span> ruangan
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0B5FE8] hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
          >
            <Plus size={14} />
            Tambah Ruangan
          </button>
        </div>

        {/* ── Pencarian ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari ruangan…"
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
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[#0B2B4F] text-white">
                  <th className={`${th} w-20`}>NO</th>
                  <th className={`${th} text-left`}>RUANGAN</th>
                  <th className={`${th} w-48`}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-16 text-slate-400 text-sm">
                      <DoorOpen size={32} className="mx-auto mb-2 text-slate-300" />
                      Ruangan tidak ditemukan
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, idx) => {
                    const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';
                    return (
                      <tr key={r.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className={`border border-slate-200 px-3 py-2 text-center font-medium text-slate-500 ${rowBg}`}>
                          {idx + 1}
                        </td>
                        <td className={`border border-slate-200 px-3 py-2 text-left font-semibold text-slate-800 ${rowBg}`}>
                          {r.nama}
                        </td>
                        <td className={`border border-slate-200 px-3 py-2 text-center ${rowBg}`}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditTarget(r)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200/60 text-[11px] font-semibold transition-colors"
                              title="Edit ruangan"
                            >
                              <Pencil size={12} />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(r)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/60 text-[11px] font-semibold transition-colors"
                              title="Hapus ruangan"
                            >
                              <Trash2 size={12} />
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
        existing={data.map((r) => r.nama)}
        serverError={formErrors.ruangan}
      />

      {/* ── Modal Edit ── */}
      <Edit
        open={editTarget !== null}
        ruangan={editTarget}
        onClose={closeEdit}
        onSave={handleUpdate}
        existing={data}
        serverError={formErrors.ruangan}
      />

      {/* ── Modal Konfirmasi Hapus ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Hapus Ruangan?</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Anda yakin ingin menghapus ruangan{' '}
              <span className="font-bold text-slate-700">{deleteTarget.nama}</span>?
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
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-sm transition flex items-center justify-center gap-2"
              >
                <Trash2 size={14} />
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
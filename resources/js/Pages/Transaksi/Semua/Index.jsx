import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayouts';
import {
  Search, Calendar, CalendarDays, ChevronDown, Download,
  Filter, X, Pencil, Trash2, User,
} from 'lucide-react';

// ─── Konfigurasi jenis pelayanan ──────────────────────────────────────────────
const BASE_URL = '/transaksi';
const JENIS = {
  rawat_jalan: { label: 'Rawat Jalan', base: '/rawat-jalan', badge: 'bg-emerald-100 text-emerald-700' },
  igd:         { label: 'IGD',         base: '/igd',         badge: 'bg-rose-100 text-rose-700' },
  rawat_inap:  { label: 'Rawat Inap',  base: '/rawat-inap',  badge: 'bg-violet-100 text-violet-700' },
};
const TABS = [{ key: '', label: 'Semua' }, ...Object.entries(JENIS).map(([key, v]) => ({ key, label: v.label }))];

const SHIFT_BADGE = {
  pagi: 'bg-amber-100 text-amber-700',
  siang: 'bg-blue-100 text-blue-700',
  malam: 'bg-indigo-100 text-indigo-700',
};

// ─── Helper tanggal (waktu LOKAL, bukan UTC) ──────────────────────────────────
const toYMD = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const today = toYMD(new Date());

function getWeekRange(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const day = new Date(y, m - 1, d).getDay();
  const mon = new Date(y, m - 1, d - (day === 0 ? 6 : day - 1));
  const sun = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6);
  return { start: toYMD(mon), end: toYMD(sun) };
}

function getMonthRange(dateStr) {
  const [y, m] = dateStr.split('-').map(Number);
  return { start: toYMD(new Date(y, m - 1, 1)), end: toYMD(new Date(y, m, 0)) };
}

const rangeOf = (period, cs, ce) => {
  if (period === 'hari') return { start: today, end: today };
  if (period === 'minggu') return getWeekRange(today);
  if (period === 'bulan') return getMonthRange(today);
  return { start: cs, end: ce };
};

const fmtTgl = (iso) => (iso ? iso.split('-').reverse().join('/') : '-');
const rp = (n) => (n || 0).toLocaleString('id-ID');
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '');

// ─── Komponen kecil ───────────────────────────────────────────────────────────
function PeriodBtn({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
        active
          ? 'bg-[#0B5FE8] text-white border-[#0B5FE8] shadow-sm'
          : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
      }`}
    >
      {label}
    </button>
  );
}

// ─── Halaman Utama ────────────────────────────────────────────────────────────
export default function PelayananIndex({ data = [], petugas = [] }) {
  const [tab, setTab] = useState(''); // '' | rawat_jalan | igd | rawat_inap
  const [f, setF] = useState({
    period: 'bulan', customStart: today, customEnd: today, shift: '', userId: '',
  });
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null); // { jenis, id, nama, label }

  const { start: rangeStart, end: rangeEnd } = rangeOf(f.period, f.customStart, f.customEnd);

  // Ubah filter → minta data ke server sesuai periode/shift/petugas
  const apply = (patch = {}) => {
    const n = { ...f, ...patch };
    setF(n);
    const { start, end } = rangeOf(n.period, n.customStart, n.customEnd);
    router.get(
      BASE_URL,
      {
        tanggal_awal: start,
        tanggal_akhir: end,
        shift: n.shift || undefined,
        user_id: n.userId || undefined,
      },
      { preserveState: true, preserveScroll: true, replace: true }
    );
  };

  // Pencarian (client) → dipakai juga untuk hitungan di tab
  const baseFiltered = useMemo(() => {
    const q = search.toLowerCase();
    return q === ''
      ? data
      : data.filter((r) => r.nama.toLowerCase().includes(q) || r.no_rm.includes(search));
  }, [data, search]);

  const filtered = useMemo(
    () => (tab === '' ? baseFiltered : baseFiltered.filter((r) => r.jenis === tab)),
    [baseFiltered, tab]
  );

  // Hitungan & total per jenis untuk tab
  const summary = useMemo(() => {
    const s = { '': { count: baseFiltered.length, total: 0 } };
    Object.keys(JENIS).forEach((k) => { s[k] = { count: 0, total: 0 }; });
    baseFiltered.forEach((r) => {
      s[r.jenis].count += 1;
      s[r.jenis].total += r.jumlah;
      s[''].total += r.jumlah;
    });
    return s;
  }, [baseFiltered]);

  const total = summary[tab].total;
  const hasFilter = search !== '' || f.shift !== '' || f.userId !== '' || f.period !== 'bulan';

  const clearFilters = () => {
    setSearch('');
    apply({ period: 'bulan', shift: '', userId: '' });
  };

  const handleDelete = () => {
    router.delete(`${JENIS[deleteTarget.jenis].base}/${deleteTarget.id}`, {
      preserveScroll: true,
      onFinish: () => setDeleteTarget(null),
    });
  };

  const th = 'border border-blue-900 px-2 py-2 text-center font-bold whitespace-nowrap';
  const dateInput =
    'text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400';
  const selectCls =
    'pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 appearance-none cursor-pointer';

  return (
    <AdminLayout title="Pelayanan">
      <Head title="Pelayanan" />

      <div className="flex flex-col gap-4">
        {/* ── Header ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Data Pelayanan</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan <span className="font-semibold text-slate-700">{filtered.length}</span> data
              {tab !== '' && <> · {JENIS[tab].label}</>}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:border-slate-300 transition shadow-sm"
          >
            <Download size={14} />
            Export Excel
          </button>
        </div>

        {/* ── Tab Jenis Pelayanan ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key || 'semua'}
                type="button"
                onClick={() => setTab(t.key)}
                className={`text-left rounded-2xl border p-3.5 transition shadow-sm ${
                  active
                    ? 'bg-[#0B2B4F] border-[#0B2B4F] text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{t.label}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {summary[t.key].count} pasien
                  </span>
                </div>
                <div className={`mt-2 text-base font-bold ${active ? 'text-white' : 'text-slate-800'}`}>
                  Rp {rp(summary[t.key].total)}
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Panel Filter ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mr-1">
              <Calendar size={13} /> Periode:
            </span>
            <PeriodBtn label="Hari Ini"   active={f.period === 'hari'}   onClick={() => apply({ period: 'hari' })} />
            <PeriodBtn label="Minggu Ini" active={f.period === 'minggu'} onClick={() => apply({ period: 'minggu' })} />
            <PeriodBtn label="Bulan Ini"  active={f.period === 'bulan'}  onClick={() => apply({ period: 'bulan' })} />
            <PeriodBtn label="Custom"     active={f.period === 'custom'} onClick={() => apply({ period: 'custom' })} />

            {f.period === 'custom' ? (
              <div className="flex items-center gap-2 ml-1">
                <input
                  type="date"
                  value={f.customStart}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (!v) return;
                    apply({ customStart: v, customEnd: f.customEnd < v ? v : f.customEnd });
                  }}
                  className={dateInput}
                />
                <span className="text-slate-400 text-xs">s/d</span>
                <input
                  type="date"
                  value={f.customEnd}
                  min={f.customStart}
                  onChange={(e) => e.target.value && apply({ customEnd: e.target.value })}
                  className={dateInput}
                />
              </div>
            ) : (
              <span className="ml-1 text-[11px] text-slate-400 flex items-center gap-1">
                <CalendarDays size={12} />
                {rangeStart === rangeEnd ? rangeStart : `${rangeStart} – ${rangeEnd}`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama pasien / No. RM…"
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

            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select value={f.shift} onChange={(e) => apply({ shift: e.target.value })} className={selectCls}>
                <option value="">Semua Shift</option>
                <option value="pagi">Shift Pagi</option>
                <option value="siang">Shift Siang</option>
                <option value="malam">Shift Malam</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select value={f.userId} onChange={(e) => apply({ userId: e.target.value })} className={selectCls}>
                <option value="">Semua Petugas</option>
                {petugas.map((p) => (
                  <option key={p.id} value={p.id}>{p.username}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {hasFilter && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-red-200 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition"
              >
                <X size={12} /> Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* ── Tabel ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] border-collapse" style={{ minWidth: 850 }}>
              <thead>
                <tr className="bg-[#0B2B4F] text-white">
                  <th className={th}>NO</th>
                  <th className={th}>JENIS</th>
                  <th className={th}>TANGGAL</th>
                  <th className={th}>SHIFT</th>
                  <th className={th}>PETUGAS</th>
                  <th className={th}>NO RM</th>
                  <th className={th}>NAMA</th>
                  <th className={`${th} bg-blue-700`}>JUMLAH (Rp)</th>
                  <th className={`${th} bg-slate-700 sticky right-0`}>AKSI</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-slate-400 text-sm">
                      <CalendarDays size={32} className="mx-auto mb-2 text-slate-300" />
                      Tidak ada data untuk filter yang dipilih
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, idx) => {
                    const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';
                    const tdC = `border border-slate-200 px-2 py-1.5 text-center ${rowBg}`;
                    const j = JENIS[r.jenis];
                    return (
                      <tr key={r.key} className="hover:bg-blue-50/40 transition-colors group">
                        <td className={`${tdC} font-medium text-slate-500`}>{idx + 1}</td>
                        <td className={tdC}>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${j.badge}`}>
                            {j.label}
                          </span>
                        </td>
                        <td className={`${tdC} whitespace-nowrap text-slate-700`}>{fmtTgl(r.tanggal)}</td>
                        <td className={tdC}>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${SHIFT_BADGE[r.shift] ?? ''}`}>
                            {cap(r.shift)}
                          </span>
                        </td>
                        <td className={`${tdC} whitespace-nowrap text-slate-700`}>{r.petugas}</td>
                        <td className={`${tdC} font-semibold text-[#0B5FE8]`}>{r.no_rm}</td>
                        <td className={`border border-slate-200 px-2 py-1.5 text-left font-semibold text-slate-800 whitespace-nowrap ${rowBg}`}>
                          {r.nama}
                        </td>
                        <td className="border border-slate-200 px-2 py-1.5 text-right font-bold text-slate-800 bg-blue-50 group-hover:bg-blue-100 transition-colors">
                          {rp(r.jumlah)}
                        </td>
                        <td className="border border-slate-200 px-2 py-1.5 text-center bg-white sticky right-0 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.08)]">
                          <div className="flex items-center justify-center gap-1">
                            <Link
                              href={`${j.base}/${r.id}/edit`}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200/60 text-[10px] font-semibold transition-colors"
                              title="Edit pelayanan"
                            >
                              <Pencil size={11} /> Edit
                            </Link>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget({ jenis: r.jenis, id: r.id, nama: r.nama, label: j.label })}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/60 text-[10px] font-semibold transition-colors"
                              title="Hapus pelayanan"
                            >
                              <Trash2 size={11} /> Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {filtered.length > 0 && (
                <tfoot>
                  <tr className="bg-[#0B2B4F] text-white font-bold text-[11px]">
                    <td colSpan={7} className="border border-blue-900 px-3 py-2 text-center tracking-wider text-blue-200">
                      TOTAL ({filtered.length} pasien)
                    </td>
                    <td className="border border-blue-700 px-2 py-2 text-right bg-blue-700 text-base">
                      {rp(total)}
                    </td>
                    <td className="border border-blue-900 px-2 py-2 bg-[#0B2B4F] sticky right-0"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {/* ── Modal Konfirmasi Hapus ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Hapus Pelayanan?</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Anda yakin ingin menghapus data {deleteTarget.label} atas nama{' '}
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
                Batal
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
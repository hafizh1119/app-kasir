import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayouts';
import {
  Search, Calendar, CalendarDays, ChevronDown, Download, Filter,
  User, X, Pencil, Trash2, Plus,
} from 'lucide-react';
import {
  KEYS, toYMD, getWeekRange, getMonthRange, exportIgd,
} from '@/utils/igd';

const BASE_URL = '/igd';
const today = toYMD(new Date());

const num = (v) => Number(v) || 0;
const fmt = (n) => (n ? n.toLocaleString('id-ID') : '');
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '');

const rangeOf = (period, cs, ce) => {
  if (period === 'hari') return { start: today, end: today };
  if (period === 'minggu') return getWeekRange(today);
  if (period === 'bulan') return getMonthRange(today);
  return { start: cs, end: ce };
};

const SHIFT_BADGE = {
  pagi: 'bg-amber-100 text-amber-700',
  siang: 'bg-blue-100 text-blue-700',
  malam: 'bg-indigo-100 text-indigo-700',
};

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

export default function IgdIndex({ data = [], petugas = [] }) {
  const [f, setF] = useState({
    period: 'bulan', customStart: today, customEnd: today, shift: '', userId: '',
  });
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

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

  // Normalisasi data dari server (angka desimal → number)
  const rows = useMemo(
    () =>
      data.map((r) => {
        const o = {
          id: r.id,
          no_rm: r.pasien?.no_rm ?? '',
          nama: r.pasien?.nama ?? '',
          petugas: r.user?.username ?? '-',
          nip: r.user?.nip ?? '',
          shift: r.shift,
          tanggal: String(r.tanggal_pelayanan).slice(0, 10),
        };
        KEYS.forEach((k) => { o[k] = num(r[k]); });
        o.jumlah = KEYS.reduce((s, k) => s + o[k], 0);
        return o;
      }),
    [data]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q === ''
      ? rows
      : rows.filter((r) => r.nama.toLowerCase().includes(q) || r.no_rm.includes(search));
  }, [rows, search]);

  const totals = useMemo(() => {
    const t = {};
    KEYS.forEach((k) => { t[k] = filtered.reduce((s, r) => s + r[k], 0); });
    t.jumlah = filtered.reduce((s, r) => s + r.jumlah, 0);
    return t;
  }, [filtered]);

  const hasFilter = search !== '' || f.shift !== '' || f.userId !== '' || f.period !== 'bulan';

  const clearFilters = () => {
    setSearch('');
    apply({ period: 'bulan', shift: '', userId: '' });
  };

  const handleDelete = () => {
    router.delete(`${BASE_URL}/${deleteTarget.id}`, {
      preserveScroll: true,
      onFinish: () => setDeleteTarget(null),
    });
  };

  const thBase = 'border border-blue-900 px-2 text-center font-bold';
  const tfTd = 'border border-blue-900 px-2 py-2 text-right';
  const dateInput =
    'text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400';
  const selectCls =
    'pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 appearance-none cursor-pointer';

  return (
    <AdminLayout title="IGD">
      <Head title="IGD" />

      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Data Transaksi IGD</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan <span className="font-semibold text-slate-700">{filtered.length}</span> data
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportIgd({ rows: filtered, totals, rangeStart, rangeEnd, shift: f.shift })}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:border-slate-300 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={14} />
              Export Excel
            </button>
            <Link
              href={`${BASE_URL}/create`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0B5FE8] hover:bg-[#094EC2] text-white text-xs font-bold shadow-sm transition"
            >
              <Plus size={14} />
              Tambah Data
            </Link>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mr-1">
              <Calendar size={13} /> Periode:
            </span>
            <PeriodBtn label="Hari Ini"   active={f.period === 'hari'}   onClick={() => apply({ period: 'hari' })} />
            <PeriodBtn label="Minggu Ini" active={f.period === 'minggu'} onClick={() => apply({ period: 'minggu' })} />
            <PeriodBtn label="Bulan Ini"  active={f.period === 'bulan'}  onClick={() => apply({ period: 'bulan' })} />
            <PeriodBtn label="Custom"     active={f.period === 'custom'} onClick={() => apply({ period: 'custom' })} />

            {f.period === 'custom' && (
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
            )}

            {f.period !== 'custom' && (
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

        {/* Tabel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] border-collapse" style={{ minWidth: 1400 }}>
              <thead>
                <tr className="bg-[#0B2B4F] text-white">
                  <th rowSpan={2} className={`${thBase} py-2`}>NO</th>
                  <th rowSpan={2} className={`${thBase} py-2 whitespace-nowrap`}>PETUGAS</th>
                  <th rowSpan={2} className={`${thBase} py-2 whitespace-nowrap`}>TANGGAL<br />PELAYANAN</th>
                  <th rowSpan={2} className={`${thBase} py-2 whitespace-nowrap`}>SHIFT</th>
                  <th rowSpan={2} className={`${thBase} py-2 whitespace-nowrap`}>NO RM</th>
                  <th rowSpan={2} className={`${thBase} py-2`}>NAMA</th>
                  <th rowSpan={2} className={`${thBase} py-2 whitespace-nowrap`}>JASA SARANA</th>
                  <th colSpan={2} className={`${thBase} py-1.5`}>PX DOKTER</th>
                  <th colSpan={7} className={`${thBase} py-1.5`}>TINDAKAN</th>
                  <th colSpan={3} className={`${thBase} py-1.5`}>PENUNJANG</th>
                  <th rowSpan={2} className={`${thBase} py-2`}>O2</th>
                  <th rowSpan={2} className={`${thBase} py-2`}>IPJ</th>
                  <th rowSpan={2} className={`${thBase} py-2`}>AMBLN</th>
                  <th rowSpan={2} className={`${thBase} py-2 whitespace-nowrap`}>AKOMODASI</th>
                  <th rowSpan={2} className={`${thBase} py-2`}>OBAT</th>
                  <th rowSpan={2} className={`${thBase} py-2 bg-blue-700`}>JUMLAH</th>
                  <th rowSpan={2} className={`${thBase} py-2 bg-slate-700 sticky right-0`}>AKSI</th>
                </tr>
                <tr className="bg-[#1D3F6E] text-white text-[10px]">
                  {['UMUM', 'SPESIALIS', 'KONSUL', 'ASKEP', 'PNM', 'TMNO', 'KEP', 'TMO', 'PERSAL', 'LAB', 'RO', 'USG'].map((h) => (
                    <th key={h} className="border border-blue-900 px-2 py-1.5 text-center">{h}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={26} className="text-center py-16 text-slate-400 text-sm">
                      <CalendarDays size={32} className="mx-auto mb-2 text-slate-300" />
                      Tidak ada data untuk filter yang dipilih
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, idx) => {
                    const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';
                    const td = `border border-slate-200 px-2 py-1.5 text-right ${rowBg}`;
                    const tdC = `border border-slate-200 px-2 py-1.5 text-center ${rowBg}`;
                    const tdL = `border border-slate-200 px-2 py-1.5 text-left ${rowBg}`;
                    return (
                      <tr key={r.id} className="hover:bg-blue-50/40 transition-colors group">
                        <td className={`${tdC} font-medium text-slate-500`}>{idx + 1}</td>
                        <td className={`${tdC} whitespace-nowrap text-slate-700`}>{r.petugas}</td>
                        <td className={`${tdC} whitespace-nowrap text-slate-700`}>
                          {r.tanggal.split('-').reverse().join('/')}
                        </td>
                        <td className={tdC}>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${SHIFT_BADGE[r.shift] ?? ''}`}>
                            {cap(r.shift)}
                          </span>
                        </td>
                        <td className={`${tdC} font-semibold text-[#0B5FE8]`}>{r.no_rm}</td>
                        <td className={`${tdL} font-semibold text-slate-800 whitespace-nowrap`}>{r.nama}</td>
                        {KEYS.map((k) => (
                          <td key={k} className={td}>{fmt(r[k])}</td>
                        ))}
                        <td className="border border-slate-200 px-2 py-1.5 text-right font-bold text-slate-800 bg-blue-50 group-hover:bg-blue-100 transition-colors">
                          {r.jumlah.toLocaleString('id-ID')}
                        </td>
                        <td className="border border-slate-200 px-2 py-1.5 text-center bg-white sticky right-0 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.08)]">
                          <div className="flex items-center justify-center gap-1">
                            <Link
                              href={`${BASE_URL}/${r.id}/edit`}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200/60 text-[10px] font-semibold transition-colors"
                              title="Edit transaksi"
                            >
                              <Pencil size={11} />
                              Edit
                            </Link>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget({ id: r.id, nama: r.nama })}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/60 text-[10px] font-semibold transition-colors"
                              title="Hapus transaksi"
                            >
                              <Trash2 size={11} />
                              Hapus
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
                    <td colSpan={6} className="border border-blue-900 px-3 py-2 text-center tracking-wider text-blue-200">
                      TOTAL ({filtered.length} pasien)
                    </td>
                    {KEYS.map((k) => (
                      <td key={k} className={tfTd}>{fmt(totals[k])}</td>
                    ))}
                    <td className="border border-blue-700 px-2 py-2 text-right bg-blue-700 text-lg">
                      {totals.jumlah.toLocaleString('id-ID')}
                    </td>
                    <td className="border border-blue-900 px-2 py-2 bg-[#0B2B4F] sticky right-0"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {/* Modal Hapus */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Hapus Transaksi?</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Anda yakin ingin menghapus data transaksi atas nama{' '}
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
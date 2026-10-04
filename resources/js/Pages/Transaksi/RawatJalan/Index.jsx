import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayouts';
import * as XLSX from 'xlsx-js-style';
import {
  Search,
  Calendar,
  CalendarDays,
  ChevronDown,
  Download,
  Filter,
  User,
  X,
  Pencil,
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

// ─── Konfigurasi ──────────────────────────────────────────────────────────────
// URL resource rawat jalan (cek: php artisan route:list --name=rawat-jalan)
const URL_BASE = '/rawat-jalan';

const BENDAHARA_NAMA = 'Kadiyono';
const BENDAHARA_NIP = 'NIP. 19730519 201001 1 001';

// ─── Helper tanggal (waktu LOKAL, bukan UTC) ──────────────────────────────────
const toYMD = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const formatTanggalID = (ymd) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const now = new Date();
const today = toYMD(now);

function getWeekRange(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay();
  const mon = new Date(y, m - 1, d - (day === 0 ? 6 : day - 1));
  const sun = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6);
  return { start: toYMD(mon), end: toYMD(sun) };
}

function getMonthRange(dateStr) {
  const [y, m] = dateStr.split('-').map(Number);
  return {
    start: toYMD(new Date(y, m - 1, 1)),
    end: toYMD(new Date(y, m, 0)),
  };
}

// ─── Kolom biaya (urutan tampilan) ────────────────────────────────────────────
// ADMISI | VISIT DR (UMUM, SPESIALIS) | KONSUL (DOKTER, GIZI) | TINDAKAN (TMNO, KEP, TMO) | PENUNJANG (LAB, RO, USG) | OBAT
const KEYS = [
  'admisi',
  'umum', 'spesialis',
  'konsul_dokter', 'konsul_gizi',
  'tmno', 'kep', 'tmo',
  'lab', 'ro', 'usg',
  'obat',
];

// ─── Helper format ────────────────────────────────────────────────────────────
const fmt = (n) => (n ? n.toLocaleString('id-ID') : '');
const jumlah = (r) => KEYS.reduce((s, k) => s + (r[k] || 0), 0);
const cap = (s = '') => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
const num = (v) => Number(v) || 0;

// Ubah data dari Laravel menjadi bentuk yang dipakai tabel
const mapRow = (r) => ({
  id: r.id,
  no_rm: r.pasien?.no_rm ?? '',
  nama: r.pasien?.nama ?? '',
  petugas: r.user?.username ?? '-',
  shift: cap(r.shift),
  poliklinik: r.poliklinik?.poliklinik ?? '-',
  tanggal: String(r.tanggal_pelayanan).slice(0, 10),
  admisi: num(r.admisi),
  umum: num(r.visit_umum),
  spesialis: num(r.visit_spesialis),
  konsul_dokter: num(r.konsul_dokter),
  konsul_gizi: num(r.konsul_gizi),
  tmno: num(r.tmno),
  kep: num(r.kep),
  tmo: num(r.tmo),
  lab: num(r.lab),
  ro: num(r.ro),
  usg: num(r.usg),
  obat: num(r.obat),
});

// ─── Komponen Filter Pill ─────────────────────────────────────────────────────
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

// ─── Halaman Utama ─────────────────────────────────────────────────────────────
export default function RawatJalanIndex({ data: rows = [], petugas: petugasOpts = [] }) {
  const { flash } = usePage().props;

  // Data sudah difilter oleh server (periode, shift, petugas, pencarian)
  const filtered = useMemo(() => rows.map(mapRow), [rows]);

  const [period, setPeriod] = useState('bulan'); // hari | minggu | bulan | custom
  const [customStart, setCustomStart] = useState(today);
  const [customEnd, setCustomEnd] = useState(today);
  const [search, setSearch] = useState('');
  const [shift, setShift] = useState('');       // 'Pagi' | 'Siang' | 'Malam'
  const [petugas, setPetugas] = useState('');   // id user
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);     // { type: 'success' | 'error', text }

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

  const { rangeStart, rangeEnd } = useMemo(() => {
    if (period === 'hari') return { rangeStart: today, rangeEnd: today };
    if (period === 'minggu') {
      const w = getWeekRange(today);
      return { rangeStart: w.start, rangeEnd: w.end };
    }
    if (period === 'bulan') {
      const m = getMonthRange(today);
      return { rangeStart: m.start, rangeEnd: m.end };
    }
    return { rangeStart: customStart, rangeEnd: customEnd };
  }, [period, customStart, customEnd]);

  // Ambil ulang data dari server setiap filter berubah (pencarian ditunda 300 ms)
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const t = setTimeout(
      () => {
        router.get(
          URL_BASE,
          {
            tanggal_awal: rangeStart,
            tanggal_akhir: rangeEnd,
            q: search.trim() || undefined,
            shift: shift ? shift.toLowerCase() : undefined,
            user_id: petugas || undefined,
          },
          { preserveState: true, preserveScroll: true, replace: true, only: ['data', 'total'] }
        );
      },
      search ? 300 : 0
    );
    return () => clearTimeout(t);
  }, [rangeStart, rangeEnd, search, shift, petugas]);

  const totals = useMemo(() => {
    const t = {};
    KEYS.forEach((k) => { t[k] = filtered.reduce((s, r) => s + (r[k] || 0), 0); });
    t.jumlah = filtered.reduce((s, r) => s + jumlah(r), 0);
    return t;
  }, [filtered]);

  const clearFilters = () => {
    setSearch('');
    setShift('');
    setPetugas('');
    setPeriod('bulan');
  };

  const hasFilter = search !== '' || shift !== '' || petugas !== '' || period !== 'bulan';

  const handleDelete = () => {
    router.delete(`${URL_BASE}/${deleteTarget.id}`, {
      preserveScroll: true,
      onFinish: () => setDeleteTarget(null),
    });
  };

  // ─── Export Excel (sesuai filter yang tampil) ───────────────────────────────
  // Kolom: NO | NO RM | NAMA | POLIKLINIK | ADMISI | VISIT DR(2) | KONSUL(2) | TINDAKAN(3) | PENUNJANG(3) | OBAT | JUMLAH
  const handleExport = () => {
    if (filtered.length === 0) return;

    const TOTAL_COLS = 17; // 4 identitas + 12 komponen biaya + 1 jumlah
    const LAST_COL = TOTAL_COLS - 1;

    // Posisi tanda tangan
    const SIG_LEFT_START = 1;
    const SIG_LEFT_END = 4;
    const SIG_RIGHT_START = 11;
    const SIG_RIGHT_END = 15;

    const blank = () => Array(TOTAL_COLS).fill('');

    const pendapatanText =
      rangeStart === rangeEnd
        ? `PENDAPATAN ${formatTanggalID(rangeStart).toUpperCase()}`
        : `PENDAPATAN ${formatTanggalID(rangeStart).toUpperCase()} S/D ${formatTanggalID(rangeEnd).toUpperCase()}`;

    const titleLines = [
      'DATA KUNJUNGAN PASIEN RAWAT JALAN',
      'STATUS PEMBAYARAN UMUM H2H',
      pendapatanText,
      'RSUD AJIBARANG',
    ];
    const titleRows = titleLines.map((t) => {
      const r = blank();
      r[0] = t;
      return r;
    });

    // ── Header tabel baris 1 & 2 ──
    const head1 = blank();
    const head2 = blank();

    head1[0] = 'NO';
    head1[1] = 'NO RM';
    head1[2] = 'NAMA';
    head1[3] = 'POLIKLINIK';
    head1[4] = 'ADMISI';
    head1[5] = 'VISIT DR';
    head1[7] = 'KONSUL';
    head1[9] = 'TINDAKAN';
    head1[12] = 'PENUNJANG';
    head1[15] = 'OBAT';
    head1[16] = 'JUMLAH';

    ['UMUM', 'SPESIALIS', 'DOKTER', 'GIZI', 'TMNO', 'KEP', 'TMO', 'LAB', 'RO', 'USG']
      .forEach((h, i) => { head2[5 + i] = h; });

    // ── Baris data ──
    const body = filtered.map((r, idx) => [
      idx + 1,
      r.no_rm,
      r.nama,
      r.poliklinik,
      ...KEYS.map((k) => (r[k] ? r[k] : '')),
      jumlah(r),
    ]);

    // ── Baris total ──
    const totalRow = blank();
    totalRow[0] = `TOTAL (${filtered.length} pasien)`;
    KEYS.forEach((k, i) => { totalRow[4 + i] = totals[k] ? totals[k] : ''; });
    totalRow[16] = totals.jumlah;

    // ── Tanda tangan (nama & NIP kasir diambil dari data pengguna) ──
    const tanggalCetak = formatTanggalID(toYMD(new Date()));
    const kasirLabel = shift ? `Kasir Shift ${shift}` : 'Kasir Semua Shift';
    const petugasDipilih = petugasOpts.find((p) => String(p.id) === String(petugas));
    const kasirList = petugasDipilih
      ? [petugasDipilih.username]
      : [...new Set(filtered.map((r) => r.petugas))].sort((a, b) => a.localeCompare(b));
    const kasirNama = kasirList.map(cap).join(', ');
    const kasirNipList = kasirList
      .map((u) => petugasOpts.find((p) => p.username === u)?.nip)
      .filter(Boolean);
    const kasirNip = kasirNipList.length ? `NIP. ${kasirNipList.join(', ')}` : '';

    const sig0 = blank(); sig0[SIG_RIGHT_START] = `Ajibarang, ${tanggalCetak}`;
    const sig1 = blank(); sig1[SIG_LEFT_START] = 'Bendahara Penerimaan'; sig1[SIG_RIGHT_START] = kasirLabel;
    const sig2 = blank();
    const sig3 = blank();
    const sig4 = blank(); sig4[SIG_LEFT_START] = BENDAHARA_NAMA; sig4[SIG_RIGHT_START] = kasirNama;
    const sig5 = blank(); sig5[SIG_LEFT_START] = BENDAHARA_NIP; sig5[SIG_RIGHT_START] = kasirNip;

    // ── Susun baris & posisi ──
    const R_H1 = titleRows.length + 1;
    const R_H2 = R_H1 + 1;
    const R_BODY = R_H2 + 1;
    const R_TOTAL = R_BODY + body.length;
    const R_SIG = R_TOTAL + 2;

    const aoa = [
      ...titleRows,
      blank(),
      head1,
      head2,
      ...body,
      totalRow,
      blank(),
      sig0, sig1, sig2, sig3, sig4, sig5,
    ];

    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // ── Merge ──
    const merges = [];

    titleRows.forEach((_, i) => {
      merges.push({ s: { r: i, c: 0 }, e: { r: i, c: LAST_COL } });
    });

    // Header: kolom yang digabung 2 baris
    [0, 1, 2, 3, 4, 15, 16].forEach((c) => {
      merges.push({ s: { r: R_H1, c }, e: { r: R_H2, c } });
    });
    merges.push({ s: { r: R_H1, c: 5 }, e: { r: R_H1, c: 6 } });    // VISIT DR
    merges.push({ s: { r: R_H1, c: 7 }, e: { r: R_H1, c: 8 } });    // KONSUL
    merges.push({ s: { r: R_H1, c: 9 }, e: { r: R_H1, c: 11 } });   // TINDAKAN
    merges.push({ s: { r: R_H1, c: 12 }, e: { r: R_H1, c: 14 } });  // PENUNJANG

    // Baris total: label menggabungkan NO s/d POLIKLINIK
    merges.push({ s: { r: R_TOTAL, c: 0 }, e: { r: R_TOTAL, c: 3 } });

    for (let i = 0; i < 6; i++) {
      const r = R_SIG + i;
      merges.push({ s: { r, c: SIG_LEFT_START }, e: { r, c: SIG_LEFT_END } });
      merges.push({ s: { r, c: SIG_RIGHT_START }, e: { r, c: SIG_RIGHT_END } });
    }

    ws['!merges'] = merges;

    // ── Styling ──
    const thin = { style: 'thin', color: { rgb: '000000' } };
    const border = { top: thin, bottom: thin, left: thin, right: thin };

    const STYLE = {
      title: {
        font: { bold: true, sz: 12 },
        alignment: { horizontal: 'center', vertical: 'center' },
      },
      head: {
        font: { bold: true },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border,
      },
      center: { alignment: { horizontal: 'center', vertical: 'center' }, border },
      left: { alignment: { horizontal: 'left', vertical: 'center' }, border },
      right: { alignment: { horizontal: 'right', vertical: 'center' }, border },
      totalCenter: {
        font: { bold: true },
        alignment: { horizontal: 'center', vertical: 'center' },
        border,
      },
      totalRight: {
        font: { bold: true },
        alignment: { horizontal: 'right', vertical: 'center' },
        border,
      },
      sig: { alignment: { horizontal: 'center', vertical: 'center' } },
    };

    const paint = (r, c, style, numFmt) => {
      const addr = XLSX.utils.encode_cell({ r, c });
      if (!ws[addr]) ws[addr] = { t: 's', v: '' };
      ws[addr].s = style;
      if (numFmt && ws[addr].t === 'n') ws[addr].z = numFmt;
    };

    for (let r = 0; r < titleRows.length; r++) {
      for (let c = 0; c < TOTAL_COLS; c++) paint(r, c, STYLE.title);
    }

    for (let r = R_H1; r <= R_H2; r++) {
      for (let c = 0; c < TOTAL_COLS; c++) paint(r, c, STYLE.head);
    }

    for (let i = 0; i < body.length; i++) {
      const r = R_BODY + i;
      for (let c = 0; c < TOTAL_COLS; c++) {
        if (c === 2 || c === 3) paint(r, c, STYLE.left);
        else if (c <= 1) paint(r, c, STYLE.center);
        else paint(r, c, STYLE.right, '#,##0');
      }
    }

    for (let c = 0; c < TOTAL_COLS; c++) {
      if (c <= 3) paint(R_TOTAL, c, STYLE.totalCenter);
      else paint(R_TOTAL, c, STYLE.totalRight, '#,##0');
    }

    for (let i = 0; i < 6; i++) {
      const r = R_SIG + i;
      for (let c = 0; c < TOTAL_COLS; c++) paint(r, c, STYLE.sig);
    }

    ws['!cols'] = [
      { wch: 5 }, { wch: 10 }, { wch: 28 }, { wch: 16 },
      ...Array(12).fill({ wch: 11 }),
      { wch: 13 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rawat Jalan');

    const fileName =
      rangeStart === rangeEnd
        ? `rawat-jalan_${rangeStart}.xlsx`
        : `rawat-jalan_${rangeStart}_sd_${rangeEnd}.xlsx`;

    XLSX.writeFile(wb, fileName);
  };

  const thBase = 'border border-blue-900 px-2 text-center font-bold';
  const tfTd = 'border border-blue-900 px-2 py-2 text-right';

  return (
    <AdminLayout title="Rawat Jalan">
      <Head title="Rawat Jalan" />

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
            <h2 className="text-lg font-bold text-slate-800">Data Transaksi Rawat Jalan</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan <span className="font-semibold text-slate-700">{filtered.length}</span> data
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:border-slate-300 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={14} />
              Export Excel
            </button>
            <Link
              href={`${URL_BASE}/create`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0B5FE8] hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
            >
              <Plus size={14} />
              Tambah Transaksi
            </Link>
          </div>
        </div>

        {/* ── Panel Filter ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mr-1">
              <Calendar size={13} /> Periode:
            </span>
            <PeriodBtn label="Hari Ini"   active={period === 'hari'}   onClick={() => setPeriod('hari')} />
            <PeriodBtn label="Minggu Ini" active={period === 'minggu'} onClick={() => setPeriod('minggu')} />
            <PeriodBtn label="Bulan Ini"  active={period === 'bulan'}  onClick={() => setPeriod('bulan')} />
            <PeriodBtn label="Custom"     active={period === 'custom'} onClick={() => setPeriod('custom')} />

            {period === 'custom' && (
              <div className="flex items-center gap-2 ml-1">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => {
                    setCustomStart(e.target.value);
                    if (customEnd < e.target.value) setCustomEnd(e.target.value);
                  }}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                />
                <span className="text-slate-400 text-xs">s/d</span>
                <input
                  type="date"
                  value={customEnd}
                  min={customStart}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                />
              </div>
            )}

            {period !== 'custom' && (
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
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 appearance-none cursor-pointer"
              >
                <option value="">Semua Shift</option>
                <option value="Pagi">Shift Pagi</option>
                <option value="Siang">Shift Siang</option>
                <option value="Malam">Shift Malam</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={petugas}
                onChange={(e) => setPetugas(e.target.value)}
                className="pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 appearance-none cursor-pointer"
              >
                <option value="">Semua Petugas</option>
                {petugasOpts.map((p) => (
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
            <table className="w-full text-[11px] border-collapse" style={{ minWidth: 1300 }}>
              <thead>
                <tr className="bg-[#0B2B4F] text-white">
                  <th rowSpan={2} className={`${thBase} py-2`}>NO</th>
                  <th rowSpan={2} className={`${thBase} py-2 whitespace-nowrap`}>PETUGAS</th>
                  <th rowSpan={2} className={`${thBase} py-2 whitespace-nowrap`}>TANGGAL<br />PELAYANAN</th>
                  <th rowSpan={2} className={`${thBase} py-2 whitespace-nowrap`}>SHIFT</th>
                  <th rowSpan={2} className={`${thBase} py-2 whitespace-nowrap`}>NO RM</th>
                  <th rowSpan={2} className={`${thBase} py-2`}>NAMA</th>
                  <th rowSpan={2} className={`${thBase} py-2 whitespace-nowrap`}>POLIKLINIK</th>
                  <th rowSpan={2} className={`${thBase} py-2 whitespace-nowrap`}>ADMISI</th>
                  <th colSpan={2} className={`${thBase} py-1.5 whitespace-nowrap`}>VISIT DR</th>
                  <th colSpan={2} className={`${thBase} py-1.5`}>KONSUL</th>
                  <th colSpan={3} className={`${thBase} py-1.5`}>TINDAKAN</th>
                  <th colSpan={3} className={`${thBase} py-1.5`}>PENUNJANG</th>
                  <th rowSpan={2} className={`${thBase} py-2`}>OBAT</th>
                  <th rowSpan={2} className={`${thBase} py-2 bg-blue-700`}>JUMLAH</th>
                  <th rowSpan={2} className={`${thBase} py-2 bg-slate-700 sticky right-0`}>AKSI</th>
                </tr>
                <tr className="bg-[#1D3F6E] text-white text-[10px]">
                  {['UMUM', 'SPESIALIS', 'DOKTER', 'GIZI', 'TMNO', 'KEP', 'TMO', 'LAB', 'RO', 'USG'].map((h) => (
                    <th key={h} className="border border-blue-900 px-2 py-1.5 text-center">{h}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={21} className="text-center py-16 text-slate-400 text-sm">
                      <CalendarDays size={32} className="mx-auto mb-2 text-slate-300" />
                      Tidak ada data untuk filter yang dipilih
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, idx) => {
                    const total = jumlah(r);
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
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              r.shift === 'Pagi'
                                ? 'bg-amber-100 text-amber-700'
                                : r.shift === 'Siang'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-indigo-100 text-indigo-700'
                            }`}
                          >
                            {r.shift}
                          </span>
                        </td>
                        <td className={`${tdC} font-semibold text-[#0B5FE8]`}>{r.no_rm}</td>
                        <td className={`${tdL} font-semibold text-slate-800 whitespace-nowrap`}>{r.nama}</td>
                        <td className={`${tdL} whitespace-nowrap text-slate-700`}>{r.poliklinik}</td>
                        {KEYS.map((k) => (
                          <td key={k} className={td}>{fmt(r[k])}</td>
                        ))}
                        <td className="border border-slate-200 px-2 py-1.5 text-right font-bold text-slate-800 bg-blue-50 group-hover:bg-blue-100 transition-colors">
                          {total.toLocaleString('id-ID')}
                        </td>
                        {/* Kolom Aksi */}
                        <td className="border border-slate-200 px-2 py-1.5 text-center bg-white sticky right-0 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.08)]">
                          <div className="flex items-center justify-center gap-1">
                            <Link
                              href={`${URL_BASE}/${r.id}/edit`}
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

              {/* Baris Total */}
              {filtered.length > 0 && (
                <tfoot>
                  <tr className="bg-[#0B2B4F] text-white font-bold text-[11px]">
                    <td colSpan={7} className="border border-blue-900 px-3 py-2 text-center tracking-wider text-blue-200">
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

      {/* ── Modal Konfirmasi Hapus ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />

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
import React, { useState, useMemo, useEffect, useRef } from 'react';
import AdminLayout from '@/Layouts/AdminLayouts';
import { usePage, Link } from '@inertiajs/react';
import { motion, animate } from 'motion/react';
import {
  Wallet,
  UserCheck,
  Ambulance,
  BedDouble,
  Receipt,
  ArrowUpRight,
  List,
  CalendarDays,
} from 'lucide-react';

// ─── Konfigurasi jenis pelayanan (samakan dengan halaman Semua Transaksi) ─────
const JENIS = {
  rawat_jalan: {
    label: 'Rawat Jalan', href: '/rawat-jalan', icon: UserCheck,
    badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500',
    iconBox: 'bg-emerald-50 text-emerald-600',
  },
  igd: {
    label: 'IGD', href: '/igd', icon: Ambulance,
    badge: 'bg-rose-100 text-rose-700', bar: 'bg-rose-500',
    iconBox: 'bg-rose-50 text-rose-600',
  },
  rawat_inap: {
    label: 'Rawat Inap', href: '/rawat-inap', icon: BedDouble,
    badge: 'bg-violet-100 text-violet-700', bar: 'bg-violet-500',
    iconBox: 'bg-violet-50 text-violet-600',
  },
};
const SHIFTS = ['Pagi', 'Siang', 'Malam'];

// ─── Helper tanggal (waktu LOKAL, bukan UTC) ──────────────────────────────────
const toYMD = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const now = new Date();
const today = toYMD(now);

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

const fmtTgl = (iso) => iso.split('-').reverse().join('/');
const rp = (n) => `Rp ${Math.round(n || 0).toLocaleString('id-ID')}`;
const pct = (part, whole) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

// Format untuk angka yang beranimasi
const fRp = (n) => rp(n);
const fPasien = (n) => `${Math.round(n)} pasien`;
const fPasienDilayani = (n) => `${Math.round(n)} pasien dilayani`;
const fPersen = (n) => `${Math.round(n)}%`;

// ─── Animasi ──────────────────────────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1];

const stagger = (gap = 0.08) => ({
  hidden: {},
  show: { transition: { staggerChildren: gap } },
});

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

// Angka yang naik dari 0 (atau dari nilai sebelumnya) sampai nilai akhir
function CountUp({ value, format = (n) => Math.round(n).toLocaleString('id-ID'), duration = 1.4 }) {
  const ref = useRef(null);
  const last = useRef(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const controls = animate(last.current, value, {
      duration,
      ease: EASE,
      onUpdate: (v) => {
        last.current = v;
        node.textContent = format(v);
      },
    });

    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span ref={ref}>{format(0)}</span>;
}

const PERIODS = [
  { key: 'hari', label: 'Hari Ini' },
  { key: 'minggu', label: 'Minggu Ini' },
  { key: 'bulan', label: 'Bulan Ini' },
];

// ─── Halaman Utama ────────────────────────────────────────────────────────────
// `transaksi` dikirim dari DashboardController (minggu ini s/d bulan ini)
export default function Dashboard({ transaksi = [] }) {
  const { auth } = usePage().props;
  const userName = auth?.user?.username || auth?.user?.name || 'Petugas';
  const [period, setPeriod] = useState('hari');

  const tanggalPanjang = now.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const { start, end } = useMemo(() => {
    if (period === 'hari') return { start: today, end: today };
    if (period === 'minggu') return getWeekRange(today);
    return getMonthRange(today);
  }, [period]);

  const rows = useMemo(
    () => transaksi
      .filter((r) => r.tanggal >= start && r.tanggal <= end)
      .sort((a, b) => (a.tanggal < b.tanggal ? 1 : a.tanggal > b.tanggal ? -1 : 0)),
    [transaksi, start, end]
  );

  const stats = useMemo(() => {
    const total = rows.reduce((s, r) => s + r.jumlah, 0);

    const perJenis = Object.fromEntries(Object.keys(JENIS).map((k) => [k, { count: 0, total: 0 }]));
    const perShift = Object.fromEntries(SHIFTS.map((k) => [k, { count: 0, total: 0 }]));
    const petugasMap = {};

    rows.forEach((r) => {
      perJenis[r.jenis].count += 1;
      perJenis[r.jenis].total += r.jumlah;
      if (perShift[r.shift]) {
        perShift[r.shift].count += 1;
        perShift[r.shift].total += r.jumlah;
      }
      petugasMap[r.petugas] = petugasMap[r.petugas] || { nama: r.petugas, count: 0, total: 0 };
      petugasMap[r.petugas].count += 1;
      petugasMap[r.petugas].total += r.jumlah;
    });

    const perPetugas = Object.values(petugasMap).sort((a, b) => b.total - a.total);
    return { total, count: rows.length, perJenis, perShift, perPetugas };
  }, [rows]);

  const card = 'bg-white rounded-2xl border border-slate-200/80 shadow-sm';
  const periodLabel = PERIODS.find((p) => p.key === period).label.toLowerCase();

  return (
    <AdminLayout title="Dashboard">
      <motion.div
        className="space-y-6"
        variants={stagger(0.1)}
        initial="hidden"
        animate="show"
      >
        {/* ── Banner ── */}
        <motion.div
          variants={fadeUp}
          className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white shadow-lg"
          style={{ background: 'linear-gradient(135deg, #0B2B4F 0%, #1D5FE0 100%)' }}
        >
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold text-blue-100 mb-3 backdrop-blur-sm">
                <CalendarDays size={13} />
                {tanggalPanjang}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Selamat bertugas, {userName}
              </h2>
              <p className="mt-2 text-sm text-blue-100/90 leading-relaxed">
                Ringkasan pelayanan rawat jalan, IGD, dan rawat inap. Pilih periode di bawah untuk
                melihat jumlah pasien dan total penerimaan.
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="shrink-0">
              <Link
                href="/transaksi"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#0B2B4F] text-sm font-bold shadow-sm hover:bg-blue-50 transition"
              >
                <List size={16} />
                Lihat Semua Transaksi
              </Link>
            </motion.div>
          </div>

          {/* Bulatan cahaya yang melayang pelan */}
          <motion.div
            className="absolute right-0 bottom-0 translate-x-8 translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"
            animate={{ scale: [1, 1.15, 1], x: [0, -14, 0], y: [0, -10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -left-10 -top-10 w-48 h-48 bg-cyan-300/10 rounded-full blur-2xl pointer-events-none"
            animate={{ scale: [1, 1.2, 1], x: [0, 16, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* ── Pilih Periode ── */}
        <motion.div variants={fadeUp} className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-800">Ringkasan Pelayanan</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {start === end ? fmtTgl(start) : `${fmtTgl(start)} – ${fmtTgl(end)}`}
            </p>
          </div>
          <div className="inline-flex p-1 rounded-xl bg-white border border-slate-200 shadow-sm">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPeriod(p.key)}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  period === p.key ? 'text-white' : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                {period === p.key && (
                  <motion.span
                    layoutId="period-pill"
                    className="absolute inset-0 rounded-lg bg-[#0B5FE8] shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{p.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Kartu Ringkasan ── */}
        <motion.div
          variants={stagger(0.09)}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -3 }}
            className={`${card} p-5 flex items-center justify-between gap-3`}
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500">Total Penerimaan</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1 truncate">
                <CountUp value={stats.total} format={fRp} duration={1.8} />
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                <CountUp value={stats.count} format={fPasienDilayani} />
              </p>
            </div>
            <motion.div
              className="w-12 h-12 rounded-xl bg-blue-50 text-[#1D5FE0] flex items-center justify-center shrink-0"
              whileHover={{ rotate: -8, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              <Wallet size={22} />
            </motion.div>
          </motion.div>

          {Object.entries(JENIS).map(([key, j]) => {
            const Icon = j.icon;
            const s = stats.perJenis[key];
            return (
              <motion.div key={key} variants={fadeUp} whileHover={{ y: -3 }}>
                <Link
                  href={j.href}
                  className={`${card} p-5 flex items-center justify-between gap-3 h-full hover:shadow-md hover:border-slate-300 transition`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-500">{j.label}</p>
                    <h3 className="text-xl font-bold text-slate-800 mt-1">
                      <CountUp value={s.count} format={fPasien} duration={1.2} />
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      <CountUp value={s.total} format={fRp} duration={1.6} />
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${j.iconBox}`}>
                    <Icon size={22} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Rincian ── */}
        <motion.div variants={stagger(0.12)} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Komposisi per jenis */}
          <motion.div variants={fadeUp} className={`${card} p-5`}>
            <h4 className="text-sm font-bold text-slate-800">Komposisi Penerimaan</h4>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">Berdasarkan jenis pelayanan</p>
            <div className="flex flex-col gap-4">
              {Object.entries(JENIS).map(([key, j], i) => {
                const s = stats.perJenis[key];
                const p = pct(s.total, stats.total);
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700">{j.label}</span>
                      <span className="text-slate-500">
                        <CountUp value={s.total} format={fRp} duration={1.6} /> ·{' '}
                        <CountUp value={p} format={fPersen} duration={1.6} />
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${j.bar}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${p}%` }}
                        transition={{ duration: 1.4, ease: EASE, delay: 0.5 + i * 0.12 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Per shift */}
          <motion.div variants={fadeUp} className={`${card} p-5`}>
            <h4 className="text-sm font-bold text-slate-800">Per Shift</h4>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">Jumlah pasien dan penerimaan</p>
            <div className="flex flex-col gap-3">
              {SHIFTS.map((sh) => {
                const s = stats.perShift[sh];
                return (
                  <motion.div
                    key={sh}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-800">Shift {sh}</div>
                      <div className="text-xs text-slate-500">
                        <CountUp value={s.count} format={fPasien} duration={1.2} />
                      </div>
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                      <CountUp value={s.total} format={fRp} duration={1.6} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Per petugas */}
          <motion.div variants={fadeUp} className={`${card} p-5`}>
            <h4 className="text-sm font-bold text-slate-800">Per Petugas</h4>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">Diurutkan dari penerimaan terbesar</p>
            {stats.perPetugas.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Belum ada transaksi {periodLabel}.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {stats.perPetugas.map((p, i) => (
                  <motion.div
                    key={`${period}-${p.nama}`}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, ease: EASE, delay: 0.3 + i * 0.08 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                        {p.nama.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-800 truncate">{p.nama}</div>
                        <div className="text-xs text-slate-500">
                          <CountUp value={p.count} format={fPasien} duration={1.2} />
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-slate-800 shrink-0">
                      <CountUp value={p.total} format={fRp} duration={1.6} />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* ── Transaksi Terbaru ── */}
        <motion.div variants={fadeUp} className={`${card} overflow-hidden`}>
          <div className="flex items-center justify-between p-5 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Transaksi Terbaru</h4>
              <p className="text-xs text-slate-500 mt-0.5">6 transaksi terakhir {periodLabel}</p>
            </div>
            <Link href="/transaksi" className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B5FE8] hover:underline">
              Lihat semua <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse" style={{ minWidth: 640 }}>
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <th className="px-4 py-2.5 text-left font-semibold">Tanggal</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Jenis</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Pasien</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Petugas</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400">
                      <Receipt size={28} className="mx-auto mb-2 text-slate-300" />
                      Belum ada transaksi {periodLabel}
                    </td>
                  </tr>
                ) : (
                  rows.slice(0, 6).map((r, i) => (
                    <motion.tr
                      key={`${period}-${r.key}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: EASE, delay: 0.4 + i * 0.07 }}
                      className="border-t border-slate-100 hover:bg-blue-50/40 transition-colors"
                    >
                      <td className="px-4 py-2.5 whitespace-nowrap text-slate-600">{fmtTgl(r.tanggal)}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${JENIS[r.jenis].badge}`}>
                          {JENIS[r.jenis].label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="font-semibold text-slate-800">{r.nama}</div>
                        <div className="text-[10px] text-slate-500">No. RM {r.no_rm}</div>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">{r.petugas}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-slate-800 whitespace-nowrap">{rp(r.jumlah)}</td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
}
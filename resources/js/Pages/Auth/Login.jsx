import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  useAnimationControls,
} from 'motion/react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Check,
  ShieldCheck,
  UserCheck,
  Ambulance,
  BedDouble,
  Clock,
  MapPin,
  Info,
  Wallet,
} from 'lucide-react';

// ─── Konfigurasi (ganti sesuai instansi) ──────────────────────────────────────
// [DIHAPUS] DASHBOARD_URL dan DUMMY_USERS: redirect & validasi sekarang di Laravel

const INSTANSI = {
  nama: 'Rumah Sakit Umum Daerah',
  singkat: 'Kasir',
  sistem: 'Sistem Informasi Kasir',
  alamat: 'Jl. Raya Pancasan, Kaliumbul, Pancurendang, Kec. Ajibarang, Kabupaten Banyumas, Jawa Tengah 53163',
  telp: '(024) 123 4567',
  email: 'it@rsud.go.id',
  versi: 'v1.0.0',
  tahun: new Date().getFullYear(),
};

const LAYANAN = [
  { icon: UserCheck, label: 'Rawat Jalan', desc: 'Pembayaran poliklinik' },
  { icon: Ambulance, label: 'IGD', desc: 'Layanan gawat darurat' },
  { icon: BedDouble, label: 'Rawat Inap', desc: 'Tagihan perawatan' },
];

// ─── Animasi ──────────────────────────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

const slideLeft = {
  hidden: { opacity: 0, x: -24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
};

const shake = { x: [0, -10, 10, -8, 8, -4, 4, 0], transition: { duration: 0.45 } };

// ─── Orb background ───────────────────────────────────────────────────────────
function Orb({ className, x, y, duration }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      animate={{ x, y, scale: [1, 1.15, 0.95, 1] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
function Field({ icon: Icon, label, error, right, ...props }) {
  return (
    <motion.div variants={item}>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      <div className="group relative">
        <Icon
          size={18}
          className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
            error ? 'text-red-500' : 'text-slate-400 group-focus-within:text-[#0B5FE8]'
          }`}
        />
        <input
          {...props}
          className={`w-full h-[52px] py-3.5 pl-12 ${right ? 'pr-12' : 'pr-4'} rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-slate-50 border outline-none transition-all duration-300 ${
            error
              ? 'border-red-300 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-500/10'
              : 'border-slate-200 hover:border-slate-300 focus:border-[#3D8BFF] focus:bg-white focus:ring-4 focus:ring-[#3D8BFF]/15'
          }`}
        />
        {right}
      </div>
    </motion.div>
  );
}

// ─── Jam & tanggal langsung ───────────────────────────────────────────────────
function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).replace(/\./g, ':');
  const tgl = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
        <Clock size={18} className="text-blue-100" />
      </div>
      <div>
        <div className="text-lg font-bold text-white leading-none tabular-nums">{jam}</div>
        <div className="text-[11px] text-blue-100/80 mt-1">{tgl}</div>
      </div>
    </div>
  );
}

// ─── Halaman Login ────────────────────────────────────────────────────────────
export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | success
  const [error, setError] = useState('');

  const formControls = useAnimationControls();

  // Cahaya mengikuti kursor (panel kiri)
  const mx = useMotionValue(-600);
  const my = useMotionValue(-600);
  const sx = useSpring(mx, { stiffness: 110, damping: 22 });
  const sy = useSpring(my, { stiffness: 110, damping: 22 });
  const spotlight = useMotionTemplate`radial-gradient(480px circle at ${sx}px ${sy}px, rgba(255,255,255,0.12), transparent 70%)`;

  // [DIUBAH] Kirim ke Laravel lewat POST /login (sebelumnya cek DUMMY_USERS)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (status !== 'idle') return;

    setError('');
    setStatus('loading');

    router.post(
      '/login',
      { username: username.trim(), password, remember },
      {
        preserveScroll: true,
        onSuccess: () => setStatus('success'),
        onError: (errors) => {
          setStatus('idle');
          setPassword('');
          setError(errors.username || errors.password || 'Terjadi kesalahan, coba lagi');
          formControls.start(shake);
        },
        onFinish: () => {
          // Jaga-jaga kalau request gagal tanpa error validasi (mis. jaringan putus)
          setStatus((s) => (s === 'loading' ? 'idle' : s));
        },
      }
    );
  };

  return (
    <>
      <Head title={`Masuk - ${INSTANSI.sistem}`} />

      <div
        onMouseMove={(e) => {
          mx.set(e.clientX);
          my.set(e.clientY);
        }}
        className="min-h-screen w-full flex bg-white antialiased selection:bg-[#0B5FE8] selection:text-white"
      >
        {/* ═══════════════ PANEL KIRI: identitas instansi ═══════════════ */}
        <motion.aside
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative hidden lg:flex lg:w-[55%] xl:w-[58%] flex-col justify-between overflow-hidden p-12 xl:p-16 text-white"
          style={{ background: 'linear-gradient(135deg, #071E3D 0%, #0B2B4F 40%, #1D5FE0 100%)' }}
        >
          {/* Orb */}
          <Orb className="w-[460px] h-[460px] -top-32 -left-32 bg-[#3D8BFF]/30" x={[0, 70, -30, 0]} y={[0, 50, 90, 0]} duration={20} />
          <Orb className="w-[420px] h-[420px] -bottom-40 -right-24 bg-[#00D2B4]/20" x={[0, -60, 30, 0]} y={[0, -70, -20, 0]} duration={24} />

          {/* Grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.08]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
              backgroundSize: '56px 56px',
              maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
            }}
          />

          {/* Cahaya kursor */}
          <motion.div className="absolute inset-0 pointer-events-none" style={{ background: spotlight }} />

          {/* Garis EKG dekoratif */}
          <svg
            className="absolute left-0 right-0 bottom-28 w-full h-24 opacity-[0.18] pointer-events-none"
            viewBox="0 0 800 100"
            preserveAspectRatio="none"
            fill="none"
          >
            <motion.path
              d="M0 50 H180 L205 50 L225 15 L250 85 L272 30 L290 50 H470 L495 50 L515 10 L540 90 L562 28 L580 50 H800"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 1], opacity: [1, 1, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', times: [0, 0.7, 1] }}
            />
          </svg>

          {/* Atas: logo instansi */}
          <motion.div variants={container} initial="hidden" animate="show" className="relative z-10">
            <motion.div variants={slideLeft} className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: -8, scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3D8BFF] to-[#0B5FE8] flex items-center justify-center shadow-lg shadow-blue-900/40 ring-1 ring-white/20 flex-shrink-0"
              >
                <Wallet size={20} className="text-white" />
              </motion.div>
              <div className="min-w-0">
                <div className="text-white font-extrabold text-xl leading-none tracking-wide">
                  {INSTANSI.singkat}<span className="text-[#4D94FF]">.</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Tengah: judul + layanan */}
          <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 max-w-xl">
            <motion.span
              variants={slideLeft}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-blue-100 mb-5"
            >
              <ShieldCheck size={13} />
              Portal Internal Kasir
            </motion.span>

            <motion.h1 variants={slideLeft} className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.1]">
              {INSTANSI.sistem}
              <span className="text-[#5BA4FF]">.</span>
            </motion.h1>

            <motion.p variants={slideLeft} className="mt-4 text-sm xl:text-base text-blue-100/85 leading-relaxed">
              Kelola pembayaran dan penerimaan layanan rumah sakit dengan cepat, tertib, dan
              terdokumentasi dalam satu sistem terpadu.
            </motion.p>

            <motion.div variants={container} className="mt-8 grid grid-cols-3 gap-3">
              {LAYANAN.map(({ icon: Icon, label, desc }) => (
                <motion.div
                  key={label}
                  variants={slideLeft}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl bg-white/[0.07] border border-white/10 backdrop-blur-sm p-4"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mb-3">
                    <Icon size={18} className="text-blue-100" />
                  </div>
                  <div className="text-sm font-bold">{label}</div>
                  <div className="text-[11px] text-blue-100/70 mt-0.5 leading-snug">{desc}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Bawah: jam + alamat */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="relative z-10 flex items-end justify-between gap-6 flex-wrap"
          >
            <LiveClock />
            <div className="flex items-start gap-2 text-[11px] text-blue-100/70 max-w-[260px]">
              <MapPin size={14} className="shrink-0 mt-0.5" />
              <span>{INSTANSI.alamat}</span>
            </div>
          </motion.div>
        </motion.aside>

        {/* ═══════════════ PANEL KANAN: form login ═══════════════ */}
        <main className="relative flex-1 flex flex-col bg-gradient-to-br from-white via-[#F7FAFF] to-[#EDF4FF] overflow-hidden">
          {/* Garis aksen atas yang bergerak */}
          <div className="absolute inset-x-0 top-0 h-1 bg-slate-100 overflow-hidden">
            <motion.div
              className="h-full w-1/3 bg-gradient-to-r from-transparent via-[#3D8BFF] to-transparent"
              animate={{ x: ['-100%', '300%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          <Orb className="w-[320px] h-[320px] -top-24 -right-24 bg-[#3D8BFF]/15" x={[0, -40, 20, 0]} y={[0, 40, 20, 0]} duration={22} />
          <Orb className="w-[260px] h-[260px] -bottom-20 -left-20 bg-[#00D2B4]/15" x={[0, 40, -20, 0]} y={[0, -30, -10, 0]} duration={26} />

          {/* Header kecil (hanya tampil di mobile) */}
          <div className="relative z-10 flex items-center gap-3 px-6 pt-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3D8BFF] to-[#0B5FE8] flex items-center justify-center shadow-lg shadow-blue-500/30 ring-1 ring-white/20 flex-shrink-0">
              <Wallet size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-slate-900 font-extrabold text-xl leading-none tracking-wide">
                {INSTANSI.singkat}<span className="text-[#0B5FE8]">.</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="relative z-10 flex-1 flex items-center justify-center p-6 sm:p-10">
            <motion.div animate={formControls} className="w-full max-w-[420px]">
              <motion.div variants={container} initial="hidden" animate="show">
                <motion.h2 variants={item} className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Selamat Datang
                </motion.h2>
                <motion.p variants={item} className="mt-2 text-sm text-slate-500 leading-relaxed">
                  Masuk menggunakan akun petugas untuk mengakses {INSTANSI.sistem.toLowerCase()}.
                </motion.p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                  <Field
                    icon={User}
                    label="Username"
                    error={!!error}
                    type="text"
                    name="username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Masukkan username"
                    autoComplete="username"
                    autoFocus
                    required
                  />

                  <Field
                    icon={Lock}
                    label="Password"
                    error={!!error}
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    required
                    right={
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span
                            key={showPassword ? 'off' : 'on'}
                            initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.6, rotate: 20 }}
                            transition={{ duration: 0.15 }}
                            className="block"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </motion.span>
                        </AnimatePresence>
                      </button>
                    }
                  />

                  {/* Pesan error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -6 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -6 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs font-medium text-red-600">
                          <AlertCircle size={14} className="shrink-0" />
                          {error}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Ingat saya + lupa password */}
                  <motion.div variants={item} className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none group">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="sr-only peer"
                      />
                      <span className="w-[18px] h-[18px] rounded-md border border-slate-300 bg-white flex items-center justify-center transition peer-checked:bg-[#0B5FE8] peer-checked:border-[#0B5FE8] peer-focus-visible:ring-4 peer-focus-visible:ring-[#3D8BFF]/20 group-hover:border-slate-400">
                        <AnimatePresence>
                          {remember && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                            >
                              <Check size={12} strokeWidth={3.5} className="text-white" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </span>
                      <span className="text-xs text-slate-600">Ingat saya</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowHelp((v) => !v)}
                      className="text-xs font-semibold text-[#0B5FE8] hover:underline cursor-pointer"
                    >
                      Lupa password?
                    </button>
                  </motion.div>

                  {/* Info lupa password */}
                  <AnimatePresence>
                    {showHelp && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2.5 text-xs text-slate-600 leading-relaxed">
                          <Info size={14} className="shrink-0 mt-0.5 text-[#0B5FE8]" />
                          Untuk mengatur ulang password, silakan hubungi Administrator atau bagian IT
                          di {INSTANSI.telp}.
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Tombol masuk */}
                  <motion.div variants={item} className="pt-1">
                    <motion.button
                      type="submit"
                      disabled={status !== 'idle'}
                      whileHover={status === 'idle' ? { scale: 1.02 } : undefined}
                      whileTap={status === 'idle' ? { scale: 0.97 } : undefined}
                      animate={{ backgroundColor: status === 'success' ? '#10B981' : '#0B5FE8' }}
                      transition={{ duration: 0.3 }}
                      className="relative w-full h-12 rounded-xl text-sm font-semibold text-white overflow-hidden shadow-lg shadow-blue-500/30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <motion.span
                        className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] pointer-events-none"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '400%' }}
                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                      />

                      <AnimatePresence mode="wait" initial={false}>
                        {status === 'idle' && (
                          <motion.span
                            key="idle"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.18 }}
                            className="relative flex items-center justify-center gap-2"
                          >
                            Masuk
                            <ArrowRight size={16} />
                          </motion.span>
                        )}

                        {status === 'loading' && (
                          <motion.span
                            key="loading"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.18 }}
                            className="relative flex items-center justify-center"
                          >
                            <motion.span
                              className="block w-5 h-5 rounded-full border-2 border-white/30 border-t-white"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                            />
                          </motion.span>
                        )}

                        {status === 'success' && (
                          <motion.span
                            key="success"
                            initial={{ opacity: 0, scale: 0.4 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                            className="relative flex items-center justify-center"
                          >
                            <Check size={20} strokeWidth={3} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </motion.div>
                </form>

                {/* Catatan keamanan */}
                <motion.div
                  variants={item}
                  className="mt-6 flex items-start gap-2.5 rounded-xl bg-white/70 border border-slate-200 px-3.5 py-3"
                >
                  <ShieldCheck size={16} className="shrink-0 mt-0.5 text-emerald-500" />
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Sistem ini hanya untuk petugas yang berwenang. Seluruh aktivitas tercatat.
                    Jangan bagikan akun Anda kepada orang lain.
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>

          {/* Footer */}
          <footer className="relative z-10 px-6 sm:px-10 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-200/80 pt-4 text-[11px] text-slate-500">
              <div>
                © {INSTANSI.tahun} Dibuat oleh Hafizh Naufal · {INSTANSI.versi}
              </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
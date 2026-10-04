import { useState, useEffect } from 'react';
import { Menu, LogOut } from 'lucide-react';
import { usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar({ title = 'Dashboard', onToggleSidebar }) {
  const { auth } = usePage().props;
  const userName = auth?.user?.name || 'Ahmad Fauzi';

  const [showConfirm, setShowConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Tutup modal dengan tombol Esc
  useEffect(() => {
    if (!showConfirm) return;
    const onKey = (e) => {
      if (e.key === 'Escape' && !loggingOut) setShowConfirm(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showConfirm, loggingOut]);

  const handleLogout = () => {
    setLoggingOut(true);
    router.post(
      '/logout',
      {},
      {
        onFinish: () => {
          setLoggingOut(false);
          setShowConfirm(false);
        },
      }
    );
  };

  return (
    <>
      <header className="h-16 flex items-center justify-between gap-4 px-6 bg-[#FCFCFD] border-b border-[#E5E7EB]">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="text-[#334155] hover:text-[#0F172A] transition-colors cursor-pointer"
            aria-label="Toggle sidebar"
          >
            <Menu size={22} strokeWidth={2} />
          </button>

          <h1 className="text-[#0F172A] text-[17px] font-bold leading-none">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-200/50 cursor-pointer"
            title="Keluar dari sistem"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* Modal konfirmasi keluar */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Latar gelap */}
            <div
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => !loggingOut && setShowConfirm(false)}
            />

            {/* Kotak modal */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="logout-title"
              className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl shadow-slate-900/20 border border-slate-100"
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <LogOut size={22} className="text-red-500" />
              </div>

              <h2
                id="logout-title"
                className="text-center text-lg font-bold text-[#0F172A]"
              >
                Yakin ingin keluar?
              </h2>
              <p className="mt-1.5 text-center text-sm text-slate-500">
                {userName}, sesi kamu akan diakhiri dan kamu perlu masuk lagi untuk melanjutkan.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  disabled={loggingOut}
                  className="h-10 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="h-10 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {loggingOut ? (
                    <span className="block h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  ) : (
                    'Ya, Keluar'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
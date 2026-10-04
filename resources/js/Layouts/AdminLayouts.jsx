import { useState, useEffect } from 'react';
import Sidebar from '@/Components/Sidebar';
import Navbar from '@/Components/Navbar';

export default function AdminLayout({ title = 'Dashboard', children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // overlay mobile
  const [collapsed, setCollapsed] = useState(false);     // mode ikon desktop

  // Strip tiga: desktop → mengecil/melebar, mobile → buka/tutup overlay
  const handleToggle = () => {
    if (window.matchMedia('(min-width: 768px)').matches) {
      setCollapsed((v) => !v);
    } else {
      setSidebarOpen((v) => !v);
    }
  };

  // Tutup overlay otomatis kalau layar membesar ke desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = (e) => {
      if (e.matches) setSidebarOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F5F7]">
      {/* ─── Sidebar Desktop (bisa mengecil jadi ikon) ─── */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar collapsed={collapsed} onExpand={() => setCollapsed(false)} />
      </div>

      {/* ─── Sidebar Mobile (overlay, selalu penuh) ─── */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-40 md:hidden">
            <Sidebar collapsed={false} />
          </div>
        </>
      )}

      {/* ─── Area Konten Utama ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar title={title} onToggleSidebar={handleToggle} />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
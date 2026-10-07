import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { motion } from 'motion/react';
import {
  Home,
  User,
  Ambulance,
  BedDouble,
  List,
  Building2,
  DoorOpen,
  Users,
  HeartPulse,
  ChevronDown,
  Wallet,
} from 'lucide-react';

const MENU = [
  {
    section: null,
    items: [{ label: 'Dashboard', icon: Home, href: '/dashboard' }],
  },
  {
    section: 'TRANSAKSI',
    items: [
      {
        label: 'Rawat Jalan',
        icon: User,
        submenu: [
          { label: 'Semua Data', href: '/rawat-jalan' },
          {
            label: 'Tambah Transaksi',
            href: '/rawat-jalan?tambah=1',
            // Halaman form create juga mengaktifkan menu ini
            also: ['/rawat-jalan/create'],
          },
        ],
      },
      {
        label: 'Rawat Jalan IGD',
        icon: Ambulance,
        submenu: [
          { label: 'Semua Data', href: '/igd' },
          { label: 'Tambah Transaksi', href: '/igd/create' },
        ],
      },
      {
        label: 'Rawat Inap',
        icon: BedDouble,
        submenu: [
          { label: 'Semua Data', href: '/rawat-inap' },
          { label: 'Tambah Transaksi', href: '/rawat-inap/create' },
        ],
      },
      { label: 'Semua Transaksi', icon: List, href: '/transaksi' },
    ],
  },
  {
    section: 'MASTER DATA',
    items: [
      { label: 'Pasien', icon: HeartPulse, href: '/datamaster/pasien' },
      { label: 'Poliklinik', icon: Building2, href: '/datamaster/poliklinik' },
      { label: 'Ruangan', icon: DoorOpen, href: '/datamaster/ruangan' },
    ],
  },
  {
    section: 'PENGGUNA',
    items: [
      { label: 'Pengguna', icon: Users, href: '/pengguna' },
    ],
  },
];

// Pecah URL jadi path (tanpa trailing slash) + query params
const parseUrl = (u) => {
  const [path, qs = ''] = u.split('?');
  return {
    path: path.replace(/\/$/, '') || '/',
    params: new URLSearchParams(qs),
  };
};

// Cocok jika path sama / berada di bawah pola DAN semua query milik pola
// ada di URL saat ini
const matches = (url, pattern) => {
  const u = parseUrl(url);
  const h = parseUrl(pattern);
  const pathOk = u.path === h.path || u.path.startsWith(h.path + '/');
  if (!pathOk) return false;
  for (const [k, v] of h.params) {
    if (u.params.get(k) !== v) return false;
  }
  return true;
};

// Kespesifikan pola: jumlah query lebih diutamakan, lalu panjang path
const specificity = (pattern) => {
  const h = parseUrl(pattern);
  return [...h.params].length * 1000 + h.path.length;
};

// Skor terbaik sebuah item (href + also) terhadap URL; -1 jika tidak cocok
const matchScore = (url, item) => {
  const patterns = [item.href, ...(item.also ?? [])];
  return patterns
    .filter((p) => matches(url, p))
    .reduce((best, p) => Math.max(best, specificity(p)), -1);
};

// Role bisa berupa string ("kepala_kasir") atau relasi ({ nama / name })
// Hasil: "Kepala Kasir"
const formatRole = (role) => {
  const raw = typeof role === 'object' && role !== null ? role.nama ?? role.name : role;
  if (!raw) return '';
  return String(raw)
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

function MenuItem({ item, currentUrl, collapsed, onExpand }) {
  const { icon: Icon, label, href, submenu } = item;

  // Submenu aktif = skor cocok tertinggi (paling spesifik)
  const activeChildHref = submenu
    ?.map((s) => ({ href: s.href, score: matchScore(currentUrl, s) }))
    .filter((s) => s.score >= 0)
    .sort((a, b) => b.score - a.score)[0]?.href;

  const isActive = href && matches(currentUrl, href);
  const isParentActive = !!activeChildHref;
  const [open, setOpen] = useState(isParentActive);

  // Buka otomatis saat pindah ke halaman di dalam grup ini
  useEffect(() => {
    if (isParentActive) setOpen(true);
  }, [isParentActive]);

  const rowClass = `flex items-center ${
    collapsed ? 'justify-center px-0' : 'justify-between gap-3 px-3'
  } py-2.5 rounded-xl transition-colors cursor-pointer ${
    isActive
      ? 'bg-[#0B5FE8] text-white'
      : collapsed && isParentActive
      ? 'bg-white/10 text-white'
      : 'text-[#9FB0CC] hover:bg-white/5 hover:text-white'
  }`;

  if (submenu) {
    return (
      <div>
        <div
          className={rowClass}
          title={collapsed ? label : undefined}
          onClick={() => {
            if (collapsed) {
              // Saat mengecil: klik ikon grup → sidebar melebar & submenu terbuka
              setOpen(true);
              onExpand?.();
            } else {
              setOpen(!open);
            }
          }}
        >
          <span className="flex items-center gap-3">
            <Icon size={collapsed ? 20 : 18} strokeWidth={1.8} className="shrink-0" />
            {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
          </span>
          {!collapsed && (
            <ChevronDown
              size={16}
              strokeWidth={2}
              className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
          )}
        </div>

        {!collapsed && open && (
          <div className="ml-8 mt-1 flex flex-col gap-0.5">
            {submenu.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className={`text-sm px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  s.href === activeChildHref
                    ? 'text-white bg-white/10 font-medium'
                    : 'text-[#8496B8] hover:text-white hover:bg-white/5'
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link href={href} className={rowClass} title={collapsed ? label : undefined}>
      <span className="flex items-center gap-3">
        <Icon size={collapsed ? 20 : 18} strokeWidth={1.8} className="shrink-0" />
        {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
      </span>
    </Link>
  );
}

export default function Sidebar({ collapsed = false, onExpand }) {
  const { url } = usePage();
  const { auth } = usePage().props;
  const userName = auth?.user?.username || auth?.user?.name || 'Petugas Kasir';
  const userRole = formatRole(auth?.user?.role);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 76 : 256 }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
      className="h-full flex flex-col overflow-hidden shrink-0"
      style={{
        background: 'linear-gradient(180deg, #061B3C 0%, #0B2B4F 100%)',
      }}
    >
      {/* Logo & Judul */}
      <div
        className={`flex items-center gap-3 py-5 border-b border-white/10 flex-shrink-0 ${
          collapsed ? 'justify-center px-0' : 'px-5'
        }`}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3D8BFF] to-[#0B5FE8] flex items-center justify-center shadow-lg shadow-blue-900/40 ring-1 ring-white/20 flex-shrink-0">
          <Wallet size={20} className="text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-white font-extrabold text-xl leading-none tracking-wide">
              Kasir<span className="text-[#4D94FF]">.</span>
            </div>
          </div>
        )}
      </div>

      {/* Menu — scrollable di dalam sidebar */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 flex flex-col gap-4">
        {MENU.map((group, i) => (
          <div key={i} className="flex flex-col gap-0.5">
            {group.section &&
              (collapsed ? (
                <div className="h-px bg-white/10 mx-2 mb-2" />
              ) : (
                <div className="text-[#62779E] text-[10px] font-bold tracking-widest uppercase px-3 mb-1 whitespace-nowrap">
                  {group.section}
                </div>
              ))}
            {group.items.map((item) => (
              <MenuItem
                key={item.label}
                item={item}
                currentUrl={url}
                collapsed={collapsed}
                onExpand={onExpand}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Profil User di bawah sidebar */}
      <div className="flex-shrink-0 px-3 py-4 border-t border-white/10">
        {collapsed ? (
          <div
            className="mx-auto w-10 h-10 rounded-xl bg-white/[0.08] text-white text-sm font-bold flex items-center justify-center"
            title={userRole ? `${userName} · ${userRole}` : userName}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
        ) : (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.06]">
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-semibold truncate">{userName}</div>
              {userRole && <div className="text-[#8496B8] text-xs truncate">{userRole}</div>}
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
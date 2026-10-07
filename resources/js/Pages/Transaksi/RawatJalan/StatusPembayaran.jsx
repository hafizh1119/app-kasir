import React from 'react';
import { router } from '@inertiajs/react';
import { Banknote, Landmark, ShieldCheck, X, Check } from 'lucide-react';
import { STATUS_OPTIONS } from '@/utils/rawatJalan';

const ICON = {
  umum_h2h: Landmark,
  umum_cash: Banknote,
  bpjs: ShieldCheck,
};

// Warna tiap status: kotak ikon, kartu aktif, dan hover
const TONE = {
  umum_h2h: {
    icon: 'bg-blue-100 text-blue-600',
    active: 'border-blue-500 bg-blue-50 ring-2 ring-blue-100',
    hover: 'hover:border-blue-400 hover:bg-blue-50/60',
  },
  umum_cash: {
    icon: 'bg-emerald-100 text-emerald-600',
    active: 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100',
    hover: 'hover:border-emerald-400 hover:bg-emerald-50/60',
  },
  bpjs: {
    icon: 'bg-amber-100 text-amber-600',
    active: 'border-amber-500 bg-amber-50 ring-2 ring-amber-100',
    hover: 'hover:border-amber-400 hover:bg-amber-50/60',
  },
};

// Kartu pilihan status (dipakai di halaman Index dan di modal)
export function StatusCard({ option, active = false, onClick }) {
  const Icon = ICON[option.key];
  const tone = TONE[option.key];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex items-center gap-3 text-left rounded-2xl border p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98] ${
        active ? tone.active : `border-slate-200 bg-white ${tone.hover}`
      }`}
    >
      <span
        className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${tone.icon}`}
      >
        <Icon size={20} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-bold text-slate-800">{option.label}</span>
        <span className="block text-[11px] text-slate-500 mt-0.5 leading-snug">{option.desc}</span>
      </span>
      {active && (
        <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#0B5FE8] text-white flex items-center justify-center">
          <Check size={12} />
        </span>
      )}
    </button>
  );
}

// Penanda status pembayaran (dipakai di halaman Create dan Edit)
export function StatusBadge({ status }) {
  const opt = STATUS_OPTIONS.find((o) => o.key === status);
  if (!opt) return null;
  const Icon = ICON[opt.key];
  const tone = TONE[opt.key];
  return (
    <div className="inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white pl-2 pr-4 py-2 shadow-sm">
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${tone.icon}`}>
        <Icon size={16} />
      </span>
      <span className="leading-tight">
        <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Status Pembayaran
        </span>
        <span className="block text-sm font-bold text-slate-800">{opt.label}</span>
      </span>
    </div>
  );
}

// Modal pilih status pembayaran sebelum membuka form tambah transaksi
export default function StatusPembayaran({ open, onClose, baseUrl }) {
  if (!open) return null;

  const pilih = (key) => {
    router.get(`${baseUrl}/create`, { status: key });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        <h3 className="text-lg font-bold text-slate-800">Status Pembayaran</h3>
        <p className="text-xs text-slate-500 mt-1">Pilih status pembayaran pasien untuk transaksi baru.</p>

        <div className="flex flex-col gap-3 mt-5">
          {STATUS_OPTIONS.map((o) => (
            <StatusCard key={o.key} option={o} onClick={() => pilih(o.key)} />
          ))}
        </div>
      </div>
    </div>
  );
}
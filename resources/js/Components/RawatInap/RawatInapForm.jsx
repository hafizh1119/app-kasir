import React, { useState, useCallback, useMemo } from 'react';
import { Link, router } from '@inertiajs/react';
import {
  ChevronLeft, Save, User, Calendar, Receipt, Stethoscope, Activity,
  FlaskConical, Package, Calculator, AlertCircle, BedDouble, Siren,
} from 'lucide-react';

const toNum = (v) => parseInt(String(v ?? '').replace(/\D/g, ''), 10) || 0;
const fromDb = (v) => Math.round(Number(v)) || 0;
const fmt = (n) => (n ? Number(n).toLocaleString('id-ID') : '');
const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dateOnly = (v) => (v ? String(v).slice(0, 10) : '');

const BIAYA = [
  'akomodasi_tanpa_makan', 'akomodasi_makan',
  'visite_umum', 'visite_spesialis',
  'konsul_dokter', 'konsul_vct', 'visite_farmasi', 'askep',
  'pelayanan_rm', 'pelayanan_medis', 'konsul_gizi',
  'pelayanan_ro', 'pelayanan_lab', 'pelayanan_usg',
  'tindakan_perawatan', 'tindakan_persalinan',
  'tmno_rinap', 'tmno_poli', 'tmo_rinap', 'tmo_ibs',
  'obat', 'fisio', 'ipj', 'o2', 'ambulan',
];

const SHIFTS = [
  { v: 'pagi',  label: '🌤 Pagi',  on: 'bg-amber-500 text-white border-amber-500 shadow-sm' },
  { v: 'siang', label: '☀️ Siang', on: 'bg-blue-600 text-white border-blue-600 shadow-sm' },
  { v: 'malam', label: '🌙 Malam', on: 'bg-indigo-600 text-white border-indigo-600 shadow-sm' },
];

const SECTIONS = [
  { icon: BedDouble, title: 'Akomodasi Pelayanan', color: 'slate', cols: 'sm:grid-cols-2',
    f: [['akomodasi_tanpa_makan', 'Tanpa Makan', 'Akomodasi tanpa makan'], ['akomodasi_makan', 'Makan', 'Akomodasi dengan makan']] },
  { icon: Stethoscope, title: 'Visite Dokter', color: 'blue', cols: 'sm:grid-cols-2',
    f: [['visite_umum', 'Umum', 'Visite dokter umum'], ['visite_spesialis', 'Spesialis', 'Visite dokter spesialis']] },
  { icon: Stethoscope, title: 'Konsultasi', color: 'purple', cols: 'sm:grid-cols-3',
    f: [['konsul_dokter', 'Dokter', 'Konsultasi dokter'], ['konsul_vct', 'VCT', 'Konsultasi VCT'], ['konsul_gizi', 'Gizi', 'Konsultasi gizi']] },
  { icon: Receipt, title: 'Visite Farmasi, Askep & Pelayanan', color: 'slate', cols: 'sm:grid-cols-2 lg:grid-cols-4',
    f: [['visite_farmasi', 'Visite Farmasi', 'Visite farmasi'], ['askep', 'Askep', 'Asuhan keperawatan'],
        ['pelayanan_rm', 'Pelayanan RM', 'Rekam medis'], ['pelayanan_medis', 'Pelayanan Medis', 'Pelayanan medis']] },
  { icon: FlaskConical, title: 'Penunjang', color: 'purple', cols: 'sm:grid-cols-3',
    f: [['pelayanan_ro', 'RO', 'Radiologi / Rontgen'], ['pelayanan_lab', 'LAB', 'Laboratorium'], ['pelayanan_usg', 'USG', 'Ultrasonografi']] },
  { icon: Activity, title: 'Tindakan', color: 'green', cols: 'sm:grid-cols-3',
    f: [['tindakan_perawatan', 'Perawatan', 'Tindakan perawatan'], ['tindakan_persalinan', 'Persalinan', 'Tindakan persalinan'],
        ['tmno_rinap', 'TMNO R Inap', 'Non-operatif rawat inap'], ['tmno_poli', 'TMNO Poli', 'Non-operatif poli'],
        ['tmo_rinap', 'TMO R Inap', 'Operatif rawat inap'], ['tmo_ibs', 'TMO IBS', 'Operatif IBS']] },
  { icon: Package, title: 'Obat & Lain-lain', color: 'rose', cols: 'sm:grid-cols-2 lg:grid-cols-5',
    f: [['obat', 'Obat', 'Biaya obat & BMHP'], ['fisio', 'Fisio', 'Fisioterapi'], ['ipj', 'IPJ', 'IPJ'],
        ['o2', 'O2', 'Oksigen'], ['ambulan', 'Ambulan', 'Ambulan']] },
  { icon: Siren, title: 'Jumlah IGD', color: 'amber', cols: 'sm:grid-cols-3',
    f: [['jumlah_igd', 'IGD', 'Tagihan IGD sebelum rawat inap (opsional)']] },
];

const COLORS = {
  blue:   'bg-blue-50 text-blue-600 border-blue-100',
  green:  'bg-emerald-50 text-emerald-600 border-emerald-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
  amber:  'bg-amber-50 text-amber-600 border-amber-100',
  slate:  'bg-slate-100 text-slate-600 border-slate-200',
  rose:   'bg-rose-50 text-rose-600 border-rose-100',
};

const LABEL = 'text-[11px] font-bold text-slate-600 uppercase tracking-wider';
const INPUT =
  'px-3 py-2 text-sm border rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1D5FE0] transition-all';

function SectionCard({ icon: Icon, title, color = 'blue', children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className={`flex items-center gap-2.5 px-5 py-3.5 border-b ${COLORS[color]}`}>
        <Icon size={16} strokeWidth={2} />
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, required, error, className = '', children }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className={LABEL}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-red-500 flex items-center gap-1">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

function RupiahInput({ label, name, value, onChange, hint, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className={LABEL}>{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium pointer-events-none">Rp</span>
        <input
          type="text"
          inputMode="numeric"
          value={value ? fmt(value) : ''}
          onChange={(e) => onChange(name, toNum(e.target.value))}
          placeholder="0"
          className={`w-full pl-8 pr-3 text-right placeholder-slate-300 ${INPUT} ${error ? 'border-red-400' : 'border-slate-200'}`}
        />
      </div>
      {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

/**
 * Props:
 * - kunjungan  : model kunjungan inap (kosong saat create)
 * - ruangan    : [{id, ruangan}]
 * - method     : 'post' | 'put'
 * - url        : endpoint submit
 * - crumb      : teks breadcrumb
 * - submitLabel: teks tombol simpan
 */
export default function RawatInapForm({ kunjungan, ruangan = [], method, url, crumb, submitLabel }) {
  const k = kunjungan?.id ? kunjungan : null;
  const todayStr = toISO(new Date());

  const [form, setForm] = useState(() => ({
    no_rm: k?.pasien?.no_rm ?? '',
    nama: k?.pasien?.nama ?? '',
    ruangan_id: k?.ruangan_id ?? '',
    tanggal_pelayanan: dateOnly(k?.tanggal_pelayanan) || todayStr,
    shift: k?.shift ?? 'pagi',
    tanggal_masuk: dateOnly(k?.tanggal_masuk) || todayStr,
    tanggal_keluar: dateOnly(k?.tanggal_keluar),
    jumlah_igd: k ? fromDb(k.jumlah_igd) : 0,
    ...Object.fromEntries(BIAYA.map((b) => [b, k ? fromDb(k[b]) : 0])),
  }));
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const set = useCallback((name, value) => {
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((e) => {
      if (!e[name]) return e;
      const c = { ...e };
      delete c[name];
      return c;
    });
  }, []);

  const handleText = (e) => set(e.target.name, e.target.value);
  const rinap = useMemo(() => BIAYA.reduce((s, b) => s + toNum(form[b]), 0), [form]);
  const igd = toNum(form.jumlah_igd);
  const err = (n) => (errors[n] ? 'border-red-400 bg-red-50/30' : 'border-slate-200');

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = {};
    if (!String(form.no_rm).trim()) v.no_rm = 'No. RM wajib diisi';
    if (!String(form.nama).trim()) v.nama = 'Nama pasien wajib diisi';
    if (!form.ruangan_id) v.ruangan_id = 'Ruangan wajib dipilih';
    if (!form.tanggal_pelayanan) v.tanggal_pelayanan = 'Tanggal wajib diisi';
    if (!form.tanggal_masuk) v.tanggal_masuk = 'Tanggal masuk wajib diisi';
    if (form.tanggal_keluar && form.tanggal_keluar < form.tanggal_masuk)
      v.tanggal_keluar = 'Tanggal keluar tidak boleh sebelum tanggal masuk';
    if (Object.keys(v).length) return setErrors(v);

    setSubmitted(true);
    router[method](url, form, {
      onError: (serverErrors) => setErrors(serverErrors),
      onFinish: () => setSubmitted(false),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/rawat-inap" className="hover:text-[#0B5FE8] transition flex items-center gap-1 font-medium">
          <ChevronLeft size={16} /> Rawat Inap
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold">{crumb}</span>
      </div>

      {/* Tanggal & Shift */}
      <SectionCard icon={Calendar} title="Tanggal & Shift Pelayanan" color="green">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tanggal Pelayanan" required error={errors.tanggal_pelayanan}>
            <input type="date" name="tanggal_pelayanan" value={form.tanggal_pelayanan}
              onChange={handleText} className={`${INPUT} ${err('tanggal_pelayanan')}`} />
          </Field>
          <Field label="Shift" required error={errors.shift}>
            <div className="flex gap-2">
              {SHIFTS.map((s) => (
                <button key={s.v} type="button" onClick={() => set('shift', s.v)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    form.shift === s.v ? s.on : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </Field>
        </div>
      </SectionCard>

      {/* Identitas & Rawat */}
      <SectionCard icon={User} title="Identitas Pasien & Rawat Inap" color="blue">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="No. Rekam Medis" required error={errors.no_rm}>
            <input name="no_rm" value={form.no_rm} onChange={handleText}
              placeholder="Contoh: 223515" className={`${INPUT} ${err('no_rm')}`} />
          </Field>
          <Field label="Nama Pasien" required error={errors.nama} className="sm:col-span-2 lg:col-span-1">
            <input name="nama" value={form.nama} onChange={handleText}
              placeholder="Nama lengkap pasien" className={`${INPUT} uppercase ${err('nama')}`} />
          </Field>
          <Field label="Ruangan" required error={errors.ruangan_id}>
            <select name="ruangan_id" value={form.ruangan_id} onChange={handleText}
              className={`${INPUT} ${err('ruangan_id')} appearance-none cursor-pointer`}>
              <option value="">-- Pilih Ruangan --</option>
              {ruangan.map((r) => (
                <option key={r.id} value={r.id}>{r.ruangan}</option>
              ))}
            </select>
          </Field>
          <Field label="Tanggal Masuk" required error={errors.tanggal_masuk}>
            <input type="date" name="tanggal_masuk" value={form.tanggal_masuk}
              onChange={handleText} className={`${INPUT} ${err('tanggal_masuk')}`} />
          </Field>
          <Field label="Tanggal Keluar" error={errors.tanggal_keluar}>
            <input type="date" name="tanggal_keluar" value={form.tanggal_keluar} min={form.tanggal_masuk}
              onChange={handleText} className={`${INPUT} ${err('tanggal_keluar')}`} />
          </Field>
        </div>
      </SectionCard>

      {/* Biaya */}
      {SECTIONS.map((s) => (
        <SectionCard key={s.title} icon={s.icon} title={s.title} color={s.color}>
          <div className={`grid grid-cols-1 ${s.cols} gap-4`}>
            {s.f.map(([name, label, hint]) => (
              <RupiahInput key={name} name={name} label={label} hint={hint}
                value={form[name]} onChange={set} error={errors[name]} />
            ))}
          </div>
        </SectionCard>
      ))}

      {/* Total */}
      <div className="rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 border"
        style={{ background: 'linear-gradient(135deg, #0B2B4F 0%, #1D5FE0 100%)' }}>
        <div className="flex items-center gap-3 text-white flex-1">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <Calculator size={20} />
          </div>
          <div>
            <div className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Total Tagihan</div>
            <div className="text-2xl font-bold mt-0.5">Rp {(rinap + igd).toLocaleString('id-ID')}</div>
          </div>
        </div>
        <div className="flex gap-6 text-white text-sm">
          <div>
            <div className="text-[10px] font-semibold text-blue-200 uppercase tracking-wider">R Inap</div>
            <div className="font-bold">Rp {rinap.toLocaleString('id-ID')}</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-blue-200 uppercase tracking-wider">IGD</div>
            <div className="font-bold">Rp {igd.toLocaleString('id-ID')}</div>
          </div>
        </div>
      </div>

      {/* Tombol */}
      <div className="flex items-center justify-end gap-3">
        <Link href="/rawat-inap"
          className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-slate-300 transition shadow-sm">
          Batal
        </Link>
        <button type="submit" disabled={submitted}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0B5FE8] hover:bg-[#094EC2] text-white text-sm font-bold shadow-sm shadow-blue-300/40 transition disabled:opacity-60">
          <Save size={16} />
          {submitted ? 'Menyimpan…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
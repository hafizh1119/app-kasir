import * as XLSX from 'xlsx-js-style';

// ─── Konfigurasi ──────────────────────────────────────────────────────────────
export const JUDUL_LAPORAN = 'DATA KUNJUNGAN PASIEN RAWAT INAP';
export const FILE_PREFIX = 'rawat-inap';
const BENDAHARA_NAMA = 'Kadiyono';
const BENDAHARA_NIP = 'NIP. 19730519 201001 1 001';

// ─── Struktur kolom (key = nama kolom database) ───────────────────────────────
// single: true → header 1 kolom (rowSpan 2)
export const GROUPS = [
  { label: 'AKOMODASI PELAYANAN', cols: [['akomodasi_tanpa_makan', 'TANPA MAKAN'], ['akomodasi_makan', 'MAKAN']] },
  { label: 'VISITE DOKTER',       cols: [['visite_umum', 'UMUM'], ['visite_spesialis', 'SPESIALIS']] },
  { label: 'KONSULTASI',          cols: [['konsul_dokter', 'DOKTER'], ['konsul_vct', 'VCT']] },
  { label: 'VISITE',              cols: [['visite_farmasi', 'FARMASI']] },
  { label: 'ASKEP',               cols: [['askep', 'ASKEP']], single: true },
  { label: 'PELAYANAN',           cols: [['pelayanan_rm', 'RM'], ['pelayanan_medis', 'MEDIS']] },
  { label: 'KONSUL',              cols: [['konsul_gizi', 'GIZI']] },
  { label: 'PELAYANAN',           cols: [['pelayanan_ro', 'RO'], ['pelayanan_lab', 'LAB'], ['pelayanan_usg', 'USG']] },
  { label: 'TINDAKAN',            cols: [['tindakan_perawatan', 'PERAWATAN']] },
  { label: 'TMNO',                cols: [['tmno_rinap', 'R INAP'], ['tmno_poli', 'POLI']] },
  { label: 'TMO',                 cols: [['tmo_rinap', 'R INAP'], ['tmo_ibs', 'IBS']] },
  { label: 'TINDAKAN',            cols: [['tindakan_persalinan', 'PERSALINAN']] },
  { label: 'OBAT',                cols: [['obat', 'OBAT']], single: true },
  { label: 'FISIO',               cols: [['fisio', 'FISIO']], single: true },
  { label: 'IPJ',                 cols: [['ipj', 'IPJ']], single: true },
  { label: 'O2',                  cols: [['o2', 'O2']], single: true },
  { label: 'AMBULAN',             cols: [['ambulan', 'AMBULAN']], single: true },
];

export const MONEY_KEYS = GROUPS.flatMap((g) => g.cols.map((c) => c[0]));
export const SUB_COLS = GROUPS.filter((g) => !g.single).flatMap((g, gi) =>
  g.cols.map(([k, label]) => ({ id: `${gi}-${k}`, label }))
);

// ─── Helper tanggal (waktu LOKAL) ─────────────────────────────────────────────
export const toYMD = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const formatTanggalID = (ymd) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const fmtTgl = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

export function getWeekRange(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  const day = new Date(y, m - 1, d).getDay();
  const mon = new Date(y, m - 1, d - (day === 0 ? 6 : day - 1));
  const sun = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6);
  return { start: toYMD(mon), end: toYMD(sun) };
}

export function getMonthRange(ymd) {
  const [y, m] = ymd.split('-').map(Number);
  return { start: toYMD(new Date(y, m - 1, 1)), end: toYMD(new Date(y, m, 0)) };
}

// ─── Export Excel ─────────────────────────────────────────────────────────────
// rows: [{ no_rm, nama, ruangan, petugas, nip, tgl_masuk, tgl_keluar, igd, rinap, total, ...MONEY_KEYS }]
// totals: { rinap, igd, total, ...MONEY_KEYS }
export function exportRawatInap({ rows, totals, rangeStart, rangeEnd, shift }) {
  if (!rows.length) return;

  const ID_COLS = 6;
  const MONEY_START = ID_COLS;
  const JML_START = ID_COLS + MONEY_KEYS.length;
  const TOTAL_COLS = JML_START + 3;
  const LAST_COL = TOTAL_COLS - 1;

  const SIG_LEFT_START = 1, SIG_LEFT_END = 3;
  const SIG_RIGHT_START = 24, SIG_RIGHT_END = 29;

  const blank = () => Array(TOTAL_COLS).fill('');

  const pendapatan =
    rangeStart === rangeEnd
      ? `PENDAPATAN ${formatTanggalID(rangeStart).toUpperCase()}`
      : `PENDAPATAN ${formatTanggalID(rangeStart).toUpperCase()} S/D ${formatTanggalID(rangeEnd).toUpperCase()}`;

  const titleRows = [JUDUL_LAPORAN, 'STATUS PEMBAYARAN UMUM H2H', pendapatan, 'RSUD AJIBARANG'].map((t) => {
    const r = blank();
    r[0] = t;
    return r;
  });

  // ── Header ──
  const head1 = blank();
  const head2 = blank();
  const vMergeCols = [];
  const hMerges = [];

  ['NO', 'NO RM', 'NAMA', 'RUANGAN', 'TANGGAL MASUK', 'TANGGAL KELUAR'].forEach((h, i) => {
    head1[i] = h;
    vMergeCols.push(i);
  });

  let c = MONEY_START;
  GROUPS.forEach((g) => {
    head1[c] = g.label;
    if (g.single || g.cols.length === 1) {
      vMergeCols.push(c);
    } else {
      g.cols.forEach(([, label], i) => { head2[c + i] = label; });
      hMerges.push({ s: c, e: c + g.cols.length - 1 });
    }
    c += g.cols.length;
  });

  head1[JML_START] = 'JUMLAH';
  hMerges.push({ s: JML_START, e: JML_START + 2 });
  head2[JML_START] = 'R INAP';
  head2[JML_START + 1] = 'IGD';
  head2[JML_START + 2] = 'TOTAL';

  // ── Data & total ──
  const body = rows.map((r, i) => [
    i + 1, r.no_rm, r.nama, r.ruangan, fmtTgl(r.tgl_masuk), fmtTgl(r.tgl_keluar),
    ...MONEY_KEYS.map((k) => r[k] || ''),
    r.rinap, r.igd || '', r.total,
  ]);

  const totalRow = blank();
  totalRow[0] = `JUMLAH (${rows.length} pasien)`;
  MONEY_KEYS.forEach((k, i) => { totalRow[MONEY_START + i] = totals[k] || ''; });
  totalRow[JML_START] = totals.rinap;
  totalRow[JML_START + 1] = totals.igd || '';
  totalRow[JML_START + 2] = totals.total;

  // ── Tanda tangan: kasir = petugas pada data hasil filter ──
  const kasirMap = new Map(rows.map((r) => [r.petugas, r.nip]));
  const kasirList = [...kasirMap.keys()].sort((a, b) => a.localeCompare(b));
  const nipList = kasirList.map((p) => kasirMap.get(p)).filter(Boolean);
  const kasirLabel = shift ? `Kasir Shift ${shift[0].toUpperCase()}${shift.slice(1)}` : 'Kasir Semua Shift';

  const sig = Array.from({ length: 6 }, blank);
  sig[0][SIG_RIGHT_START] = `Ajibarang, ${formatTanggalID(toYMD(new Date()))}`;
  sig[1][SIG_LEFT_START] = 'Bendahara Penerimaan';
  sig[1][SIG_RIGHT_START] = kasirLabel;
  sig[4][SIG_LEFT_START] = BENDAHARA_NAMA;
  sig[4][SIG_RIGHT_START] = kasirList.join(', ');
  sig[5][SIG_LEFT_START] = BENDAHARA_NIP;
  sig[5][SIG_RIGHT_START] = nipList.length ? `NIP. ${nipList.join(', ')}` : '';

  const R_H1 = titleRows.length + 1;
  const R_H2 = R_H1 + 1;
  const R_BODY = R_H2 + 1;
  const R_TOTAL = R_BODY + body.length;
  const R_SIG = R_TOTAL + 2;

  const ws = XLSX.utils.aoa_to_sheet([...titleRows, blank(), head1, head2, ...body, totalRow, blank(), ...sig]);

  // ── Merge ──
  const merges = [];
  titleRows.forEach((_, i) => merges.push({ s: { r: i, c: 0 }, e: { r: i, c: LAST_COL } }));
  vMergeCols.forEach((col) => merges.push({ s: { r: R_H1, c: col }, e: { r: R_H2, c: col } }));
  hMerges.forEach(({ s, e }) => merges.push({ s: { r: R_H1, c: s }, e: { r: R_H1, c: e } }));
  merges.push({ s: { r: R_TOTAL, c: 0 }, e: { r: R_TOTAL, c: ID_COLS - 1 } });
  for (let i = 0; i < 6; i++) {
    const r = R_SIG + i;
    merges.push({ s: { r, c: SIG_LEFT_START }, e: { r, c: SIG_LEFT_END } });
    merges.push({ s: { r, c: SIG_RIGHT_START }, e: { r, c: SIG_RIGHT_END } });
  }
  ws['!merges'] = merges;

  // ── Styling ──
  const thin = { style: 'thin', color: { rgb: '000000' } };
  const border = { top: thin, bottom: thin, left: thin, right: thin };
  const al = (h) => ({ horizontal: h, vertical: 'center' });
  const STYLE = {
    title: { font: { bold: true, sz: 12 }, alignment: al('center') },
    head: { font: { bold: true }, alignment: { ...al('center'), wrapText: true }, border },
    center: { alignment: al('center'), border },
    left: { alignment: al('left'), border },
    right: { alignment: al('right'), border },
    totalCenter: { font: { bold: true }, alignment: al('center'), border },
    totalRight: { font: { bold: true }, alignment: al('right'), border },
    sig: { alignment: al('center') },
  };

  const paint = (r, col, style, numFmt) => {
    const addr = XLSX.utils.encode_cell({ r, c: col });
    if (!ws[addr]) ws[addr] = { t: 's', v: '' };
    ws[addr].s = style;
    if (numFmt && ws[addr].t === 'n') ws[addr].z = numFmt;
  };

  for (let r = 0; r < titleRows.length; r++) for (let col = 0; col < TOTAL_COLS; col++) paint(r, col, STYLE.title);
  for (let r = R_H1; r <= R_H2; r++) for (let col = 0; col < TOTAL_COLS; col++) paint(r, col, STYLE.head);
  for (let i = 0; i < body.length; i++) {
    for (let col = 0; col < TOTAL_COLS; col++) {
      if (col === 2) paint(R_BODY + i, col, STYLE.left);
      else if (col < ID_COLS) paint(R_BODY + i, col, STYLE.center);
      else paint(R_BODY + i, col, STYLE.right, '#,##0');
    }
  }
  for (let col = 0; col < TOTAL_COLS; col++) {
    if (col < ID_COLS) paint(R_TOTAL, col, STYLE.totalCenter);
    else paint(R_TOTAL, col, STYLE.totalRight, '#,##0');
  }
  for (let i = 0; i < 6; i++) for (let col = 0; col < TOTAL_COLS; col++) paint(R_SIG + i, col, STYLE.sig);

  ws['!cols'] = [
    { wch: 5 }, { wch: 10 }, { wch: 28 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
    ...Array(MONEY_KEYS.length).fill({ wch: 12 }),
    { wch: 14 }, { wch: 12 }, { wch: 14 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rawat Inap');
  XLSX.writeFile(
    wb,
    rangeStart === rangeEnd
      ? `${FILE_PREFIX}_${rangeStart}.xlsx`
      : `${FILE_PREFIX}_${rangeStart}_sd_${rangeEnd}.xlsx`
  );
}
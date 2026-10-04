import * as XLSX from 'xlsx-js-style';

// ─── Konfigurasi ──────────────────────────────────────────────────────────────
export const JUDUL_LAPORAN = 'DATA KUNJUNGAN PASIEN IGD';
export const FILE_PREFIX = 'igd';
const BENDAHARA_NAMA = 'Kadiyono';
const BENDAHARA_NIP = 'NIP. 19730519 201001 1 001';

export const KEYS = [
  'jasa_sarana', 'dokter_umum', 'dokter_spesialis', 'konsul',
  'askep', 'pnm', 'tmno', 'kep', 'tmo', 'persal',
  'lab', 'ro', 'usg',
  'o2', 'ipj', 'ambulan', 'akomodasi', 'obat',
];

// ─── Helper tanggal (waktu LOKAL) ─────────────────────────────────────────────
export const toYMD = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const formatTanggalID = (ymd) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
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
// rows: [{ no_rm, nama, petugas, nip, jumlah, ...KEYS }]
export function exportIgd({ rows, totals, rangeStart, rangeEnd, shift }) {
  if (!rows.length) return;

  const TOTAL_COLS = 22;
  const LAST_COL = TOTAL_COLS - 1;
  const SIG_LEFT_START = 1, SIG_LEFT_END = 4;
  const SIG_RIGHT_START = 13, SIG_RIGHT_END = 18;
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

  const head1 = blank();
  const head2 = blank();
  Object.entries({
    0: 'NO', 1: 'NO RM', 2: 'NAMA', 3: 'JASA SARANA', 4: 'PX DOKTER', 6: 'TINDAKAN',
    13: 'PENUNJANG', 16: 'O2', 17: 'IPJ', 18: 'AMBLN', 19: 'AKOMODASI', 20: 'OBAT', 21: 'JUMLAH',
  }).forEach(([c, v]) => { head1[c] = v; });
  ['UMUM', 'SPESIALIS', 'KONSUL', 'ASKEP', 'PNM', 'TMNO', 'KEP', 'TMO', 'PERSAL', 'LAB', 'RO', 'USG']
    .forEach((h, i) => { head2[4 + i] = h; });

  const body = rows.map((r, i) => [i + 1, r.no_rm, r.nama, ...KEYS.map((k) => r[k] || ''), r.jumlah]);

  const totalRow = blank();
  totalRow[0] = `TOTAL (${rows.length} pasien)`;
  KEYS.forEach((k, i) => { totalRow[3 + i] = totals[k] || ''; });
  totalRow[21] = totals.jumlah;

  // Tanda tangan: kasir = petugas pada data hasil filter
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

  const merges = [];
  titleRows.forEach((_, i) => merges.push({ s: { r: i, c: 0 }, e: { r: i, c: LAST_COL } }));
  [0, 1, 2, 3, 16, 17, 18, 19, 20, 21].forEach((c) => merges.push({ s: { r: R_H1, c }, e: { r: R_H2, c } }));
  merges.push({ s: { r: R_H1, c: 4 }, e: { r: R_H1, c: 5 } });
  merges.push({ s: { r: R_H1, c: 6 }, e: { r: R_H1, c: 12 } });
  merges.push({ s: { r: R_H1, c: 13 }, e: { r: R_H1, c: 15 } });
  merges.push({ s: { r: R_TOTAL, c: 0 }, e: { r: R_TOTAL, c: 2 } });
  for (let i = 0; i < 6; i++) {
    const r = R_SIG + i;
    merges.push({ s: { r, c: SIG_LEFT_START }, e: { r, c: SIG_LEFT_END } });
    merges.push({ s: { r, c: SIG_RIGHT_START }, e: { r, c: SIG_RIGHT_END } });
  }
  ws['!merges'] = merges;

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

  const paint = (r, c, style, numFmt) => {
    const addr = XLSX.utils.encode_cell({ r, c });
    if (!ws[addr]) ws[addr] = { t: 's', v: '' };
    ws[addr].s = style;
    if (numFmt && ws[addr].t === 'n') ws[addr].z = numFmt;
  };

  for (let r = 0; r < titleRows.length; r++) for (let c = 0; c < TOTAL_COLS; c++) paint(r, c, STYLE.title);
  for (let r = R_H1; r <= R_H2; r++) for (let c = 0; c < TOTAL_COLS; c++) paint(r, c, STYLE.head);
  for (let i = 0; i < body.length; i++) {
    for (let c = 0; c < TOTAL_COLS; c++) {
      if (c === 2) paint(R_BODY + i, c, STYLE.left);
      else if (c <= 1) paint(R_BODY + i, c, STYLE.center);
      else paint(R_BODY + i, c, STYLE.right, '#,##0');
    }
  }
  for (let c = 0; c < TOTAL_COLS; c++) {
    if (c <= 2) paint(R_TOTAL, c, STYLE.totalCenter);
    else paint(R_TOTAL, c, STYLE.totalRight, '#,##0');
  }
  for (let i = 0; i < 6; i++) for (let c = 0; c < TOTAL_COLS; c++) paint(R_SIG + i, c, STYLE.sig);

  ws['!cols'] = [{ wch: 5 }, { wch: 10 }, { wch: 28 }, { wch: 12 }, ...Array(17).fill({ wch: 11 }), { wch: 13 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'IGD');
  XLSX.writeFile(
    wb,
    rangeStart === rangeEnd
      ? `${FILE_PREFIX}_${rangeStart}.xlsx`
      : `${FILE_PREFIX}_${rangeStart}_sd_${rangeEnd}.xlsx`
  );
}
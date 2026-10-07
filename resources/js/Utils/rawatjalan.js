import * as XLSX from 'xlsx-js-style';
import { toYMD, formatTanggalID } from './igd';

// ─── Konfigurasi ──────────────────────────────────────────────────────────────
export const JUDUL_LAPORAN = 'DATA KUNJUNGAN PASIEN RAWAT JALAN';
export const FILE_PREFIX = 'rawat-jalan';
const BENDAHARA_NAMA = 'Kadiyono';
const BENDAHARA_NIP = 'NIP. 19730519 201001 1 001';

// Urutan kolom biaya (sama dengan nama kolom di database)
export const KEYS = [
  'admisi',
  'visit_umum', 'visit_spesialis',
  'konsul_dokter', 'konsul_gizi',
  'tmno', 'kep', 'tmo',
  'lab', 'ro', 'usg',
  'obat',
];

// Status pembayaran (dipakai kartu di Index, modal StatusPembayaran, dan Excel)
export const STATUS_OPTIONS = [
  { key: 'umum_h2h', label: 'Umum H2H', desc: 'Pembayaran umum via host to host' },
  { key: 'umum_cash', label: 'Umum Cash', desc: 'Pembayaran umum tunai' },
  { key: 'bpjs', label: 'BPJS', desc: 'Pasien peserta BPJS' },
];
export const DEFAULT_STATUS = 'umum_h2h';

// Urutan & label subtotal per shift (ubah label di sini jika ingin "SORE")
export const SHIFT_GROUPS = [
  { key: 'pagi', label: 'JUMLAH PENDAPATAN PAGI' },
  { key: 'siang', label: 'JUMLAH PENDAPATAN SIANG' },
  { key: 'malam', label: 'JUMLAH PENDAPATAN MALAM' },
];

export const sumRows = (list) => {
  const t = {};
  KEYS.forEach((k) => { t[k] = list.reduce((s, r) => s + (r[k] || 0), 0); });
  t.jumlah = list.reduce((s, r) => s + (r.jumlah || 0), 0);
  return t;
};

// ─── Export Excel ─────────────────────────────────────────────────────────────
// rows: [{ no_rm, nama, poliklinik, petugas, nip, shift, jumlah, ...KEYS }]
export function exportRawatJalan({ rows, totals, rangeStart, rangeEnd, shift, status = DEFAULT_STATUS }) {
  if (!rows.length) return;

  const statusText = (STATUS_OPTIONS.find((s) => s.key === status)?.label ?? '').toUpperCase();

  // Kolom: NO | NO RM | NAMA | POLIKLINIK | ADMISI | VISIT DR(2) | KONSUL(2) | TINDAKAN(3) | PENUNJANG(3) | OBAT | JUMLAH
  const TOTAL_COLS = 17;
  const LAST_COL = TOTAL_COLS - 1;
  // Posisi tanda tangan (digeser ke tengah)
  const SIG_LEFT_START = 2, SIG_LEFT_END = 5;
  const SIG_RIGHT_START = 10, SIG_RIGHT_END = 14;
  const blank = () => Array(TOTAL_COLS).fill('');

  const pendapatan =
    rangeStart === rangeEnd
      ? `PENDAPATAN ${formatTanggalID(rangeStart).toUpperCase()}`
      : `PENDAPATAN ${formatTanggalID(rangeStart).toUpperCase()} S/D ${formatTanggalID(rangeEnd).toUpperCase()}`;

  const titleRows = [JUDUL_LAPORAN, `STATUS PEMBAYARAN ${statusText}`, pendapatan, 'RSUD AJIBARANG'].map((t) => {
    const r = blank();
    r[0] = t;
    return r;
  });

  const head1 = blank();
  const head2 = blank();
  Object.entries({
    0: 'NO', 1: 'NO RM', 2: 'NAMA', 3: 'POLIKLINIK', 4: 'ADMISI', 5: 'VISIT DR',
    7: 'KONSUL', 9: 'TINDAKAN', 12: 'PENUNJANG', 15: 'OBAT', 16: 'JUMLAH',
  }).forEach(([c, v]) => { head1[c] = v; });
  ['UMUM', 'SPESIALIS', 'DOKTER', 'GIZI', 'TMNO', 'KEP', 'TMO', 'LAB', 'RO', 'USG']
    .forEach((h, i) => { head2[5 + i] = h; });

  // Body per shift: data (nomor mulai dari 1 di tiap shift) + baris subtotal
  const body = [];
  const bodyType = []; // 'data' | 'sub'
  SHIFT_GROUPS.forEach((g) => {
    const list = rows.filter((r) => r.shift === g.key);

    list.forEach((r, i) => {
      body.push([i + 1, r.no_rm, r.nama, r.poliklinik, ...KEYS.map((k) => r[k] || ''), r.jumlah]);
      bodyType.push('data');
    });

    const t = sumRows(list);
    const sub = blank();
    sub[0] = `${g.label} (${list.length} pasien)`;
    KEYS.forEach((k, i) => { sub[4 + i] = t[k] || '-'; });
    sub[LAST_COL] = t.jumlah || '-';
    body.push(sub);
    bodyType.push('sub');
  });

  const totalRow = blank();
  totalRow[0] = `JUMLAH PAGI, SIANG DAN MALAM (${rows.length} pasien)`;
  KEYS.forEach((k, i) => { totalRow[4 + i] = totals[k] || ''; });
  totalRow[LAST_COL] = totals.jumlah;

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
  [0, 1, 2, 3, 4, 15, 16].forEach((c) => merges.push({ s: { r: R_H1, c }, e: { r: R_H2, c } }));
  merges.push({ s: { r: R_H1, c: 5 }, e: { r: R_H1, c: 6 } });    // VISIT DR
  merges.push({ s: { r: R_H1, c: 7 }, e: { r: R_H1, c: 8 } });    // KONSUL
  merges.push({ s: { r: R_H1, c: 9 }, e: { r: R_H1, c: 11 } });   // TINDAKAN
  merges.push({ s: { r: R_H1, c: 12 }, e: { r: R_H1, c: 14 } });  // PENUNJANG
  bodyType.forEach((type, i) => {
    if (type === 'sub') merges.push({ s: { r: R_BODY + i, c: 0 }, e: { r: R_BODY + i, c: 3 } });
  });
  merges.push({ s: { r: R_TOTAL, c: 0 }, e: { r: R_TOTAL, c: 3 } });
  for (let i = 0; i < 6; i++) {
    const r = R_SIG + i;
    merges.push({ s: { r, c: SIG_LEFT_START }, e: { r, c: SIG_LEFT_END } });
    merges.push({ s: { r, c: SIG_RIGHT_START }, e: { r, c: SIG_RIGHT_END } });
  }
  ws['!merges'] = merges;

  const thin = { style: 'thin', color: { rgb: '000000' } };
  const border = { top: thin, bottom: thin, left: thin, right: thin };
  const al = (h) => ({ horizontal: h, vertical: 'center' });
  const solid = (rgb) => ({ patternType: 'solid', fgColor: { rgb } });

  // Warna (header terang)
  const FILL_SUB = solid('E2E8F0');          // subtotal tiap shift (abu-abu)
  const FILL_HEAD = solid('BFDBFE');         // header tabel (biru muda)
  const FILL_JUMLAH_HEAD = solid('93C5FD');  // header kolom JUMLAH (biru sedang)
  const FILL_JUMLAH_COL = solid('DBEAFE');   // isi kolom JUMLAH baris pasien
  const FILL_TOTAL = solid('BFDBFE');        // baris total 3 shift
  const FILL_TOTAL_JUMLAH = solid('93C5FD'); // sel JUMLAH pada baris total
  const TEXT_DARK = { rgb: '0B2B4F' };

  const STYLE = {
    title: { font: { bold: true, sz: 12 }, alignment: al('center') },
    head: { font: { bold: true, color: TEXT_DARK }, alignment: { ...al('center'), wrapText: true }, border, fill: FILL_HEAD },
    headJumlah: { font: { bold: true, color: TEXT_DARK }, alignment: { ...al('center'), wrapText: true }, border, fill: FILL_JUMLAH_HEAD },
    center: { alignment: al('center'), border },
    left: { alignment: al('left'), border },
    right: { alignment: al('right'), border },
    rightJumlah: { font: { bold: true }, alignment: al('right'), border, fill: FILL_JUMLAH_COL },
    subCenter: { font: { bold: true }, alignment: al('center'), border, fill: FILL_SUB },
    subRight: { font: { bold: true }, alignment: al('right'), border, fill: FILL_SUB },
    totalCenter: { font: { bold: true, color: TEXT_DARK }, alignment: al('center'), border, fill: FILL_TOTAL },
    totalRight: { font: { bold: true, color: TEXT_DARK }, alignment: al('right'), border, fill: FILL_TOTAL },
    totalJumlah: { font: { bold: true, color: TEXT_DARK }, alignment: al('right'), border, fill: FILL_TOTAL_JUMLAH },
    sig: { alignment: al('center') },
  };

  const paint = (r, c, style, numFmt) => {
    const addr = XLSX.utils.encode_cell({ r, c });
    if (!ws[addr]) ws[addr] = { t: 's', v: '' };
    ws[addr].s = style;
    if (numFmt && ws[addr].t === 'n') ws[addr].z = numFmt;
  };

  for (let r = 0; r < titleRows.length; r++) for (let c = 0; c < TOTAL_COLS; c++) paint(r, c, STYLE.title);

  for (let r = R_H1; r <= R_H2; r++) {
    for (let c = 0; c < TOTAL_COLS; c++) paint(r, c, c === LAST_COL ? STYLE.headJumlah : STYLE.head);
  }

  for (let i = 0; i < body.length; i++) {
    const isSub = bodyType[i] === 'sub';
    for (let c = 0; c < TOTAL_COLS; c++) {
      if (isSub) {
        if (c <= 3) paint(R_BODY + i, c, STYLE.subCenter);
        else paint(R_BODY + i, c, STYLE.subRight, '#,##0');
      } else if (c === 2 || c === 3) paint(R_BODY + i, c, STYLE.left);
      else if (c <= 1) paint(R_BODY + i, c, STYLE.center);
      else if (c === LAST_COL) paint(R_BODY + i, c, STYLE.rightJumlah, '#,##0');
      else paint(R_BODY + i, c, STYLE.right, '#,##0');
    }
  }

  for (let c = 0; c < TOTAL_COLS; c++) {
    if (c <= 3) paint(R_TOTAL, c, STYLE.totalCenter);
    else if (c === LAST_COL) paint(R_TOTAL, c, STYLE.totalJumlah, '#,##0');
    else paint(R_TOTAL, c, STYLE.totalRight, '#,##0');
  }

  for (let i = 0; i < 6; i++) for (let c = 0; c < TOTAL_COLS; c++) paint(R_SIG + i, c, STYLE.sig);

  ws['!cols'] = [{ wch: 5 }, { wch: 10 }, { wch: 28 }, { wch: 16 }, ...Array(12).fill({ wch: 11 }), { wch: 13 }];

  // Kertas F4 (Folio 215 x 330 mm) landscape, muat 1 halaman lebar
  ws['!pageSetup'] = {
    paperSize: 14,
    orientation: 'landscape',
    fitToWidth: 1,
    fitToHeight: 0,
    scale: 100,
  };
  ws['!sheetPr'] = { pageSetUpPr: { fitToPage: true } };
  ws['!margins'] = { left: 0.3, right: 0.3, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rawat Jalan');
  XLSX.writeFile(
    wb,
    rangeStart === rangeEnd
      ? `${FILE_PREFIX}_${status}_${rangeStart}.xlsx`
      : `${FILE_PREFIX}_${status}_${rangeStart}_sd_${rangeEnd}.xlsx`
  );
}
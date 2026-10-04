<?php

namespace App\Http\Controllers\Transaksi;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Transaksi\Concerns\MengelolaBiaya;
use App\Models\KunjunganRawatJalan;
use App\Models\Pasien;
use App\Models\Poliklinik;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RawatJalanController extends Controller
{
    use MengelolaBiaya;

    private const BIAYA = [
        'admisi', 'visit_umum', 'visit_spesialis', 'konsul_dokter', 'konsul_gizi',
        'tmno', 'kep', 'tmo', 'lab', 'ro', 'usg', 'obat',
    ];

    public function index(Request $request)
    {
        // Default: bulan ini (sama dengan filter awal di halaman)
        $awal  = $request->tanggal_awal  ?: now()->startOfMonth()->toDateString();
        $akhir = $request->tanggal_akhir ?: now()->endOfMonth()->toDateString();

        $filter = fn ($q) => $q
            ->whereBetween('tanggal_pelayanan', [$awal, $akhir])
            ->when($request->shift, fn ($q, $v) => $q->where('shift', $v))
            ->when($request->user_id, fn ($q, $v) => $q->where('user_id', $v))
            ->when($request->poliklinik_id, fn ($q, $v) => $q->where('poliklinik_id', $v))
            ->when($request->q, fn ($q, $v) => $q->whereHas('pasien', fn ($p) => $p
                ->where('nama', 'ilike', "%$v%")
                ->orWhere('no_rm', 'like', "%$v%")));

        // Tanpa paginate: tabel, total, dan export Excel memakai seluruh data pada periode terpilih
        $data = $filter(KunjunganRawatJalan::with(['pasien:id,no_rm,nama', 'user:id,username', 'poliklinik']))
            ->orderByDesc('tanggal_pelayanan')->orderByDesc('id')
            ->get();

        $total = $this->totalan($filter(KunjunganRawatJalan::query()), [...self::BIAYA, 'jumlah']);

        return Inertia::render('Transaksi/RawatJalan/Index', [
            'data'       => $data,
            'total'      => $total,
            'poliklinik' => Poliklinik::orderBy('poliklinik')->get(),
            'petugas'    => User::orderBy('username')->get(['id', 'username', 'nip']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Transaksi/RawatJalan/Create', $this->formData(new KunjunganRawatJalan));
    }

    public function store(Request $request)
    {
        $this->simpan($request->validate($this->rules()));

        return redirect()->route('rawat-jalan.index')->with('success', 'Data rawat jalan disimpan.');
    }

    public function edit(KunjunganRawatJalan $rawatJalan)
    {
        return Inertia::render('Transaksi/RawatJalan/Edit', $this->formData($rawatJalan->load('pasien')));
    }

    public function update(Request $request, KunjunganRawatJalan $rawatJalan)
    {
        $this->simpan($request->validate($this->rules()), $rawatJalan);

        return redirect()->route('rawat-jalan.index')->with('success', 'Data rawat jalan diperbarui.');
    }

    public function destroy(KunjunganRawatJalan $rawatJalan)
    {
        $rawatJalan->delete();

        return back()->with('success', 'Data rawat jalan dihapus.');
    }

    private function rules(): array
    {
        return [
            'no_rm'             => ['required', 'string', 'max:20'],
            'nama'              => ['required', 'string', 'max:255'],
            'poliklinik_id'     => ['required', 'exists:poliklinik,id'],
            'tanggal_pelayanan' => ['required', 'date'],
            'shift'             => ['required', 'in:pagi,siang,malam'],
        ] + $this->rulesBiaya(self::BIAYA);
    }

    private function simpan(array $data, ?KunjunganRawatJalan $kunjungan = null): void
    {
        DB::transaction(function () use ($data, $kunjungan) {
            $pasien = Pasien::updateOrCreate(['no_rm' => $data['no_rm']], ['nama' => $data['nama']]);
            $biaya  = $this->nilaiBiaya($data, self::BIAYA);

            $isi = [
                // Create: user yang login. Edit: petugas asli tetap dipertahankan.
                'user_id'           => $kunjungan?->user_id ?? auth()->id(),
                'pasien_id'         => $pasien->id,
                'poliklinik_id'     => $data['poliklinik_id'],
                'tanggal_pelayanan' => $data['tanggal_pelayanan'],
                'shift'             => $data['shift'],
            ] + $biaya + ['jumlah' => array_sum($biaya)];

            $kunjungan ? $kunjungan->update($isi) : KunjunganRawatJalan::create($isi);
        });
    }

    private function formData(KunjunganRawatJalan $kunjungan): array
    {
        return [
            'kunjungan'  => $kunjungan,
            'poliklinik' => Poliklinik::orderBy('poliklinik')->get(),
        ];
    }
}
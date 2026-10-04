<?php

namespace App\Http\Controllers\Transaksi;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Transaksi\Concerns\MengelolaBiaya;
use App\Models\KunjunganInap;
use App\Models\Pasien;
use App\Models\Ruangan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RawatInapController extends Controller
{
    use MengelolaBiaya;

    private const BIAYA = [
        'akomodasi_tanpa_makan', 'akomodasi_makan',
        'visite_umum', 'visite_spesialis',
        'konsul_dokter', 'konsul_vct', 'visite_farmasi', 'askep',
        'pelayanan_rm', 'pelayanan_medis', 'konsul_gizi',
        'pelayanan_ro', 'pelayanan_lab', 'pelayanan_usg',
        'tindakan_perawatan', 'tindakan_persalinan',
        'tmno_rinap', 'tmno_poli', 'tmo_rinap', 'tmo_ibs',
        'obat', 'fisio', 'ipj', 'o2', 'ambulan',
    ];

    public function index(Request $request)
    {
        // Default: bulan ini. Periode memakai tanggal masuk.
        $awal  = $request->tanggal_awal  ?: now()->startOfMonth()->toDateString();
        $akhir = $request->tanggal_akhir ?: now()->endOfMonth()->toDateString();

        $data = KunjunganInap::with(['pasien:id,no_rm,nama', 'user:id,username,nip', 'ruangan'])
            ->whereBetween('tanggal_masuk', [$awal, $akhir])
            ->when($request->shift, fn ($q, $v) => $q->where('shift', $v))
            ->when($request->user_id, fn ($q, $v) => $q->where('user_id', $v))
            ->when($request->ruangan_id, fn ($q, $v) => $q->where('ruangan_id', $v))
            ->orderByDesc('tanggal_masuk')->orderByDesc('id')
            ->get();

        return Inertia::render('Transaksi/RawatInap/Index', [
            'data'    => $data,
            'petugas' => User::orderBy('username')->get(['id', 'username']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Transaksi/RawatInap/Create', $this->formData(new KunjunganInap));
    }

    public function store(Request $request)
    {
        $this->simpan($request->validate($this->rules()));

        return redirect()->route('rawat-inap.index')->with('success', 'Data rawat inap disimpan.');
    }

    public function edit(KunjunganInap $rawatInap)
    {
        return Inertia::render('Transaksi/RawatInap/Edit', $this->formData($rawatInap->load('pasien')));
    }

    public function update(Request $request, KunjunganInap $rawatInap)
    {
        $this->simpan($request->validate($this->rules()), $rawatInap);

        return redirect()->route('rawat-inap.index')->with('success', 'Data rawat inap diperbarui.');
    }

    public function destroy(KunjunganInap $rawatInap)
    {
        $rawatInap->delete();

        return back()->with('success', 'Data rawat inap dihapus.');
    }

    private function rules(): array
    {
        return [
            'no_rm'             => ['required', 'string', 'max:20'],
            'nama'              => ['required', 'string', 'max:255'],
            'ruangan_id'        => ['required', 'exists:ruangan,id'],
            'tanggal_pelayanan' => ['required', 'date'],
            'shift'             => ['required', 'in:pagi,siang,malam'],
            'tanggal_masuk'     => ['required', 'date'],
            'tanggal_keluar'    => ['nullable', 'date', 'after_or_equal:tanggal_masuk'],
            'jumlah_igd'        => ['nullable', 'integer', 'min:0', 'max:1000000000'],
        ] + $this->rulesBiaya(self::BIAYA);
    }

    private function simpan(array $data, ?KunjunganInap $kunjungan = null): void
    {
        DB::transaction(function () use ($data, $kunjungan) {
            $pasien = Pasien::updateOrCreate(['no_rm' => $data['no_rm']], ['nama' => $data['nama']]);
            $biaya  = $this->nilaiBiaya($data, self::BIAYA);
            $rinap  = array_sum($biaya);
            $igd    = (int) ($data['jumlah_igd'] ?? 0);

            $isi = [
                // Create: user yang login. Edit: petugas asli tetap dipertahankan.
                'user_id'           => $kunjungan?->user_id ?? auth()->id(),
                'pasien_id'         => $pasien->id,
                'ruangan_id'        => $data['ruangan_id'],
                'tanggal_pelayanan' => $data['tanggal_pelayanan'],
                'shift'             => $data['shift'],
                'tanggal_masuk'     => $data['tanggal_masuk'],
                'tanggal_keluar'    => $data['tanggal_keluar'] ?? null,
            ] + $biaya + [
                'jumlah_rinap' => $rinap,
                'jumlah_igd'   => $igd,
                'total'        => $rinap + $igd,
            ];

            $kunjungan ? $kunjungan->update($isi) : KunjunganInap::create($isi);
        });
    }

    private function formData(KunjunganInap $kunjungan): array
    {
        return [
            'kunjungan' => $kunjungan,
            'ruangan'   => Ruangan::orderBy('ruangan')->get(),
        ];
    }
}
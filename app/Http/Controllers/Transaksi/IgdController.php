<?php

namespace App\Http\Controllers\Transaksi;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Transaksi\Concerns\MengelolaBiaya;
use App\Models\KunjunganIgd;
use App\Models\Pasien;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class IgdController extends Controller
{
    use MengelolaBiaya;

    private const BIAYA = [
        'jasa_sarana', 'dokter_umum', 'dokter_spesialis',
        'konsul', 'askep', 'pnm', 'tmno', 'kep', 'tmo', 'persal',
        'lab', 'ro', 'usg', 'o2', 'ipj', 'ambulan', 'akomodasi', 'obat',
    ];

    public function index(Request $request)
    {
        // Default: bulan ini (sama dengan filter awal di halaman)
        $awal  = $request->tanggal_awal  ?: now()->startOfMonth()->toDateString();
        $akhir = $request->tanggal_akhir ?: now()->endOfMonth()->toDateString();

        $data = KunjunganIgd::with(['pasien:id,no_rm,nama', 'user:id,username,nip'])
            ->whereBetween('tanggal_pelayanan', [$awal, $akhir])
            ->when($request->shift, fn ($q, $v) => $q->where('shift', $v))
            ->when($request->user_id, fn ($q, $v) => $q->where('user_id', $v))
            ->orderByDesc('tanggal_pelayanan')->orderByDesc('id')
            ->get();

        return Inertia::render('Transaksi/RawatJalanIgd/Index', [
            'data'    => $data,
            'petugas' => User::orderBy('username')->get(['id', 'username']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Transaksi/RawatJalanIgd/Create', $this->formData(new KunjunganIgd));
    }

    public function store(Request $request)
    {
        $this->simpan($request->validate($this->rules()));

        return redirect()->route('igd.index')->with('success', 'Data IGD disimpan.');
    }

    public function edit(KunjunganIgd $igd)
    {
        return Inertia::render('Transaksi/RawatJalanIgd/Edit', $this->formData($igd->load('pasien')));
    }

    public function update(Request $request, KunjunganIgd $igd)
    {
        $this->simpan($request->validate($this->rules()), $igd);

        return redirect()->route('igd.index')->with('success', 'Data IGD diperbarui.');
    }

    public function destroy(KunjunganIgd $igd)
    {
        $igd->delete();

        return back()->with('success', 'Data IGD dihapus.');
    }

    private function rules(): array
    {
        return [
            'no_rm'             => ['required', 'string', 'max:20'],
            'nama'              => ['required', 'string', 'max:255'],
            'tanggal_pelayanan' => ['required', 'date'],
            'shift'             => ['required', 'in:pagi,siang,malam'],
        ] + $this->rulesBiaya(self::BIAYA);
    }

    private function simpan(array $data, ?KunjunganIgd $kunjungan = null): void
    {
        DB::transaction(function () use ($data, $kunjungan) {
            $pasien = Pasien::updateOrCreate(['no_rm' => $data['no_rm']], ['nama' => $data['nama']]);
            $biaya  = $this->nilaiBiaya($data, self::BIAYA);

            $isi = [
                // Create: user yang login. Edit: petugas asli tetap dipertahankan.
                'user_id'           => $kunjungan?->user_id ?? auth()->id(),
                'pasien_id'         => $pasien->id,
                'tanggal_pelayanan' => $data['tanggal_pelayanan'],
                'shift'             => $data['shift'],
            ] + $biaya + ['jumlah' => array_sum($biaya)];

            $kunjungan ? $kunjungan->update($isi) : KunjunganIgd::create($isi);
        });
    }

    private function formData(KunjunganIgd $kunjungan): array
    {
        return ['kunjungan' => $kunjungan];
    }
}
<?php

namespace App\Http\Controllers\Transaksi;

use App\Http\Controllers\Controller;
use App\Models\KunjunganIgd;
use App\Models\KunjunganInap;
use App\Models\KunjunganRawatJalan;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SemuaController extends Controller
{
    public function index(Request $request)
    {
        // Default: bulan ini (sama dengan filter awal di halaman)
        $awal  = $request->tanggal_awal  ?: now()->startOfMonth()->toDateString();
        $akhir = $request->tanggal_akhir ?: now()->endOfMonth()->toDateString();

        $ambil = fn (string $model, string $jenis, string $kolomTanggal, string $kolomJumlah) => $model::query()
            ->with(['pasien:id,no_rm,nama', 'user:id,username'])
            ->whereBetween($kolomTanggal, [$awal, $akhir])
            ->when($request->shift, fn ($q, $v) => $q->where('shift', $v))
            ->when($request->user_id, fn ($q, $v) => $q->where('user_id', $v))
            ->get()
            ->map(fn ($r) => [
                'key'     => "{$jenis}-{$r->id}",
                'jenis'   => $jenis,
                'id'      => $r->id,
                'no_rm'   => $r->pasien?->no_rm ?? '',
                'nama'    => $r->pasien?->nama ?? '',
                'petugas' => $r->user?->username ?? '-',
                'shift'   => $r->shift,
                'tanggal' => $r->{$kolomTanggal}?->format('Y-m-d'),
                'jumlah'  => (float) $r->{$kolomJumlah},
            ]);

        $data = collect()
            ->concat($ambil(KunjunganRawatJalan::class, 'rawat_jalan', 'tanggal_pelayanan', 'jumlah'))
            ->concat($ambil(KunjunganIgd::class, 'igd', 'tanggal_pelayanan', 'jumlah'))
            ->concat($ambil(KunjunganInap::class, 'rawat_inap', 'tanggal_masuk', 'total'))
            ->sortByDesc(fn ($r) => $r['tanggal'] . str_pad($r['id'], 10, '0', STR_PAD_LEFT))
            ->values();

        return Inertia::render('Transaksi/Semua/Index', [
            'data'    => $data,
            'petugas' => User::orderBy('username')->get(['id', 'username']),
        ]);
    }
}
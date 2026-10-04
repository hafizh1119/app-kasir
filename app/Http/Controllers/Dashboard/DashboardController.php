<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\KunjunganIgd;
use App\Models\KunjunganInap;
use App\Models\KunjunganRawatJalan;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $now = now();

        // Cakup minggu ini dan bulan ini (minggu bisa melewati pergantian bulan)
        $awal  = $now->copy()->startOfWeek()->min($now->copy()->startOfMonth())->toDateString();
        $akhir = $now->copy()->endOfWeek()->max($now->copy()->endOfMonth())->toDateString();

        $ambil = fn (string $model, string $jenis, string $kolomTanggal, string $kolomJumlah) => $model::query()
            ->with(['pasien:id,no_rm,nama', 'user:id,username'])
            ->whereBetween($kolomTanggal, [$awal, $akhir])
            ->get()
            ->map(fn ($r) => [
                'key'     => "{$jenis}-{$r->id}",
                'jenis'   => $jenis,
                'id'      => $r->id,
                'no_rm'   => $r->pasien?->no_rm ?? '',
                'nama'    => $r->pasien?->nama ?? '',
                'petugas' => $r->user?->username ?? '-',
                'shift'   => ucfirst((string) $r->shift),
                'tanggal' => $r->{$kolomTanggal}?->format('Y-m-d'),
                'jumlah'  => (float) $r->{$kolomJumlah},
            ]);

        $transaksi = collect()
            ->concat($ambil(KunjunganRawatJalan::class, 'rawat_jalan', 'tanggal_pelayanan', 'jumlah'))
            ->concat($ambil(KunjunganIgd::class, 'igd', 'tanggal_pelayanan', 'jumlah'))
            ->concat($ambil(KunjunganInap::class, 'rawat_inap', 'tanggal_masuk', 'total'))
            ->sortByDesc(fn ($r) => $r['tanggal'] . str_pad($r['id'], 10, '0', STR_PAD_LEFT))
            ->values();

        return Inertia::render('Dashboard/Index', [
            'transaksi' => $transaksi,
        ]);
    }
}
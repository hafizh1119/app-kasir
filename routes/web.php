<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Master\PoliklinikController;
use App\Http\Controllers\Master\RuanganController;
use App\Http\Controllers\Master\PasienController;
use App\Http\Controllers\Pengguna\UserController;
use App\Http\Controllers\Transaksi\IgdController;
use App\Http\Controllers\Transaksi\RawatInapController;
use App\Http\Controllers\Transaksi\RawatJalanController;
use App\Http\Controllers\Transaksi\SemuaController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

// ================= REDIRECT ROOT =================
Route::get('/', function () {
    return auth()->check() ? redirect()->route('dashboard') : redirect()->route('login');
});

// ================= AUTENTIKASI =================
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'showLogin'])->name('login');
    Route::post('/login', [LoginController::class, 'login']);
});

Route::post('/logout', [LoginController::class, 'logout'])->name('logout')->middleware('auth');

// ================= HALAMAN YANG WAJIB LOGIN =================
Route::middleware('auth')->group(function () {

    // ---------- DASHBOARD ----------
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ---------- TRANSAKSI ----------
    // URL: /rawat-jalan, /rawat-jalan/create, /rawat-jalan/{id}/edit, dst.
    Route::resource('rawat-jalan', RawatJalanController::class)
        ->parameters(['rawat-jalan' => 'rawatJalan'])
        ->except('show');

    Route::resource('igd', IgdController::class)
        ->except('show');

    Route::resource('rawat-inap', RawatInapController::class)
        ->parameters(['rawat-inap' => 'rawatInap'])
        ->except('show');

    Route::get('/transaksi', [SemuaController::class, 'index'])
        ->name('transaksi.index');

    // Dipakai form transaksi untuk autocomplete pasien
    Route::get('/pasien/cari', [PasienController::class, 'cari'])->name('pasien.cari');

    // ---------- MASTER DATA ----------
    // Nama route: datamaster.poliklinik.index, datamaster.ruangan.store, dst.
    Route::prefix('datamaster')->name('datamaster.')->group(function () {
        Route::resource('poliklinik', PoliklinikController::class)
            ->only(['index', 'store', 'update', 'destroy']);

        Route::resource('ruangan', RuanganController::class)
            ->only(['index', 'store', 'update', 'destroy']);

        Route::resource('pasien', PasienController::class)
            ->only(['index', 'update', 'destroy']);
    });

    // ---------- PENGGUNA ----------
    Route::resource('pengguna', UserController::class)
        ->parameters(['pengguna' => 'user'])
        ->only(['index', 'store', 'update', 'destroy']);
    Route::put('pengguna/{user}/password', [UserController::class, 'updatePassword'])
        ->name('pengguna.password');

    Route::get('/tes-db', function () {
    $t = microtime(true);
    DB::connection()->getPdo();
    $konek = round((microtime(true) - $t) * 1000);

    $t = microtime(true);
    DB::select('select 1');
    $q1 = round((microtime(true) - $t) * 1000);

    $t = microtime(true);
    DB::select('select 1');
    $q2 = round((microtime(true) - $t) * 1000);

    return compact('konek', 'q1', 'q2'); // satuan ms
});
});
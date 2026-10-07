<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $tabel = [
        'kunjungan_rawat_jalan',
        'kunjungan_igd',
        'kunjungan_inap',
    ];

    public function up(): void
    {
        foreach ($this->tabel as $nama) {
            Schema::table($nama, function (Blueprint $table) {
                $table->string('status_pembayaran', 20)->default('umum_h2h')->index();
            });
        }
    }

    public function down(): void
    {
        foreach ($this->tabel as $nama) {
            Schema::table($nama, function (Blueprint $table) {
                $table->dropColumn('status_pembayaran');
            });
        }
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('kunjungan_rawat_jalan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');            // petugas
            $table->foreignId('pasien_id')->constrained('pasien');         // no RM + nama
            $table->foreignId('poliklinik_id')->constrained('poliklinik');
            $table->date('tanggal_pelayanan');
            $table->enum('shift', ['pagi', 'siang', 'malam']);

            $table->unsignedInteger('admisi')->default(0);
            $table->unsignedInteger('visit_umum')->default(0);
            $table->unsignedInteger('visit_spesialis')->default(0);
            $table->unsignedInteger('konsul_dokter')->default(0);
            $table->unsignedInteger('konsul_gizi')->default(0);
            $table->unsignedInteger('tmno')->default(0);
            $table->unsignedInteger('kep')->default(0);
            $table->unsignedInteger('tmo')->default(0);
            $table->unsignedInteger('lab')->default(0);
            $table->unsignedInteger('ro')->default(0);
            $table->unsignedInteger('usg')->default(0);
            $table->unsignedInteger('obat')->default(0);
            $table->unsignedInteger('jumlah')->default(0);

            $table->timestamps();

            $table->index('tanggal_pelayanan');
            $table->index(['user_id', 'tanggal_pelayanan']);
            $table->index('pasien_id');
            $table->index('poliklinik_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kunjungan_rawat_jalan');
    }
};

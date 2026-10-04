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
        Schema::create('kunjungan_inap', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('pasien_id')->constrained('pasien');
            $table->foreignId('ruangan_id')->constrained('ruangan');
            $table->date('tanggal_pelayanan');
            $table->enum('shift', ['pagi', 'siang', 'malam']);
            $table->date('tanggal_masuk');
            $table->date('tanggal_keluar')->nullable();

            foreach ([
                'akomodasi_tanpa_makan', 'akomodasi_makan',
                'visite_umum', 'visite_spesialis',
                'konsul_dokter', 'konsul_vct',
                'visite_farmasi',
                'askep',
                'pelayanan_rm', 'pelayanan_medis',
                'konsul_gizi',
                'pelayanan_ro', 'pelayanan_lab', 'pelayanan_usg',
                'tindakan_perawatan', 'tindakan_persalinan',
                'tmno_rinap', 'tmno_poli',
                'tmo_rinap', 'tmo_ibs',
                'obat', 'fisio', 'ipj', 'o2', 'ambulan',
                'jumlah_rinap', 'jumlah_igd', 'total',
            ] as $kolom) {
                $table->unsignedInteger($kolom)->default(0);
            }

            $table->timestamps();

            $table->index('tanggal_pelayanan');
            $table->index(['user_id', 'tanggal_pelayanan']);
            $table->index('pasien_id');
            $table->index('ruangan_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kunjungan_inap');
    }
};

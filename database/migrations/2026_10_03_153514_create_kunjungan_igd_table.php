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
        Schema::create('kunjungan_igd', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('pasien_id')->constrained('pasien');
            $table->date('tanggal_pelayanan');
            $table->enum('shift', ['pagi', 'siang', 'malam']);

            foreach ([
                'jasa_sarana',
                'dokter_umum', 'dokter_spesialis',
                'konsul', 'askep', 'pnm', 'tmno', 'kep', 'tmo', 'persal',
                'lab', 'ro', 'usg',
                'o2', 'ipj', 'ambulan', 'akomodasi',
                'obat', 'jumlah',
            ] as $kolom) {
                $table->unsignedInteger($kolom)->default(0);
            }

            $table->timestamps();

            $table->index('tanggal_pelayanan');
            $table->index(['user_id', 'tanggal_pelayanan']);
            $table->index('pasien_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kunjungan_igd');
    }
};

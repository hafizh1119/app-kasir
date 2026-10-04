<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransaksiRawatJalan extends Model
{
    protected $table = 'transaksi_rawat_jalan';

    protected $fillable = [
        'no_rm',
        'nama',
        'tanggal',
        'shift',
        'dokter',
        'poli',
        'penjamin',
        'jasa_sarana',
        'umum',
        'spesialis',
        'konsul',
        'askep',
        'pnm',
        'tmno',
        'kep',
        'tmo',
        'persal',
        'lab',
        'ro',
        'usg',
        'o2',
        'ipj',
        'ambln',
        'akomodasi',
        'obat',
        'jumlah',
        'user_id',
    ];

    protected $casts = [
        'tanggal' => 'date:Y-m-d',
    ];

    /**
     * Hitung jumlah total dari semua komponen biaya.
     */
    public function hitungJumlah(): int
    {
        return
            $this->jasa_sarana +
            $this->umum + $this->spesialis +
            $this->konsul + $this->askep + $this->pnm +
            $this->tmno + $this->kep + $this->tmo + $this->persal +
            $this->lab + $this->ro + $this->usg +
            $this->o2 + $this->ipj + $this->ambln +
            $this->akomodasi + $this->obat;
    }

    /**
     * Auto-hitung jumlah sebelum menyimpan.
     */
    protected static function booted(): void
    {
        static::saving(function (TransaksiRawatJalan $trx) {
            $trx->jumlah = $trx->hitungJumlah();
        });
    }

    /**
     * Relasi ke user (kasir yang menginput).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

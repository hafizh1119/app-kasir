<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KunjunganInap extends Model
{
    protected $table = 'kunjungan_inap';
    protected $guarded = [];
    protected $casts = [
        'tanggal_pelayanan' => 'date:Y-m-d',
        'tanggal_masuk'     => 'date:Y-m-d',
        'tanggal_keluar'    => 'date:Y-m-d',
    ];

    public function pasien()  { return $this->belongsTo(Pasien::class); }
    public function user()    { return $this->belongsTo(User::class); }
    public function ruangan() { return $this->belongsTo(Ruangan::class); }
}

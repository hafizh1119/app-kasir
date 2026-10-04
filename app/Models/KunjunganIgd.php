<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KunjunganIgd extends Model
{
    protected $table = 'kunjungan_igd';
    protected $guarded = [];
    protected $casts = ['tanggal_pelayanan' => 'date'];

    public function pasien() { return $this->belongsTo(Pasien::class); }
    public function user()   { return $this->belongsTo(User::class); }
}

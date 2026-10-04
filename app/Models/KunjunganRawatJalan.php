<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class KunjunganRawatJalan extends Model
{
    protected $table = 'kunjungan_rawat_jalan';
    protected $guarded = [];
    protected $casts = ['tanggal_pelayanan' => 'date:Y-m-d'];

    public function pasien()     { return $this->belongsTo(Pasien::class); }
    public function user()       { return $this->belongsTo(User::class); }
    public function poliklinik() { return $this->belongsTo(Poliklinik::class); }
}

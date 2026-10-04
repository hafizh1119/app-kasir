<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Poliklinik extends Model
{
    protected $table = 'poliklinik';
    public $timestamps = false;
    protected $fillable = ['poliklinik'];

    public function kunjungan() 
    { 
        return $this->hasMany(KunjunganRawatJalan::class); 
    }
}

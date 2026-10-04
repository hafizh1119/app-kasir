<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ruangan extends Model
{
    protected $table = 'ruangan';
    public $timestamps = false;
    protected $fillable = ['ruangan'];

    public function kunjunganInap() { return $this->hasMany(KunjunganInap::class); }
}

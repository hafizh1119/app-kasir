<?php

namespace App\Http\Controllers\Transaksi\Concerns;

trait MengelolaBiaya
{
    protected function rulesBiaya(array $kolom): array
    {
        return collect($kolom)
            ->mapWithKeys(fn ($k) => [$k => ['nullable', 'integer', 'min:0', 'max:1000000000']])
            ->all();
    }

    protected function nilaiBiaya(array $data, array $kolom): array
    {
        return collect($kolom)
            ->mapWithKeys(fn ($k) => [$k => (int) ($data[$k] ?? 0)])
            ->all();
    }

    /** Satu query agregat untuk baris TOTAL di bawah tabel. */
    protected function totalan($query, array $kolom)
    {
        $sum = collect($kolom)->map(fn ($k) => "COALESCE(SUM($k),0) as $k")->implode(', ');

        return $query->selectRaw("COUNT(*) as jumlah_pasien, $sum")->first();
    }
}
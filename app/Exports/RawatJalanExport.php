<?php

namespace App\Exports;

use App\Models\TransaksiRawatJalan;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class RawatJalanExport implements FromView, ShouldAutoSize, WithStyles
{
    protected $start;
    protected $end;
    protected $shift;
    protected $search;

    public function __construct($start, $end, $shift, $search)
    {
        $this->start = $start;
        $this->end = $end;
        $this->shift = $shift;
        $this->search = $search;
    }

    public function view(): View
    {
        $query = TransaksiRawatJalan::query()->orderBy('tanggal', 'asc')->orderBy('id', 'asc');

        if ($this->start && $this->end) {
            $query->whereBetween('tanggal', [$this->start, $this->end]);
        }
        if ($this->shift) {
            $query->where('shift', $this->shift);
        }
        if ($this->search) {
            $search = $this->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('no_rm', 'like', "%{$search}%");
            });
        }

        return view('exports.rawat-jalan', [
            'transaksi' => $query->get()
        ]);
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
            2 => ['font' => ['bold' => true]],
            3 => ['font' => ['bold' => true]],
        ];
    }
}

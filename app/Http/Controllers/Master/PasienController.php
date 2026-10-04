<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Pasien;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PasienController extends Controller
{
    public function index(Request $request)
    {
        $data = Pasien::query()
            ->when($request->q, function ($q, $v) {
                $like = '%' . mb_strtolower($v) . '%';
                $q->where(fn ($w) => $w
                    ->whereRaw('LOWER(nama) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(no_rm) LIKE ?', [$like]));
            })
            ->orderBy('nama')->orderBy('id')
            ->paginate(50, ['id', 'no_rm', 'nama'])
            ->withQueryString();

        return Inertia::render('DataMaster/Pasien/Index', [
            'data'    => $data,
            'filters' => ['q' => $request->q],
        ]);
    }

    public function update(Request $request, Pasien $pasien)
    {
        $data = $request->validate([
            'no_rm' => ['required', 'string', 'max:20', Rule::unique('pasien', 'no_rm')->ignore($pasien->id)],
            'nama'  => ['required', 'string', 'max:255'],
        ]);

        $pasien->update($data);

        return back()->with('success', 'Data pasien diperbarui.');
    }

    public function destroy(Pasien $pasien)
    {
        try {
            $pasien->delete();
        } catch (QueryException $e) {
            return back()->with('error', 'Pasien tidak bisa dihapus karena sudah memiliki data transaksi.');
        }

        return back()->with('success', 'Data pasien dihapus.');
    }

    public function cari(Request $request)
    {
        $q = trim((string) $request->q);

        if (mb_strlen($q) < 2) {
            return response()->json([]);
        }

        // Escape wildcard supaya "%" atau "_" yang diketik tidak jadi pola
        $like = addcslashes($q, '%_\\');

        return Pasien::query()
            ->where(fn ($w) => $w
                ->where('no_rm', 'like', "$like%")
                ->orWhere('nama', 'ilike', "%$like%"))
            ->orderBy('nama')
            ->limit(8)
            ->get(['id', 'no_rm', 'nama']);
    }
}
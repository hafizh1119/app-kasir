<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Ruangan;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class RuanganController extends Controller
{
    public function index()
    {
        return Inertia::render('DataMaster/Ruangan/Index', [
            'data' => Ruangan::orderBy('ruangan')->get(),
        ]);
    }

    public function store(Request $request)
    {
        Ruangan::create($request->validate([
            'ruangan' => ['required', 'string', 'max:50', 'unique:ruangan,ruangan'],
        ], $this->messages(), $this->attributes()));

        return back()->with('success', 'Ruangan ditambahkan.');
    }

    public function update(Request $request, Ruangan $ruangan)
    {
        $ruangan->update($request->validate([
            'ruangan' => ['required', 'string', 'max:50', Rule::unique('ruangan', 'ruangan')->ignore($ruangan->id)],
        ], $this->messages(), $this->attributes()));

        return back()->with('success', 'Ruangan diperbarui.');
    }

    public function destroy(Ruangan $ruangan)
    {
        if ($ruangan->kunjunganInap()->exists()) {
            return back()->with('error', 'Ruangan masih dipakai di data rawat inap, tidak bisa dihapus.');
        }

        $ruangan->delete();

        return back()->with('success', 'Ruangan dihapus.');
    }

    // ── Pesan validasi bahasa Indonesia ──
    private function messages(): array
    {
        return [
            'required' => ':attribute wajib diisi.',
            'unique'   => ':attribute sudah ada.',
            'max'      => ':attribute maksimal :max karakter.',
        ];
    }

    private function attributes(): array
    {
        return ['ruangan' => 'Nama ruangan'];
    }
}
<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Poliklinik;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PoliklinikController extends Controller
{
    public function index()
    {
        return Inertia::render('DataMaster/Poliklinik/Index', [
            'data' => Poliklinik::orderBy('poliklinik')->get(),
        ]);
    }

    public function store(Request $request)
    {
        Poliklinik::create($request->validate([
            'poliklinik' => ['required', 'string', 'max:50', 'unique:poliklinik,poliklinik'],
        ], $this->messages(), $this->attributes()));

        return back()->with('success', 'Poliklinik ditambahkan.');
    }

    public function update(Request $request, Poliklinik $poliklinik)
    {
        $poliklinik->update($request->validate([
            'poliklinik' => ['required', 'string', 'max:50', Rule::unique('poliklinik', 'poliklinik')->ignore($poliklinik->id)],
        ], $this->messages(), $this->attributes()));

        return back()->with('success', 'Poliklinik diperbarui.');
    }

    public function destroy(Poliklinik $poliklinik)
    {
        if ($poliklinik->kunjungan()->exists()) {
            return back()->with('error', 'Poliklinik masih dipakai di data rawat jalan, tidak bisa dihapus.');
        }

        $poliklinik->delete();

        return back()->with('success', 'Poliklinik dihapus.');
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
        return ['poliklinik' => 'Nama poliklinik'];
    }
}
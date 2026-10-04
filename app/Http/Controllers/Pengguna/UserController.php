<?php

namespace App\Http\Controllers\Pengguna;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        // Kirim semua pengguna (jumlahnya kecil), pencarian dilakukan di React
        $data = User::select('id', 'username', 'nip', 'role')
            ->orderBy('username')
            ->get();

        return Inertia::render('Pengguna/Index', ['data' => $data]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'username' => ['required', 'string', 'max:50', 'unique:users,username'],
            'nip'      => ['required', 'string', 'max:30', 'unique:users,nip'],
            'role'     => ['required', Rule::in(['admin', 'kasir'])],
            'password' => ['required', 'string', 'min:6'],
        ], $this->messages(), $this->attributes());

        // Password otomatis di-hash oleh cast 'hashed' di model User
        User::create($data);

        return back()->with('success', 'Pengguna ditambahkan.');
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'username' => ['required', 'string', 'max:50', Rule::unique('users', 'username')->ignore($user->id)],
            'nip'      => ['required', 'string', 'max:30', Rule::unique('users', 'nip')->ignore($user->id)],
            'role'     => ['required', Rule::in(['admin', 'kasir'])],
        ], $this->messages(), $this->attributes());

        $user->update($data);

        return back()->with('success', 'Pengguna diperbarui.');
    }

    public function updatePassword(Request $request, User $user)
    {
        $data = $request->validate([
            'password' => ['required', 'string', 'min:6'],
        ], $this->messages(), $this->attributes());

        $user->update(['password' => $data['password']]);

        return back()->with('success', 'Password berhasil diubah.');
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'Tidak bisa menghapus akun sendiri.');
        }

        if ($user->kunjunganRawatJalan()->exists() || $user->kunjunganIgd()->exists() || $user->kunjunganInap()->exists()) {
            return back()->with('error', 'Pengguna sudah punya data transaksi, tidak bisa dihapus.');
        }

        $user->delete();

        return back()->with('success', 'Pengguna dihapus.');
    }

    // ── Pesan validasi bahasa Indonesia ──
    private function messages(): array
    {
        return [
            'required' => ':attribute wajib diisi.',
            'unique'   => ':attribute sudah dipakai.',
            'max'      => ':attribute maksimal :max karakter.',
            'min'      => ':attribute minimal :min karakter.',
            'in'       => ':attribute tidak valid.',
        ];
    }

    private function attributes(): array
    {
        return [
            'username' => 'Username',
            'nip'      => 'NIP',
            'role'     => 'Role',
            'password' => 'Password',
        ];
    }
}
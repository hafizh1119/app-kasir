<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['username' => 'admin'],
            [
                'nip'      => '1234567890',
                'role'     => 'admin',
                'password' => Hash::make('password'),
            ]
        );

        foreach (['Rina' => '1111111111', 'Dewi' => '2222222222', 'Andi' => '3333333333'] as $nama => $nip) {
            User::updateOrCreate(
                ['username' => strtolower($nama)],
                [
                    'nip'      => $nip,
                    'role'     => 'staff',
                    'password' => Hash::make('password'),
                ]
            );
        }
    }
}
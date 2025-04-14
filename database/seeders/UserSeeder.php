<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        // Create default users
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'role_id' => Role::where('name', 'superadmin')->first()->id,
                'email_verified_at' => now(),
                'remember_token' => Str::random(10),
            ]
        );

        // Add more users for development environment
        if (app()->environment('local', 'development')) {
            User::firstOrCreate(
                ['email' => 'admin@example.com'],
                [
                    'name' => 'Admin User',
                    'password' => Hash::make('password'),
                    'role_id' => Role::where('name', 'admin')->first()->id,
                    'email_verified_at' => now(),
                    'remember_token' => Str::random(10),
                ]
            );

            User::factory(10)->create(['role_id' => Role::where('name', 'user')->first()->id]);
        }
    }
}

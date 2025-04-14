<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = User::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'remember_token' => Str::random(10),
            'role_id' => Role::where('name', 'user')->first()->id ?? 3,
        ];
    }

    /**
     * Indicate that the user is an admin.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function admin()
    {
        return $this->state(function (array $attributes) {
            return [
                'role_id' => Role::where('name', 'admin')->first()->id ?? 2,
            ];
        });
    }

    /**
     * Indicate that the user is a superadmin.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function superadmin()
    {
        return $this->state(function (array $attributes) {
            return [
                'role_id' => Role::where('name', 'superadmin')->first()->id ?? 1,
            ];
        });
    }
}

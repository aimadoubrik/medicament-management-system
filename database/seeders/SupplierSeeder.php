<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        $suppliers = [
            [
                'name' => 'PharmaStar',
                'contact_person' => 'John Doe',
                'phone' => '1234567890',
                'email' => 'contact@pharmastar.com',
                'address' => '123 Pharma Street, MedCity',
            ],
            [
                'name' => 'MediSource',
                'contact_person' => 'Jane Smith',
                'phone' => '9876543210',
                'email' => 'info@medisource.com',
                'address' => '456 Health Avenue, Welltown',
            ],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::firstOrCreate(['email' => $supplier['email']], $supplier);
        }

        // Additional suppliers for development
        if (app()->environment('local', 'development')) {
            Supplier::factory(8)->create();
        }
    }
}

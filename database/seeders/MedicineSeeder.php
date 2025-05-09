<?php

namespace Database\Seeders;

use App\Models\Medicine;
use Illuminate\Database\Seeder;

class MedicineSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $medicines = [
            [
                'name' => 'Paracetamol',
                'manufacturer_distributor' => 'Generic Pharma',
                'dosage' => '500mg',
                'form' => 'Tablet',
                'unit_of_measure' => 'mg',
                'reorder_level' => 20,
                'description' => 'Pain reliever and fever reducer',
            ],
            [
                'name' => 'Amoxicillin',
                'manufacturer_distributor' => 'Med Labs',
                'dosage' => '250mg',
                'form' => 'Capsule',
                'unit_of_measure' => 'mg',
                'reorder_level' => 15,
                'description' => 'Antibiotic for bacterial infections',
            ],
            [
                'name' => 'Loratadine',
                'manufacturer_distributor' => 'AllerCare',
                'dosage' => '10mg',
                'form' => 'Tablet',
                'unit_of_measure' => 'mg',
                'reorder_level' => 10,
                'description' => 'Non-drowsy antihistamine for allergies',
            ],
        ];

        foreach ($medicines as $medicine) {
            Medicine::firstOrCreate(
                ['name' => $medicine['name'], 'dosage' => $medicine['dosage']],
                $medicine
            );
        }

        // Additional medicines for development
        if (app()->environment('local', 'development')) {
            Medicine::factory(10)->create();
        }
    }
}

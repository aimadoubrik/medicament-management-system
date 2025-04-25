<?php

namespace Database\Seeders;

use App\Models\Category;
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
                'generic_name' => 'Acetaminophen',
                'manufacturer' => 'Generic Pharma',
                'strength' => '500mg',
                'form' => 'Tablet',
                'description' => 'Pain reliever and fever reducer',
                'category_id' => Category::where('name', 'Analgesics')->first()->id,
                'requires_prescription' => false,
                'low_stock_threshold' => 20,
            ],
            [
                'name' => 'Amoxicillin',
                'generic_name' => 'Amoxicillin',
                'manufacturer' => 'Med Labs',
                'strength' => '250mg',
                'form' => 'Capsule',
                'description' => 'Antibiotic for bacterial infections',
                'category_id' => Category::where('name', 'Antibiotics')->first()->id,
                'requires_prescription' => true,
                'low_stock_threshold' => 15,
            ],
            [
                'name' => 'Loratadine',
                'generic_name' => 'Loratadine',
                'manufacturer' => 'AllerCare',
                'strength' => '10mg',
                'form' => 'Tablet',
                'description' => 'Non-drowsy antihistamine for allergies',
                'category_id' => Category::where('name', 'Antihistamines')->first()->id,
                'requires_prescription' => false,
                'low_stock_threshold' => 10,
            ],
        ];

        foreach ($medicines as $medicine) {
            Medicine::firstOrCreate(
                ['name' => $medicine['name'], 'strength' => $medicine['strength']],
                $medicine
            );
        }

        // Additional medicines for development
        if (app()->environment('local', 'development')) {
            Category::all()->each(function ($category) {
                Medicine::factory(rand(3, 5))->create(['category_id' => $category->id]);
            });
        }
    }
}

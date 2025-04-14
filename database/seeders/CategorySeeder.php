<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Analgesics', 'description' => 'Pain relievers'],
            ['name' => 'Antibiotics', 'description' => 'Treat bacterial infections'],
            ['name' => 'Antihistamines', 'description' => 'Allergy medications'],
            ['name' => 'Antihypertensives', 'description' => 'Blood pressure medications'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['name' => $category['name']], $category);
        }

        // Additional random categories for development
        if (app()->environment('local', 'development')) {
            Category::factory(5)->create();
        }
    }
}

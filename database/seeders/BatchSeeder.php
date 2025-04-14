<?php

namespace Database\Seeders;

use App\Models\Batch;
use App\Models\Medicine;
use App\Models\Supplier;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class BatchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        $now = Carbon::now();

        $batches = [
            [
                'medicine_id' => Medicine::where('name', 'Paracetamol')->first()->id,
                'supplier_id' => Supplier::where('name', 'PharmaStar')->first()->id,
                'batch_number' => 'PCM-' . date('Ymd') . '-001',
                'quantity_received' => 100,
                'current_quantity' => 98,
                'manufacture_date' => $now->copy()->subMonths(1),
                'expiry_date' => $now->copy()->addYears(2),
            ],
            [
                'medicine_id' => Medicine::where('name', 'Amoxicillin')->first()->id,
                'supplier_id' => Supplier::where('name', 'MediSource')->first()->id,
                'batch_number' => 'AMX-' . date('Ymd') . '-001',
                'quantity_received' => 50,
                'current_quantity' => 49,
                'manufacture_date' => $now->copy()->subMonths(2),
                'expiry_date' => $now->copy()->addYears(1),
            ],
            [
                'medicine_id' => Medicine::where('name', 'Loratadine')->first()->id,
                'supplier_id' => Supplier::where('name', 'PharmaStar')->first()->id,
                'batch_number' => 'LRT-' . date('Ymd') . '-001',
                'quantity_received' => 75,
                'current_quantity' => 75,
                'manufacture_date' => $now->copy()->subMonths(1),
                'expiry_date' => $now->copy()->addYears(3),
            ],
        ];

        foreach ($batches as $batch) {
            Batch::firstOrCreate(['batch_number' => $batch['batch_number']], $batch);
        }

        // Additional batches for development
        if (app()->environment('local', 'development')) {
            Medicine::all()->each(function ($medicine) {
                Batch::factory(rand(1, 3))->create(['medicine_id' => $medicine->id]);
            });
        }
    }
}

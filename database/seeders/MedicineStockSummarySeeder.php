<?php

namespace Database\Seeders;

use App\Models\Medicine;
use App\Models\MedicineStockSummary;
use Illuminate\Database\Seeder;

class MedicineStockSummarySeeder extends Seeder
{
    public function run(): void
    {
        $medicines = Medicine::all();

        if ($medicines->isEmpty()) {
            $this->command->warn('No medicines found to create stock summaries for.');

            return;
        }

        // Clear existing summaries to rebuild accurately
        MedicineStockSummary::truncate();

        foreach ($medicines as $medicine) {
            // The factory will sum up current_quantity from non-expired batches.
            // This relies on BatchSeeder and StockLedgerEntrySeeder having run correctly.
            MedicineStockSummary::factory()->create([
                'medicine_id' => $medicine->id,
            ]);
        }
        $this->command->info('Medicine stock summaries rebuilt accurately.');
    }
}

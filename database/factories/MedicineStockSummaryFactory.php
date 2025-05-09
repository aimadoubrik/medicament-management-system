<?php

namespace Database\Factories;

use App\Models\Batch;
use App\Models\Medicine;
use App\Models\MedicineStockSummary;
use Illuminate\Database\Eloquent\Factories\Factory; // Good to specify the model

class MedicineStockSummaryFactory extends Factory
{
    protected $model = MedicineStockSummary::class;

    public function definition(): array
    {
        // This is usually called by MedicineStockSummarySeeder which provides medicine_id
        // If called directly, ensure medicine exists or handle it:
        $medicine = $this->attributes['medicine_id'] ?? Medicine::inRandomOrder()->first();

        if (! $medicine && ! isset($this->attributes['medicine_id'])) {
            // If no medicine_id is passed and no medicines exist, create one.
            $medicine = Medicine::factory()->create();
        } elseif (is_numeric($medicine)) { // If ID was passed
            $medicine = Medicine::find($medicine);
        }

        $totalStock = 0;
        if ($medicine) { // Check if medicine object is valid
            $totalStock = Batch::where('medicine_id', $medicine->id)
                ->where('expiry_date', '>=', now()->format('Y-m-d')) // Ensure correct date format for comparison
                ->sum('current_quantity');
        }

        return [
            'medicine_id' => $medicine ? $medicine->id : Medicine::factory(), // Fallback if somehow still no medicine
            'total_quantity_in_stock' => $totalStock,
        ];
    }
}

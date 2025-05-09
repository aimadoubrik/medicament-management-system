<?php

namespace Database\Factories;

use App\Models\Batch;
use App\Models\Medicine;
use App\Models\StockLedgerEntry;
use App\Models\User; // Good to specify the model
use Illuminate\Database\Eloquent\Factories\Factory;

class StockLedgerEntryFactory extends Factory
{
    protected $model = StockLedgerEntry::class;

    public function definition(): array
    {
        $transactionType = $this->faker->randomElement(['IN_NEW_BATCH', 'OUT_DISPENSE', 'ADJUST_ADD', 'ADJUST_SUB', 'DISPOSAL_EXPIRED', 'RETURN']);
        $quantityChange = 0;

        switch ($transactionType) {
            case 'IN_NEW_BATCH': // Usually positive and matches batch received qty
                $quantityChange = $this->faker->numberBetween(50, 200); // Will be set by seeder
                break;
            case 'ADJUST_ADD':
            case 'RETURN':
                $quantityChange = $this->faker->numberBetween(1, 20);
                break;
            case 'OUT_DISPENSE':
            case 'ADJUST_SUB':
            case 'DISPOSAL_EXPIRED':
                $quantityChange = $this->faker->numberBetween(-50, -1); // Ensure it's negative
                break;
        }

        return [
            'medicine_id' => Medicine::factory(), // Will be overridden by seeder
            'batch_id' => Batch::factory(),       // Will be overridden by seeder for accuracy
            'transaction_type' => $transactionType,
            'quantity_change' => $quantityChange,
            'quantity_after_transaction' => 0, // CRITICAL: This will be calculated and set by the Seeder
            'transaction_date' => $this->faker->dateTimeThisMonth(),
            'user_id' => User::factory(), // Or ensure UserSeeder runs first and pick one
            'notes' => $this->faker->optional()->sentence(),
            'related_transaction_id' => null,
        ];
    }
}

<?php

namespace Database\Seeders;

use App\Models\Batch;
use App\Models\StockLedgerEntry;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class StockLedgerEntrySeeder extends Seeder
{
    public function run(): void
    {
        $batches = Batch::with('medicine')->get(); // Eager load medicine for context
        $users = User::all();

        if ($batches->isEmpty()) {
            $this->command->warn('No batches found. Please run BatchSeeder first.');

            return;
        }
        if ($users->isEmpty()) {
            $this->command->warn('No users found. Please run UserSeeder first or ensure users exist.');
            // As a fallback, create one if really none (though UserSeeder should handle this)
            User::factory()->create(['email' => 'stockuser@example.com']);
            $users = User::all();
        }

        // Only run if no ledger entries exist to avoid duplicating history on re-seed
        if (StockLedgerEntry::count() > 0) {
            $this->command->info('Stock ledger entries already exist. Skipping seeding.');

            return;
        }

        foreach ($batches as $batch) {
            $currentBatchStock = $batch->quantity_received; // Actual stock in this specific batch
            // For ledger: quantity_after_transaction reflects total for medicine,
            // or can be batch-specific if your model supports it.
            // For simplicity here, we'll track quantity_after_transaction per batch processing.
            // A more advanced ledger might track total medicine stock across batches.
            // Let's assume quantity_after_transaction in this context is for the specific medicine from this batch movement.

            $lastQtyAfterTransactionForMedicineInBatchContext = 0;
            $transactionTime = Carbon::parse($batch->created_at ?? now())->addMinutes(5); // Start after batch creation

            // 1. Initial Stock Entry for this new batch
            $initialStock = StockLedgerEntry::create([
                'medicine_id' => $batch->medicine_id,
                'batch_id' => $batch->id,
                'transaction_type' => 'IN_NEW_BATCH',
                'quantity_change' => $batch->quantity_received,
                'quantity_after_transaction' => $currentBatchStock, // For this batch, it starts with its received qty
                'transaction_date' => $transactionTime,
                'user_id' => $users->random()->id,
                'notes' => 'Initial stock from batch '.$batch->batch_number,
            ]);
            $lastQtyAfterTransactionForMedicineInBatchContext = $initialStock->quantity_after_transaction;
            $transactionTime = $transactionTime->addDays(rand(0, 2))->addHours(rand(1, 5));

            // 2. Simulate some outgoing/adjustment transactions for this batch
            $numberOfTransactions = rand(0, 4); // 0 to 4 more transactions
            for ($i = 0; $i < $numberOfTransactions && $currentBatchStock > 0; $i++) {
                $transactionType = $this->faker()->randomElement(['OUT_DISPENSE', 'ADJUST_SUB']); // Focus on decrements
                $maxChange = min(rand(1, max(1, (int) ($currentBatchStock * 0.3))), $currentBatchStock); // Dispense up to 30% or what's left
                $quantityChange = -$maxChange;

                if ($quantityChange == 0) {
                    continue;
                }

                $currentBatchStock += $quantityChange; // Update batch-specific stock
                // quantity_after_transaction in ledger is often total for medicine.
                // If this ledger is strictly batch-specific, then this is $currentBatchStock.
                // If it reflects total for medicine, it's more complex to track across all batches in a seeder.
                // For this seeder, let's make quantity_after_transaction reflect the batch's state.
                $qtyAfterTx = $currentBatchStock;

                StockLedgerEntry::create([
                    'medicine_id' => $batch->medicine_id,
                    'batch_id' => $batch->id,
                    'transaction_type' => $transactionType,
                    'quantity_change' => $quantityChange,
                    'quantity_after_transaction' => $qtyAfterTx,
                    'transaction_date' => $transactionTime,
                    'user_id' => $users->random()->id,
                    'notes' => $transactionType.' from batch '.$batch->batch_number,
                ]);

                $transactionTime = $transactionTime->addDays(rand(1, 5))->addHours(rand(1, 10));
            }

            // 3. IMPORTANT: Update the batch's actual current_quantity
            $batch->current_quantity = $currentBatchStock;
            $batch->save();
        }
        $this->command->info('Stock ledger entries seeded accurately for batches.');
    }

    // Helper for faker instance inside seeder method if needed
    protected function faker()
    {
        return \Faker\Factory::create();
    }
}

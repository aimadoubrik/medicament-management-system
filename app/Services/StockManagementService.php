<?php

namespace App\Services;

use App\Enums\StockTransactionType;
use App\Exceptions\InsufficientStockException;
use App\Models\Batch;
use App\Models\Medicine;
use App\Models\MedicineStockSummary; // Assuming Supplier model might be needed for IN_NEW_BATCH
use App\Models\StockLedgerEntry;
use App\Models\Supplier; // Your Enum
use App\Models\User; // Your Custom Exception
use Carbon\Carbon;
// For logging
use Illuminate\Support\Facades\DB; // For handling dates

class StockManagementService
{
    /**
     * Main entry point to process various stock transactions.
     *
     * @param  array  $validatedData  Data from HandleStockTransactionRequest
     * @param  User|null  $user  The authenticated user performing the transaction
     * @return array Result array typically containing a message and affected entities
     *
     * @throws InsufficientStockException
     * @throws \InvalidArgumentException
     * @throws \Exception
     */
    public function processTransaction(array $validatedData, ?User $user): array
    {
        $transactionType = StockTransactionType::from($validatedData['transaction_type']);
        $medicineId = $validatedData['medicine_id'] ?? null; // Might be null initially if creating medicine too (not current scope)
        $batchId = $validatedData['batch_id'] ?? null;
        // User input for quantity (always positive magnitude)
        $quantityChangeInput = (int) ($validatedData['quantity_change_input'] ?? 0);
        $notes = $validatedData['notes'] ?? null;
        $transactionDate = isset($validatedData['transaction_date']) ? Carbon::parse($validatedData['transaction_date']) : now();
        $relatedTransactionId = $validatedData['related_transaction_id'] ?? null;

        // The actual signed quantity change for the ledger
        $actualLedgerQuantityChange = $this->determineActualLedgerQuantityChange($transactionType, $quantityChangeInput);

        // Wrap individual handlers in DB transaction if they are not already,
        // or rely on the controller's DB transaction. For safety, individual handlers can also use transactions.
        // Here, we assume the controller has started a transaction.

        $batch = null;
        $medicine = null;

        switch ($transactionType) {
            case StockTransactionType::IN_NEW_BATCH:
                $batch = $this->handleReceiveNewBatch($validatedData, $actualLedgerQuantityChange, $user, $transactionDate);
                $medicine = $batch->medicine; // Get medicine from the newly created batch
                break;

            case StockTransactionType::OUT_DISPENSE:
            case StockTransactionType::ADJUST_SUB:
            case StockTransactionType::DISPOSAL_EXPIRED:
            case StockTransactionType::DISPOSAL_DAMAGED:
            case StockTransactionType::RETURN_SUPPLIER:
                if (! $batchId) {
                    throw new \InvalidArgumentException("Batch ID is required for {$transactionType->label()}.");
                }
                $batch = Batch::findOrFail($batchId);
                $medicine = $batch->medicine; // Get medicine from the existing batch
                $this->handleStockReduction($batch, $actualLedgerQuantityChange, $transactionType, $user, $notes, $transactionDate, $relatedTransactionId);
                break;

            case StockTransactionType::ADJUST_ADD:
                // Could be to an existing batch or general medicine stock if batch_id is null (though less common for ADJUST_ADD)
                if (! $batchId) {
                    throw new \InvalidArgumentException("Batch ID is required for {$transactionType->label()}.");
                }
                $batch = Batch::findOrFail($batchId);
                $medicine = $batch->medicine;
                $this->handleStockIncrease($batch, $actualLedgerQuantityChange, $transactionType, $user, $notes, $transactionDate, $relatedTransactionId);
                break;

            case StockTransactionType::INITIAL_STOCK:
                $medicine = Medicine::findOrFail($medicineId); // Medicine must exist
                if (! empty($validatedData['create_new_batch_for_initial_stock']) && $validatedData['create_new_batch_for_initial_stock'] === true) {
                    $batch = $this->handleReceiveNewBatch($validatedData, $actualLedgerQuantityChange, $user, $transactionDate, StockTransactionType::INITIAL_STOCK);
                } elseif ($batchId) {
                    $batch = Batch::findOrFail($batchId);
                    // For initial stock on an existing batch, it's like an adjustment.
                    // Ensure this logic is what you intend: usually INITIAL_STOCK implies setting a new baseline.
                    // If it's an existing batch, this is more like an ADJUST_ADD to reach the initial count.
                    // For simplicity, treating it as a direct setting if batch exists, or a new batch scenario.
                    // This might need refinement based on exact business rule for INITIAL_STOCK on existing batch.
                    $this->handleStockIncrease($batch, $actualLedgerQuantityChange, StockTransactionType::INITIAL_STOCK, $user, $notes, $transactionDate, $relatedTransactionId, true); // true to override as initial
                } else {
                    // INITIAL_STOCK for a medicine without a specific batch (if your system supports this concept)
                    // This scenario requires creating a ledger entry not tied to a batch.
                    $this->createStockLedgerEntry(
                        $medicine->id,
                        null, // No batch_id
                        StockTransactionType::INITIAL_STOCK,
                        $actualLedgerQuantityChange,
                        $this->calculateMedicineQuantityAfterTransaction($medicine, $actualLedgerQuantityChange, null),
                        $user,
                        $notes,
                        $transactionDate,
                        $relatedTransactionId
                    );
                }
                break;

            default:
                throw new \InvalidArgumentException("Unsupported transaction type: {$transactionType->value}");
        }

        // Update medicine stock summary after any transaction that affected a medicine
        if ($medicine) {
            $this->updateMedicineStockSummary($medicine);
        }

        return [
            'message' => "{$transactionType->label()} processed successfully.",
            'batch' => $batch, // Return the affected/created batch
            'medicine' => $medicine,
        ];
    }

    /**
     * Determines the signed quantity change for the ledger based on transaction type.
     */
    protected function determineActualLedgerQuantityChange(StockTransactionType $transactionType, int $quantityChangeInput): int
    {
        if (in_array($transactionType->value, StockTransactionType::getNegativeTransactionTypes())) {
            return -abs($quantityChangeInput);
        }

        return abs($quantityChangeInput); // For positive types or IN_NEW_BATCH (uses quantity_received as input)
    }

    /**
     * Handles receiving a new batch or creating a batch for initial stock.
     */
    protected function handleReceiveNewBatch(
        array $validatedData,
        int $quantityReceived, // This is actualLedgerQuantityChange for IN_NEW_BATCH/INITIAL_STOCK new batch
        ?User $user,
        Carbon $transactionDate,
        StockTransactionType $ledgerTransactionType = StockTransactionType::IN_NEW_BATCH // Allow override for INITIAL_STOCK
    ): Batch {
        // Ensure all required fields for batch creation are present
        $batch = Batch::create([
            'medicine_id' => $validatedData['medicine_id'],
            'supplier_id' => $validatedData['supplier_id'], // Required by IN_NEW_BATCH request rules
            'batch_number' => $validatedData['batch_number'],
            'quantity_received' => $quantityReceived, // User input (positive) for new batch
            'current_quantity' => $quantityReceived,  // Initial current quantity
            'manufacture_date' => $validatedData['manufacture_date'] ?? null,
            'expiry_date' => $validatedData['expiry_date'],
            // transaction_date is for ledger, not batch creation date
        ]);

        $this->createStockLedgerEntry(
            $batch->medicine_id,
            $batch->id,
            $ledgerTransactionType, // IN_NEW_BATCH or INITIAL_STOCK
            $quantityReceived,      // Positive change
            $batch->current_quantity, // QAT is the batch's new current quantity
            $user,
            $validatedData['notes'] ?? "Received new batch {$batch->batch_number}",
            $transactionDate,
            $validatedData['related_transaction_id'] ?? null
        );

        return $batch;
    }

    /**
     * Handles transactions that reduce stock from a specific batch.
     * (OUT_DISPENSE, ADJUST_SUB, DISPOSAL_*, RETURN_SUPPLIER)
     */
    protected function handleStockReduction(
        Batch $batch,
        int $signedQuantityChange, // Should be negative
        StockTransactionType $transactionType,
        ?User $user,
        ?string $notes,
        Carbon $transactionDate,
        ?int $relatedTransactionId
    ): Batch {
        if ($signedQuantityChange >= 0) {
            throw new \InvalidArgumentException('Quantity change must be negative for stock reduction.');
        }

        // Optimistic lock for updating batch quantity
        $batch = Batch::lockForUpdate()->find($batch->id);

        if ($batch->current_quantity < abs($signedQuantityChange)) {
            throw new InsufficientStockException(
                message: "Cannot {$transactionType->label()} ".abs($signedQuantityChange)." units. Only {$batch->current_quantity} units available in batch {$batch->batch_number}.",
                code: 422,
                batch: $batch,
                attemptedQuantity: abs($signedQuantityChange),
                availableQuantity: $batch->current_quantity
            );
        }

        $newBatchQuantity = $batch->current_quantity + $signedQuantityChange; // Adding a negative number
        $batch->current_quantity = $newBatchQuantity;
        $batch->save();

        $this->createStockLedgerEntry(
            $batch->medicine_id,
            $batch->id,
            $transactionType,
            $signedQuantityChange,
            $newBatchQuantity, // QAT is the batch's new current quantity
            $user,
            $notes,
            $transactionDate,
            $relatedTransactionId
        );

        return $batch;
    }

    /**
     * Handles transactions that increase stock for a specific batch.
     * (ADJUST_ADD, or INITIAL_STOCK on an existing batch)
     */
    protected function handleStockIncrease(
        Batch $batch,
        int $signedQuantityChange, // Should be positive
        StockTransactionType $transactionType,
        ?User $user,
        ?string $notes,
        Carbon $transactionDate,
        ?int $relatedTransactionId,
        bool $isInitialStockOverride = false // Flag for INITIAL_STOCK on existing batch
    ): Batch {
        if ($signedQuantityChange <= 0 && ! $isInitialStockOverride && $transactionType !== StockTransactionType::INITIAL_STOCK) { // INITIAL_STOCK can be 0
            throw new \InvalidArgumentException('Quantity change must be positive for stock increase (unless initial stock is zero).');
        }
        if ($signedQuantityChange < 0 && $transactionType === StockTransactionType::INITIAL_STOCK && $isInitialStockOverride) {
            throw new \InvalidArgumentException('Initial stock quantity cannot be negative.');
        }

        // Optimistic lock
        $batch = Batch::lockForUpdate()->find($batch->id);

        $newBatchQuantity = $isInitialStockOverride ? $signedQuantityChange : ($batch->current_quantity + $signedQuantityChange);
        $batch->current_quantity = $newBatchQuantity;
        $batch->save();

        $this->createStockLedgerEntry(
            $batch->medicine_id,
            $batch->id,
            $transactionType,
            $signedQuantityChange,
            $newBatchQuantity, // QAT is the batch's new current quantity
            $user,
            $notes,
            $transactionDate,
            $relatedTransactionId
        );

        return $batch;
    }

    /**
     * Helper to create a stock ledger entry.
     */
    protected function createStockLedgerEntry(
        int $medicineId,
        ?int $batchId,
        StockTransactionType $transactionType,
        int $quantityChange,
        int $quantityAfterTransaction,
        ?User $user,
        ?string $notes,
        Carbon $transactionDate,
        ?int $relatedTransactionId
    ): StockLedgerEntry {
        return StockLedgerEntry::create([
            'medicine_id' => $medicineId,
            'batch_id' => $batchId,
            'transaction_type' => $transactionType->value,
            'quantity_change' => $quantityChange,
            'quantity_after_transaction' => $quantityAfterTransaction,
            'user_id' => $user?->id,
            'notes' => $notes,
            'transaction_date' => $transactionDate,
            'related_transaction_id' => $relatedTransactionId,
        ]);
    }

    /**
     * Calculates the quantity_after_transaction for the stock ledger.
     * This can be complex: it could be for the specific batch, or the overall medicine total.
     * For simplicity with the current structure, this method will focus on batch quantity if batch is present,
     * otherwise, it needs a strategy for overall medicine QAT.
     *
     * IMPORTANT: The current implementation of individual handlers sets QAT based on the batch's new quantity.
     * This helper is more for a scenario where you need to calculate it independently,
     * e.g., for INITIAL_STOCK on a medicine without a specific batch.
     */
    protected function calculateQuantityAfterTransaction(?Batch $batch, Medicine $medicine, int $quantityChange): int
    {
        if ($batch) {
            // If a batch is involved, QAT is typically its new current_quantity
            // This logic is already handled in handleStockIncrease/Reduction which update batch->current_quantity
            // So, this method might be more about the overall medicine total if batch is null
            return $batch->current_quantity + $quantityChange; // This is if $batch->current_quantity wasn't updated yet
            // Or, if it was updated: $batch->current_quantity
        }

        // If no specific batch, calculate total for the medicine.
        // This requires summing current_quantity of all non-expired batches for that medicine + the current change.
        $currentTotalStock = Batch::where('medicine_id', $medicine->id)
            ->where('expiry_date', '>=', now()->format('Y-m-d'))
            ->sum('current_quantity');

        return $currentTotalStock + $quantityChange; // This is a simplified view for non-batch specific INITIAL_STOCK
    }

    /**
     * Calculates the quantity_after_transaction for the stock ledger.
     * If a batch is involved, it's the batch's new current quantity.
     * If no batch, it's the medicine's new total quantity.
     *
     * @param  int  $signedQuantityChange  The actual change being applied (can be negative)
     * @param  Batch|null  $batch  The specific batch being affected (if any)
     */
    protected function calculateMedicineQuantityAfterTransaction(Medicine $medicine, int $signedQuantityChange, ?Batch $batchBeingChanged = null): int
    {
        // Get current total stock of all *other* non-expired batches for this medicine
        $currentTotalStockOfOtherBatches = Batch::where('medicine_id', $medicine->id)
            ->when($batchBeingChanged, function ($query) use ($batchBeingChanged) {
                // Exclude the batch that is currently being changed, as its new value will be added
                return $query->where('id', '!=', $batchBeingChanged->id);
            })
            ->where('expiry_date', '>=', now()->format('Y-m-d'))
            ->sum('current_quantity');

        $newQuantityForBatchBeingChanged = 0;
        if ($batchBeingChanged) {
            // If a batch is being changed, its new current_quantity is its old one + the change
            // This assumes $batchBeingChanged->current_quantity has NOT YET been updated with $signedQuantityChange
            // in the DB call that might precede calling this method.
            // For a more robust way if called *after* batch update:
            // $newQuantityForBatchBeingChanged = $batchBeingChanged->current_quantity; (if already updated)
            // OR, if calculating before the update:
            $newQuantityForBatchBeingChanged = $batchBeingChanged->current_quantity + $signedQuantityChange;
            if ($newQuantityForBatchBeingChanged < 0) {
                $newQuantityForBatchBeingChanged = 0;
            } // Safety
        } else {
            // If no specific batch is being changed (e.g., INITIAL_STOCK without a batch),
            // the $signedQuantityChange applies to the overall medicine stock.
            $newQuantityForBatchBeingChanged = $signedQuantityChange;
        }

        return $currentTotalStockOfOtherBatches + $newQuantityForBatchBeingChanged;
    }

    /**
     * Updates the stock summary for a given medicine.
     */
    public function updateMedicineStockSummary(Medicine $medicine): MedicineStockSummary
    {
        // This method can be called after any transaction that modifies batch quantities.
        // No need for a separate DB transaction here if the calling method is already in one.
        $totalStock = Batch::where('medicine_id', $medicine->id)
            ->where('expiry_date', '>=', now()->format('Y-m-d')) // Only count non-expired stock
            ->sum('current_quantity');

        return MedicineStockSummary::updateOrCreate(
            ['medicine_id' => $medicine->id],
            ['total_quantity_in_stock' => $totalStock >= 0 ? $totalStock : 0] // Ensure summary isn't negative
        );
    }

    // --- Remove or adapt old specific methods if processTransaction covers all cases ---
    // public function receiveNewBatch(Batch $batch, int $quantity, ?User $user = null, ?string $notes = null) { ... }
    // public function dispenseStock(Medicine $medicine, Batch $batch, int $quantityToDispense, ?User $user = null, ?string $notes = null) { ... }
    // public function adjustStock(Medicine $medicine, Batch $batch, int $quantityChange, string $transactionType, ?User $user = null, ?string $notes = null) { ... }
}

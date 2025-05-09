<?php

namespace App\Enums;

/**
 * Enum for Stock Ledger Transaction Types.
 * This helps maintain consistency and avoids magic strings.
 */
enum StockTransactionType: string
{
    case IN_NEW_BATCH = 'IN_NEW_BATCH'; // Stock in from a new batch
    case OUT_DISPENSE = 'OUT_DISPENSE'; // Stock out due to dispensing/sale
    case ADJUST_ADD = 'ADJUST_ADD';     // Stock adjustment - adding quantity (e.g., found stock)
    case ADJUST_SUB = 'ADJUST_SUB';     // Stock adjustment - subtracting quantity (e.g., recount correction)
    case DISPOSAL_EXPIRED = 'DISPOSAL_EXPIRED'; // Stock out due to expiry
    case DISPOSAL_DAMAGED = 'DISPOSAL_DAMAGED'; // Stock out due to damage
    case RETURN_SUPPLIER = 'RETURN_SUPPLIER';   // Stock out due to returning to supplier
    case INITIAL_STOCK = 'INITIAL_STOCK'; // For setting up initial stock levels if not from a new batch

    /**
     * Get a human-readable label for the transaction type.
     */
    public function label(): string
    {
        return match ($this) {
            self::IN_NEW_BATCH => 'New Batch Received',
            self::OUT_DISPENSE => 'Dispensed/Sold',
            self::ADJUST_ADD => 'Adjustment (Add)',
            self::ADJUST_SUB => 'Adjustment (Subtract)',
            self::DISPOSAL_EXPIRED => 'Disposal (Expired)',
            self::DISPOSAL_DAMAGED => 'Disposal (Damaged)',
            self::RETURN_SUPPLIER => 'Return to Supplier',
            self::INITIAL_STOCK => 'Initial Stock Entry',
        };
    }

    /**
     * Get all transaction types as an associative array (value => label).
     * Useful for populating dropdowns in forms.
     */
    public static function asSelectArray(): array
    {
        return collect(self::cases())->mapWithKeys(fn ($case) => [
            $case->value => $case->label(),
        ])->all();
    }

    /**
     * Get transaction types that represent an increase in stock.
     */
    public static function getPositiveTransactionTypes(): array
    {
        return [
            self::IN_NEW_BATCH->value,
            self::ADJUST_ADD->value,
            self::INITIAL_STOCK->value,
        ];
    }

    /**
     * Get transaction types that represent a decrease in stock.
     */
    public static function getNegativeTransactionTypes(): array
    {
        return [
            self::OUT_DISPENSE->value,
            self::ADJUST_SUB->value,
            self::DISPOSAL_EXPIRED->value,
            self::DISPOSAL_DAMAGED->value,
            self::RETURN_SUPPLIER->value,
        ];
    }
}

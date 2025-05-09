
import { z } from 'zod';
import { medicineSchema } from './medicine'; // Assuming you have this
import { batchSchema } from './batch';       // Assuming you have this
import { userSchema } from './user';         // Assuming you have this

// Define an enum for transaction types mirroring your PHP Enum
// This helps with type safety in the frontend
export const StockTransactionTypeEnum = z.enum([
    'IN_NEW_BATCH',
    'OUT_DISPENSE',
    'ADJUST_ADD',
    'ADJUST_SUB',
    'DISPOSAL_EXPIRED',
    'DISPOSAL_DAMAGED',
    'RETURN_SUPPLIER',
    'INITIAL_STOCK',
]);
export type StockTransactionType = z.infer<typeof StockTransactionTypeEnum>;

export const stockLedgerEntrySchema = z.object({
    id: z.number().int(),
    medicine_id: z.number().int(),
    batch_id: z.number().int().nullable(), // Batch ID can be nullable if a general adjustment
    transaction_type: StockTransactionTypeEnum,
    quantity_change: z.number().int(),
    quantity_after_transaction_in_batch: z.number().int().nullable(), // Quantity in the specific batch after this transaction
    transaction_date: z.string(), // Typically comes as ISO string, can be transformed to Date object
    notes: z.string().nullable(),
    user_id: z.number().int().nullable(),
    created_at: z.string(),
    updated_at: z.string(),

    // Optional related models (if eager loaded)
    medicine: medicineSchema.optional(),
    batch: batchSchema.optional(),
    user: userSchema.optional(),

    // You might want a client-side computed property for display
    transaction_type_label: z.string().optional(),
});

export type StockLedgerEntry = z.infer<typeof stockLedgerEntrySchema>;

// Helper to get labels (similar to PHP Enum)
export const stockTransactionTypeLabels: Record<StockTransactionType, string> = {
    IN_NEW_BATCH: 'New Batch Received',
    OUT_DISPENSE: 'Dispensed',
    ADJUST_ADD: 'Adjustment (Add)',
    ADJUST_SUB: 'Adjustment (Subtract)',
    DISPOSAL_EXPIRED: 'Disposal (Expired)',
    DISPOSAL_DAMAGED: 'Disposal (Damaged)',
    RETURN_SUPPLIER: 'Return to Supplier',
    INITIAL_STOCK: 'Initial Stock Entry',
};

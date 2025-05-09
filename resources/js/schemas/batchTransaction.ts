import { z } from 'zod';

// Define the possible string values directly for z.enum
const transactionTypeValues = [
    'IN_NEW_BATCH', 'OUT_DISPENSE', 'ADJUST_ADD', 'ADJUST_SUB',
    'DISPOSAL_EXPIRED', 'DISPOSAL_DAMAGED', 'RETURN_SUPPLIER', 'INITIAL_STOCK'
] as const;

// Base Schema - Define fields that *might* be present.
// Use .optional() for fields that aren't always required.
// Use strings for IDs coming from HTML selects.
const baseTransactionSchema = z.object({
    transaction_type: z.enum(transactionTypeValues, {
        required_error: "Transaction type is required.",
        invalid_type_error: "Invalid transaction type selected.",
    }),
    // IDs from selects are typically strings
    medicine_id: z.string().optional(),
    batch_id: z.string().optional(),
    supplier_id: z.string().optional(),
    // Fields specific to new batch creation
    batch_number: z.string().max(255).optional(),
    manufacture_date: z.preprocess(
        (val) => {
            if (val instanceof Date) return val;
            if (typeof val === 'string' && val) return new Date(val);
            return undefined;
        },
        z.date().optional()
    ),
    expiry_date: z.preprocess(
        (val) => {
            if (val instanceof Date) return val;
            if (typeof val === 'string' && val) return new Date(val);
            return undefined;
        },
        z.date().optional()
    ),
    // Quantity input from user (positive number)
    quantity_change_input: z.preprocess(
        (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
        z.number({ invalid_type_error: 'Quantity must be a number' })
            .int({ message: "Quantity must be a whole number." })
            .min(0, 'Quantity cannot be negative.')
            .optional() // Make optional in base, require conditionally
    ),
    notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').trim().optional(),
    transaction_date: z.string().datetime({ message: "Invalid transaction date/time format" }).optional(),
    related_transaction_id: z.preprocess(
        (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
        z.number({ invalid_type_error: 'Related ID must be a number if provided.' })
            .int()
            .positive()
            .optional()
    ),
    // Flag for initial stock creating new batch
    create_new_batch_for_initial_stock: z.boolean().optional().default(false),
    // --- REMOVED relational objects: medicine, batch, user ---
});

// Refined schema using superRefine for conditional logic
export const stockTransactionSchema = baseTransactionSchema.superRefine((data, ctx) => {
    const {
        transaction_type, medicine_id, batch_id, supplier_id, batch_number,
        quantity_change_input, expiry_date, notes, create_new_batch_for_initial_stock
    } = data;

    // --- Helper Function for Required String ---
    const checkRequiredString = (field: keyof typeof data, path: (string | number)[], message: string) => {
        if (!data[field] || (typeof data[field] === 'string' && (data[field] as string).trim() === '')) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });
        }
    };

    // --- Helper Function for Required Positive Integer Quantity ---
    const checkRequiredQuantity = (minVal: number = 1) => {
        if (quantity_change_input === undefined || quantity_change_input < minVal) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['quantity_change_input'], message: `Quantity must be at least ${minVal}.` });
        }
    };

    // --- Conditional Logic ---
    switch (transaction_type) {
        case 'IN_NEW_BATCH':
            checkRequiredString('medicine_id', ['medicine_id'], 'Medicine is required.');
            checkRequiredString('supplier_id', ['supplier_id'], 'Supplier is required.');
            checkRequiredString('batch_number', ['batch_number'], 'Batch number is required.');
            checkRequiredQuantity(1);
            checkRequiredString('expiry_date', ['expiry_date'], 'Expiry date is required.');
            // Validate expiry_date is a valid date
            if (expiry_date && !(expiry_date instanceof Date && !isNaN(expiry_date.getTime()))) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['expiry_date'], message: 'Invalid expiry date format.' });
            }
            break;

        case 'OUT_DISPENSE':
            checkRequiredString('medicine_id', ['medicine_id'], 'Medicine is required.');
            checkRequiredString('batch_id', ['batch_id'], 'Batch selection is required.');
            checkRequiredQuantity(1);
            checkRequiredString('notes', ['notes'], 'Dispense notes/reference is required.');
            break;

        case 'ADJUST_SUB':
        case 'DISPOSAL_EXPIRED':
        case 'DISPOSAL_DAMAGED':
        case 'RETURN_SUPPLIER':
            checkRequiredString('medicine_id', ['medicine_id'], 'Medicine is required.');
            checkRequiredString('batch_id', ['batch_id'], 'Batch selection is required.');
            checkRequiredQuantity(1);
            checkRequiredString('notes', ['notes'], 'Notes/Reason is required for this transaction.');
            break;

        case 'ADJUST_ADD':
            checkRequiredString('medicine_id', ['medicine_id'], 'Medicine is required.');
            checkRequiredString('batch_id', ['batch_id'], 'Batch selection is required.');
            checkRequiredQuantity(1);
            checkRequiredString('notes', ['notes'], 'Notes/Reason is required.');
            break;

        case 'INITIAL_STOCK':
            checkRequiredString('medicine_id', ['medicine_id'], 'Medicine is required.');
            checkRequiredQuantity(0); // Initial stock can be zero
            if (create_new_batch_for_initial_stock) {
                checkRequiredString('supplier_id', ['supplier_id'], 'Supplier is required for new batch.');
                checkRequiredString('batch_number', ['batch_number'], 'Batch number is required for new batch.');
                checkRequiredString('expiry_date', ['expiry_date'], 'Expiry date is required for new batch.');
                if (expiry_date && !(expiry_date instanceof Date && !isNaN(expiry_date.getTime()))) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['expiry_date'], message: 'Invalid expiry date format.' });
                }
            }
            break;
    }

    // Add any cross-field validation if needed, e.g., expiry_date > manufacture_date
    // if (data.expiry_date && data.manufacture_date && new Date(data.expiry_date) <= new Date(data.manufacture_date)) {
    //     ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['expiry_date'], message: 'Expiry date must be after manufacture date.' });
    // }
});

// Export the type derived from the schema
export type StockTransactionFormData = z.infer<typeof stockTransactionSchema>;
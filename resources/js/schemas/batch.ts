import { z } from 'zod';

export const batchSchema = z.object({
    batch_number: z.string().min(1, 'Batch number is required').max(255),
    expiry_date: z.string().min(1, 'Expiry date is required').max(255),
    quantity_received: z.coerce
        .number({ invalid_type_error: 'Quantity received must be a number' })
        .int()
        .min(0, 'Quantity received cannot be negative'),
    current_quantity: z.coerce
        .number({ invalid_type_error: 'Current quantity must be a number' })
        .int()
        .min(0, 'Current quantity cannot be negative'),
    manufacture_date: z.string().min(1, 'Manufacture date is required').max(255),
    medicine_id: z.string().min(1, 'Medicine is required'),
    supplier_id: z.string().min(1, 'Supplier is required'),
});

export type BatchFormData = z.infer<typeof batchSchema>;

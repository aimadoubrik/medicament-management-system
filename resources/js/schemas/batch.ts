import { z } from 'zod';

export const batchSchema = z.object({
    batch_number: z
        .string()
        .max(255)
        .nullable(),
    expiry_date: z
        .date({ invalid_type_error: 'Expiry date must be a valid date' })
        .min(new Date(), 'Expiry date must be in the future'),
    quantity_received: z.coerce
        .number({ invalid_type_error: 'Quantity received must be a number' })
        .int()
        .min(0, 'Quantity received cannot be negative'),
    current_quantity: z.coerce
        .number({ invalid_type_error: 'Current quantity must be a number' })
        .int()
        .min(0, 'Current quantity cannot be negative'),
    manufacture_date: z
        .date({ invalid_type_error: 'Manufacture date must be a valid date' })
        .nullable(),
    medicine_id: z.coerce
        .number({ invalid_type_error: 'Medicine ID must be a number' })
        .int()
        .positive('Medicine is required'),
    supplier_id: z.coerce
        .number({ invalid_type_error: 'Supplier ID must be a number' })
        .int()
        .positive('Supplier is required'),
});

export type BatchFormData = z.infer<typeof batchSchema>;

export const batchMetadataSchema = z.object({
    supplier_id: z.string().min(1, 'Supplier is required.'),
    batch_number: z.string().min(1, 'Batch number is required.'),
    manufacture_date: z.date({ invalid_type_error: 'Manufacture date must be a valid date' }).nullable().optional(),
    expiry_date: z.date({ invalid_type_error: 'Expiry date must be a valid date' })
        .min(new Date(), 'Expiry date must be in the future'),
});

export type BatchMetadataFormData = z.infer<typeof batchMetadataSchema>;

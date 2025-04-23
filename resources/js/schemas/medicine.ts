import { z } from 'zod';

export const medicineSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255),
    generic_name: z.string().min(1, 'Generic name is required').max(255),
    manufacturer: z.string().min(1, 'Manufacturer is required').max(255),
    strength: z.string().min(1, 'Strength is required').max(255),
    form: z.string().min(1, 'Form is required').max(255),
    description: z.string().max(65535).nullable().optional(),
    category_id: z.string().min(1, 'Category is required'),
    requires_prescription: z.boolean().nullable().default(false),
    low_stock_threshold: z.coerce
        .number({ invalid_type_error: 'Threshold must be a number' })
        .int()
        .min(0, 'Threshold cannot be negative')
        .default(10),
});
export type MedicineFormData = z.infer<typeof medicineSchema>;

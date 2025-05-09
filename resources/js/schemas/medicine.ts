import { z } from 'zod';

export const medicineSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255),
    manufacturer_distributor: z.string().max(255).nullable().optional(),
    dosage: z.string().max(255).nullable().optional(),
    form: z.string().max(255).nullable().optional(),
    unit_of_measure: z.string().max(255).nullable().optional(),
    description: z.string().max(65535).nullable().optional(),
    reorder_level: z.coerce
        .number({ invalid_type_error: 'Reorder level must be a number' })
        .int()
        .min(0, 'Reorder level cannot be negative')
        .nullable()
        .optional(),
});

export type MedicineFormData = z.infer<typeof medicineSchema>;

import { z } from 'zod';

export const supplierSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255),
    contact_person: z.string().max(255).nullable().optional(),
    email: z.string().email('Invalid email').max(255).nullable().optional(),
    phone: z.string().max(255).nullable().optional(),
    address: z.string().nullable().optional(),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;

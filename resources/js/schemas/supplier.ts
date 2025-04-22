import { z } from 'zod';

export const supplierSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255),
    contact_person: z.string().min(1, 'Contact person is required').max(255),
    email: z.string().email('Invalid email').min(1, 'Email is required').max(255),
    phone: z.string().min(1, 'Phone is required').max(255),
    address: z.string().min(1, 'Address is required').max(255),
});
export type SupplierFormData = z.infer<typeof supplierSchema>;

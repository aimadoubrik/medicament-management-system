import { z } from 'zod';
export const categorySchema = z.object({
    name: z.string().min(1, 'Name is required').max(255),
    description: z.string().max(65535).nullable().optional(),
});
export type CategoryFormData = z.infer<typeof categorySchema>;

import { z } from 'zod';

export const userSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255),
    email: z.string().email('Invalid email address').max(255),
    role_id: z.string().min(1, 'Role is required'),
});

export type UserFormData = z.infer<typeof userSchema>;
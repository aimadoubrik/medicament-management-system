import { z } from 'zod';

export const userSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255),
    email: z.string().email('Invalid email address').max(255),
    email_verified_at: z.string().nullable().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters').max(255),
    role_id: z.number().int(),
    remember_token: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
    updated_at: z.string().nullable().optional(),
});

export type UserFormData = z.infer<typeof userSchema>;

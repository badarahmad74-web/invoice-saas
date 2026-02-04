import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name is required'),
    organizationName: z.string().min(2, 'Organization Name is required'),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;

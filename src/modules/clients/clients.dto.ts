import { z } from 'zod';

export const createClientSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email().optional().or(z.literal('')),
    vatNumber: z.string().optional(),
    address: z.string().optional(),
});

export const updateClientSchema = createClientSchema.partial();

export type CreateClientDto = z.infer<typeof createClientSchema>;
export type UpdateClientDto = z.infer<typeof updateClientSchema>;

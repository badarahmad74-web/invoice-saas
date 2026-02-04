import { z } from 'zod';

const invoiceItemSchema = z.object({
    productId: z.string().optional(),
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().min(0.01, 'Quantity must be positive'),
    unitPrice: z.number().min(0, 'Unit Price must be positive'),
});

export const createInvoiceSchema = z.object({
    clientId: z.string().uuid('Invalid Client ID'),
    date: z.string().datetime({ offset: true }).or(z.string()), // Accept ISO string
    dueDate: z.string().datetime({ offset: true }).or(z.string()),
    items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
    taxRate: z.number().min(0).default(0),
    currency: z.string().default('USD'),
    notes: z.string().optional(),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

export type CreateInvoiceDto = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceDto = z.infer<typeof updateInvoiceSchema>;

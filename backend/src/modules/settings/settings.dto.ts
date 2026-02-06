import { z } from 'zod';

export const SettingsSchema = z.object({
    organizationName: z.string().min(1, "Organization name is required"),
    currency: z.string().default('USD'),
    taxRate: z.number().min(0).max(100).default(0),
    address: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    website: z.string().url().optional(),
    logoUrl: z.string().url().optional(),
    invoicePrefix: z.string().default('INV-'),
    nextInvoiceNumber: z.number().min(1).default(1),
    termsAndConditions: z.string().optional(), // Default payment terms
});

export type AppSettings = z.infer<typeof SettingsSchema>;

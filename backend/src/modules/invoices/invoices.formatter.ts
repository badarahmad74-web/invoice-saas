import { prisma } from '../../shared/infra/db';
import { templateService } from '../../shared/providers/TemplateService';

export class InvoiceFormatter {
    static formatForTemplate(invoice: any) {
        const subtotal = Number(invoice.subtotal);
        const taxRate = Number(invoice.taxRate);
        const taxAmount = Number(invoice.taxAmount);
        const total = Number(invoice.total);

        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: invoice.currency || 'USD',
        });

        return {
            number: invoice.number || 'DRAFT',
            date: new Date(invoice.date).toLocaleDateString(),
            dueDate: new Date(invoice.dueDate).toLocaleDateString(),
            clientName: invoice.clientId, // In a real app, populate this. For preview, we might just have ID or Name passed.
            clientEmail: '', // Need to populate
            organizationName: 'Your Organization', // Should come from Organization context
            organizationEmail: 'contact@org.com',
            subtotalFormatted: formatter.format(subtotal),
            taxRate: taxRate,
            taxAmountFormatted: formatter.format(taxAmount),
            totalFormatted: formatter.format(total),
            notes: invoice.notes,
            items: invoice.items.map((item: any) => ({
                description: item.description,
                unitPriceFormatted: formatter.format(Number(item.unitPrice)),
                quantity: Number(item.quantity),
                totalFormatted: formatter.format(Number(item.quantity) * Number(item.unitPrice)),
            })),
        };
    }

    static async enrichWithRelations(invoiceData: any, organizationId: string) {
        // If we have clientId, fetch client details
        let clientName = 'Client';
        let clientEmail = '';

        if (invoiceData.clientId) {
            const client = await prisma.client.findFirst({
                where: { id: invoiceData.clientId, organizationId },
            });
            if (client) {
                clientName = client.name;
                clientEmail = client.email || '';
            }
        }

        const organization = await prisma.organization.findUnique({
            where: { id: organizationId },
        });

        // Parse Settings
        const settings = organization?.settings
            ? JSON.parse(JSON.stringify(organization.settings))
            : {};

        return {
            ...this.formatForTemplate(invoiceData),
            clientName,
            clientEmail: clientEmail || '',
            organizationName: settings.organizationName || organization?.name || 'Organization',
            organizationAddress: settings.address || '',
            organizationPhone: settings.phone || '',
            organizationEmail: settings.email || '',
            organizationWebsite: settings.website || '',
            currency: invoiceData.currency || settings.currency || 'USD', // Ensure currency is passed down
        };
    }
}

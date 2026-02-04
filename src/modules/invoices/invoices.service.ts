import { prisma } from '../../shared/infra/db';
import { Prisma } from '@prisma/client';
import { CreateInvoiceDto, UpdateInvoiceDto } from './invoices.dto';
import { Decimal } from '@prisma/client/runtime/library';

export class InvoiceService {
    private calculateTotals(items: { quantity: number; unitPrice: number }[], taxRate: number) {
        const subtotal = items.reduce((sum, item) => {
            return sum + (item.quantity * item.unitPrice);
        }, 0);

        const taxAmount = subtotal * (taxRate / 100);
        const total = subtotal + taxAmount;

        return { subtotal, taxAmount, total };
    }

    async generateInvoiceNumber(organizationId: string): Promise<string> {
        const lastInvoice = await prisma.invoice.findFirst({
            where: { organizationId },
            orderBy: { createdAt: 'desc' },
        });

        if (!lastInvoice) return 'INV-0001';

        const lastNumber = parseInt(lastInvoice.number.split('-')[1] || '0', 10);
        return `INV-${String(lastNumber + 1).padStart(4, '0')}`;
    }

    async create(organizationId: string, data: CreateInvoiceDto) {
        // Fetch Organization Settings
        const organization = await prisma.organization.findUnique({
            where: { id: organizationId }
        });

        // Parse settings
        const settings = organization?.settings
            ? JSON.parse(JSON.stringify(organization.settings))
            : {};

        // Generate Invoice Number
        const count = await prisma.invoice.count({ where: { organizationId } });
        const invoiceNumber = `INV-${(count + 1).toString().padStart(4, '0')}`;

        // Calculate Totals
        const subtotal = data.items.reduce((sum, item) => sum.add(new Decimal(item.quantity).mul(new Decimal(item.unitPrice))), new Decimal(0));
        const taxRate = data.taxRate !== undefined ? new Decimal(data.taxRate) : (new Decimal(settings.taxRate || 0));
        const taxAmount = subtotal.mul(taxRate).div(100);
        const total = subtotal.add(taxAmount);

        // Transaction
        return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const invoice = await tx.invoice.create({
                data: {
                    organizationId,
                    clientId: data.clientId,
                    number: invoiceNumber,
                    date: new Date(data.date),
                    dueDate: new Date(data.dueDate),
                    status: 'DRAFT',
                    subtotal,
                    taxRate: taxRate,
                    taxAmount,
                    total,
                    currency: data.currency || settings.currency || 'USD',
                    notes: data.notes || settings.termsAndConditions,
                    paidAt: null,
                    items: {
                        create: data.items.map(item => ({
                            description: item.description,
                            quantity: new Decimal(item.quantity),
                            unitPrice: new Decimal(item.unitPrice),
                            total: new Decimal(item.quantity).mul(new Decimal(item.unitPrice)),
                            productId: item.productId,
                        })),
                    },
                },
                include: { items: true, client: true },
            });
            return invoice;
        });
    }

    async findAll(organizationId: string) {
        return prisma.invoice.findMany({
            where: { organizationId },
            include: { client: true, items: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(organizationId: string, invoiceId: string) {
        return prisma.invoice.findFirst({
            where: { id: invoiceId, organizationId },
            include: { client: true, items: true, organization: true },
        });
    }
}

export const invoiceService = new InvoiceService();

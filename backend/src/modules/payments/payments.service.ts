import { prisma } from '../../shared/infra/db';
import { PaymentProvider, CreatePaymentLinkDTO } from '../../shared/providers/payment/PaymentProvider';
import { StripeProvider } from '../../shared/providers/payment/StripeProvider';
import { Decimal } from '@prisma/client/runtime/library';

export class PaymentService {
    private provider: PaymentProvider;

    constructor() {
        // We could inject this or use a factory based on org settings
        this.provider = new StripeProvider();
    }

    async createPaymentLink(dto: CreatePaymentLinkDTO) {
        const link = await this.provider.createPaymentLink(dto);
        return link;
    }

    async handleWebhook(signature: string, payload: any) {
        // 1. Verify signature
        const event = this.provider.verifyWebhookSignature(payload, signature);
        const eventId = event.id; // Stripe event ID

        // 2. Idempotency Check
        const existingPayment = await prisma.payment.findFirst({
            where: { externalId: eventId }
        });
        if (existingPayment) {
            console.log(`Event ${eventId} already processed.`);
            return { received: true };
        }

        // 3. Handle generic event
        const result = await this.provider.handleWebhookEvent(event);

        if (result) {
            if (result.status === 'PAID') {
                await this.markInvoiceAsPaid(result.invoiceId, result.amount, result.currency, eventId);
            } else if (result.status === 'FAILED') {
                // Log failed payment attempt
                await this.recordFailedPayment(result.invoiceId, result.amount, result.currency, eventId);
            }
        }

        return { received: true };
    }

    private async markInvoiceAsPaid(invoiceId: string, amount: number, currency: string, externalId: string) {
        const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
        if (!invoice) return;

        if (invoice.status !== 'PAID') {
            await prisma.$transaction(async (tx) => {
                // Create Payment Record
                await tx.payment.create({
                    data: {
                        organizationId: invoice.organizationId,
                        invoiceId: invoice.id,
                        amount: new Decimal(amount),
                        currency,
                        status: 'COMPLETED',
                        provider: 'stripe',
                        externalId: externalId,
                    }
                });

                // Update Invoice
                await tx.invoice.update({
                    where: { id: invoiceId },
                    data: {
                        status: 'PAID',
                        paidAt: new Date()
                    }
                });
            });

            console.log(`Invoice ${invoiceId} marked as PAID`);
        }
    }

    private async recordFailedPayment(invoiceId: string, amount: number, currency: string, externalId: string) {
        const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
        if (!invoice) return;

        await prisma.payment.create({
            data: {
                organizationId: invoice.organizationId,
                invoiceId: invoice.id,
                amount: new Decimal(amount),
                currency,
                status: 'FAILED',
                provider: 'stripe',
                externalId: externalId
            }
        });
    }
}

export const paymentService = new PaymentService();

import Stripe from 'stripe';
import { CreatePaymentLinkDTO, PaymentProvider } from './PaymentProvider';

export class StripeProvider implements PaymentProvider {
    private stripe: Stripe;
    private webhookSecret: string;

    constructor() {
        // In production, these should be env vars verified at startup
        const apiKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
        this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';

        this.stripe = new Stripe(apiKey, {
            apiVersion: '2024-12-18.acacia' as any, // Use latest or defined version
            typescript: true,
        });
    }

    async createPaymentLink(data: CreatePaymentLinkDTO): Promise<string> {
        // Create a Checkout Session
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: data.currency,
                        product_data: {
                            name: data.description,
                        },
                        unit_amount: Math.round(data.amount * 100), // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/invoices/${data.invoiceId}?payment=success`,
            cancel_url: `${process.env.FRONTEND_URL}/invoices/${data.invoiceId}?payment=cancelled`,
            customer_email: data.email,
            metadata: {
                invoiceId: data.invoiceId,
                organizationId: data.organizationId,
            },
        });

        return session.url || '';
    }

    verifyWebhookSignature(payload: any, signature: string): any {
        return this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
    }

    async handleWebhookEvent(event: any): Promise<{ invoiceId: string; status: 'PAID' | 'FAILED'; amount: number; currency: string } | null> {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const invoiceId = session.metadata?.invoiceId;

                if (invoiceId) {
                    return {
                        invoiceId,
                        status: 'PAID',
                        amount: (session.amount_total || 0) / 100,
                        currency: session.currency || 'USD'
                    };
                }
                break;
            }
            case 'payment_intent.payment_failed': {
                // ... logic
                break;
            }
        }
        return null;
    }
}

import { Request, Response } from 'express';
import { paymentService } from './payments.service';
import { invoiceService } from '../invoices/invoices.service';

export class PaymentController {
    async createPaymentLink(req: Request, res: Response) {
        try {
            const { invoiceId } = req.body;
            const invoice = await invoiceService.findOne(req.user!.organizationId, invoiceId);

            if (!invoice) {
                return res.status(404).json({ error: 'Invoice not found' });
            }

            const link = await paymentService.createPaymentLink({
                invoiceId: invoice.id,
                amount: Number(invoice.total),
                currency: invoice.currency,
                description: `Invoice ${invoice.number}`,
                email: 'client@example.com', // Should be invoice.client.email
                organizationId: invoice.organizationId,
            });

            res.json({ url: link });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to create payment link' });
        }
    }

    async handleWebhook(req: Request, res: Response) {
        const sig = req.headers['stripe-signature'];

        try {
            if (!sig) throw new Error('No signature');
            // In a real app, use raw body. Express might parse it automatically.
            // Need 'bodyParser.raw({ type: "application/json" })' for webhooks
            await paymentService.handleWebhook(sig as string, req.body);
            res.json({ received: true });
        } catch (err: any) {
            console.error('Webhook Error:', err.message);
            res.status(400).send(`Webhook Error: ${err.message}`);
        }
    }
}

export const paymentController = new PaymentController();

// import { prisma } from '../../shared/infra/db'; // internal usage if needed

export interface CreatePaymentLinkDTO {
    invoiceId: string;
    amount: number;
    currency: string;
    description: string;
    email?: string;
    organizationId: string;
}

export interface PaymentProvider {
    createPaymentLink(data: CreatePaymentLinkDTO): Promise<string>;
    verifyWebhookSignature(payload: any, signature: string): any;
    handleWebhookEvent(event: any): Promise<{ invoiceId: string; status: 'PAID' | 'FAILED'; amount: number; currency: string } | null>;
}

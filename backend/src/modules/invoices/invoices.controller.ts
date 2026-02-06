import { Request, Response } from 'express';
import { invoiceService } from './invoices.service';
import { prisma } from '../../shared/infra/db';
import { createInvoiceSchema } from './invoices.dto';
import { z } from 'zod';
import { templateService } from '../../shared/providers/TemplateService';
import { pdfService } from '../../shared/providers/PdfService';
import { emailService } from '../../shared/providers/EmailService';
import { InvoiceFormatter } from './invoices.formatter';

// Align with auth.middleware.ts definition
interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        organizationId: string;
        role: string;
    };
}

export class InvoiceController {
    async create(req: Request, res: Response) {
        const authReq = req as AuthenticatedRequest;
        try {
            const data = createInvoiceSchema.parse(req.body);
            const invoice = await invoiceService.create(authReq.user!.organizationId, data);
            res.status(201).json(invoice);
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: error.issues });
            } else {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    }

    async findAll(req: Request, res: Response) {
        const authReq = req as AuthenticatedRequest;
        const invoices = await invoiceService.findAll(authReq.user!.organizationId);
        res.json(invoices);
    }

    async findOne(req: Request, res: Response) {
        const authReq = req as AuthenticatedRequest;
        const invoiceId = req.params.id as string;
        const invoice = await invoiceService.findOne(authReq.user!.organizationId, invoiceId);
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
        res.json(invoice);
    }

    async preview(req: Request, res: Response) {
        const authReq = req as AuthenticatedRequest;
        try {
            const data = req.body;
            const formattedData = await InvoiceFormatter.enrichWithRelations(data, authReq.user!.organizationId);
            const html = await templateService.render('invoice-default', formattedData);
            res.send(html);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Preview generation failed' });
        }
    }

    async downloadPdf(req: Request, res: Response) {
        const authReq = req as AuthenticatedRequest;
        try {
            const invoiceId = req.params.id as string;
            const invoice = await invoiceService.findOne(authReq.user!.organizationId, invoiceId);
            if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

            const formattedData = await InvoiceFormatter.enrichWithRelations(invoice, authReq.user!.organizationId);
            const html = await templateService.render('invoice-default', formattedData);
            const pdfBuffer = await pdfService.generatePdf(html);

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="invoice-${invoice.number}.pdf"`,
                'Content-Length': pdfBuffer.length
            });
            res.send(pdfBuffer);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'PDF generation failed' });
        }
    }

    async sendEmail(req: Request, res: Response) {
        const authReq = req as AuthenticatedRequest;
        try {
            const invoiceId = req.params.id as string;
            const invoice = await invoiceService.findOne(authReq.user!.organizationId, invoiceId);
            if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

            const formattedData = await InvoiceFormatter.enrichWithRelations(invoice, authReq.user!.organizationId);
            const html = await templateService.render('invoice-default', formattedData);
            const pdfBuffer = await pdfService.generatePdf(html);

            if (!formattedData.clientEmail) {
                return res.status(400).json({ error: 'Client email not found' });
            }

            await emailService.sendInvoice(
                formattedData.clientEmail,
                `Invoice ${invoice.number} from ${formattedData.organizationName}`,
                `Please find attached invoice ${invoice.number}.`,
                pdfBuffer,
                invoice.number
            );

            if (invoice.status === 'DRAFT') {
                await prisma.invoice.update({
                    where: { id: invoiceId },
                    data: { status: 'SENT' }
                });
            }

            res.json({ success: true, message: 'Email sent successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to send email' });
        }
    }
}

export const invoiceController = new InvoiceController();

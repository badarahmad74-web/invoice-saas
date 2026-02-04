import nodemailer from 'nodemailer';
import { env } from '../../config/env';

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        // For development, we'll log capabilities. 
        // In production, this should be configured via ENV.
        // Fallback to Ethereal or console if sending is not critically configured yet.
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER || 'ethereal_user',
                pass: process.env.SMTP_PASS || 'ethereal_pass',
            },
        });
    }

    async sendInvoice(to: string, subject: string, html: string, pdfBuffer: Buffer, invoiceNumber: string) {
        try {
            const info = await this.transporter.sendMail({
                from: '"Invoicer App" <no-reply@invoicer.app>',
                to,
                subject,
                html,
                attachments: [
                    {
                        filename: `invoice-${invoiceNumber}.pdf`,
                        content: pdfBuffer,
                    },
                ],
            });

            console.log('Message sent: %s', info.messageId);
            return info;
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Failed to send email');
        }
    }
}

export const emailService = new EmailService();

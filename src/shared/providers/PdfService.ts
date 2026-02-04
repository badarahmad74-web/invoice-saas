import puppeteer from 'puppeteer';

export class PdfService {
    async generatePdf(html: string): Promise<Buffer> {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        try {
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });
            // Uint8Array is compatible with Buffer for most Node.js fs operations, but let's be explicit
            const pdfUint8Array = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
            });

            return Buffer.from(pdfUint8Array);
        } finally {
            await browser.close();
        }
    }
}

export const pdfService = new PdfService();

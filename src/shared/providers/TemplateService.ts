import fs from 'fs/promises';
import path from 'path';
import Handlebars from 'handlebars';

export class TemplateService {
    private templatesDir = path.join(process.cwd(), 'src', 'templates');

    async render(templateName: string, data: any): Promise<string> {
        const filePath = path.join(this.templatesDir, `${templateName}.hbs`);

        try {
            const source = await fs.readFile(filePath, 'utf-8');
            const template = Handlebars.compile(source);
            return template(data);
        } catch (error) {
            console.error(`Failed to render template ${templateName}`, error);
            throw new Error(`Template ${templateName} not found or invalid`);
        }
    }
}

export const templateService = new TemplateService();

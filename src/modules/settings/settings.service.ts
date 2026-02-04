import { prisma } from '../../shared/infra/db';

export class SettingsService {
    async getSettings(organizationId: string) {
        return prisma.organization.findUnique({
            where: { id: organizationId },
            select: { settings: true, name: true },
        });
    }

    async updateSettings(organizationId: string, settings: any) {
        return prisma.organization.update({
            where: { id: organizationId },
            data: { settings },
        });
    }
}

export const settingsService = new SettingsService();

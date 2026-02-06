import { prisma } from '../../shared/infra/db';
import { CreateClientDto, UpdateClientDto } from './clients.dto';

export class ClientService {
    async create(organizationId: string, data: CreateClientDto) {
        return prisma.client.create({
            data: {
                ...data,
                organizationId,
            },
        });
    }

    async findAll(organizationId: string) {
        return prisma.client.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(organizationId: string, clientId: string) {
        return prisma.client.findFirst({
            where: { id: clientId, organizationId },
        });
    }

    async update(organizationId: string, clientId: string, data: UpdateClientDto) {
        const client = await this.findOne(organizationId, clientId);
        if (!client) throw new Error('Client not found');

        return prisma.client.update({
            where: { id: clientId },
            data,
        });
    }

    async delete(organizationId: string, clientId: string) {
        const client = await this.findOne(organizationId, clientId);
        if (!client) throw new Error('Client not found');

        return prisma.client.delete({
            where: { id: clientId },
        });
    }
}

export const clientService = new ClientService();

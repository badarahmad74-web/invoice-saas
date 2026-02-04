import { prisma } from '../../shared/infra/db';
import { Prisma } from '@prisma/client';

export class DashboardService {
    async getStats(organizationId: string) {
        const now = new Date();

        // Parallelize queries for performance
        const [totalRevenue, overdueInvoices, openInvoicesCount] = await Promise.all([
            // Total Revenue (PAID Invoices)
            prisma.invoice.aggregate({
                where: {
                    organizationId,
                    status: 'PAID',
                },
                _sum: {
                    total: true,
                },
            }),

            // Overdue Amount
            prisma.invoice.aggregate({
                where: {
                    organizationId,
                    status: 'OVERDUE',
                },
                _sum: {
                    total: true,
                },
            }),

            // Open Invoices Count (SENT or OVERDUE)
            prisma.invoice.count({
                where: {
                    organizationId,
                    status: { in: ['SENT', 'OVERDUE'] },
                },
            }),
        ]);

        // Recent Invoices
        const recentInvoices = await prisma.invoice.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                client: {
                    select: { name: true },
                },
            },
        });

        return {
            totalRevenue: totalRevenue._sum.total || 0,
            overdueAmount: overdueInvoices._sum.total || 0,
            openInvoicesCount,
            recentInvoices,
        };
    }
}

export const dashboardService = new DashboardService();

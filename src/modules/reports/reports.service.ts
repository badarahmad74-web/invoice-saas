import { prisma } from '../../shared/infra/db';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class ReportsService {
    async getDashboardStats(organizationId: string) {
        const totalRevenue = await prisma.invoice.aggregate({
            where: {
                organizationId,
                status: 'PAID'
            },
            _sum: { total: true }
        });

        const overdueAmount = await prisma.invoice.aggregate({
            where: {
                organizationId,
                status: 'OVERDUE'
            },
            _sum: { total: true }
        });

        const openInvoicesCount = await prisma.invoice.count({
            where: {
                organizationId,
                status: { in: ['DRAFT', 'SENT', 'OVERDUE'] }
            }
        });

        const recentInvoices = await prisma.invoice.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { client: true }
        });

        return {
            totalRevenue: totalRevenue._sum.total || 0,
            overdueAmount: overdueAmount._sum.total || 0,
            openInvoicesCount,
            recentInvoices
        };
    }

    async getRevenueOverTime(organizationId: string) {
        // Group by month for the last 6 months
        // Prisma doesn't support advanced grouping easily without raw queries or processing in JS.
        // For MVP, fetch recent paid invoices and aggregate in JS.
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const paidInvoices = await prisma.invoice.findMany({
            where: {
                organizationId,
                status: 'PAID',
                paidAt: { gte: sixMonthsAgo }
            },
            select: {
                paidAt: true,
                total: true
            }
        });

        // Aggregate by month
        const monthlyRevenue: Record<string, number> = {};
        paidInvoices.forEach((inv: { paidAt: Date | null; total: Decimal }) => {
            if (!inv.paidAt) return;
            const monthKey = inv.paidAt.toLocaleString('default', { month: 'short', year: 'numeric' });
            monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + Number(inv.total);
        });

        return Object.entries(monthlyRevenue).map(([month, amount]) => ({ month, amount }));
    }
}

export const reportsService = new ReportsService();

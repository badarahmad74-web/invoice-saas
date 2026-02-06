import { Request, Response } from 'express';
import { reportsService } from './reports.service';

interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        organizationId: string;
        role: string;
    };
}

export class ReportsController {
    async getDashboardStats(req: Request, res: Response) {
        const authReq = req as AuthenticatedRequest;
        try {
            const stats = await reportsService.getDashboardStats(authReq.user!.organizationId);
            res.json(stats);
        } catch (error) {
            console.error('Failed to fetch dashboard stats', error);
            res.status(500).json({ error: 'Failed to fetch dashboard stats' });
        }
    }

    async getRevenueChart(req: Request, res: Response) {
        const authReq = req as AuthenticatedRequest;
        try {
            const data = await reportsService.getRevenueOverTime(authReq.user!.organizationId);
            res.json(data);
        } catch (error) {
            console.error('Failed to fetch revenue chart', error);
            res.status(500).json({ error: 'Failed to fetch revenue chart' });
        }
    }
}

export const reportsController = new ReportsController();

import { Request, Response } from 'express';
import { dashboardService } from './dashboard.service';

export class DashboardController {
    async getStats(req: Request, res: Response) {
        try {
            const stats = await dashboardService.getStats(req.user!.organizationId);
            res.json(stats);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

export const dashboardController = new DashboardController();

import { Router } from 'express';
import { reportsController } from './reports.controller';
import { authenticate } from '../auth/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/dashboard', reportsController.getDashboardStats);
router.get('/revenue', reportsController.getRevenueChart);

export const reportsRoutes = router;

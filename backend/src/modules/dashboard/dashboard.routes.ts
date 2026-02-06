import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate, requireOrganization } from '../auth/auth.middleware';

const router = Router();

router.use(authenticate, requireOrganization);

router.get('/stats', dashboardController.getStats);

export const dashboardRoutes = router;

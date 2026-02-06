import { Router } from 'express';
import { settingsController } from './settings.controller';
import { authenticate, requireOrganization } from '../auth/auth.middleware';

const router = Router();

router.use(authenticate, requireOrganization);

router.get('/', settingsController.get);
router.put('/', settingsController.update);

export const settingsRoutes = router;

import { Router } from 'express';
import { clientController } from './clients.controller';
import { authenticate, requireOrganization } from '../auth/auth.middleware';

const router = Router();

router.use(authenticate, requireOrganization);

router.post('/', clientController.create);
router.get('/', clientController.findAll);
router.get('/:id', clientController.findOne);
router.put('/:id', clientController.update);
router.delete('/:id', clientController.delete);

export const clientRoutes = router;

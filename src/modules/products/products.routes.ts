import { Router } from 'express';
import { productController } from './products.controller';
import { authenticate, requireOrganization } from '../auth/auth.middleware';

const router = Router();

router.use(authenticate, requireOrganization);

router.post('/', productController.create);
router.get('/', productController.findAll);
router.get('/:id', productController.findOne);
router.put('/:id', productController.update);
router.delete('/:id', productController.delete);

export const productRoutes = router;

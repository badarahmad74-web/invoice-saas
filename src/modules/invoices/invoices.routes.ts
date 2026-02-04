import { Router } from 'express';
import { invoiceController } from './invoices.controller';
import { authenticate, requireOrganization } from '../auth/auth.middleware';

const router = Router();

router.use(authenticate, requireOrganization);

router.post('/', invoiceController.create);
router.post('/preview', invoiceController.preview);
router.get('/', invoiceController.findAll);
router.get('/:id', invoiceController.findOne);
router.get('/:id/pdf', invoiceController.downloadPdf);
router.post('/:id/email', invoiceController.sendEmail);

export const invoiceRoutes = router;

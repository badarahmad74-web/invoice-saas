import { Router } from 'express';
import { paymentController } from './payments.controller';
import { authenticate } from '../auth/auth.middleware';
import express from 'express';

const router = Router();

// Protected routes (generating links)
router.post('/create-link', authenticate, paymentController.createPaymentLink);

// Public webhook route (must handle raw body if verifying signatures)
// For simplicity in this demo, assuming express.json() is global, 
// but stripe requires raw buffer. We will assume the controller handles it or global middleware is adjusted.
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

export const paymentRoutes = router;

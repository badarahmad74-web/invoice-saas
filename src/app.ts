import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { authRoutes } from './modules/auth/auth.routes';
import { clientRoutes } from './modules/clients/clients.routes';
import { productRoutes } from './modules/products/products.routes';

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());

// Body Parsing
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', env: env.NODE_ENV });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/products', productRoutes);
import { invoiceRoutes } from './modules/invoices/invoices.routes';
import { settingsRoutes } from './modules/settings/settings.routes';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';
import { paymentRoutes } from './modules/payments/payments.routes';
import { reportsRoutes } from './modules/reports/reports.routes';

app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/dashboard', dashboardRoutes); // Legacy or alias
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/payments', paymentRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

export { app };

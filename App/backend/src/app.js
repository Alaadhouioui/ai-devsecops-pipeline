import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import moduleRoutes from './routes/moduleRoutes.js';
import logRoutes from './routes/logRoutes.js';
import securityRoutes from './routes/securityRoutes.js';
import devsecopsRoutes from './routes/devsecopsRoutes.js';
import versionRoutes from './routes/versionRoutes.js';

const app = express();
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
const trustProxy = process.env.TRUST_PROXY || 'loopback, linklocal, uniquelocal';

app.use(helmet());
app.set('trust proxy', trustProxy);
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'aerosec-backend' }));
app.use('/api/version', versionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/devsecops', devsecopsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

export default app;

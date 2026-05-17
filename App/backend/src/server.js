import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import moduleRoutes from './routes/moduleRoutes.js';
import logRoutes from './routes/logRoutes.js';
import securityRoutes from './routes/securityRoutes.js';
import devsecopsRoutes from './routes/devsecopsRoutes.js';
import { buildActivityEvent, buildDashboardSnapshot } from './services/simulationService.js';
import { seedDemoData } from './services/seedService.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST']
  }
});

app.use(helmet());
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'aerosec-backend' }));
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

io.on('connection', (socket) => {
  socket.emit('tower:snapshot', buildDashboardSnapshot());
  socket.emit('tower:event', buildActivityEvent());
});

setInterval(() => {
  io.emit('tower:snapshot', buildDashboardSnapshot());
  io.emit('tower:event', buildActivityEvent());
}, 4500);

const port = process.env.PORT || 5000;
seedDemoData()
  .then(() => {
    server.listen(port, () => {
      console.log(`AeroSec backend listening on ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to seed demo data', error);
    process.exit(1);
  });

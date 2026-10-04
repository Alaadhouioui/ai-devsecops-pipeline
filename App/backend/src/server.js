import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { buildActivityEvent, buildDashboardSnapshot } from './services/simulationService.js';
import { seedDemoData } from './services/seedService.js';

dotenv.config();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST']
  }
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

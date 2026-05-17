import { Router } from 'express';
import { createAttackSimulation, listAlerts } from '../controllers/securityController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/alerts', requireAuth, listAlerts);
router.post('/simulate', requireAuth, requireRole('Admin', 'Engineer'), createAttackSimulation);

export default router;


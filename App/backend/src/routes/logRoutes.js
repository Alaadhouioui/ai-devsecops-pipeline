import { Router } from 'express';
import { listLogs } from '../controllers/logsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, listLogs);

export default router;


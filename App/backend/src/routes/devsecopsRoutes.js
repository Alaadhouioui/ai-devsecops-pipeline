import { Router } from 'express';
import { getDevSecOps } from '../controllers/devsecopsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getDevSecOps);

export default router;


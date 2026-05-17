import { Router } from 'express';
import { getModule, listModules } from '../controllers/modulesController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, listModules);
router.get('/:slug', requireAuth, getModule);

export default router;


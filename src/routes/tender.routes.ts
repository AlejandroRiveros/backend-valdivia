import { Router } from 'express';
import { getTenderProcesses, createTenderProcess } from '../controllers/tender.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, getTenderProcesses);
router.post('/', requireAuth, createTenderProcess);

export default router;

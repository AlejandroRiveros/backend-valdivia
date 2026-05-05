import { Router } from 'express';
import { getTenderProcesses, createTenderProcess, assignSupervisor } from '../controllers/tender.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, getTenderProcesses);
router.post('/', requireAuth, createTenderProcess);
router.patch('/:id/assign-supervisor', requireAuth, assignSupervisor);

export default router;

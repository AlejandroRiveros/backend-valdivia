import { Router } from 'express';
import { getDeliverables, authorizeDeliverable, rejectDeliverable } from '../controllers/deliverable.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, getDeliverables);
router.patch('/:id/authorize', requireAuth, authorizeDeliverable);
router.patch('/:id/reject', requireAuth, rejectDeliverable);

export default router;

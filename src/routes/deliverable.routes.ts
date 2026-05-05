import { Router } from 'express';
import { getDeliverables, authorizeDeliverable, rejectDeliverable, createDeliverable, updateDocStatus } from '../controllers/deliverable.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, getDeliverables);
router.post('/', requireAuth, createDeliverable);
router.patch('/:id/authorize', requireAuth, authorizeDeliverable);
router.patch('/:id/reject', requireAuth, rejectDeliverable);
router.patch('/:id/doc-status', requireAuth, updateDocStatus);

export default router;

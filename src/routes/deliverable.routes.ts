import { Router } from 'express';
import { getDeliverables, authorizeDeliverable, rejectDeliverable } from '../controllers/deliverable.controller';

const router = Router();

router.get('/', getDeliverables);
router.patch('/:id/authorize', authorizeDeliverable);
router.patch('/:id/reject', rejectDeliverable);

export default router;

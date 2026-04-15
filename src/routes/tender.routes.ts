import { Router } from 'express';
import { getTenderProcesses, createTenderProcess } from '../controllers/tender.controller';

const router = Router();

router.get('/', getTenderProcesses);
router.post('/', createTenderProcess);

export default router;

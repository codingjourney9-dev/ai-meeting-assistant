

import { Router } from 'express';
import { generateSummary, getSummary } from '../controllers/summaryController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth); 


router.post('/:meetingId/summary', generateSummary); 
router.get('/:meetingId/summary', getSummary);       

export default router;

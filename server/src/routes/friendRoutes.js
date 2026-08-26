import { Router } from 'express';
import { searchUsers, sendRequest, getPendingRequests, acceptRequest, rejectRequest, getFriends } from '../controllers/friendController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/search', searchUsers);
router.post('/request', sendRequest);
router.get('/requests', getPendingRequests);
router.post('/request/:requestId/accept', acceptRequest);
router.post('/request/:requestId/reject', rejectRequest);
router.get('/', getFriends);

export default router;

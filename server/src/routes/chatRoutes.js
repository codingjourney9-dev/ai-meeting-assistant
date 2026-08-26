import { Router } from 'express';
import { getOrCreateConversation, getConversations, getMessages } from '../controllers/chatController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.post('/conversation', getOrCreateConversation);
router.get('/conversations', getConversations);
router.get('/:conversationId/messages', getMessages);

export default router;

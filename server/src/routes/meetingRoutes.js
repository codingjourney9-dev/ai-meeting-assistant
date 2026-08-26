

import { Router } from 'express';
import {
  createMeeting,
  listMeetings,
  getMeeting,
  deleteMeeting,
} from '../controllers/meetingController.js';
import {
  addTask,
  toggleTask,
  dispatchEmails,
} from '../controllers/taskController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth); 

router.post('/', createMeeting);      
router.get('/', listMeetings);        
router.get('/:id', getMeeting);       
router.delete('/:id', deleteMeeting); 


router.post('/:id/tasks', addTask);
router.patch('/:id/tasks/:taskId/toggle', toggleTask);
router.post('/:id/dispatch', dispatchEmails);

export default router;

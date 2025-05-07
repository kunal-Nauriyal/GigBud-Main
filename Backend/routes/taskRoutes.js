import express from 'express';
import { 
  createTask, 
  listTasks, 
  getTask, 
  acceptTask, 
  completeTask, 
  deleteTask 
} from '../controllers/taskController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/task/create', authMiddleware, upload.single('attachment'), createTask);
router.get('/task/list', authMiddleware, listTasks);
router.get('/task/:id', authMiddleware, getTask);
router.post('/task/accept/:id', authMiddleware, acceptTask);
router.post('/task/complete/:id', authMiddleware, completeTask);
router.delete('/task/delete/:id', authMiddleware, deleteTask);

export default router;

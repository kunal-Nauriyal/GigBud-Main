import express from 'express';
import {
  createTask,
  listTasks,
  getTask,
  acceptTask,
  completeTask,
  deleteTask,
  getAvailableTasks,
  getTasksByProvider, // optional provider-specific
} from '../controllers/taskController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Create Task (with optional file upload)
router.post('/task/create', authMiddleware, upload.single('attachment'), createTask);

// List all tasks for authenticated user
router.get('/task/list', authMiddleware, listTasks);

// Get available tasks (not assigned, filtered by location if provided)
router.get('/task/available', authMiddleware, getAvailableTasks);

// Optional: Get tasks by provider user ID
router.get('/tasks/provider/:userId', authMiddleware, getTasksByProvider);

// Get single task by ID
router.get('/task/:id', authMiddleware, getTask);

// Accept a task
router.post('/task/accept/:id', authMiddleware, acceptTask);

// Complete a task
router.post('/task/complete/:id', authMiddleware, completeTask);

// Delete a task
router.delete('/task/delete/:id', authMiddleware, deleteTask);

export default router;

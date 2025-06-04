import express from 'express';
import {
  createTask,
  listTasks,
  getTask,
  acceptTask,
  completeTask,
  deleteTask,
  getAvailableTasks,
  getTasksByProvider,
  applyForTask,
  getAppliedTasks,
  getSavedTasks,
  getOngoingTasks,
  getCompletedTasks,
  saveTask,
  markTaskAsOngoing,
  assignTaskByProvider,
  markTaskReadyForCompletion,
  rateTask
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

// IMPORTANT: These specific routes MUST come BEFORE the parameterized route (/task/:id)
router.get('/task/applied', authMiddleware, getAppliedTasks);
router.get('/task/saved', authMiddleware, getSavedTasks);
router.get('/task/ongoing', authMiddleware, getOngoingTasks);
router.get('/task/completed', authMiddleware, getCompletedTasks);

// Apply for a task
router.post('/task/apply/:id', authMiddleware, applyForTask);

// Save a task
router.post('/task/save/:id', authMiddleware, saveTask);

// Accept a task
router.post('/task/accept/:id', authMiddleware, acceptTask);

// Assign a task to an applicant (by task creator)
router.post('/task/assign/:id', authMiddleware, assignTaskByProvider);

// Mark task as ongoing
router.post('/task/mark-ongoing/:id', authMiddleware, markTaskAsOngoing);

// Mark task as ready for completion
router.post('/task/ready/:id', authMiddleware, markTaskReadyForCompletion);

// Complete a task
router.post('/task/complete/:id', authMiddleware, completeTask);

// Delete a task
router.delete('/task/delete/:id', authMiddleware, deleteTask);

// Optional: Get tasks by provider user ID
router.get('/tasks/provider/:userId', authMiddleware, getTasksByProvider);

// Get single task by ID (MUST be last)
router.get('/task/:id', authMiddleware, getTask);

// Add this route before export default
router.post('/task/rate/:id', authMiddleware, rateTask);

export default router;
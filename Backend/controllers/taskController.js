import mongoose from 'mongoose';
import Task from '../models/Task.js';
import { successResponse, errorResponse } from '../views/responseTemplates.js';

/**
 * Create a new task
 */
export const createTask = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'Unauthorized: user not found', 401);
    }

    const { taskType } = req.body;
    if (!taskType || !['normal', 'timebuyer'].includes(taskType)) {
      return errorResponse(res, 'Invalid task type', 400);
    }

    let taskData = {
      user: userId,
      taskType,
      status: 'pending',
      applicants: [], // Initialize applicants array
    };

    let locationMode = req.body.location?.mode || req.body.location || 'Online';
    locationMode = typeof locationMode === 'string' ? locationMode : 'Online';

    taskData.location = {
      type: 'Point',
      coordinates: req.body.location?.coordinates || [0, 0],
      mode: locationMode,
      ...(req.body.address && { address: req.body.address })
    };

    if (req.file) {
      taskData.attachment = req.file.path;
    }

    if (taskType === 'normal') {
      const { title, description, deadline, budget } = req.body;

      const errors = [];
      if (!title?.trim()) errors.push('Title is required');
      if (!description?.trim()) errors.push('Description is required');
      if (!deadline) errors.push('Deadline is required');
      if (!budget || isNaN(parseFloat(budget))) {
        errors.push('Valid budget amount is required');
      }

      if (errors.length > 0) {
        return errorResponse(res, errors.join(', '), 400);
      }

      Object.assign(taskData, {
        title: title.trim(),
        description: description.trim(),
        deadline: new Date(deadline),
        budget: parseFloat(budget),
      });
    } else {
      const {
        timeRequirement,
        jobType,
        skills,
        workMode = 'Online',
        budgetPerHour,
        additionalNotes,
      } = req.body;

      const errors = [];
      if (!timeRequirement?.trim()) errors.push('Time requirement is required');
      if (!jobType?.trim()) errors.push('Job type is required');
      if (!budgetPerHour || isNaN(parseFloat(budgetPerHour))) {
        errors.push('Valid budget per hour is required');
      }

      if (errors.length > 0) {
        return errorResponse(res, errors.join(', '), 400);
      }

      Object.assign(taskData, {
        timeRequirement: timeRequirement.trim(),
        jobType: jobType.trim(),
        skills: Array.isArray(skills) ? skills : (skills?.split(',') || []),
        workMode,
        budgetPerHour: parseFloat(budgetPerHour),
        ...(additionalNotes && { additionalNotes: additionalNotes.trim() }),
      });
    }

    const newTask = new Task(taskData);
    await newTask.save();

    return successResponse(res, 'Task created successfully', 201, newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return errorResponse(res, messages.join(', '), 400);
    }
    return errorResponse(res, error.message || 'Server error', 500);
  }
};

/**
 * List tasks belonging to the logged-in user
 */
export const listTasks = async (req, res) => {
  try {
    const userId = req.user?.id;
    const tasks = await Task.find({ user: userId }).sort({ createdAt: -1 });
    return successResponse(res, 'Tasks retrieved successfully', 200, tasks);
  } catch (error) {
    console.error('Error listing tasks:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * Get a single task (only if owned by user or assigned to user)
 */
export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return errorResponse(res, 'Task not found', 404);
    }

    const userId = req.user?.id;
    // Allow access to task owner OR assigned provider
    if (task.user.toString() !== userId && task.assignedTo?.toString() !== userId) {
      return errorResponse(res, 'Unauthorized access to this task', 403);
    }

    return successResponse(res, 'Task retrieved successfully', 200, task);
  } catch (error) {
    console.error('Error getting task:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * Accept a task (assign it to a user, e.g., a provider)
 */
export const acceptTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized: user not found in request', 401);
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return errorResponse(res, 'Task not found', 404);
    }

    if (task.assignedTo) {
      return errorResponse(res, 'Task is already accepted by another user', 400);
    }

    task.assignedTo = userId;
    task.status = 'accepted';
    await task.save();

    return successResponse(res, 'Task accepted successfully', 200, task);
  } catch (error) {
    console.error('Error accepting task:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * Mark a task as ongoing
 */
export const markTaskAsOngoing = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized: user not found', 401);
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return errorResponse(res, 'Task not found', 404);
    }

    // Check if user is the assigned provider
    if (task.assignedTo?.toString() !== userId) {
      return errorResponse(res, 'Unauthorized to mark this task as ongoing', 403);
    }

    // Check if task is already completed
    if (task.status === 'completed') {
      return errorResponse(res, 'Completed task cannot be marked as ongoing', 400);
    }

    task.status = 'in-progress';
    await task.save();

    return successResponse(res, 'Task marked as ongoing successfully', 200, task);
  } catch (error) {
    console.error('Error marking task as ongoing:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * Mark a task as complete (only by owner or assignee)
 */
export const completeTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return errorResponse(res, 'Task not found', 404);
    }

    const userId = req.user?.id;
    if (
      task.user.toString() !== userId &&
      task.assignedTo?.toString() !== userId
    ) {
      return errorResponse(res, 'Unauthorized to complete this task', 403);
    }

    task.status = 'completed';
    await task.save();

    return successResponse(res, 'Task marked as completed', 200, task);
  } catch (error) {
    console.error('Error completing task:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * Delete a task (only by owner)
 */
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return errorResponse(res, 'Task not found', 404);
    }

    if (task.user.toString() !== req.user?.id) {
      return errorResponse(res, 'Unauthorized to delete this task', 403);
    }

    await task.deleteOne();
    return successResponse(res, 'Task deleted successfully', 200, task);
  } catch (error) {
    console.error('Error deleting task:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * Get all available (unassigned) tasks
 */
export const getAvailableTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: null, status: 'pending' }).sort({ createdAt: -1 });
    return successResponse(res, 'Available tasks retrieved successfully', 200, tasks);
  } catch (error) {
    console.error('Error retrieving available tasks:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * Get tasks assigned to the current provider
 */
export const getTasksByProvider = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'Unauthorized: user not found', 401);
    }

    const tasks = await Task.find({ assignedTo: userId }).sort({ createdAt: -1 });
    return successResponse(res, 'Tasks retrieved successfully for provider', 200, tasks);
  } catch (error) {
    console.error('Error retrieving provider tasks:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * Apply for a task (add user to applicants list)
 */
export const applyForTask = async (req, res) => {
  try {
    const userId = req.user?.id;
    const taskId = req.params.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized: user not found', 401);
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return errorResponse(res, 'Task not found', 404);
    }

    // Check if user is trying to apply for their own task
    if (task.user.toString() === userId) {
      return errorResponse(res, 'You cannot apply for your own task', 400);
    }

    // Initialize applicants array if it doesn't exist
    if (!task.applicants) {
      task.applicants = [];
    }

    // Check if user has already applied
    const alreadyApplied = task.applicants.some(
      (applicant) => applicant.user && applicant.user.toString() === userId
    );

    if (alreadyApplied) {
      return errorResponse(res, 'You have already applied for this task', 400);
    }

    // Add user to applicants
    task.applicants.push({ 
      user: userId,
      appliedAt: new Date()
    });
    
    await task.save();

    return successResponse(res, 'Successfully applied for the task', 200, task);
  } catch (error) {
    console.error('Error applying for task:', error);
    console.error('Error details:', error.stack);
    return errorResponse(res, 'Server error while applying for task', 500);
  }
};

/**
 * Get tasks applied by the current user
 */
export const getAppliedTasks = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized: user not found', 401);
    }

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return errorResponse(res, 'Invalid user ID format', 400);
    }

    const objectId = new mongoose.Types.ObjectId(userId);
    const tasks = await Task.find({
      'applicants.user': objectId
    }).sort({ createdAt: -1 });

    return successResponse(res, 'Applied tasks retrieved successfully', 200, tasks);
  } catch (error) {
    console.error('Error retrieving applied tasks:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    return errorResponse(res, error.message || 'Failed to retrieve applied tasks', 500);
  }
};

/**
 * Get saved tasks for the current user
 */
export const getSavedTasks = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized: user not found', 401);
    }

    const tasks = await Task.find({
      savedBy: userId
    }).sort({ createdAt: -1 });

    return successResponse(res, 'Saved tasks retrieved successfully', 200, tasks);
  } catch (error) {
    console.error('Error retrieving saved tasks:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * Get ongoing tasks for the current user
 */
export const getOngoingTasks = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized: user not found', 401);
    }

    const tasks = await Task.find({
      assignedTo: userId,
      status: { $in: ['in-progress', 'accepted'] }
    }).sort({ createdAt: -1 });

    return successResponse(res, 'Ongoing tasks retrieved successfully', 200, tasks);
  } catch (error) {
    console.error('Error retrieving ongoing tasks:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * Get completed tasks for the current user
 */
export const getCompletedTasks = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized: user not found', 401);
    }

    const tasks = await Task.find({
      assignedTo: userId,
      status: 'completed'
    }).sort({ createdAt: -1 });

    return successResponse(res, 'Completed tasks retrieved successfully', 200, tasks);
  } catch (error) {
    console.error('Error retrieving completed tasks:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * Save a task for the current user
 */
export const saveTask = async (req, res) => {
  try {
    const userId = req.user?.id;
    const taskId = req.params.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized: user not found', 401);
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return errorResponse(res, 'Task not found', 404);
    }

    // Initialize savedBy array if it doesn't exist
    if (!task.savedBy) {
      task.savedBy = [];
    }

    // Check if user has already saved this task
    const alreadySaved = task.savedBy.includes(userId);
    if (alreadySaved) {
      return errorResponse(res, 'Task already saved', 400);
    }

    // Add user to savedBy array
    task.savedBy.push(userId);
    await task.save();

    return successResponse(res, 'Task saved successfully', 200, task);
  } catch (error) {
    console.error('Error saving task:', error);
    return errorResponse(res, 'Server error', 500);
  }
};
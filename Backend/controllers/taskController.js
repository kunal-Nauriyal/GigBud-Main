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
    };

    // Process location data
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
      // Time buyer task
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
 * Get a single task (only if owned by user)
 */
export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return errorResponse(res, 'Task not found', 404);
    }
    if (task.user.toString() !== req.user?.id) {
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
    await task.save();

    return successResponse(res, 'Task accepted successfully', 200, task);
  } catch (error) {
    console.error('Error accepting task:', error);
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

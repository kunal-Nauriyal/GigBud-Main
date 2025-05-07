import Task from '../models/Task.js';
import { successResponse, errorResponse } from '../views/responseTemplates.js';

/**
 * Create a new task
 */
export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      deadline,
      timeRequirement,
      budgetPerHour,
      mode,
      notes,
      lat,
      lng
    } = req.body;

    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId || !role) {
      return errorResponse(res, 'Unauthorized: user not found', 401);
    }

    // Validate required fields
    if (!title || !description || !deadline || !budgetPerHour || !timeRequirement) {
      return errorResponse(res, 'Missing required fields', 400);
    }

    // Handle on-site task location
    let geoLocation = null;
    if (mode === 'on-site') {
      if (!lat || !lng) {
        return errorResponse(res, 'Latitude and longitude are required for on-site tasks', 400);
      }
      geoLocation = {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      };
    }

    // Create new task
    const newTask = new Task({
      user: userId,
      role,
      title,
      description,
      deadline: new Date(deadline),
      timeRequirement: parseFloat(timeRequirement),
      mode,
      location: geoLocation,
      budgetPerHour: parseFloat(budgetPerHour),
      notes,
      attachment: null // Removed req.file usage for now
    });

    await newTask.save();
    return successResponse(res, 'Task created successfully', 201, newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    return errorResponse(res, 'Server error', 500);
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

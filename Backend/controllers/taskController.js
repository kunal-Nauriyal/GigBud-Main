import mongoose from 'mongoose';
import Task from '../models/Task.js';
import { successResponse, errorResponse } from '../views/responseTemplates.js';

/**
 * Create a new task
 */
export const createTask = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return errorResponse(res, 'Unauthorized: user not found', 401);

    const { taskType } = req.body;
    if (!['normal', 'timebuyer'].includes(taskType)) {
      return errorResponse(res, 'Invalid task type', 400);
    }

    let taskData = {
      user: userId,
      taskType,
      status: 'pending',
      applicants: [],
    };

    let locationInput = req.body.location || {};
    let locationMode = locationInput.mode || locationInput || 'Online';
    locationMode = typeof locationMode === 'string' ? locationMode : 'Online';

    taskData.location = {
      type: 'Point',
      coordinates: locationInput.coordinates || [0, 0],
      mode: locationMode,
      ...(req.body.address && { address: req.body.address }),
    };

    if (req.file) taskData.attachment = req.file.path;

    if (taskType === 'normal') {
      const { title, description, deadline, budget } = req.body;
      const errors = [];
      if (!title?.trim()) errors.push('Title is required');
      if (!description?.trim()) errors.push('Description is required');
      if (!deadline) errors.push('Deadline is required');
      if (!budget || isNaN(parseFloat(budget))) errors.push('Valid budget amount is required');
      if (errors.length) return errorResponse(res, errors.join(', '), 400);

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
      if (!budgetPerHour || isNaN(parseFloat(budgetPerHour))) errors.push('Valid budget per hour is required');
      if (errors.length) return errorResponse(res, errors.join(', '), 400);

      Object.assign(taskData, {
        timeRequirement: timeRequirement.trim(),
        jobType: jobType.trim(),
        skills: Array.isArray(skills) ? skills : (skills?.split(',').map(s => s.trim()) || []),
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

export const listTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user?.id }).sort({ createdAt: -1 });
    return successResponse(res, 'Tasks retrieved successfully', 200, tasks);
  } catch (error) {
    console.error('Error listing tasks:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return errorResponse(res, 'Task not found', 404);

    const userId = req.user?.id;
    if (task.user.toString() !== userId && task.assignedTo?.toString() !== userId) {
      return errorResponse(res, 'Unauthorized access to this task', 403);
    }

    return successResponse(res, 'Task retrieved successfully', 200, task);
  } catch (error) {
    console.error('Error getting task:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

export const acceptTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return errorResponse(res, 'Task not found', 404);
    if (task.assignedTo) return errorResponse(res, 'Task is already accepted', 400);

    task.assignedTo = req.user?.id;
    task.status = 'accepted';
    await task.save();

    return successResponse(res, 'Task accepted successfully', 200, task);
  } catch (error) {
    console.error('Error accepting task:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

export const markTaskAsOngoing = async (req, res) => {
  try {
    const userId = req.user?.id;
    const task = await Task.findById(req.params.id);
    if (!task) return errorResponse(res, 'Task not found', 404);

    if (task.assignedTo && task.assignedTo.toString() !== userId) {
      return errorResponse(res, 'Task already assigned to another user', 403);
    }

    if (!task.assignedTo) {
      task.assignedTo = userId;
    }

    task.status = 'in-progress';
    await task.save();

    return successResponse(res, 'Task marked as ongoing', 200, task);
  } catch (error) {
    console.error('Error marking task as ongoing:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

export const completeTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return errorResponse(res, 'Task not found', 404);

    const userId = req.user?.id;

    // ✅ Updated permission check
    const isCreator = task.user.toString() === userId;
    const isAssigned = task.assignedTo?.toString() === userId;

    if (!isCreator && !isAssigned) {
      return errorResponse(
        res,
        `Only the assigned user or task creator can complete this task`,
        403
      );
    }

    task.status = 'completed';
    await task.save();

    return successResponse(res, 'Task marked as completed', 200, task);
  } catch (error) {
    console.error('Error completing task:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return errorResponse(res, 'Task not found', 404);

    if (task.user.toString() !== req.user?.id) return errorResponse(res, 'Unauthorized', 403);
    await task.deleteOne();

    return successResponse(res, 'Task deleted successfully', 200, task);
  } catch (error) {
    console.error('Error deleting task:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

export const getAvailableTasks = async (_req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: null, status: 'pending' }).sort({ createdAt: -1 });
    return successResponse(res, 'Available tasks retrieved', 200, tasks);
  } catch (error) {
    console.error('Error retrieving available tasks:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

export const getTasksByProvider = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user?.id }).sort({ createdAt: -1 });
    return successResponse(res, 'Tasks retrieved for provider', 200, tasks);
  } catch (error) {
    console.error('Error retrieving provider tasks:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

export const applyForTask = async (req, res) => {
  try {
    const userId = req.user?.id;
    const task = await Task.findById(req.params.id);
    if (!task) return errorResponse(res, 'Task not found', 404);
    if (task.user.toString() === userId) return errorResponse(res, 'Cannot apply to own task', 400);

    task.applicants ??= [];
    const alreadyApplied = task.applicants.some(a => a.user?.toString() === userId);
    if (alreadyApplied) return errorResponse(res, 'Already applied', 400);

    task.applicants.push({ user: userId, appliedAt: new Date() });
    await task.save();

    return successResponse(res, 'Applied successfully', 200, task);
  } catch (error) {
    console.error('Error applying for task:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

export const getAppliedTasks = async (req, res) => {
  try {
    const userId = req.user?.id;
    const objectId = new mongoose.Types.ObjectId(userId);
    const tasks = await Task.find({ 'applicants.user': objectId }).sort({ createdAt: -1 });

    return successResponse(res, 'Applied tasks retrieved', 200, tasks);
  } catch (error) {
    console.error('Error retrieving applied tasks:', error);
    return errorResponse(res, error.message || 'Failed to retrieve applied tasks', 500);
  }
};

export const getSavedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ savedBy: req.user?.id }).sort({ createdAt: -1 });
    return successResponse(res, 'Saved tasks retrieved', 200, tasks);
  } catch (error) {
    console.error('Error retrieving saved tasks:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

export const getOngoingTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user?.id,
      status: { $in: ['in-progress', 'accepted'] }
    }).sort({ createdAt: -1 });

    return successResponse(res, 'Ongoing tasks retrieved', 200, tasks);
  } catch (error) {
    console.error('Error retrieving ongoing tasks:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

export const getCompletedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user?.id,
      status: 'completed'
    }).sort({ createdAt: -1 });

    return successResponse(res, 'Completed tasks retrieved', 200, tasks);
  } catch (error) {
    console.error('Error retrieving completed tasks:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

export const saveTask = async (req, res) => {
  try {
    const userId = req.user?.id;
    const task = await Task.findById(req.params.id);
    if (!task) return errorResponse(res, 'Task not found', 404);

    task.savedBy ??= [];
    if (task.savedBy.some(id => id.toString() === userId)) {
      return errorResponse(res, 'Task already saved', 400);
    }

    task.savedBy.push(userId);
    await task.save();

    return successResponse(res, 'Task saved successfully', 200, task);
  } catch (error) {
    console.error('Error saving task:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

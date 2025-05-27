import mongoose from 'mongoose';
import Task from '../models/Task.js';
import User from '../models/userModel.js';
import { successResponse, errorResponse } from '../views/responseTemplates.js';

// Helper function to safely compare MongoDB IDs
const compareIds = (id1, id2) => {
  if (!id1 || !id2) return false;
  return id1.toString() === id2.toString();
};

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

    // Handle location data
    const locationInput = req.body.location || {};
    const locationMode = typeof locationInput === 'object' 
      ? locationInput.mode || 'Online' 
      : locationInput || 'Online';

    taskData.location = {
      type: 'Point',
      coordinates: locationInput.coordinates || [0, 0],
      mode: locationMode,
      ...(req.body.address && { address: req.body.address }),
    };

    if (req.file) taskData.attachment = req.file.path;

    // Validate and process task type specific fields
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
      const { timeRequirement, jobType, skills, workMode = 'Online', budgetPerHour, additionalNotes } = req.body;
      const errors = [];
      if (!timeRequirement?.trim()) errors.push('Time requirement is required');
      if (!jobType?.trim()) errors.push('Job type is required');
      if (!budgetPerHour || isNaN(parseFloat(budgetPerHour))) errors.push('Valid budget per hour is required');
      if (errors.length) return errorResponse(res, errors.join(', '), 400);

      // Create task data object with conditional additionalNotes
      const taskFields = {
        timeRequirement: timeRequirement.trim(),
        jobType: jobType.trim(),
        skills: Array.isArray(skills) ? skills : (skills?.split(',').map(s => s.trim()) || []),
        workMode,
        budgetPerHour: parseFloat(budgetPerHour),
      };

      // Only add additionalNotes if it exists and is not empty
      if (additionalNotes && additionalNotes.trim()) {
        taskFields.additionalNotes = additionalNotes.trim();
      }

      Object.assign(taskData, taskFields);
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
    const tasks = await Task.find({ user: req.user?.id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'applicants.user',
        select: 'name email phone image rating'
      })
      .populate('assignedTo', 'name email phone image rating')
      .populate('user', 'name email phone image rating');

    return successResponse(res, 'Tasks retrieved successfully', 200, tasks);
  } catch (error) {
    console.error('Error listing tasks:', error);
    return errorResponse(res, error.message || 'Failed to retrieve tasks', 500);
  }
};

export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate({
        path: 'applicants.user',
        select: 'name email phone image rating'
      })
      .populate('assignedTo', 'name email phone image rating')
      .populate('user', 'name email phone image rating');

    if (!task) {
      console.log('Task not found:', req.params.id);
      return errorResponse(res, 'Task not found', 404);
    }

    const userId = req.user?.id;
    const isCreator = compareIds(task.user?._id || task.user, userId);
    const isAssigned = compareIds(task.assignedTo?._id || task.assignedTo, userId);

    if (!isCreator && !isAssigned) {
      console.log('Unauthorized access attempt by user:', userId);
      return errorResponse(res, 'Unauthorized access to this task', 403);
    }

    return successResponse(res, 'Task retrieved successfully', 200, task);
  } catch (error) {
    console.error('Error getting task:', error);
    return errorResponse(res, error.message || 'Failed to retrieve task', 500);
  }
};

export const acceptTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      console.log('Task not found:', req.params.id);
      return errorResponse(res, 'Task not found', 404);
    }

    const userId = req.user?.id;
    
    // Check if task is already assigned
    if (task.assignedTo) {
      if (compareIds(task.assignedTo, userId)) {
        console.log('User already accepted this task:', userId);
        return errorResponse(res, 'You have already accepted this task', 409);
      }
      console.log('Task already accepted by another user:', task.assignedTo);
      return errorResponse(res, 'Task is already accepted by another user', 409);
    }

    // Check if user is trying to accept their own task
    if (compareIds(task.user, userId)) {
      console.log('User trying to accept their own task:', userId);
      return errorResponse(res, 'Cannot accept your own task', 400);
    }

    // Accept the task
    task.assignedTo = userId;
    task.status = 'accepted';
    await task.save();

    return successResponse(res, 'Task accepted successfully', 200, task);
  } catch (error) {
    console.error('Error accepting task:', error);
    return errorResponse(res, error.message || 'Failed to accept task', 500);
  }
};

export const markTaskAsOngoing = async (req, res) => {
  try {
    const userId = req.user?.id;
    const task = await Task.findById(req.params.id);
    if (!task) {
      console.log('Task not found:', req.params.id);
      return errorResponse(res, 'Task not found', 404);
    }

    if (task.assignedTo && !compareIds(task.assignedTo, userId)) {
      console.log('Task already assigned to another user:', task.assignedTo);
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
    return errorResponse(res, error.message || 'Failed to mark task as ongoing', 500);
  }
};

export const completeTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      console.log('Task not found:', req.params.id);
      return errorResponse(res, 'Task not found', 404);
    }

    const userId = req.user?.id;
    const isCreator = compareIds(task.user, userId);
    const isAssigned = compareIds(task.assignedTo, userId);

    if (!isCreator && !isAssigned) {
      console.log('Unauthorized completion attempt by user:', userId);
      return errorResponse(res, 'Only the assigned user or task creator can complete this task', 403);
    }

    task.status = 'completed';
    await task.save();

    return successResponse(res, 'Task marked as completed', 200, task);
  } catch (error) {
    console.error('Error completing task:', error);
    return errorResponse(res, error.message || 'Failed to complete task', 500);
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      console.log('Task not found:', req.params.id);
      return errorResponse(res, 'Task not found', 404);
    }

    if (!compareIds(task.user, req.user?.id)) {
      console.log('Unauthorized delete attempt by user:', req.user?.id);
      return errorResponse(res, 'Unauthorized to delete this task', 403);
    }

    await task.deleteOne();
    return successResponse(res, 'Task deleted successfully', 200, task);
  } catch (error) {
    console.error('Error deleting task:', error);
    return errorResponse(res, error.message || 'Failed to delete task', 500);
  }
};

export const getAvailableTasks = async (_req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: null, status: 'pending' })
      .sort({ createdAt: -1 })
      .populate('user', 'name email phone image rating');

    return successResponse(res, 'Available tasks retrieved', 200, tasks);
  } catch (error) {
    console.error('Error retrieving available tasks:', error);
    return errorResponse(res, error.message || 'Failed to retrieve available tasks', 500);
  }
};

export const getTasksByProvider = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user?.id })
      .sort({ createdAt: -1 })
      .populate('user', 'name email phone image rating');

    return successResponse(res, 'Tasks retrieved for provider', 200, tasks);
  } catch (error) {
    console.error('Error retrieving provider tasks:', error);
    return errorResponse(res, error.message || 'Failed to retrieve provider tasks', 500);
  }
};

export const applyForTask = async (req, res) => {
  try {
    const userId = req.user?.id;
    const taskId = req.params.id;

    // Enhanced logging for debugging
    console.log('Apply for task request:', {
      userId,
      taskId,
      userExists: !!req.user,
      params: req.params,
      body: req.body
    });

    // Check if user is authenticated
    if (!userId) {
      console.log('Unauthorized: No user ID found');
      return errorResponse(res, 'Unauthorized: Please log in to apply for tasks', 401);
    }

    // Validate task ID format
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      console.log('Invalid task ID format:', taskId);
      return errorResponse(res, 'Invalid task ID format', 400);
    }

    const task = await Task.findById(taskId);

    if (!task) {
      console.log('Task not found:', taskId);
      return errorResponse(res, 'Task not found', 404);
    }

    console.log('Task found:', {
      taskId: task._id,
      taskUser: task.user,
      assignedTo: task.assignedTo,
      status: task.status,
      applicantsCount: task.applicants?.length || 0
    });

    // Check if user is trying to apply to their own task
    if (compareIds(task.user, userId)) {
      console.log('User trying to apply to own task:', { userId, taskUser: task.user });
      return errorResponse(res, 'You cannot apply to your own task', 400);
    }

    // Check if task is already assigned
    if (task.assignedTo) {
      console.log('Task already assigned:', { assignedTo: task.assignedTo, userId });
      return errorResponse(res, 'This task has already been assigned to someone else', 400);
    }

    // Check task status
    if (task.status !== 'pending') {
      console.log('Task not available for applications:', { status: task.status });
      return errorResponse(res, `Task is not available for applications. Current status: ${task.status}`, 400);
    }

    // Initialize applicants array if it doesn't exist
    if (!task.applicants) {
      task.applicants = [];
    }

    // Check if user already applied
    const alreadyApplied = task.applicants.some(applicant => 
      compareIds(applicant.user, userId)
    );

    if (alreadyApplied) {
      console.log('User already applied:', { userId, taskId });
      return errorResponse(res, 'You have already applied for this task', 400);
    }

    // Add application
    task.applicants.push({ 
      user: userId, 
      appliedAt: new Date(),
      status: 'pending'
    });

    await task.save();

    console.log('Application successful:', {
      userId,
      taskId,
      applicantsCount: task.applicants.length
    });

    return successResponse(res, 'Application submitted successfully', 200, {
      message: 'Application submitted successfully',
      applicationStatus: 'pending',
      taskId: task._id
    });

  } catch (error) {
    console.error('Error applying for task:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      taskId: req.params.id
    });
    return errorResponse(res, error.message || 'Failed to apply for task', 500);
  }
};

export const getAppliedTasks = async (req, res) => {
  try {
    const userId = req.user?.id;
    const tasks = await Task.find({ 'applicants.user': userId })
      .sort({ createdAt: -1 })
      .populate('user', 'name email phone image rating');

    return successResponse(res, 'Applied tasks retrieved', 200, tasks);
  } catch (error) {
    console.error('Error retrieving applied tasks:', error);
    return errorResponse(res, error.message || 'Failed to retrieve applied tasks', 500);
  }
};

export const getSavedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ savedBy: req.user?.id })
      .sort({ createdAt: -1 })
      .populate('user', 'name email phone image rating');

    return successResponse(res, 'Saved tasks retrieved', 200, tasks);
  } catch (error) {
    console.error('Error retrieving saved tasks:', error);
    return errorResponse(res, error.message || 'Failed to retrieve saved tasks', 500);
  }
};

export const getOngoingTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user?.id,
      status: { $in: ['in-progress', 'accepted'] }
    })
      .sort({ createdAt: -1 })
      .populate('user', 'name email phone image rating');

    return successResponse(res, 'Ongoing tasks retrieved', 200, tasks);
  } catch (error) {
    console.error('Error retrieving ongoing tasks:', error);
    return errorResponse(res, error.message || 'Failed to retrieve ongoing tasks', 500);
  }
};

export const getCompletedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user?.id,
      status: 'completed'
    })
      .sort({ createdAt: -1 })
      .populate('user', 'name email phone image rating');

    return successResponse(res, 'Completed tasks retrieved', 200, tasks);
  } catch (error) {
    console.error('Error retrieving completed tasks:', error);
    return errorResponse(res, error.message || 'Failed to retrieve completed tasks', 500);
  }
};

export const saveTask = async (req, res) => {
  try {
    const userId = req.user?.id;
    const task = await Task.findById(req.params.id);
    if (!task) {
      console.log('Task not found:', req.params.id);
      return errorResponse(res, 'Task not found', 404);
    }

    task.savedBy ??= [];
    if (task.savedBy.some(id => compareIds(id, userId))) {
      console.log('Task already saved by user:', userId);
      return errorResponse(res, 'Task already saved', 400);
    }

    task.savedBy.push(userId);
    await task.save();

    return successResponse(res, 'Task saved successfully', 200, task);
  } catch (error) {
    console.error('Error saving task:', error);
    return errorResponse(res, error.message || 'Failed to save task', 500);
  }
};

export const assignTaskByProvider = async (req, res) => {
  try {
    const userId = req.user?.id;
    const taskId = req.params.id;
    const { applicantId } = req.body;
    const task = await Task.findById(taskId);
    if (!task) return errorResponse(res, 'Task not found', 404);
    // Ensure only the task creator can assign it
    if (!compareIds(task.user, userId)) {
      return errorResponse(res, 'Only the creator can assign the task', 403);
    }
    // Validate applicantId
    if (!mongoose.Types.ObjectId.isValid(applicantId)) {
      return errorResponse(res, 'Invalid applicant ID', 400);
    }
    // Assign task
    task.assignedTo = applicantId;
    task.status = 'accepted';
    await task.save();
    return successResponse(res, 'Task assigned successfully', 200, task);
  } catch (error) {
    console.error('Error assigning task:', error);
    return errorResponse(res, error.message || 'Failed to assign task', 500);
  }
};
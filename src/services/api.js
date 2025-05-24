import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api'; // Backend base URL

const getAccessToken = () => localStorage.getItem('token');
const getRefreshToken = () => localStorage.getItem('refreshToken');
const saveAccessToken = (token) => localStorage.setItem('token', token);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add access token to request headers
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
  }

  return config;
});

// Handle expired token and auto-refresh logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      error.response.data?.message === 'Token expired. Please login again' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const refreshRes = await axios.post(`${API_BASE_URL}/refresh-token`, {
          refreshToken: getRefreshToken(),
        });

        const newAccessToken = refreshRes.data.accessToken;
        saveAccessToken(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('🔒 Refresh token failed:', refreshError.response?.data || refreshError);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Enhanced error logging with more details
    console.error('API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    return Promise.reject(error);
  }
);

// Task-related API calls
export const taskAPI = {
  getProviderTasks: async () => {
    try {
      const response = await api.get('/tasks/task/list');
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch provider tasks',
        error: error.response?.data
      };
    }
  },

  createTask: async (taskData) => {
    try {
      const response = await api.post('/tasks/task/create', taskData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create task',
        error: error.response?.data
      };
    }
  },

  getTask: async (taskId) => {
    try {
      // Validate taskId
      if (!taskId) {
        return {
          success: false,
          message: 'Task ID is required'
        };
      }

      // Check if user is authenticated
      const token = getAccessToken();
      if (!token) {
        return {
          success: false,
          message: 'Authentication required. Please login again.',
          requiresAuth: true
        };
      }

      const response = await api.get(`/tasks/task/${taskId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      // Handle specific error cases
      if (error.response?.status === 403) {
        return {
          success: false,
          message: error.response.data?.message || 'You do not have permission to access this task',
          error: 'FORBIDDEN',
          statusCode: 403
        };
      } else if (error.response?.status === 404) {
        return {
          success: false,
          message: 'Task not found',
          error: 'NOT_FOUND',
          statusCode: 404
        };
      } else if (error.response?.status === 401) {
        return {
          success: false,
          message: 'Authentication required. Please login again.',
          error: 'UNAUTHORIZED',
          statusCode: 401,
          requiresAuth: true
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch task details',
        error: error.response?.data,
        statusCode: error.response?.status
      };
    }
  },

  acceptTask: async (taskId) => {
    try {
      if (!taskId) {
        return {
          success: false,
          message: 'Task ID is required'
        };
      }

      const response = await api.post(`/tasks/task/accept/${taskId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to accept task',
        error: error.response?.data,
        statusCode: error.response?.status
      };
    }
  },

  markTaskAsOngoing: async (taskId) => {
    try {
      if (!taskId) {
        return {
          success: false,
          message: 'Task ID is required'
        };
      }

      // First check if we can access the task
      const taskResult = await this.getTask(taskId);
      if (!taskResult.success) {
        return taskResult; // Return the error from getTask
      }

      const task = taskResult.data;
      const userId = JSON.parse(localStorage.getItem('user'))?._id;

      if (!userId) {
        return {
          success: false,
          message: 'User authentication required',
          requiresAuth: true
        };
      }

      if (!task.applicants || !task.applicants.includes(userId)) {
        return {
          success: false,
          message: 'You must apply for this task first',
        };
      }

      const response = await api.post(`/tasks/task/mark-ongoing/${taskId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark task as ongoing',
        error: error.response?.data,
        statusCode: error.response?.status
      };
    }
  },

  completeTask: async (taskId) => {
    try {
      if (!taskId) {
        return {
          success: false,
          message: 'Task ID is required'
        };
      }

      const response = await api.post(`/tasks/task/complete/${taskId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark task as complete',
        error: error.response?.data,
        statusCode: error.response?.status
      };
    }
  },

  deleteTask: async (taskId) => {
    try {
      if (!taskId) {
        return {
          success: false,
          message: 'Task ID is required'
        };
      }

      const response = await api.delete(`/tasks/task/delete/${taskId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete task',
        error: error.response?.data,
        statusCode: error.response?.status
      };
    }
  },

  getAvailableTasks: async (location) => {
    try {
      const response = await api.get(
        `/tasks/task/available${location ? `?location=${encodeURIComponent(location)}` : ''}`
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch available tasks',
        error: error.response?.data,
        statusCode: error.response?.status
      };
    }
  },

  getAppliedTasks: async () => {
    try {
      const response = await api.get('/tasks/task/applied');
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch applied tasks',
        error: error.response?.data,
        statusCode: error.response?.status
      };
    }
  },

  getSavedTasks: async () => {
    try {
      const response = await api.get('/tasks/task/saved');
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch saved tasks',
        error: error.response?.data,
        statusCode: error.response?.status
      };
    }
  },

  getOngoingTasks: async () => {
    try {
      const response = await api.get('/tasks/task/ongoing');
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch ongoing tasks',
        error: error.response?.data,
        statusCode: error.response?.status
      };
    }
  },

  getCompletedTasks: async () => {
    try {
      const response = await api.get('/tasks/task/completed');
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch completed tasks',
        error: error.response?.data,
        statusCode: error.response?.status
      };
    }
  },

  applyForTask: async (taskId) => {
    try {
      if (!taskId) {
        return {
          success: false,
          message: 'Task ID is required'
        };
      }

      const response = await api.post(`/tasks/task/apply/${taskId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to apply for task',
        error: error.response?.data,
        statusCode: error.response?.status
      };
    }
  },

  saveTask: async (taskId) => {
    try {
      if (!taskId) {
        return {
          success: false,
          message: 'Task ID is required'
        };
      }

      const response = await api.post(`/tasks/task/save/${taskId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to save task',
        error: error.response?.data,
        statusCode: error.response?.status
      };
    }
  },

  updateUserLocation: async (location) => {
    try {
      if (!location) {
        return {
          success: false,
          message: 'Location is required'
        };
      }

      const response = await api.post(`/users/update-location`, { location });
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update location',
        error: error.response?.data,
        statusCode: error.response?.status
      };
    }
  },
};

export default api;
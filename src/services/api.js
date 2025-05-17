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

    // If token expired and we haven't retried yet
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

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('🔒 Refresh token failed:', refreshError.response?.data || refreshError);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login'; // Redirect to login
        return Promise.reject(refreshError);
      }
    }

    console.error('API Error:', error.response?.data || error);
    return Promise.reject(error);
  }
);

// Task-related API calls
export const taskAPI = {
  getProviderTasks: async () => {
    const response = await api.get('/tasks/task/list');
    return { success: true, data: response.data.data };
  },

  createTask: async (taskData) => {
    const response = await api.post('/tasks/task/create', taskData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getTask: async (taskId) => {
    const response = await api.get(`/tasks/task/${taskId}`);
    return response.data.data;
  },

  acceptTask: async (taskId) => {
    const response = await api.post(`/tasks/task/accept/${taskId}`);
    return response.data.data;
  },

  completeTask: async (taskId) => {
    try {
      const response = await api.post(`/tasks/task/complete/${taskId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark task as complete',
      };
    }
  },

  deleteTask: async (taskId) => {
    const response = await api.delete(`/tasks/task/delete/${taskId}`);
    return response.data.data;
  },

  getAvailableTasks: async (location) => {
    try {
      const response = await api.get(
        `/tasks/task/available${location ? `?location=${location}` : ''}`
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch available tasks',
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
      };
    }
  },

  applyForTask: async (taskId) => {
    try {
      const response = await api.post(`/tasks/task/apply/${taskId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to apply for task',
      };
    }
  },

  saveTask: async (taskId) => {
    try {
      const response = await api.post(`/tasks/task/save/${taskId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to save task',
      };
    }
  },

  updateUserLocation: async (location) => {
    try {
      const response = await api.post(`/users/update-location`, { location });
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update location',
      };
    }
  },
};

export default api;

import axios, { AxiosInstance, AxiosError } from 'axios';

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  },
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_profile');
      window.location.href = '/auth/login';
      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    if (error.response?.status === 403) {
      // Forbidden - insufficient permissions
      return Promise.reject(new Error('Insufficient permissions to perform this action.'));
    }

    if (error.response?.status === 500) {
      // Server error
      return Promise.reject(
        new Error('Server error. Please try again later or contact support.'),
      );
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timeout. Please try again.'));
    }

    return Promise.reject(error);
  },
);

export default apiClient;

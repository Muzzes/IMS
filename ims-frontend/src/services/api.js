import axios from 'axios';
import toast from 'react-hot-toast';

// Create a configured Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Global Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Inject Authorization token securely before requests leave
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // CSRF protection could be injected here if using cookie-based backend
    return config;
  },
  (error) => Promise.reject(error)
);

// Global Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;

    // Handle globally standardized errors
    if (status === 401) {
      // Unauthorized: invalid or expired token
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userEmail');
      
      // Prevent rapid fire toasts
      if (!window.location.pathname.includes('/login')) {
         toast.error('Session expired. Please log in again.');
         window.location.href = '/login';
      }
    } else if (status === 403) {
      // Forbidden: sufficient auth but lacks RBAC privilege
      toast.error('You do not have permission to perform this action.');
    } else if (status === 404) {
      toast.error('Requested resource was not found.');
    } else if (status >= 500) {
      toast.error('A server error occurred. Please try again later.');
    } else if (!error.response && error.code === 'ECONNABORTED') {
      toast.error('Network timeout. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';
import toast from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';
import DOMPurify from 'dompurify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Version': import.meta.env.VITE_APP_VERSION || '1.0.0',
  }
});

const sanitizeData = (data) => {
  if (typeof data === 'string') {
    return DOMPurify.sanitize(data.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }
  if (data !== null && typeof data === 'object') {
    const sanitizedObj = {};
    for (const key in data) {
      if (Object.hasOwn(data, key)) {
        sanitizedObj[sanitizeData(key)] = sanitizeData(data[key]);
      }
    }
    return sanitizedObj;
  }
  return data;
};

// Request interceptor: attach token, workspace_id, CSRF, and sanitize body
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ims_token');
  if (token) {
    try {
      const { exp } = jwtDecode(token);
      if (exp < Date.now() / 1000) {
        // Expiry should be handled by refresh flow, but as fallback:
        // Let it pass here and fail safely at response interceptor or handle refresh
      }
      config.headers.Authorization = `Bearer ${token}`;
    } catch {
      localStorage.removeItem('ims_token');
      window.location.href = '/login';
      return Promise.reject('Invalid token');
    }
  }

  // Get CSRF token
  const csrfCookie = document.cookie.split('; ').find(row => row.startsWith('CSRF-TOKEN='));
  if (csrfCookie) {
    config.headers['X-CSRF-Token'] = csrfCookie.split('=')[1];
  }

  // Auto-append workspace_id from localStorage
  const wsId = localStorage.getItem('ims_active_workspace');
  if (wsId) {
    config.headers['X-Workspace-ID'] = wsId; 
    if (config.method === 'get' || config.method === 'delete') {
      config.params = { ...config.params, workspace_id: wsId };
    } else {
      config.data = { ...config.data, workspace_id: wsId };
    }
  }

  // Universal HTML sanitization before submission
  if (config.data) {
    config.data = sanitizeData(config.data);
  }
  if (config.params) {
    config.params = sanitizeData(config.params);
  }

  // Never log passwords in dev environment
  if (import.meta.env.DEV) {
    const safeConfig = { ...config };
    if (safeConfig.data?.password) {
      safeConfig.data = { ...safeConfig.data, password: '[REDACTED]' };
    }
  }

  return config;
}, (error) => Promise.reject(error));

// Response interceptor: handle token expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('ims_refresh_token');
        if (refreshToken) {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken });
          localStorage.setItem('ims_token', data.token);
          original.headers.Authorization = `Bearer ${data.token}`;
          return api(original);
        }
      } catch {
        // Refresh failed
      }
      localStorage.removeItem('ims_token');
      localStorage.removeItem('ims_refresh_token');
      localStorage.removeItem('ims_active_workspace');
      localStorage.removeItem('ims_user');
      sessionStorage.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    if (status === 403) {
      window.location.href = '/403';
    } else if (status === 422) {
      // Form validation errors, handled down the chain
    } else if (status === 429) {
      toast.error('Too many requests. Please slow down.');
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (!error.response && error.code !== 'ERR_CANCELED') {
      toast.error('Network error. Check your connection.');
    }
    
    return Promise.reject(error);
  }
);

export default api;

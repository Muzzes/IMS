import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor: attach token + workspace_id
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ims_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Auto-append workspace_id from localStorage
  const wsId = localStorage.getItem('ims_active_workspace');
  if (wsId) {
    if (config.method === 'get' || config.method === 'delete') {
      config.params = { ...config.params, workspace_id: wsId };
    } else {
      config.data = { ...config.data, workspace_id: wsId };
    }
  }

  return config;
});

// Response interceptor: handle token expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
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
        // Refresh failed — clear everything and redirect
      }
      localStorage.removeItem('ims_token');
      localStorage.removeItem('ims_refresh_token');
      localStorage.removeItem('ims_active_workspace');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

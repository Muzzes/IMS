import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor: attach token + workspace_id
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Auto-append workspace_id from localStorage
  const wsId = localStorage.getItem('activeWorkspace');
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
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken });
          localStorage.setItem('token', data.token);
          original.headers.Authorization = `Bearer ${data.token}`;
          return api(original);
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

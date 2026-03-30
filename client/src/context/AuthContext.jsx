import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// Validate token based on expiry and required fields
export const validateToken = (token) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;
    if (decoded.exp < now) {
      return false;
    }
    if (!decoded.id || !decoded.role) {
      return false;
    }
    return decoded;
  } catch {
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimer = useRef(null);

  const clearAuthVariables = useCallback(() => {
    localStorage.removeItem('ims_token');
    localStorage.removeItem('ims_refresh_token');
    localStorage.removeItem('ims_active_workspace');
    localStorage.removeItem('ims_user');
    sessionStorage.clear();
    
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    setUser(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('ims_refresh_token');
      // Backend blacklists token on logout
      await api.post('/auth/logout', { refreshToken });
    } catch {
      // Ignore if network is down or already unauthenticated
    } finally {
      clearAuthVariables();
      // Replace browser history and hard reload to clear memory state completely
      window.history.replaceState(null, '', '/login');
      window.location.href = '/login';
    }
  }, [clearAuthVariables]);

  const scheduleTokenRefresh = useCallback((token) => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    try {
      const { exp } = jwtDecode(token);
      const now = Date.now() / 1000;
      const msUntilExpiry = (exp - now) * 1000;
      const refreshAt = msUntilExpiry - (5 * 60 * 1000); // 5 minutes before expiry
      
      if (refreshAt > 0) {
        refreshTimer.current = setTimeout(async () => {
          try {
            const refreshTokenStr = localStorage.getItem('ims_refresh_token');
            if (refreshTokenStr) {
               const { data } = await api.post('/auth/refresh', { refreshToken: refreshTokenStr });
               if (data && data.token) {
                 localStorage.setItem('ims_token', data.token);
                 scheduleTokenRefresh(data.token);
               } else {
                 logout();
               }
            } else {
              logout();
            }
          } catch {
            logout();
          }
        }, refreshAt);
      }
    } catch {
       // invalid token
    }
  }, [logout]);

  // Initial check
  useEffect(() => {
    const token = localStorage.getItem('ims_token');
    
    if (token) {
      const validToken = validateToken(token);
      if (!validToken) {
        clearAuthVariables();
        setLoading(false);
        return;
      }
      
      api.get('/auth/me')
        .then(({ data }) => {
          setUser(data.user);
          scheduleTokenRefresh(token);
        })
        .catch(() => {
          clearAuthVariables();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [clearAuthVariables, scheduleTokenRefresh]);

  // Concurrent session / cross-tab detection
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'ims_token') {
        if (!e.newValue) {
          clearAuthVariables();
          window.location.replace('/login');
        } else if (e.newValue !== e.oldValue) {
          const decoded = validateToken(e.newValue);
          if (decoded) {
            scheduleTokenRefresh(e.newValue);
          }
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [clearAuthVariables, scheduleTokenRefresh]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('ims_token', data.token);
    localStorage.setItem('ims_refresh_token', data.refreshToken);
    setUser(data.user);
    scheduleTokenRefresh(data.token);
    return data;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

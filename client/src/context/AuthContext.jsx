import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

/**
 * Decode JWT payload without a library.
 * Returns the decoded payload object or null on failure.
 */
const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const expiryTimer = useRef(null);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('ims_token');
    localStorage.removeItem('ims_refresh_token');
    localStorage.removeItem('ims_active_workspace');
    if (expiryTimer.current) clearTimeout(expiryTimer.current);
    setUser(null);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    // Replace history so back button cannot return to authenticated pages
    window.location.replace('/login');
  }, [clearAuth]);

  /**
   * Schedule auto-logout 30 seconds before the JWT expires.
   */
  const scheduleAutoLogout = useCallback((token) => {
    if (expiryTimer.current) clearTimeout(expiryTimer.current);
    const decoded = decodeToken(token);
    if (!decoded?.exp) return;
    const msUntilExpiry = decoded.exp * 1000 - Date.now() - 30000; // 30s buffer
    if (msUntilExpiry <= 0) {
      logout();
      return;
    }
    expiryTimer.current = setTimeout(logout, msUntilExpiry);
  }, [logout]);

  // Initialize: check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('ims_token');
    if (token) {
      api.get('/auth/me')
        .then(({ data }) => {
          setUser(data.user);
          scheduleAutoLogout(token);
        })
        .catch(() => {
          clearAuth();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [clearAuth, scheduleAutoLogout]);

  // Cross-tab logout detection: if another tab removes the token, log out here too
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'ims_token' && !e.newValue) {
        clearAuth();
        window.location.replace('/login');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [clearAuth]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('ims_token', data.token);
    localStorage.setItem('ims_refresh_token', data.refreshToken);
    setUser(data.user);
    scheduleAutoLogout(data.token);
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

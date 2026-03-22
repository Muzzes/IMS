import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      setUser({ email: localStorage.getItem('userEmail') || 'mockuser@ims.com', name: 'Mock User' });
    }
  }, [token]);

  const login = async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let mockRole = null;
        if (email === 'admin@ims.com' && password === 'password') mockRole = 'admin';
        else if (email === 'staff@ims.com' && password === 'password') mockRole = 'staff';
        else if (email === 'manufacturer@ims.com' && password === 'password') mockRole = 'manufacturer';

        if (mockRole) {
          const fakeToken = `mock-token-${mockRole}-${Date.now()}`;
          localStorage.setItem('token', fakeToken);
          localStorage.setItem('role', mockRole);
          localStorage.setItem('userEmail', email);
          setToken(fakeToken);
          setRole(mockRole);
          setUser({ email });
          setIsAuthenticated(true);
          resolve({ role: mockRole });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userEmail');
    setToken(null);
    setRole(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const register = async (userData) => {
    return new Promise((resolve) => setTimeout(() => resolve(), 500));
  };

  return (
    <AuthContext.Provider value={{ user, token, role, isAuthenticated, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

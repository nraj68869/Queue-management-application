import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('queue_app_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('queue_app_token', data.data.token);
    localStorage.setItem('queue_app_user', JSON.stringify(data.data.user));
    setUser(data.data.user);
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('queue_app_token', data.data.token);
    localStorage.setItem('queue_app_user', JSON.stringify(data.data.user));
    setUser(data.data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('queue_app_token');
    localStorage.removeItem('queue_app_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

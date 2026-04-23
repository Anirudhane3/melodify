import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('crystalbeats_user') || 'null'); }
    catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    localStorage.setItem('crystalbeats_token', data.token);
    localStorage.setItem('crystalbeats_user', JSON.stringify(data.user));
    setCurrentUser(data.user);
    return data;
  };

  const register = async (username, password) => {
    const { data } = await api.post('/auth/register', { username, password });
    localStorage.setItem('crystalbeats_token', data.token);
    localStorage.setItem('crystalbeats_user', JSON.stringify(data.user));
    setCurrentUser(data.user);
    return data;
  };

  const googleLogin = async (credential) => {
    const { data } = await api.post('/auth/google', { credential });
    localStorage.setItem('crystalbeats_token', data.token);
    localStorage.setItem('crystalbeats_user', JSON.stringify(data.user));
    setCurrentUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('crystalbeats_token');
    localStorage.removeItem('crystalbeats_user');
    setCurrentUser(null);
  };

  const getAllUsers = async () => {
    const { data } = await api.get('/users');
    return data;
  };

  const updateUserRole = async (userId, role) => {
    const { data } = await api.patch(`/users/${userId}/role`, { role });
    return data;
  };

  return (
    <AuthContext.Provider value={{
      currentUser, loading,
      login, register, logout, googleLogin,
      getAllUsers, updateUserRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

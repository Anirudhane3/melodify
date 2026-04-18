import { createContext, useContext, useState, useEffect } from 'react';
import {
  getSession,
  loginUser,
  registerUser,
  registerAdminUser,
  clearSession,
  migrateExistingUsers,
  grantAdmin   as _grantAdmin,
  revokeAdmin  as _revokeAdmin,
  refreshSession,
  getAllUsersPublic,
  signInWithGoogle as _signInWithGoogle,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading]         = useState(true);

  // Restore session on mount + run migration for existing users
  useEffect(() => {
    migrateExistingUsers();        // adds isAdmin / isPrimaryAdmin to old users
    const session = getSession();
    if (session) setCurrentUser(session);
    setLoading(false);
  }, []);

  const login = (username, password) => {
    const result = loginUser(username, password);
    if (result.success) setCurrentUser(result.user);
    return result;
  };

  const register = (username, password) => {
    const result = registerUser(username, password);
    if (result.success) {
      const loginResult = loginUser(username, password);
      if (loginResult.success) setCurrentUser(loginResult.user);
    }
    return result;
  };

  const logout = () => {
    clearSession();
    setCurrentUser(null);
  };

  /** Sign in with Google */
  const signInWithGoogle = async () => {
    try {
      const result = await _signInWithGoogle();
      if (result.success) setCurrentUser(result.user);
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  /** Primary admin grants admin role to another user */
  const grantAdmin = (userId) => {
    const ok = _grantAdmin(userId);
    if (ok && currentUser?.id === userId) {
      const updated = refreshSession(userId);
      if (updated) setCurrentUser(updated);
    }
    return ok;
  };

  /** Primary admin revokes admin role */
  const revokeAdmin = (userId) => {
    const ok = _revokeAdmin(userId);
    if (ok && currentUser?.id === userId) {
      const updated = refreshSession(userId);
      if (updated) setCurrentUser(updated);
    }
    return ok;
  };

  /** Register a user directly as admin (primary admin only) */
  const createAdminUser = (username, password) => {
    return registerAdminUser(username, password);
  };

  /** Get all users (public info, no passwords) */
  const getAllUsers = () => getAllUsersPublic();

  return (
    <AuthContext.Provider value={{
      currentUser, loading,
      login, register, logout, signInWithGoogle,
      grantAdmin, revokeAdmin, createAdminUser, getAllUsers,
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

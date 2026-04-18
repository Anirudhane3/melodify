// ─── Auth Service ────────────────────────────────────────────────────────────
// LocalStorage-based auth with admin role support + Google Sign-In.
// First registered/signed-in user is always the Primary Admin.

import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

const USERS_KEY   = 'melodify_users';
const SESSION_KEY = 'melodify_session';

/** Get all registered users (with passwords — internal only) */
export function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

/** Migrate existing users to include isAdmin/isPrimaryAdmin fields */
export function migrateExistingUsers() {
  const users = getUsers();
  if (users.length === 0) return;

  let changed = false;
  users.forEach((u, i) => {
    if (u.isPrimaryAdmin === undefined) {
      u.isPrimaryAdmin = i === 0;          // first user = primary admin
      u.isAdmin        = i === 0;
      changed = true;
    }
  });
  if (changed) localStorage.setItem(USERS_KEY, JSON.stringify(users));

  // Also refresh the current session if it belongs to a migrated user
  const session = getSession();
  if (session && session.isAdmin === undefined) {
    const updated = users.find(u => u.id === session.id);
    if (updated) {
      const newSession = { ..._sanitize(updated), loginAt: session.loginAt };
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    }
  }
}

/** Register a new user. Returns { success, user, error } */
export function registerUser(username, password) {
  if (!username?.trim() || !password?.trim())
    return { success: false, error: 'Username and password are required.' };
  if (username.trim().length < 3)
    return { success: false, error: 'Username must be at least 3 characters.' };
  if (password.length < 6)
    return { success: false, error: 'Password must be at least 6 characters.' };

  const users = getUsers();
  const exists = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
  if (exists) return { success: false, error: 'Username already taken.' };

  // First user ever registered becomes the Primary Admin
  const isPrimary = users.length === 0;

  const newUser = {
    id:            crypto.randomUUID(),
    username:      username.trim(),
    password,
    createdAt:     new Date().toISOString(),
    avatar:        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username.trim())}`,
    isAdmin:       isPrimary,
    isPrimaryAdmin: isPrimary,
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return { success: true, user: _sanitize(newUser) };
}

/** Register a new user as admin (invited by primary admin).
 *  Returns { success, user, error } */
export function registerAdminUser(username, password) {
  const result = registerUser(username, password);
  if (!result.success) return result;

  // Grant admin immediately
  grantAdmin(result.user.id);
  const updatedUser = getUsers().find(u => u.id === result.user.id);
  return { success: true, user: _sanitize(updatedUser) };
}

/** Login. Returns { success, user, error } */
export function loginUser(username, password) {
  if (!username?.trim() || !password)
    return { success: false, error: 'Username and password are required.' };

  // Ensure migration has run
  migrateExistingUsers();

  const users  = getUsers();
  const user   = users.find(
    u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
  );
  if (!user) return { success: false, error: 'Invalid username or password.' };

  const session = { ..._sanitize(user), loginAt: new Date().toISOString() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { success: true, user: session };
}

/** Get the current session */
export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

/** Refresh session from latest user data */
export function refreshSession(userId) {
  const users = getUsers();
  const user  = users.find(u => u.id === userId);
  if (!user) return null;
  const session = getSession();
  const updated = { ..._sanitize(user), loginAt: session?.loginAt };
  localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  return updated;
}

/** Clear session (logout) */
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

/** Grant admin role to a user */
export function grantAdmin(userId) {
  const users = getUsers();
  const idx   = users.findIndex(u => u.id === userId);
  if (idx === -1) return false;
  users[idx].isAdmin = true;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return true;
}

/** Revoke admin role from a user (can't revoke primary admin) */
export function revokeAdmin(userId) {
  const users = getUsers();
  const idx   = users.findIndex(u => u.id === userId);
  if (idx === -1 || users[idx].isPrimaryAdmin) return false;
  users[idx].isAdmin = false;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return true;
}

/** Return all users without passwords */
export function getAllUsersPublic() {
  return getUsers().map(_sanitize);
}

/** Sign in with Google popup. Creates or updates user in LocalStorage. */
export async function signInWithGoogle() {
  if (!auth) return { success: false, error: 'Firebase Auth not configured.' };

  const result = await signInWithPopup(auth, googleProvider);
  const gUser  = result.user;

  // Run migration first
  migrateExistingUsers();

  const users = getUsers();

  // Check if this Google account was already registered
  let user = users.find(u => u.id === gUser.uid || u.email === gUser.email);

  if (!user) {
    // Brand new user — register them
    const isPrimary = users.length === 0;
    user = {
      id:             gUser.uid,
      username:       gUser.displayName || gUser.email.split('@')[0],
      email:          gUser.email,
      avatar:         gUser.photoURL || '',
      provider:       'google',
      isAdmin:        isPrimary,
      isPrimaryAdmin: isPrimary,
      createdAt:      new Date().toISOString(),
    };
    users.push(user);
  } else {
    // Existing user — update avatar/name from Google
    user.avatar   = gUser.photoURL  || user.avatar;
    user.username = user.username   || gUser.displayName || user.email.split('@')[0];
    user.provider = 'google';
    const idx = users.findIndex(u => u.id === user.id || u.email === user.email);
    if (idx !== -1) { user.id = gUser.uid; users[idx] = user; }
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  const session = { ..._sanitize(user), loginAt: new Date().toISOString() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { success: true, user: session };
}

/** Remove password before returning to UI */
function _sanitize(user) {
  const { password, ...rest } = user;
  return rest;
}

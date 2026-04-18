/**
 * In-browser Auth Store — localStorage user database
 * Supports register, login, session management.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // simple btoa hash for demo
  role: 'Resident' | 'Sarpanch' | 'Inspector';
  createdAt: string;
  village?: string;
}

export interface Session {
  userId: string;
  email: string;
  name: string;
  role: User['role'];
  village?: string;
  loginAt: string;
}

const USERS_KEY = 'ecosentinel_users';
const SESSION_KEY = 'ecosentinel_session';

function hashPassword(pwd: string): string {
  // Simple reversible encoding for demo (not production!)
  return btoa(encodeURIComponent(pwd));
}

function loadUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch { return []; }
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function registerUser(
  name: string,
  email: string,
  password: string,
  role: User['role'],
  village?: string
): { ok: true; user: User } | { ok: false; error: string } {
  const users = loadUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, error: 'An account with this email already exists.' };
  }
  if (password.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters.' };
  }
  const user: User = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: hashPassword(password),
    role,
    createdAt: new Date().toISOString(),
    village,
  };
  users.push(user);
  saveUsers(users);
  return { ok: true, user };
}

export function loginUser(
  email: string,
  password: string,
  role: User['role']
): { ok: true; session: Session } | { ok: false; error: string } {
  const users = loadUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return { ok: false, error: 'No account found with this email.' };
  if (user.passwordHash !== hashPassword(password)) {
    return { ok: false, error: 'Incorrect password.' };
  }
  if (user.role !== role) {
    return { ok: false, error: `This account is registered as "${user.role}", not "${role}".` };
  }
  const session: Session = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    village: user.village,
    loginAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { ok: true, session };
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function seedDemoUsers() {
  const users = loadUsers();
  if (users.length > 0) return; // already seeded
  const demos: Omit<User, 'passwordHash'>[] = [
    { id: 'demo-1', name: 'Rameshbhai Patel', email: 'sarpanch@demo.com', role: 'Sarpanch', village: 'Ankleshwar', createdAt: new Date().toISOString() },
    { id: 'demo-2', name: 'AK Sharma', email: 'inspector@demo.com', role: 'Inspector', createdAt: new Date().toISOString() },
    { id: 'demo-3', name: 'Priya Mehta', email: 'resident@demo.com', role: 'Resident', createdAt: new Date().toISOString() },
  ];
  const seeded = demos.map(d => ({ ...d, passwordHash: hashPassword('demo123') }));
  saveUsers(seeded);
}

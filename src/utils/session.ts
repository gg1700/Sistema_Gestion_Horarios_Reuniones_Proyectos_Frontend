import type { RegisteredUser, Session } from '../types/auth';

const sessionStorageKey = 'orbitia-session';

interface StoredSession {
  token: string;
  user: RegisteredUser;
}

export function saveSession(session: Session, user: RegisteredUser) {
  const storedSession: StoredSession = { token: session.token, user: user };
  try {
    localStorage.setItem(sessionStorageKey, JSON.stringify(storedSession));
  } catch {
    return;
  }
}

export function getStoredSession(): StoredSession | null {
  try {
    const savedSession = localStorage.getItem(sessionStorageKey);
    if (!savedSession) return null;
    const parsedSession: unknown = JSON.parse(savedSession);
    if (typeof parsedSession !== 'object' || parsedSession === null) return null;
    const candidate = parsedSession as Partial<StoredSession>;
    if (typeof candidate.token !== 'string' || typeof candidate.user !== 'object') return null;
    return candidate as StoredSession;
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(sessionStorageKey);
  } catch {
    return;
  }
}

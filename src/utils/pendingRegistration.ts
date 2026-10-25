import type { OAuthProvider, PendingRegistration } from '../types/auth';

const pendingRegistrationStorageKey = 'orbitia-pending-registration';

function decodeTokenPayload(token: string): unknown {
  const payload = token.split('.')[1];
  if (!payload) return null;
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

function isProvider(value: unknown): value is OAuthProvider {
  return value === 'google' || value === 'github';
}

function isExpired(expiration: unknown) {
  return typeof expiration !== 'number' || expiration * 1000 <= Date.now();
}

export function readPendingRegistration(token: string): PendingRegistration | null {
  const payload = decodeTokenPayload(token);
  if (typeof payload !== 'object' || payload === null) return null;
  const claims = payload as Record<string, unknown>;
  if (claims.purpose !== 'registration' || typeof claims.email !== 'string') return null;
  if (!isProvider(claims.provider) || isExpired(claims.exp)) return null;
  return { token: token, email: claims.email, provider: claims.provider };
}

export function savePendingRegistration(token: string) {
  try {
    sessionStorage.setItem(pendingRegistrationStorageKey, token);
  } catch {
    return;
  }
}

export function getPendingRegistration(): PendingRegistration | null {
  try {
    const token = sessionStorage.getItem(pendingRegistrationStorageKey);
    return token ? readPendingRegistration(token) : null;
  } catch {
    return null;
  }
}

export function clearPendingRegistration() {
  try {
    sessionStorage.removeItem(pendingRegistrationStorageKey);
  } catch {
    return;
  }
}

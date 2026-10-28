import type { AuthProviderName, AuthSession, GitHubConnection } from './types';

/*
CONTRATOS IMPLEMENTADOS — FASE 1
Todas las llamadas incluyen credentials: include; el servidor decide el titular.
GET /api/v1/auth/session, sin body:
200 {"success":true,"data":{"authenticated":true,"profile":{"id":"UUID",
"handleName":"ana-perez","name":"Ana","firstSurname":"Pérez","email":"ana@correo.com",
"profilePicture":null,"requiresProfileCompletion":false},"accounts":[{"provider":"github",
"username":"ana","email":null,"state":"active","scopes":["read:user","user:email"]}]}}
401 sin sesión; mostrar acceso. accounts solo contiene Google/GitHub vinculados.

PATCH /api/v1/auth/profile
Body {"name":"Ana","firstSurname":"Pérez","handleName":"ana-perez"}
200 mismo JSON de sesión. 400 datos inválidos; 409 identificador ocupado.
El formulario nunca envía email, contraseña, token ni id de otro usuario.

GET /api/v1/integrations/github/connection, sin body:
200 {"success":true,"data":{"connected":true,"username":"ana",
"permissions":{"canReadPublicRepositories":true,"canReadPrivateRepositories":false},
"checkedAt":"2026-10-28T12:00:00Z"}}
409 code GITHUB_NOT_CONNECTED o GITHUB_REAUTH_REQUIRED -> vincular/reautorizar.
401 -> volver al acceso; 429 -> esperar/reintentar; 502 -> proveedor no disponible.
La comprobación contrasta la cuenta vinculada con GET /user de GitHub; no lista repositorios.

GET /api/v1/auth/:provider?intent=login|link&returnTo=/perfil/conexiones
302 al proveedor. link exige la sesión actual y no fusiona por correo.
Callback establece cookie HttpOnly y devuelve /acceso?oauth=success; nunca tokens.
DELETE /api/v1/auth/accounts/:provider, sin body: 200 {"success":true,"message":"Acceso revocado correctamente"}.
409 si era la última forma de entrar. POST /api/v1/auth/logout: 204 sin body.
*/

const origin = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
export class AuthApiError extends Error {
  constructor(message: string, public status: number, public code?: string) { super(message); }
}

export async function authRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(origin + '/api/v1/' + path, {
      ...options, credentials: 'include', cache: 'no-store',
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error;
    throw new AuthApiError('No se pudo contactar con Orbitia. Intenta nuevamente.', 0);
  }
  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success) throw new AuthApiError(body?.message ?? 'No se pudo completar la solicitud.', response.status, body?.code);
  return body.data as T;
}

// GET auth/session: 200 AuthSession; 401 se traduce a sesión ausente.
// No guardar JWT, access_token ni refresh_token en almacenamiento del navegador.
export async function getSession(signal?: AbortSignal): Promise<AuthSession | null> {
  try { return await authRequest<AuthSession>('auth/session', { signal }); }
  catch (error) { if (error instanceof AuthApiError && error.status === 401) return null; throw error; }
}
export function completeProfile(value: { name: string; firstSurname: string; handleName: string }) {
  return authRequest<AuthSession>('auth/profile', { method: 'PATCH', body: JSON.stringify(value) });
}
export function logoutSession() { return authRequest<void>('auth/logout', { method: 'POST' }); }
export function unlinkIdentity(provider: AuthProviderName) { return authRequest<void>('auth/accounts/' + provider, { method: 'DELETE' }); }
export function getGitHubConnection(signal?: AbortSignal) { return authRequest<GitHubConnection>('integrations/github/connection', { signal }); }

export function safeReturnTo(value: string | null): string {
  return value && ['/panel', '/perfil/conexiones', '/perfil/conexiones/github', '/bienvenida'].includes(value) ? value : '/panel';
}
export function authorizationUrl(provider: AuthProviderName, intent: 'login' | 'link', returnTo: string) {
  const url = new URL(origin + '/api/v1/auth/' + provider);
  url.searchParams.set('intent', intent);
  url.searchParams.set('returnTo', safeReturnTo(returnTo));
  return url.toString();
}


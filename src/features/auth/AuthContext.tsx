import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { authorizationUrl, completeProfile, getSession, logoutSession } from './api';
import type { AuthProviderName, AuthSession } from './types';

interface AuthState {
  status: 'loading' | 'authenticated' | 'anonymous' | 'signed-out' | 'error';
  session: AuthSession | null;
  error: string;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  complete: (value: { name: string; firstSurname: string; handleName: string }) => Promise<void>;
  authorize: (provider: AuthProviderName, intent?: 'login' | 'link', returnTo?: string) => void;
}
const AuthContext = createContext<AuthState | null>(null);

// El estado privado es del servidor. initialSession permite montar pruebas de UI
// sin simular una autenticación a través de localStorage o de MockFlowContext.
export function AuthProvider({ children, initialSession }: PropsWithChildren<{ initialSession?: AuthSession | null }>) {
  const [session, setSession] = useState<AuthSession | null>(initialSession ?? null);
  const [status, setStatus] = useState<AuthState['status']>(initialSession === undefined ? 'loading' : initialSession ? 'authenticated' : 'anonymous');
  const [error, setError] = useState('');
  const requestVersion = useRef(0);
  const apply = useCallback((value: AuthSession | null) => {
    setSession(value); setStatus(value ? 'authenticated' : 'anonymous'); setError('');
  }, []);
  const refresh = useCallback(async () => {
    const version = ++requestVersion.current;
    try { const value = await getSession(); if (version === requestVersion.current) apply(value); }
    catch (failure) { if (version === requestVersion.current) { setError(failure instanceof Error ? failure.message : 'No se pudo consultar la sesión.'); setStatus('error'); } }
  }, [apply]);
  useEffect(() => {
    if (initialSession !== undefined) return;
    const controller = new AbortController();
    const version = ++requestVersion.current;
    getSession(controller.signal).then(value => { if (!controller.signal.aborted && version === requestVersion.current) apply(value); })
      .catch(failure => { if (!controller.signal.aborted && version === requestVersion.current) { setError(failure instanceof Error ? failure.message : 'No se pudo consultar la sesión.'); setStatus('error'); } });
    return () => controller.abort();
  }, [apply, initialSession]);
  async function logout() {
    await logoutSession(); ++requestVersion.current; apply(null); setStatus('signed-out');
    // Retirar demostraciones del usuario anterior; no persistimos la sesión real.
    try {
      sessionStorage.removeItem('orbitia-screen-mocks-v1');
      localStorage.removeItem('orbitia-session');
    } catch { /* La cookie ya se retiró aunque el almacenamiento esté bloqueado. */ }
  }
  async function complete(value: { name: string; firstSurname: string; handleName: string }) {
    const result = await completeProfile(value); ++requestVersion.current; apply(result);
  }
  function authorize(provider: AuthProviderName, intent: 'login' | 'link' = 'login', returnTo = intent === 'link' ? '/perfil/conexiones' : '/panel') {
    window.location.assign(authorizationUrl(provider, intent, returnTo));
  }
  return <AuthContext.Provider value={{ status, session, error, refresh, logout, complete, authorize }}>{children}</AuthContext.Provider>;
}

// Los componentes de demostración/pruebas pueden montarse sin servidor. La app
// siempre instala AuthProvider; su ausencia no es una opción de acceso productiva.
export function useOptionalAuth() { return useContext(AuthContext); }
export function useAuth() {
  const auth = useOptionalAuth();
  if (!auth) throw new Error('Se requiere AuthProvider.');
  return auth;
}


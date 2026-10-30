import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { useLocation } from 'react-router';
import { apiBase, githubApi } from './api';

interface MemberIdentity { name: string; firstSurname: string; handleName: string; email: string; profilePicture: string | null }
interface IdentityState { profile: MemberIdentity | null; loading: boolean; error: string; signOut: () => Promise<void> }
const Context = createContext<IdentityState | null>(null);
export const useMemberIdentity = () => useContext(Context);

export function MemberIdentityProvider({ children }: PropsWithChildren) {
  const { pathname } = useLocation();
  const privatePage = /^\/(perfil|panel|agenda|solicitudes|bienvenida)(\/|$)/.test(pathname);
  const [profile, setProfile] = useState<MemberIdentity | null>(null);
  const [loading, setLoading] = useState(privatePage);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!privatePage) { setLoading(false); return; }
    const controller = new AbortController();
    setLoading(true); setError('');
    githubApi<MemberIdentity>('/profile', { signal: controller.signal }).then(data => {
      if (!controller.signal.aborted) setProfile(data);
    }).catch(failure => {
      if (!controller.signal.aborted) { setProfile(null); setError(failure instanceof Error ? failure.message : 'No se pudo consultar tu sesión.'); }
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [privatePage, pathname]);
  async function signOut() {
    const response = await fetch(`${apiBase}/api/v1/auth/logout`, { method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:'{}' });
    if (!response.ok) throw new Error('No se pudo cerrar la sesión.');
    setProfile(null);
  }
  return <Context.Provider value={{profile,loading,error,signOut}}>{children}</Context.Provider>;
}

import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { useLocation } from 'react-router';
import { apiBase } from './api';
import { getOwnProfile } from '../../api/profileApi';
import type { Profile } from '../../types/profile-response.types';

interface IdentityState { profile: Profile | null; loading: boolean; error: string; retry: () => void; signOut: () => Promise<void> }
const Context = createContext<IdentityState | null>(null);
export const useMemberIdentity = () => useContext(Context);

export function MemberIdentityProvider({ children }: PropsWithChildren) {
  const { pathname } = useLocation();
  const privatePage = /^\/(perfil|panel|agenda|solicitudes|bienvenida)(\/|$)/.test(pathname);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(privatePage);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!privatePage) { setProfile(null); setLoading(false); return; }
    const controller = new AbortController();
    setProfile(null); setLoading(true); setError('');
    getOwnProfile(controller.signal).then(data => {
      if (!controller.signal.aborted) setProfile(data);
    }).catch(failure => {
      if (!controller.signal.aborted) { setProfile(null); setError(failure instanceof Error ? failure.message : 'No se pudo consultar tu sesión.'); }
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [privatePage, pathname, revision]);
  function retry() { setRevision(value => value + 1); }
  async function signOut() {
    const response = await fetch(`${apiBase}/api/v1/auth/logout`, { method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:'{}' });
    if (!response.ok) throw new Error('No se pudo cerrar la sesión.');
    setProfile(null);
  }
  return <Context.Provider value={{profile,loading,error,retry,signOut}}>{children}</Context.Provider>;
}

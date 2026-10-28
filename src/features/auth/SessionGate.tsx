import type { PropsWithChildren } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { AppLayout } from '../../components/layouts/AppLayout';
import { Alert, Button, Spinner } from '../../components/ui';
import { useAuth, useOptionalAuth } from './AuthContext';

export function RequireSession() {
  const auth = useOptionalAuth();
  return auth ? <SessionGate><Outlet /></SessionGate> : <Outlet />;
}

export function SessionGate({ children }: PropsWithChildren) {
  const auth = useAuth();
  const location = useLocation();
  // React Router puede aplazar la navegación. Tras salir, el guard anterior
  // también debe apuntar a inicio para no competir con el cierre del menú.
  if (auth.status === 'signed-out') return <Navigate to="/" replace />;
  if (auth.status === 'anonymous') return <Navigate to={'/acceso?returnTo=' + encodeURIComponent(location.pathname)} replace />;
  if (auth.status === 'authenticated') {
    if (auth.session?.profile.requiresProfileCompletion) return <Navigate to="/acceso" replace />;
    return children;
  }
  return <div className="flow-surface"><AppLayout navigation={[]}><section className="auth-session-status" aria-live="polite">
    {auth.status === 'loading' ? <><Spinner /><p>Comprobando tu sesión…</p></> : <><Alert tone="danger">{auth.error}</Alert><Button onClick={() => void auth.refresh()}>Volver a intentar</Button></>}
  </section></AppLayout></div>;
}


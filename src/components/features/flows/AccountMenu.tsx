import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { FiEye, FiLink, FiLogOut, FiUser, FiX } from 'react-icons/fi';
import { useMockFlow } from '../../../contexts/MockFlowContext';
import { paths } from '../../../constants/paths';
import { TextLink } from './FlowPrimitives';
import { useOptionalAuth } from '../../../features/auth/AuthContext';
import { Alert } from '../../ui';

/*
POST /api/v1/auth/logout, sin body; cookie de sesión de Orbitia.
204 incluso si la cookie ya no existe. El servidor retira la cookie HttpOnly;
el cliente limpia el estado privado y vuelve a inicio. No desvincula proveedores.
Nombre y correo reales proceden de GET /api/v1/auth/session.
*/
export function AccountMenu({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useMockFlow();
  const auth = useOptionalAuth();
  const [error, setError] = useState('');
  const [closing, setClosing] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const pointer = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest('.ui-header__identity')) return;
      if (!ref.current?.contains(event.target as Node)) onClose();
    };
    const keyboard = (event: KeyboardEvent) => { if (event.key === 'Escape') { onClose(); previous?.focus(); } };
    document.addEventListener('pointerdown', pointer);
    document.addEventListener('keydown', keyboard);
    return () => { document.removeEventListener('pointerdown', pointer); document.removeEventListener('keydown', keyboard); };
  }, [onClose]);
  return <div className="flow-account-menu" ref={ref} role="dialog" aria-label="Menú de cuenta"><header>
    <div><strong>{auth?.session?.profile.name ?? state.profile.name} {auth?.session?.profile.firstSurname ?? state.profile.firstSurname}</strong><span>{auth?.session?.profile.email ?? state.profile.email}</span></div>
    <button type="button" aria-label="Cerrar menú" onClick={onClose}><FiX /></button></header>
    <div className="flow-account-menu__links">
      <TextLink to={paths.profile} icon={null} onClick={onClose}><FiUser />Mi perfil</TextLink><TextLink to={paths.connections} icon={null} onClick={onClose}><FiLink />Conexiones</TextLink><TextLink to={paths.visibility} icon={null} onClick={onClose}><FiEye />Visibilidad</TextLink>
    </div>{error && <Alert tone="danger">{error}</Alert>}<button type="button" disabled={closing} className="flow-account-menu__logout" onClick={async () => {
      if (auth) {
        setClosing(true); setError('');
        try { await auth.logout(); onClose(); navigate(paths.home, { replace: true }); }
        catch (failure) { setError(failure instanceof Error ? failure.message : 'No se pudo cerrar la sesión.'); }
        finally { setClosing(false); }
      } else { dispatch({ type: 'sign-out' }); onClose(); navigate(paths.home); }
    }}><FiLogOut />Cerrar sesión</button>
  </div>;
}

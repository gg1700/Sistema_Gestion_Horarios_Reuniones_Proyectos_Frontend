import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { FiEye, FiLink, FiLogOut, FiUser, FiX } from 'react-icons/fi';
import { useMockFlow } from '../../../contexts/MockFlowContext';
import { paths } from '../../../constants/paths';
import { TextLink } from './FlowPrimitives';

/*
CONTRATO BACKEND PROPUESTO — CERRAR SESIÓN
Nombre y correo del menú: GET /api/v1/profile, JSON en ProfilePage.tsx.
POST /api/v1/auth/logout — cookie de sesión actual; sin body.
Respuesta 204: sin cuerpo. Invalidar sesión y cookie en servidor; después limpiar
el estado privado del cliente y volver a /. Cerrar sesión no elimina el perfil ni
desvincula proveedores. Si no había sesión activa, también responder 204.
*/
export function AccountMenu({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useMockFlow();
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
    <div><strong>{state.profile.name} {state.profile.firstSurname}</strong><span>{state.profile.email}</span></div>
    <button type="button" aria-label="Cerrar menú" onClick={onClose}><FiX /></button></header>
    <div className="flow-account-menu__links">
      <TextLink to={paths.profile} icon={null} onClick={onClose}><FiUser />Mi perfil</TextLink><TextLink to={paths.connections} icon={null} onClick={onClose}><FiLink />Conexiones</TextLink><TextLink to={paths.visibility} icon={null} onClick={onClose}><FiEye />Visibilidad</TextLink>
    </div><button type="button" className="flow-account-menu__logout" onClick={() => {

      dispatch({ type: 'sign-out' }); onClose(); navigate(paths.home);
    }}><FiLogOut />Cerrar sesión</button>
  </div>;
}

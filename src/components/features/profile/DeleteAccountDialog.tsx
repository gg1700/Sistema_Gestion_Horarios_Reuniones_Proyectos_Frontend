import { useState } from 'react';
import { useNavigate } from 'react-router';
import { FiArrowRight, FiTrash2, FiX } from 'react-icons/fi';
import { Dialog } from '../../modals';
import { Alert, Button, Input } from '../../ui';
import { useMockFlow } from '../../../contexts/MockFlowContext';
import { paths } from '../../../constants/paths';

/*
CONTRATO BACKEND PROPUESTO — ELIMINAR CUENTA
DELETE /api/v1/profile — sesión del titular.
Request JSON:
{ "confirmation": "ELIMINAR" }
Respuesta 204: sin cuerpo. Cerrar sesión local y navegar a /acceso.
Eliminar datos de Orbitia, desactivar el enlace público, desvincular proveedores e
invalidar sesiones en servidor. No borrar repositorios ni calendarios del proveedor.
Errores: 401 sin sesión; 422 confirmación distinta de ELIMINAR. Si falla, mantener
abierto este modal y conservar los datos del usuario.
*/
export function DeleteAccountDialog({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useMockFlow();
  const navigate = useNavigate();
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  function remove() {
    try {

      dispatch({ type: 'account', action: { type: 'delete-account', confirmation } });
      navigate(paths.access, { replace: true });
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Revisa la confirmación.'); }
  }
  return <Dialog open onOpenChange={value => { if (!value) onClose(); }} title="¿Cerrar tu órbita?" eyebrow="ELIMINAR CUENTA" className="delete-profile-dialog" size="small"
    footer={<><Button variant="secondary" onClick={onClose}>Conservar cuenta</Button><Button variant="danger" disabled={confirmation !== 'ELIMINAR'} onClick={remove} trailingIcon={<FiArrowRight />}>Eliminar cuenta</Button></>}>
    <span className="profile-danger-symbol"><FiTrash2 /></span><p className="flow-copy">Se eliminarán tu perfil y sus datos de Orbitia. Esta acción no se puede deshacer.</p>
    <div className="delete-profile-identity"><strong>@{state.profile.handle}</strong><span>{state.profile.email}</span></div>
    <ul className="delete-profile-effects"><li><FiX />Tu perfil dejará de estar disponible.</li><li><FiX />Se desactivará tu enlace público.</li><li><FiX />Se desvincularán tus servicios conectados.</li></ul>
    {error && <Alert tone="danger">{error}</Alert>}<Input label="Escribe ELIMINAR para confirmar" value={confirmation} autoComplete="off" autoFocus placeholder="ELIMINAR" onChange={event => setConfirmation(event.target.value)} />
    <p className="delete-profile-note">Al eliminar tu cuenta, se cerrará tu sesión.</p>
  </Dialog>;
}

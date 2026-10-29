import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { FiArrowRight, FiCheck, FiCopy, FiExternalLink, FiEye, FiLink, FiLock } from 'react-icons/fi';
import { MemberShell } from '../components/features/flows/FlowShell';
import { TextLink, StatusDot } from '../components/features/flows/FlowPrimitives';
import { OrbitIllustration } from '../components/features/flows/OrbitIllustration';
import { ProfileIdentity, ProfileTabs } from '../components/features/profile/ProfileParts';
import { Dialog } from '../components/modals';
import { Alert, Button, Input, SectionHeading, Switch } from '../components/ui';
import { useMockFlow } from '../contexts/MockFlowContext';
import { useUI } from '../contexts/UIContext';
import { validateHandle } from '../mocks/flow';
import { paths, publicProfilePath } from '../constants/paths';

/*
CONTRATO BACKEND PROPUESTO — CAMBIAR IDENTIFICADOR
GET /api/v1/profile/handle-availability?handle=mateo-silva-dev — sesión, sin body.
Respuesta JSON 200:
{ "data": { "handle": "mateo-silva-dev", "available": true } }
Consultar al cambiar el texto; esta consulta no reserva el identificador.

PATCH /api/v1/profile/public-link — sesión del titular.
Request JSON:
{ "handle": "mateo-silva-dev" }
Respuesta JSON 200:
{ "data": { "handle": "mateo-silva-dev", "enabled": true, "url": "https://orbitia.app/mateo-silva-dev" } }
Actualizar handle y URL en el perfil y en todos los enlaces de esta sesión.
Validación: entre 3 y 50 letras a-z, números o guiones; no rutas reservadas.
Comprobar unicidad al guardar: 409 si ya se ocupó, conservar el formulario y mostrar
error en el identificador. La dirección anterior responde 404, sin redirección.
*/
function ChangeHandleDialog({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useMockFlow();
  const { notify } = useUI();
  const [handle, setHandle] = useState(`${state.profile.handle.slice(0, 46)}-dev`);
  const [error, setError] = useState('');
  let validation = '';
  try { validateHandle(handle); if (handle === state.profile.handle) validation = 'Elige un identificador diferente al actual.'; }
  catch (failure) { validation = failure instanceof Error ? failure.message : 'Revisa el identificador.'; }
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try { dispatch({ type: 'change-handle', handle }); onClose(); notify('Enlace actualizado. Comparte tu nueva dirección.', 'success'); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'No se pudo cambiar el enlace.'); }
  }
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }} title="Cambia tu dirección pública." eyebrow="ENLACE PÚBLICO" className="change-handle-dialog"
    footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button type="submit" form="change-public-handle" disabled={Boolean(validation)} trailingIcon={<FiArrowRight />}>Guardar nuevo enlace</Button></>}>
    <p className="flow-copy">Elige un identificador para tu perfil. Al cambiarlo, la dirección anterior dejará de estar disponible.</p><div className="current-public-address"><span>Dirección actual</span><strong>orbitia.app/{state.profile.handle}</strong></div>
    <form id="change-public-handle" className="flow-form" onSubmit={save}>{error && <Alert tone="danger">{error}</Alert>}<Input label="Nuevo identificador" required autoFocus minLength={3} maxLength={50} pattern="[a-z0-9-]{3,50}" leadingContent={<span>orbitia.app/</span>} value={handle} onChange={event => { setHandle(event.target.value.toLowerCase()); setError(''); }} error={validation || undefined} />{!validation && <p className="public-handle-available"><FiCheck />Identificador disponible</p>}<small>Entre 3 y 50 letras minúsculas, números o guiones.</small></form>
    
    <p className="flow-note flow-top-rule"><FiLink />Si ya compartiste tu enlace, tendrás que enviar la nueva dirección.</p>
  </Dialog>;
}

/*
CONTRATO BACKEND PROPUESTO — ENLACE PÚBLICO
GET /api/v1/profile/public-link — sesión del titular; sin body.
Respuesta JSON 200:
{ "data": { "handle": "mateo-silva", "enabled": true, "url": "https://orbitia.app/mateo-silva" } }
Llenado: enabled -> switch y botón de copiar; url -> dirección y portapapeles;
handle -> identificador. Usar la URL devuelta; no fijar el dominio del despliegue.

PATCH /api/v1/profile/public-link
Request JSON del switch:
{ "enabled": false }
Respuesta JSON 200:
{ "data": { "handle": "mateo-silva", "enabled": false, "url": "https://orbitia.app/mateo-silva" } }
Aplicar el switch al confirmar la respuesta; si falla, conservar el valor anterior.
Desactivar no borra perfil ni visibilidad. Perfil público y disponibilidad responden
404 mientras esté inactivo. Errores: 401 sin sesión; 422 enabled no booleano.
*/
export default function ProfileLinkPage() {
  const { state, dispatch } = useMockFlow();
  const { notify } = useUI();
  const [query, setQuery] = useSearchParams();
  const enabled = state.account.publicLinkEnabled;
  async function copy() {
    try { await navigator.clipboard.writeText(`${window.location.origin}${publicProfilePath(state.profile.handle)}`); notify('Enlace copiado.', 'success'); }
    catch { notify('No se pudo copiar. Puedes seleccionar la dirección del enlace.', 'warning'); }
  }
  return <MemberShell><SectionHeading title="Tu perfil tiene una dirección" eyebrow="MI CUENTA / PERFIL" accentPeriod actions={<TextLink to={publicProfilePath(state.profile.handle)} icon={<FiExternalLink />}>Ver mi perfil público</TextLink>} />
    <ProfileIdentity /><ProfileTabs /><div className="public-link-columns"><section><div className="public-link-sharing"><div><h2>Compartir mi perfil</h2><p>Permite que otras personas consulten tu información pública.</p></div><StatusDot tone={enabled ? 'success' : 'muted'}>{enabled ? 'Enlace activo' : 'Enlace inactivo'}</StatusDot><span className="public-link-toggle"><Switch label="Compartir mi perfil" checked={enabled} onChange={event => { dispatch({ type: 'account', action: { type: 'set-public-link', enabled: event.target.checked } }); }} /></span></div>
      
      <section className="public-link-address"><p className="ui-eyebrow">TU ENLACE ACTUAL</p><div><FiLink /><p>orbitia.app/<strong>{state.profile.handle}</strong></p><Button variant="secondary" size="small" leadingIcon={<FiCopy />} disabled={!enabled} onClick={copy}>Copiar enlace</Button></div><p>{enabled ? 'Comparte esta dirección para que puedan conocerte y consultar tu disponibilidad.' : 'Activa el enlace para compartir tu perfil y tu disponibilidad.'}</p></section>
      <section className="public-link-identifier"><div><h2>Identificador del perfil</h2><p>Es la parte personal de tu dirección pública.</p></div><Button variant="secondary" size="small" onClick={() => setQuery({ cambiar: '1' })}>Cambiar identificador</Button><p>orbitia.app/<strong>{state.profile.handle}</strong></p><small>Identificador actual</small></section>
      <div className="public-link-visibility"><FiEye /><div><h3>Publica solo lo que tú decidas.</h3><p>La visibilidad de tus datos se controla desde tu perfil.</p></div><TextLink to={paths.visibility}>Configurar visibilidad</TextLink></div>
    </section><aside><OrbitIllustration /><p className="ui-eyebrow">TU PUNTO DE ENCUENTRO</p><h2>Tu próxima conexión<br />empieza aquí.</h2><p>Una dirección para compartir tu perfil, tus proyectos y tus espacios disponibles.</p><p className="flow-note flow-top-rule"><FiLock />Al desactivar el enlace, tu perfil público deja de estar disponible.</p></aside></div>
    {query.has('cambiar') && <ChangeHandleDialog onClose={() => setQuery({})} />}
  </MemberShell>;
}

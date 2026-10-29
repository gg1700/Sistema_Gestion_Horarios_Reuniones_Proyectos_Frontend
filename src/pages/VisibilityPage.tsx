import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { FiArrowRight, FiCheck, FiEye, FiExternalLink, FiLock } from 'react-icons/fi';
import { MemberShell } from '../components/features/flows/FlowShell';
import { ProfileIdentity, ProfileTabs } from '../components/features/profile/ProfileParts';
import { PublicProfileView } from '../components/features/profile/PublicProfileView';
import { DeleteAccountDialog } from '../components/features/profile/DeleteAccountDialog';
import { Dialog } from '../components/modals';
import { Button, SectionHeading, Switch } from '../components/ui';
import { useMockFlow } from '../contexts/MockFlowContext';
import { useUI } from '../contexts/UIContext';
import { publicProfileSnapshot, type VisibilitySettings } from '../mocks/account';

/*
CONTRATO BACKEND PROPUESTO — VISIBILIDAD
Pantalla privada; sesión del titular. Datos a mostrar vienen de GET /api/v1/profile.
GET /api/v1/profile/visibility — sin body.
Respuesta JSON 200:
{ "data": { "secondSurname": false, "country": true, "address": false, "contactEmail": false, "phone": false, "experience": true, "links": true, "repositories": false, "githubActivity": false } }
Llenado: cada booleano controla el switch del mismo nombre; true = Público.

PATCH /api/v1/profile/visibility
Request JSON (puede contener solo los switches modificados):
{ "country": true, "address": false, "repositories": true }
Respuesta 204: sin cuerpo. Recargar GET /api/v1/profile/visibility.
Los omitidos se conservan. Nombre, primer apellido, usuario y foto siempre son públicos
en un enlace activo y no se aceptan como switches. Vista previa usa el borrador local;
el perfil del visitante usa valores guardados y filtrados por el servidor.
Errores: 401 sin sesión; 422 si un campo no es booleano o no está permitido.
*/
export { default } from '../features/github/ProfileVisibilityPage';

export function DemoVisibilityPage() {
  const { state, dispatch } = useMockFlow();
  const { notify } = useUI();
  const [query, setQuery] = useSearchParams();
  const [draft, setDraft] = useState<VisibilitySettings>({ ...state.account.visibility });
  const details = state.account.details;
  const preview = publicProfileSnapshot(state.profile, { ...state.account, visibility: draft });
  const groups: { title: string; rows: { key: keyof VisibilitySettings; label: string; value: string }[] }[] = [
    { title: 'Datos personales', rows: [{ key: 'secondSurname', label: 'Segundo apellido', value: details.secondSurname || 'Sin especificar' }, { key: 'country', label: 'País de residencia', value: details.country || 'Sin especificar' }, { key: 'address', label: 'Dirección', value: details.address || 'Sin especificar' }] },
    { title: 'Contacto', rows: [{ key: 'contactEmail', label: 'Correo de contacto', value: details.contactEmails.map(email => email.value).join(' · ') || 'Sin especificar' }, { key: 'phone', label: 'Teléfono', value: details.phones.map(phone => `${phone.code} ${phone.number}`).join(' · ') || 'Sin especificar' }] },
    { title: 'Trayectoria y actividad', rows: [{ key: 'experience', label: 'Experiencia laboral', value: 'Tus experiencias profesionales' }, { key: 'links', label: 'Enlaces personales', value: 'Los enlaces que agregas a tu perfil' }, { key: 'repositories', label: 'Repositorios', value: 'Los repositorios de GitHub que selecciones' }, { key: 'githubActivity', label: 'Actividad de GitHub', value: 'Tu actividad compartida desde GitHub' }] },
  ];
  return <MemberShell><SectionHeading title="Decide qué compartes" eyebrow="MI CUENTA / PERFIL" accentPeriod actions={<button type="button" className="flow-link" onClick={() => setQuery({ vista: 'previa' })}><FiEye />Vista previa <FiExternalLink /></button>} />
    <ProfileIdentity /><ProfileTabs /><div className="visibility-columns"><div>{groups.map(group => <section key={group.title} className="visibility-group"><h3>{group.title}</h3>{group.rows.map(row => <div className="visibility-row" key={row.key}><span>{row.label}</span><p>{row.value}</p><small className={draft[row.key] ? 'is-public' : ''}>{draft[row.key] ? 'Público' : 'Solo yo'}</small><span className="visibility-toggle"><Switch label={`${row.label}: público`} checked={draft[row.key]} onChange={event => setDraft(current => ({ ...current, [row.key]: event.target.checked }))} /></span></div>)}</section>)}</div>
      <aside className="visibility-aside"><section><p className="ui-eyebrow">TU IDENTIDAD PÚBLICA</p><h2>Siempre visibles.</h2><p>Estos datos permiten identificar tu perfil.</p><ul>{['Nombre de usuario', 'Nombre', 'Primer apellido', 'Fotografía de perfil'].map(label => <li key={label}><FiLock />{label}</li>)}</ul></section><section><h3>Tu información, a tu manera.</h3><p>La visibilidad define lo que otras personas pueden ver. Tus cuentas externas se gestionan en Conexiones.</p></section><section><h3>Tu cuenta</h3><p>También puedes eliminar tu perfil y los datos asociados.</p><button type="button" className="flow-link visibility-delete-link" onClick={() => setQuery({ eliminar: '1' })}>Eliminar cuenta <FiArrowRight /></button></section></aside>
    </div><footer className="visibility-save"><p>Guarda los cambios para actualizar tu perfil público.</p><Button leadingIcon={<FiCheck />} onClick={() => { dispatch({ type: 'account', action: { type: 'save-visibility', visibility: draft } }); notify('Visibilidad guardada.', 'success'); }}>Guardar cambios</Button></footer>
    
    {query.get('vista') === 'previa' && preview && <Dialog open onOpenChange={value => { if (!value) setQuery({}); }} title="Así te ven otras personas." eyebrow="VISTA PREVIA" className="profile-preview-dialog" size="large"
      footer={<><span className="profile-dialog-note"><FiEye />Solo se muestra la información configurada como pública.</span><Button variant="secondary" onClick={() => setQuery({})}>Volver a visibilidad</Button></>}><PublicProfileView profile={preview} /></Dialog>}
    {query.has('eliminar') && <DeleteAccountDialog onClose={() => setQuery({})} />}
  </MemberShell>;
}

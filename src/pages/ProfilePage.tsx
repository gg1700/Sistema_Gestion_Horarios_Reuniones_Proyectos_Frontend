import { useNavigate, useSearchParams } from 'react-router';
import { FiExternalLink, FiLink, FiLock, FiMail, FiPlus } from 'react-icons/fi';
import { MemberShell } from '../components/features/flows/FlowShell';
import { TextLink } from '../components/features/flows/FlowPrimitives';
import { ProfileTabs, WorkTimeline } from '../components/features/profile/ProfileParts';
import { EditProfileDialog } from '../components/features/profile/EditProfileDialog';
import { ExperienceEditor } from '../components/features/profile/ExperienceEditor';
import { Dialog } from '../components/modals';
import { Avatar, Button, OrbitalGraphic, ProviderIcon, SectionHeading } from '../components/ui';
import { useMockFlow } from '../contexts/MockFlowContext';
import { useUI } from '../contexts/UIContext';
import { paths } from '../constants/paths';

/*
CONTRATO BACKEND PROPUESTO — MI PERFIL
Ruta de pantalla privada: requiere sesión; el servidor obtiene al usuario de la sesión.

GET /api/v1/profile
Body: ninguno.
Respuesta JSON 200:
{
  "data": {
    "profile": { "name": "Mateo", "firstSurname": "Silva", "handle": "mateo-silva", "email": "mateo.silva@correo.com" },
    "details": {
      "secondSurname": "Gutiérrez", "country": "Bolivia", "address": "Av. 6 de Agosto, La Paz", "image": null,
      "contactEmails": [{ "id": "email-1", "value": "contacto@mateosilva.dev" }],
      "phones": [{ "id": "phone-1", "code": "+591", "number": "70123456" }],
      "links": [{ "id": "link-1", "label": "Portafolio", "url": "https://mateosilva.dev" }]
    },
    "experiences": [{ "id": "work-1", "title": "Desarrollador frontend", "company": "Nexo Digital", "startDate": "2024-03-01", "endDate": "2025-12-31", "description": "Desarrollo de interfaces web." }],
    "fieldOrigins": { "name": { "provider": "github", "originalValue": "Mateo" } }
  }
}
Llenado: profile -> nombre, usuario y correo de acceso; details -> datos y contacto;
experiences -> lista editable; fieldOrigins -> procedencia, sin reemplazar el valor propio.
image es null o URL de imagen. Arrays vacíos significan que no hay elementos.
El correo de acceso no es el correo de contacto y no se edita desde este formulario.
Errores: 401 sin sesión; 403 si se intenta operar sobre otro usuario.

DELETE /api/v1/profile/work-experience/work-1
Body: ninguno. Respuesta 204: sin cuerpo; quitar esa experiencia de la lista.
Errores: 401 sin sesión, 404 si no existe o no pertenece al usuario.
*/
export default function ProfilePage() {
  const { state, dispatch } = useMockFlow();
  const { notify } = useUI();
  const [query, setQuery] = useSearchParams();
  const navigate = useNavigate();
  const details = state.account.details;
  const editingExperience = query.get('experiencia');
  const experience = state.account.experiences.find(item => item.id === editingExperience);
  function closeModal() { setQuery({}); }
  return <MemberShell><SectionHeading title="Mi perfil" eyebrow="MI CUENTA" accentPeriod actions={<><span className="profile-private-indicator"><FiLock />Vista privada</span><Button variant="secondary" size="small" onClick={() => setQuery({ editar: '1' })}>Editar información</Button></>} />
    
    <div className="profile-hero"><Avatar name={`${state.profile.name} ${state.profile.firstSurname}`} src={details.image} size="large" /><div><h2>{state.profile.name} {state.profile.firstSurname} {details.secondSurname}</h2><p><span>@{state.profile.handle}</span><i>·</i><FiMail />{state.profile.email}</p><small>Tu información personal y tus conexiones, en el mismo lugar.</small></div><div className="profile-hero__orbit"><OrbitalGraphic /></div></div>
    <ProfileTabs /><div className="private-profile-columns"><section><div className="profile-section-head"><h3>Datos personales</h3><TextLink to={paths.profileOrigins}>Ver procedencia</TextLink></div><dl className="profile-data-grid"><div><dt>Nombre</dt><dd>{state.profile.name}</dd></div><div><dt>Primer apellido</dt><dd>{state.profile.firstSurname}</dd></div><div><dt>Segundo apellido</dt><dd>{details.secondSurname || 'Sin especificar'}</dd></div><div><dt>País de residencia</dt><dd>{details.country || 'Sin especificar'}</dd></div><div className="profile-data-wide"><dt>Dirección</dt><dd>{details.address || 'Sin especificar'}</dd></div></dl>
      <section className="profile-contact-section"><h3>Contacto</h3><div className="profile-contact-data"><div><h4>Correo de contacto</h4>{details.contactEmails.length ? details.contactEmails.map(email => <p key={email.id}>{email.value}</p>) : <p>Sin especificar</p>}</div><div><h4>Teléfono</h4>{details.phones.length ? details.phones.map(phone => <p key={phone.id}>{phone.code} {phone.number}</p>) : <p>Sin especificar</p>}</div></div></section>
      <section className="profile-personal-links"><h3>Enlaces personales</h3>{details.links.map(link => <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"><FiLink /><strong>{link.label}</strong><span>{link.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span><FiExternalLink /></a>)}{!details.links.length && <p className="flow-note">Aún no agregaste enlaces personales.</p>}</section>
    </section><aside><div className="profile-section-head"><h3>Experiencia laboral</h3><small>Añadida por ti</small></div><WorkTimeline experiences={state.account.experiences} onEdit={id => setQuery({ experiencia: id })} onRemove={id => { dispatch({ type: 'account', action: { type: 'remove-experience', id } }); notify('Experiencia eliminada.', 'success'); }} />
      <button type="button" className="flow-link profile-add-experience" disabled={state.account.experiences.length >= 10} onClick={() => setQuery({ experiencia: 'nueva' })}><FiPlus />Agregar experiencia</button>
    </aside></div><div className="profile-connections-entry"><ProviderIcon provider="google" /><ProviderIcon provider="github" /><div><h3>Conecta tus herramientas a tu perfil.</h3><p>Gestiona Google Calendar y GitHub desde Conexiones.</p></div><TextLink to={paths.connections}>Ir a conexiones</TextLink></div>
    {query.has('editar') && <EditProfileDialog onClose={closeModal} />}
    {editingExperience && (experience || editingExperience === 'nueva') && <ExperienceEditor key={editingExperience} experience={experience} onClose={closeModal} onSave={value => { dispatch({ type: 'account', action: { type: 'save-experience', experience: value } }); closeModal(); notify('Experiencia guardada.', 'success'); }} />}
    {editingExperience && !experience && editingExperience !== 'nueva' && <Dialog open onOpenChange={closeModal} title="Experiencia no disponible" footer={<Button onClick={() => navigate(paths.profile)}>Volver a mi perfil</Button>}><p>Esta experiencia ya no está en tu perfil.</p></Dialog>}
  </MemberShell>;
}

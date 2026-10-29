import { useSearchParams } from 'react-router';
import { FiEdit2, FiEye } from 'react-icons/fi';
import { MemberShell } from '../components/features/flows/FlowShell';
import { TextLink } from '../components/features/flows/FlowPrimitives';
import { ProfileTabs, experienceDates } from '../components/features/profile/ProfileParts';
import { EditProfileDialog } from '../components/features/profile/EditProfileDialog';
import { Avatar, ProviderIcon, SectionHeading } from '../components/ui';
import { useMockFlow } from '../contexts/MockFlowContext';
import { paths } from '../constants/paths';
import type { AccountState } from '../mocks/account';

/*
CONTRATO BACKEND — PROCEDENCIA
Usa GET /api/v1/profile (JSON completo en ProfilePage.tsx); no requiere otro endpoint.
Ejemplo JSON de los campos utilizados de esa respuesta:
{ "profile": { "name": "Mateo Ignacio" }, "fieldOrigins": { "name": { "provider": "github", "originalValue": "Mateo" } } }
Si hay origen y value coincide con originalValue: mostrar "Desde GitHub/Google".
Si difiere: mostrar "Personalizado", proveedor original y valor recibido.
Si no hay origen para el campo: "Añadido por ti". Editar usa el mismo PATCH comentado
en EditProfileDialog.tsx. Nunca cambiar fieldOrigins desde el navegador.
*/
export default function ProfileOriginsPage() {
  const { state } = useMockFlow();
  const [query, setQuery] = useSearchParams();
  const { details, fieldOrigins } = state.account;
  const fields: { key: keyof AccountState['fieldOrigins']; label: string; value: string }[] = [
    { key: 'name', label: 'Nombre', value: state.profile.name }, { key: 'firstSurname', label: 'Primer apellido', value: state.profile.firstSurname },
    { key: 'secondSurname', label: 'Segundo apellido', value: details.secondSurname }, { key: 'country', label: 'País de residencia', value: details.country },
    { key: 'contactEmail', label: 'Correo de contacto', value: details.contactEmails.map(item => item.value).join(' · ') },
  ];
  return <MemberShell><SectionHeading title="Mi perfil" eyebrow="MI CUENTA / INFORMACIÓN" accentPeriod actions={<TextLink to={paths.connections}>Gestionar conexiones</TextLink>} />
    
    <div className="profile-origin-identity"><Avatar name={`${state.profile.name} ${state.profile.firstSurname}`} src={details.image} size="large" /><div><h2>{state.profile.name} {state.profile.firstSurname} {details.secondSurname}</h2><p>@{state.profile.handle} · {state.profile.email}</p></div></div>
    <ProfileTabs /><div className="profile-origin-columns"><section><div className="profile-section-head"><h3>Datos personales</h3><small>Procedencia por campo</small></div><dl className="profile-origin-fields">{fields.map(field => {
      const origin = fieldOrigins[field.key];
      const customized = origin && origin.originalValue !== field.value;
      return <div key={field.key}><div><dt>{field.label}</dt><dd>{field.value || 'Sin especificar'}</dd></div><span className="profile-field-origin">{origin ? <><ProviderIcon provider={origin.provider} />{customized ? 'Personalizado · origen ' : 'Desde '}{origin.provider === 'github' ? 'GitHub' : 'Google'}</> : 'Añadido por ti'}</span>{origin && <button type="button" className="flow-link" onClick={() => setQuery({ editar: '1' })}>Editar <FiEdit2 /></button>}{customized && <small className="profile-original-value">Valor recibido: {origin.originalValue}</small>}</div>;
    })}</dl><TextLink to={paths.profile} icon={null}>Volver a mi información</TextLink></section><aside><div className="profile-section-head"><h3>Experiencia laboral</h3></div>{state.account.experiences.map(item => <article className="profile-origin-experience" key={item.id}><h4>{item.title}</h4><p>{item.company} · {experienceDates(item)}</p><small>Añadida por ti</small></article>)}<p className="flow-note"><FiEye />La visibilidad de cada dato sigue bajo tu control.</p><TextLink to={paths.visibility}>Configurar visibilidad</TextLink><section className="flow-top-rule"><h3>Personaliza un dato importado.</h3><p>Al editarlo, Orbitia identificará tu versión y conservará la procedencia del dato.</p></section></aside></div>
    {query.has('editar') && <EditProfileDialog onClose={() => setQuery({})} />}
  </MemberShell>;
}

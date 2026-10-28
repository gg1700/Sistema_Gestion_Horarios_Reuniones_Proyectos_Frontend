import { useParams } from 'react-router';
import { FiArrowRight, FiCalendar } from 'react-icons/fi';
import { VisitorShell } from '../components/features/flows/FlowShell';
import { PublicProfileView } from '../components/features/profile/PublicProfileView';
import { PublicProfileUnavailable } from '../components/features/profile/PublicProfileUnavailable';
import { TextLink } from '../components/features/flows/FlowPrimitives';
import { ButtonLink } from '../components/ui';
import { publicProfileSnapshot } from '../mocks/account';
import { useMockFlow } from '../contexts/MockFlowContext';
import { flowPaths } from '../constants/paths';
import { publicProfileAvailable } from '../mocks/flow';

/*
CONTRATO BACKEND PROPUESTO — PERFIL DEL VISITANTE
GET /api/v1/public/profiles/mateo-silva — público, sin body ni sesión.
Respuesta JSON 200, ejemplo con país, experiencia, enlaces y repositorios públicos:
{ "data": { "name": "Mateo", "firstSurname": "Silva", "handle": "mateo-silva", "image": null, "country": "Bolivia", "experiences": [{ "id": "work-1", "title": "Desarrollador frontend", "company": "Nexo Digital", "startDate": "2024-03-01", "endDate": "2025-12-31", "description": "Desarrollo de interfaces." }], "links": [{ "id": "link-1", "label": "Portafolio", "url": "https://mateosilva.dev" }], "repositories": [{ "id": "repo-1", "name": "orbitia-web", "description": "Interfaz para coordinar reuniones.", "language": "TypeScript", "stars": 24, "forks": 4, "url": "https://github.com/mateosilva/orbitia-web" }] } }
Llenado: identidad siempre presente; renderizar solo secciones recibidas y no vacías.
Campos opcionales, si son públicos: secondSurname/address (texto), contactEmails (array
de textos), phones (array de textos), activity (id/date/title/detail, como GitHubInfoPage).
El servidor OMITE los campos privados antes de serializar. No enviar email de acceso,
fieldOrigins, conexiones, tokens ni proyectos no seleccionados. GitHub desconectado:
omitir repositories/activity aunque sus switches estuvieran activos.
404 con el mismo JSON para usuario inexistente, eliminado, enlace inactivo o dirección vieja:
{ "error": { "code": "PUBLIC_PROFILE_NOT_FOUND", "message": "Perfil no disponible." } }
Mostrar la pantalla de órbita no disponible. El CTA de disponibilidad usa el handle recibido.
*/
export default function ProfilePublicPage() {
  const { publicHandle } = useParams();
  const { state } = useMockFlow();
  const profile = publicProfileAvailable(state, publicHandle) ? publicProfileSnapshot(state.profile, state.account) : null;

  return <VisitorShell>{profile ? <><PublicProfileView profile={profile} visitor actions={<div className="public-profile-header-action"><ButtonLink to={flowPaths.availability(state.profile.handle)} trailingIcon={<FiArrowRight />}>Consultar disponibilidad</ButtonLink><small>Encuentra un espacio para reunirte.</small></div>} /><div className="public-profile-invitation"><FiCalendar /><div><h3>Hagamos coincidir nuestras órbitas.</h3><p>Consulta los horarios disponibles y envía una solicitud de reunión.</p></div><TextLink to={flowPaths.availability(state.profile.handle)}>Ver disponibilidad</TextLink></div></> : <PublicProfileUnavailable />}</VisitorShell>;
}

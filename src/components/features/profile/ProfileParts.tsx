import { NavLink, useLocation } from 'react-router';
import { FiEdit2, FiEye, FiLink, FiLock, FiTrash2, FiUser } from 'react-icons/fi';
import { Avatar } from '../../ui';
import { useMockFlow } from '../../../contexts/MockFlowContext';
import { paths } from '../../../constants/paths';
import type { WorkExperience } from '../../../mocks/account';
import { useOptionalAuth } from '../../../features/auth/AuthContext';

export function ProfileIdentity() {
  const { state } = useMockFlow();
  const auth = useOptionalAuth();
  if (auth?.session) {
    const profile = auth.session.profile;
    return <div className="profile-context"><Avatar name={`${profile.name} ${profile.firstSurname}`} src={profile.profilePicture} size="small" /><span>{profile.name} {profile.firstSurname}</span><small>@{profile.handleName}</small></div>;
  }
  return <div className="profile-context"><Avatar name={`${state.profile.name} ${state.profile.firstSurname}`} src={state.account.details.image} size="small" />
    <span>{state.profile.name} {state.profile.firstSurname} {state.account.details.secondSurname}</span><small>@{state.profile.handle}</small></div>;
}

export function ProfileTabs({ connections = false }: { connections?: boolean }) {
  const { pathname } = useLocation();
  return <div className="profile-tabs-row"><nav aria-label="Secciones de mi perfil" className="profile-tabs">
    <NavLink to={paths.profile} end className={({ isActive }) => isActive || pathname === paths.profileOrigins ? 'active' : undefined}><FiUser />Información</NavLink><NavLink to={paths.connections}><FiLink />Conexiones</NavLink><NavLink to={paths.visibility}><FiEye />Visibilidad</NavLink><NavLink to={paths.profileLink}><FiLink />Enlace público</NavLink>
  </nav><span>{connections ? <FiEye /> : <FiLock />}{connections ? 'Tú autorizas cada conexión' : 'Solo tú puedes cambiar esta configuración'}</span></div>;
}

export function experienceDates(experience: WorkExperience) {
  const format = (value: string) => new Intl.DateTimeFormat('es-BO', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`));
  return `${format(experience.startDate)} — ${experience.endDate ? format(experience.endDate) : 'Actualidad'}`;
}

export function WorkTimeline({ experiences, onEdit, onRemove }: { experiences: WorkExperience[]; onEdit?: (id: string) => void; onRemove?: (id: string) => void }) {
  return <div className="profile-timeline">{experiences.map(experience => <article key={experience.id}>
    <div className="profile-timeline__heading"><h4>{experience.title}</h4>{onEdit && <button type="button" className="profile-small-action" aria-label={`Editar ${experience.title}`} onClick={() => onEdit(experience.id)}><FiEdit2 /></button>}{onRemove && <button type="button" className="profile-small-action" aria-label={`Eliminar ${experience.title}`} onClick={() => onRemove(experience.id)}><FiTrash2 /></button>}</div>
    <p className="profile-timeline__dates">{experience.company && <>{experience.company}<span>·</span></>}{experienceDates(experience)}</p>
    {experience.description && <p className="profile-timeline__description">{experience.description}</p>}
  </article>)}</div>;
}

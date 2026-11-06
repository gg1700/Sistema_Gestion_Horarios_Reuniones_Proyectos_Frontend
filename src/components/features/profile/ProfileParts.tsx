
import { NavLink, useLocation } from 'react-router';
import {
  FiCalendar,
  FiEdit2,
  FiEye,
  FiLink,
  FiLock,
  FiTrash2,
  FiUser,
} from 'react-icons/fi';
import { Avatar } from '../../ui';
import { paths } from '../../../constants/paths';
import { useMemberIdentity } from '../../../features/github/MemberIdentityContext';

export interface WorkExperienceView {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  description: string;
}

export function ProfileIdentity() {
  const member = useMemberIdentity();
  const profile = member?.profile;

  if (!profile) return null;

  const fullName = [
    profile.name,
    profile.firstSurname,
    profile.surname?.surname,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="profile-context">
      <Avatar
        name={fullName}
        src={profile.profilePicture}
        size="small"
      />

      <span>{fullName}</span>
      <small>@{profile.handleName}</small>
    </div>
  );
}

export function ProfileTabs({
  connections = false,
}: {
  connections?: boolean;
}) {
  const { pathname } = useLocation();

  return (
    <div className="profile-tabs-row">
      <nav
        aria-label="Secciones de mi perfil"
        className="profile-tabs"
      >
        <NavLink
          to={paths.profile}
          end
          className={({ isActive }) =>
            isActive ? 'active' : undefined
          }
        >
          <FiUser />
          Información
        </NavLink>

        <NavLink to={paths.connections}>
          <FiLink />
          Conexiones
        </NavLink>

        <NavLink to={paths.visibility}>
          <FiEye />
          Visibilidad
        </NavLink>

        <NavLink to={paths.profileLink}>
          <FiLink />
          Enlace público
        </NavLink>

        <NavLink to={paths.availabilitySettings}>
          <FiCalendar />
          Disponibilidad
        </NavLink>
      </nav>

      <span>
        {connections ? <FiEye /> : <FiLock />}
        {connections
          ? 'Tú autorizas cada conexión'
          : 'Solo tú puedes cambiar esta configuración'}
      </span>
    </div>
  );
}

export function experienceDates(
  experience: WorkExperienceView
) {
  const format = (value: string) =>
    new Intl.DateTimeFormat('es-BO', {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${value}T12:00:00Z`));

  return `${format(experience.startDate)} — ${
    experience.endDate
      ? format(experience.endDate)
      : 'Actualidad'
  }`;
}

export function WorkTimeline({
  experiences,
  onEdit,
  onRemove,
}: {
  experiences: WorkExperienceView[];
  onEdit?: (id: string) => void;
  onRemove?: (id: string) => void;
}) {
  return (
    <div className="profile-timeline">
      {experiences.map(experience => (
        <article key={experience.id}>
          <div className="profile-timeline__heading">
            <h4>{experience.title}</h4>

            {onEdit && (
              <button
                type="button"
                className="profile-small-action"
                aria-label={`Editar ${experience.title}`}
                onClick={() => onEdit(experience.id)}
              >
                <FiEdit2 />
              </button>
            )}

            {onRemove && (
              <button
                type="button"
                className="profile-small-action"
                aria-label={`Eliminar ${experience.title}`}
                onClick={() => onRemove(experience.id)}
              >
                <FiTrash2 />
              </button>
            )}
          </div>

          <p className="profile-timeline__dates">
            {experience.company && (
              <>
                {experience.company}
                <span>·</span>
              </>
            )}
            {experienceDates(experience)}
          </p>

          {experience.description && (
            <p className="profile-timeline__description">
              {experience.description}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
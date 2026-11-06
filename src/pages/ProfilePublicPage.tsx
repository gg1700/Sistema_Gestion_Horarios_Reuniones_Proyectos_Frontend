import { useEffect } from 'react';
import { FiArrowRight, FiCalendar } from 'react-icons/fi';
import { VisitorShell } from '../components/features/flows/FlowShell';
import { PublicProfileView } from '../components/features/profile/PublicProfileView';
import { PublicProfileUnavailable } from '../components/features/profile/PublicProfileUnavailable';
import { TextLink } from '../components/features/flows/FlowPrimitives';
import { Alert, ButtonLink } from '../components/ui';
import usePublicProfile from '../hooks/usePublicProfile';
import { toPublicSnapshot } from '../api/publicProfileAdapter';
import { flowPaths } from '../constants/paths';

export default function ProfilePublicPage() {
  const { profile: response, isLoading, error } = usePublicProfile();
  const profile = response ? toPublicSnapshot(response) : null;
  useEffect(() => {
  const previousTitle = document.title;

  const existingMeta =
    document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    );

  const previousDescription =
    existingMeta?.getAttribute('content') ?? null;

  const meta =
    existingMeta ?? document.createElement('meta');

    if (!existingMeta) {
      meta.name = 'description';
      document.head.appendChild(meta);
    }

    if (isLoading) {
      document.title = 'Cargando perfil público | Orbitia';
      meta.content = 'Consultando el perfil público.';
    } else if (error) {
      document.title = 'Error al consultar el perfil | Orbitia';
      meta.content =
        'No se pudo consultar el perfil público.';
    } else if (profile) {
      const fullName =
        `${profile.name} ${profile.firstSurname}`;

      document.title = `${fullName} | Orbitia`;
      meta.content =
        `Perfil público de ${fullName} (@${profile.handle}) en Orbitia.`;
    } else {
      document.title = 'Perfil no encontrado | Orbitia';
      meta.content =
        'El perfil público solicitado no está disponible.';
    }

    return () => {
      document.title = previousTitle;

      if (!existingMeta) {
        meta.remove();
      } else if (previousDescription === null) {
        meta.removeAttribute('content');
      } else {
        meta.setAttribute(
          'content',
          previousDescription
        );
      }
    };
  }, [
    isLoading,
    error,
    profile?.name,
    profile?.firstSurname,
    profile?.handle
  ]);

  return <VisitorShell>{isLoading ? <p role="status">Cargando perfil público…</p> : error ? <Alert tone="danger">{error}</Alert> : profile ? <><PublicProfileView profile={profile} visitor actions={<div className="public-profile-header-action"><ButtonLink to={flowPaths.availability(profile.handle)} trailingIcon={<FiArrowRight />}>Consultar disponibilidad</ButtonLink><small>Encuentra un espacio para reunirte.</small></div>} /><div className="public-profile-invitation"><FiCalendar /><div><h3>Hagamos coincidir nuestras órbitas.</h3><p>Consulta los horarios disponibles y envía una solicitud de reunión.</p></div><TextLink to={flowPaths.availability(profile.handle)}>Ver disponibilidad</TextLink></div></> : <PublicProfileUnavailable />}</VisitorShell>;
}

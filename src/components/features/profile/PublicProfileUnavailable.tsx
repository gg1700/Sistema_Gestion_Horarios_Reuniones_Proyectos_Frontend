import { FiArrowRight, FiLink } from 'react-icons/fi';
import { OrbitIllustration } from '../flows/OrbitIllustration';
import { ButtonLink } from '../../ui';
import { paths } from '../../../constants/paths';

export function PublicProfileUnavailable() {
  return <section className="public-profile-unavailable"><div className="public-profile-404" aria-hidden="true"><OrbitIllustration /><strong>404</strong></div><div><p className="ui-eyebrow">PERFIL PÚBLICO</p><h1>Esta órbita no está<br />disponible<span>.</span></h1><p>No encontramos un perfil público en esta dirección. Comprueba el enlace que recibiste e inténtalo de nuevo.</p><ButtonLink variant="secondary" to={paths.access} trailingIcon={<FiArrowRight />}>Iniciar sesión</ButtonLink><p className="flow-note flow-top-rule"><FiLink />Solo se pueden consultar perfiles con un enlace público activo.</p></div></section>;
}

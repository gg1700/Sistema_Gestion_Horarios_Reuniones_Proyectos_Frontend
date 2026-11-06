import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { useSearchParams } from 'react-router';
import { VisitorShell } from '../components/features/flows/FlowShell';
import { OrbitIllustration } from '../components/features/flows/OrbitIllustration';
import { TextLink } from '../components/features/flows/FlowPrimitives';
import { ButtonLink } from '../components/ui';
import { paths } from '../constants/paths';

export default function AccessIssuePage() {
  const [query] = useSearchParams();
  const returnTo = query.get('volver') === 'conexiones' ? paths.connections : paths.access;

  return <VisitorShell access><section className="access-issue"><OrbitIllustration /><p className="ui-eyebrow">AUTORIZACIÓN EXTERNA</p><h1>El acceso no se completó<span>.</span></h1><p>La autorización del proveedor no se completó. Vuelve a intentarlo con Google o GitHub.</p><div><ButtonLink to={returnTo} trailingIcon={<FiArrowRight />}>Reintentar acceso</ButtonLink><TextLink to={paths.home} icon={<FiArrowLeft />}>Volver a Orbitia</TextLink></div></section></VisitorShell>;
}

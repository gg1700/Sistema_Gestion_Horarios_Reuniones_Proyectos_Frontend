import { FiShield } from 'react-icons/fi';
import { MemberShell } from '../components/features/flows/FlowShell';
import { OrbitIllustration } from '../components/features/flows/OrbitIllustration';
import { TextLink } from '../components/features/flows/FlowPrimitives';
import { SectionHeading } from '../components/ui';
import { useMockFlow } from '../contexts/MockFlowContext';
import { paths, flowPaths } from '../constants/paths';

/*
DATOS PARA BIENVENIDA
Pantalla privada tras completar cuenta. Reutilizar name del GET /api/v1/profile,
documentado con su JSON en ProfilePage.tsx. No requiere un endpoint propio.
Completar perfil / Conectar servicios / Gestionar enlace solo navegan; no autorizan
ni publican datos por sí mismos. Los pasos opcionales pueden completarse después.
*/
export default function WelcomePage() {
  const { state } = useMockFlow();
  return <MemberShell><SectionHeading title="Tu espacio ya está listo" eyebrow="BIENVENIDO A ORBITIA" accentPeriod description={`Hola, ${state.profile.name}. Empieza por lo que más te interese y completa tu espacio a tu ritmo.`} />
    <div className="welcome-columns"><section className="welcome-steps"><article><span>01</span><div><h2>Dale forma a tu perfil.</h2><p>Agrega información de contacto, enlaces y experiencia laboral.</p></div><TextLink to={paths.profileSetup}>Completar perfil</TextLink></article>
      <article><span>02</span><div><h2>Conecta tus servicios.</h2><p>Integra tu calendario, tus repositorios y tu actividad reciente.</p></div><TextLink to={paths.connections}>Conectar servicios</TextLink></article>
      <article><span>03</span><div><h2>Comparte tu punto de encuentro.</h2><p>Activa tu enlace público y elige qué información quieres mostrar.</p></div><TextLink to={paths.profileLink}>Gestionar mi enlace</TextLink></article>
    </section><aside className="welcome-aside"><OrbitIllustration services /><h2>Tú eres el punto<br />de conexión.</h2><p>Tu cuenta de Orbitia ya está creada. Cada servicio se vincula con tu autorización.</p><p className="flow-note flow-top-rule"><FiShield />Puedes configurar la visibilidad de tus datos antes de compartir el perfil.</p></aside></div>
    <div className="welcome-shortcuts"><div><h3>También puedes explorar tu espacio.</h3><p>El perfil y las conexiones se pueden completar más adelante.</p></div><TextLink to={paths.agenda}>Ver agenda</TextLink><TextLink to={paths.dashboard}>Ir a mi panel</TextLink><TextLink to={flowPaths.availability(state.profile.handle)}>Ver disponibilidad</TextLink></div>
  </MemberShell>;
}

import { FiArrowRight } from 'react-icons/fi';
import { VisitorShell } from '../components/features/flows/FlowShell';
import { OrbitIllustration } from '../components/features/flows/OrbitIllustration';
import { ButtonLink, ProviderIcon } from '../components/ui';
import { paths } from '../constants/paths';

export default function LandingPage() {
  return <VisitorShell landing><section className="landing-hero"><div>
    <p className="ui-eyebrow"><span className="flow-small-orbit" />PERSONAS · TIEMPO · PROYECTOS</p>
    <h1>Todo lo que haces,<br />en una misma <em>órbita.</em></h1>
    <p className="landing-description">Reúne tu perfil, tus calendarios y tu actividad profesional. Comparte tu disponibilidad y encuentra el momento para conectar.</p>
    <div className="landing-actions"><ButtonLink to={paths.access} trailingIcon={<FiArrowRight />}>Empezar ahora</ButtonLink><span>Entra con Google o GitHub.</span></div>
    <div className="landing-integrations"><span>CONEXIONES PARA TU ESPACIO</span><div><span><ProviderIcon provider="google" />Google Calendar</span><span><ProviderIcon provider="github" />GitHub</span></div></div>
  </div><OrbitIllustration services /></section>
    <section className="landing-method"><header><p className="ui-eyebrow">ASÍ EMPIEZA TU ÓRBITA</p><span>Tú decides qué conectar y qué compartir.</span></header>
      <div>{[
        ['01', 'Entra con tu cuenta.', 'Usa Google o GitHub y completa tu perfil la primera vez que ingreses.'],
        ['02', 'Conecta tus herramientas.', 'Autoriza tus servicios para integrar calendarios, repositorios y actividad reciente.'],
        ['03', 'Comparte y coordina.', 'Publica tu perfil y tu disponibilidad para recibir solicitudes de reunión.'],
      ].map(([number, title, description]) => <article key={number}><span>{number}</span><h2>{title}</h2><p>{description}</p></article>)}</div>
    </section>
  </VisitorShell>;
}

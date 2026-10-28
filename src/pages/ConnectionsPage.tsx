import { useSearchParams } from 'react-router';
import { FiArrowRight, FiCalendar, FiRefreshCw, FiServer, FiShield } from 'react-icons/fi';
import { MemberShell } from '../components/features/flows/FlowShell';
import { OrbitIllustration } from '../components/features/flows/OrbitIllustration';
import { StatusDot, TextLink } from '../components/features/flows/FlowPrimitives';
import { ProfileIdentity, ProfileTabs } from '../components/features/profile/ProfileParts';
import { ConnectionDialogs } from '../components/features/connections/ConnectionDialogs';
import { Button, ProviderIcon, SectionHeading } from '../components/ui';
import { useMockFlow } from '../contexts/MockFlowContext';
import { calendars } from '../mocks/account';
import { paths } from '../constants/paths';
import { useOptionalAuth } from '../features/auth/AuthContext';
import { RealConnectionsPage } from '../features/auth/RealConnectionsPage';

/*
La app usa RealConnectionsPage: GET auth/session y GET integrations/github/connection.
Los JSON y errores reales se documentan en features/auth/api.ts.
MockConnectionsPage conserva los flujos visuales de calendario/repositorios para
pruebas aisladas. Esos datos no acreditan una conexión del usuario real.
*/
function MockConnectionsPage() {
  const { state } = useMockFlow();
  const [query, setQuery] = useSearchParams();
  const { google, github } = state.account;
  const chosen = calendars.find(calendar => calendar.id === google.calendarId)?.name ?? 'Sin elegir';
  const connectedGoogle = google.calendarStatus === 'connected';
  function openModal(modal: string) { setQuery({ modal }); }
  return <MemberShell><SectionHeading title="Tus conexiones" eyebrow="MI CUENTA / PERFIL" accentPeriod actions={<span className="connections-heading-note">Google Calendar · GitHub</span>} />
    <ProfileIdentity /><ProfileTabs connections /><div className="connections-columns"><section className="connections-provider-list">
      <article className="connection-provider"><ProviderIcon provider="google" /><div><header><h2>{google.calendarStatus === 'reconnect' ? 'Google' : 'Google Calendar'}</h2><StatusDot tone={google.calendarStatus === 'reconnect' ? 'warning' : connectedGoogle ? 'success' : 'muted'}>{google.calendarStatus === 'reconnect' ? 'Calendar requiere reconexión' : connectedGoogle ? 'Conectado' : 'Sin conectar'}</StatusDot></header>
        {google.calendarStatus !== 'disconnected' ? <><p>{state.profile.email}</p>{connectedGoogle ? <div className="connection-calendar-line"><FiCalendar /><span>Calendario elegido</span><strong>{chosen}</strong><button type="button" className="flow-link" onClick={() => openModal('calendario')}>Cambiar</button></div> : <p className="connection-provider-note">Renueva el permiso de Calendar para volver a actualizar eventos. {chosen} sigue seleccionado.</p>}
          <p className="connection-identity-note">Cuenta de acceso a Orbitia · vinculada.</p><div className="connection-actions">{connectedGoogle ? <button type="button" className="flow-link" onClick={() => openModal('reconectar-google')}><FiRefreshCw />Reconectar</button> : <Button variant="secondary" size="small" onClick={() => openModal('reconectar-google')}>Volver a autorizar</Button>}<div className="connection-separation-actions"><button type="button" className="flow-link connection-unlink" onClick={() => openModal('desconectar-calendar')}>Desconectar Calendar</button><button type="button" className="flow-link connection-unlink" onClick={() => openModal('desvincular-google')}>Quitar acceso con Google</button></div></div></> : <><p>Tu calendario personal, conectado a tu disponibilidad y reuniones.</p><p className="connection-provider-note">Consulta tus calendarios y sincroniza sus eventos.</p><p className="connection-identity-note">{google.identityLinked ? 'Google se conserva como cuenta de acceso.' : 'Puedes seguir entrando con GitHub.'}</p><div className="connection-actions"><Button variant="secondary" size="small" trailingIcon={<FiArrowRight />} onClick={() => openModal('conectar-google')}>Conectar Google</Button>{google.identityLinked && <button type="button" className="flow-link connection-unlink" onClick={() => openModal('desvincular-google')}>Quitar acceso con Google</button>}</div></>}
      </div></article>
      <article className="connection-provider"><ProviderIcon provider="github" /><div><header><h2>GitHub</h2><StatusDot tone={github.dataConnected ? 'success' : 'muted'}>{github.dataConnected ? 'Conectado' : 'Sin conectar'}</StatusDot></header>
        {github.dataConnected ? <><p>@mateosilva</p><div className="connection-calendar-line"><FiServer /><strong>{github.selectedRepositories.length} repositorios seleccionados</strong><button type="button" className="flow-link" onClick={() => openModal('repositorios')}>Gestionar</button></div><p className="connection-identity-note">También puedes entrar con esta cuenta.</p><div className="connection-actions"><TextLink to={paths.githubInfo}>Ver información</TextLink><div className="connection-separation-actions"><button type="button" className="flow-link connection-unlink" onClick={() => openModal('desconectar-datos-github')}>Desconectar datos</button><button type="button" className="flow-link connection-unlink" onClick={() => openModal('desvincular-github')}>Quitar acceso con GitHub</button></div></div></> : <><p>Tus repositorios y tu actividad reciente, dentro de Orbitia.</p><p className="connection-provider-note">Consulta repositorios y actividad con los permisos que autorices.</p><p className="connection-identity-note">{github.identityLinked ? 'GitHub se conserva como cuenta de acceso.' : 'Los datos que personalizaste en Orbitia se conservan.'}</p><div className="connection-actions"><Button variant="secondary" size="small" trailingIcon={<FiArrowRight />} onClick={() => openModal('conectar-github')}>Conectar GitHub</Button>{github.identityLinked && <button type="button" className="flow-link connection-unlink" onClick={() => openModal('desvincular-github')}>Quitar acceso con GitHub</button>}</div></>}
      </div></article><p className="flow-note"><FiShield />Puedes conectar, volver a autorizar o desvincular cada servicio desde aquí.</p>
    </section><aside className="connections-aside"><OrbitIllustration services /><p className="ui-eyebrow">EN LA MISMA ÓRBITA</p><h2>Tus herramientas.<br />Tu espacio.</h2><p>Conecta cada servicio con tu propia cuenta y elige qué información usar en Orbitia.</p><section><h3>Conectar y publicar son decisiones distintas.</h3><p>La información que compartes en tu perfil se configura en Visibilidad.</p><TextLink to={paths.visibility}>Configurar visibilidad</TextLink></section></aside></div>
    <ConnectionDialogs modal={query.get('modal')} onClose={() => setQuery({})} onNext={openModal} />
  </MemberShell>;
}

export default function ConnectionsPage() {
  const auth = useOptionalAuth();
  return auth ? <RealConnectionsPage /> : <MockConnectionsPage />;
}

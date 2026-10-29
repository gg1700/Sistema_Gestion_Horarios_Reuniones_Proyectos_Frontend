
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { FiArrowRight, FiCalendar, FiRefreshCw, FiServer, FiShield } from 'react-icons/fi';
import { MemberShell } from '../components/features/flows/FlowShell';
import { OrbitIllustration } from '../components/features/flows/OrbitIllustration';
import { StatusDot, TextLink } from '../components/features/flows/FlowPrimitives';
import { ProfileIdentity, ProfileTabs } from '../components/features/profile/ProfileParts';
import { ConnectionDialogs } from '../components/features/connections/ConnectionDialogs';
import { Alert, Button, ProviderIcon, SectionHeading } from '../components/ui';
import { useMockFlow } from '../contexts/MockFlowContext';
import { paths } from '../constants/paths';
import { useGoogleCalendar } from '../hooks/useGoogleCalendar';

export default function ConnectionsPage() {
  const { state } = useMockFlow();
  const [query, setQuery] = useSearchParams();
  const { github } = state.account;
  const calendar = useGoogleCalendar();
  const [oauthError, setOauthError] = useState('');

  const calendarAuthorized = calendar.status.status === 'connected';
  const connectedGoogle = calendarAuthorized && Boolean(calendar.status.calendarId);
  const reconnectGoogle = calendar.status.status === 'expired';
  const chosen = calendar.status.calendarName ?? 'Sin elegir';

  const google = {
    ...state.account.google,
    calendarStatus: reconnectGoogle ? 'reconnect' : calendar.status.status,
    calendarId: calendar.status.calendarId
  };

  function openModal(modal: string) {
    setOauthError('');
    setQuery({ modal });
  }

  function closeModal() {
    setQuery({});
    void calendar.refreshStatus().catch(() => {});
  }

  useEffect(() => {
    const result = query.get('calendar_oauth');
    if (!result) return;

    const next = new URLSearchParams(query);
    next.delete('calendar_oauth');

    if (result === 'success') {
      setOauthError('');
      next.set('modal', 'calendario');
    } else {
      const messages: Record<string, string> = {
        access_denied: 'Cancelaste la autorización de Google Calendar.',
        invalid_session: 'Tu sesión ha expirado. Vuelve a iniciar sesión.',
        invalid_state: 'La autorización no pudo verificarse. Inténtalo nuevamente.',
        missing_refresh_token: 'Google no proporcionó los permisos necesarios.',
        insufficient_scope: 'No se concedieron todos los permisos de Calendar.'
      };

      setOauthError(messages[result] ?? 'No se pudo completar la conexión con Google Calendar.');
    }

    setQuery(next, { replace: true });
  }, [query, setQuery]);

  return (
    <MemberShell>
      <SectionHeading
        title="Tus conexiones"
        eyebrow="MI CUENTA / PERFIL"
        accentPeriod
        actions={<span className="connections-heading-note">Google Calendar · GitHub</span>}
      />

      {calendar.loading && <p className="flow-copy">Consultando conexión de Google Calendar...</p>}
      {calendar.error && <Alert tone="danger">{calendar.error}</Alert>}
      {oauthError && <Alert tone="warning">{oauthError}</Alert>}

      <ProfileIdentity />
      <ProfileTabs connections />

      <div className="connections-columns">
        <section className="connections-provider-list">
          <article className="connection-provider">
            <ProviderIcon provider="google" />
            <div>
              <header>
                <h2>Google Calendar</h2>
                <StatusDot tone={reconnectGoogle ? 'warning' : connectedGoogle ? 'success' : 'muted'}>
                  {reconnectGoogle
                    ? 'Calendar requiere reconexión'
                    : connectedGoogle
                      ? 'Conectado'
                      : calendarAuthorized
                        ? 'Pendiente de seleccionar calendario'
                        : 'Sin conectar'}
                </StatusDot>
              </header>

              {calendarAuthorized ? (
                <>
                  <p>Google Calendar autorizado</p>

                  {connectedGoogle ? (
                    <div className="connection-calendar-line">
                      <FiCalendar />
                      <span>Calendario elegido</span>
                      <strong>{chosen}</strong>
                      <button type="button" className="flow-link" onClick={() => openModal('calendario')}>
                        Cambiar
                      </button>
                    </div>
                  ) : (
                    <p className="connection-provider-note">
                      Ya autorizaste Google Calendar. Selecciona el calendario que utilizarás en Orbitia.
                    </p>
                  )}

                  <p className="connection-identity-note">
                    {google.identityLinked
                      ? 'Google se conserva como cuenta de acceso.'
                      : 'Google Calendar autorizado como integración.'}
                  </p>

                  <div className="connection-actions">
                    {connectedGoogle ? (
                      <button type="button" className="flow-link" onClick={() => openModal('reconectar-google')}>
                        <FiRefreshCw />Reconectar
                      </button>
                    ) : (
                      <Button variant="secondary" size="small" onClick={() => openModal('calendario')}>
                        Elegir calendario
                      </Button>
                    )}

                    <div className="connection-separation-actions">
                      <button type="button" className="flow-link connection-unlink" onClick={() => openModal('desconectar-calendar')}>
                        Desconectar Calendar
                      </button>
                      {google.identityLinked && (
                        <button type="button" className="flow-link connection-unlink" onClick={() => openModal('desvincular-google')}>
                          Quitar acceso con Google
                        </button>
                      )}
                    </div>
                  </div>
                </>
              ) : reconnectGoogle ? (
                <>
                  <p>Google Calendar requiere una nueva autorización.</p>
                  <p className="connection-provider-note">
                    Renueva los permisos de Calendar para volver a sincronizar eventos. {chosen} sigue seleccionado.
                  </p>
                  <p className="connection-identity-note">
                    {google.identityLinked
                      ? 'Google se conserva como cuenta de acceso.'
                      : 'La integración de Calendar necesita reconexión.'}
                  </p>

                  <div className="connection-actions">
                    <Button variant="secondary" size="small" onClick={() => openModal('reconectar-google')}>
                      Volver a autorizar
                    </Button>

                    <div className="connection-separation-actions">
                      <button type="button" className="flow-link connection-unlink" onClick={() => openModal('desconectar-calendar')}>
                        Desconectar Calendar
                      </button>
                      {google.identityLinked && (
                        <button type="button" className="flow-link connection-unlink" onClick={() => openModal('desvincular-google')}>
                          Quitar acceso con Google
                        </button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p>Tu calendario personal, conectado a tu disponibilidad y reuniones.</p>
                  <p className="connection-provider-note">
                    Consulta tus calendarios y sincroniza sus eventos.
                  </p>
                  <p className="connection-identity-note">
                    {google.identityLinked
                      ? 'Google se conserva como cuenta de acceso.'
                      : 'Puedes seguir entrando con GitHub.'}
                  </p>

                  <div className="connection-actions">
                    <Button
                      variant="secondary"
                      size="small"
                      trailingIcon={<FiArrowRight />}
                      onClick={() => openModal('conectar-google')}
                    >
                      Conectar Google
                    </Button>

                    {google.identityLinked && (
                      <button type="button" className="flow-link connection-unlink" onClick={() => openModal('desvincular-google')}>
                        Quitar acceso con Google
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </article>

          <article className="connection-provider">
            <ProviderIcon provider="github" />
            <div>
              <header>
                <h2>GitHub</h2>
                <StatusDot tone={github.dataConnected ? 'success' : 'muted'}>
                  {github.dataConnected ? 'Conectado' : 'Sin conectar'}
                </StatusDot>
              </header>

              {github.dataConnected ? (
                <>
                  <p>@mateosilva</p>

                  <div className="connection-calendar-line">
                    <FiServer />
                    <strong>{github.selectedRepositories.length} repositorios seleccionados</strong>
                    <button type="button" className="flow-link" onClick={() => openModal('repositorios')}>
                      Gestionar
                    </button>
                  </div>

                  <p className="connection-identity-note">También puedes entrar con esta cuenta.</p>

                  <div className="connection-actions">
                    <TextLink to={paths.githubInfo}>Ver información</TextLink>
                    <div className="connection-separation-actions">
                      <button type="button" className="flow-link connection-unlink" onClick={() => openModal('desconectar-datos-github')}>
                        Desconectar datos
                      </button>
                      <button type="button" className="flow-link connection-unlink" onClick={() => openModal('desvincular-github')}>
                        Quitar acceso con GitHub
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p>Tus repositorios y tu actividad reciente, dentro de Orbitia.</p>
                  <p className="connection-provider-note">
                    Consulta repositorios y actividad con los permisos que autorices.
                  </p>
                  <p className="connection-identity-note">
                    {github.identityLinked
                      ? 'GitHub se conserva como cuenta de acceso.'
                      : 'Los datos que personalizaste en Orbitia se conservan.'}
                  </p>

                  <div className="connection-actions">
                    <Button
                      variant="secondary"
                      size="small"
                      trailingIcon={<FiArrowRight />}
                      onClick={() => openModal('conectar-github')}
                    >
                      Conectar GitHub
                    </Button>

                    {github.identityLinked && (
                      <button type="button" className="flow-link connection-unlink" onClick={() => openModal('desvincular-github')}>
                        Quitar acceso con GitHub
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </article>

          <p className="flow-note">
            <FiShield />Puedes conectar, volver a autorizar o desvincular cada servicio desde aquí.
          </p>
        </section>

        <aside className="connections-aside">
          <OrbitIllustration services />
          <p className="ui-eyebrow">EN LA MISMA ÓRBITA</p>
          <h2>Tus herramientas.<br />Tu espacio.</h2>
          <p>Conecta cada servicio con tu propia cuenta y elige qué información usar en Orbitia.</p>
          <section>
            <h3>Conectar y publicar son decisiones distintas.</h3>
            <p>La información que compartes en tu perfil se configura en Visibilidad.</p>
            <TextLink to={paths.visibility}>Configurar visibilidad</TextLink>
          </section>
        </aside>
      </div>

      <ConnectionDialogs
        modal={query.get('modal')}
        onClose={closeModal}
        onNext={openModal}
      />
    </MemberShell>
  );
}
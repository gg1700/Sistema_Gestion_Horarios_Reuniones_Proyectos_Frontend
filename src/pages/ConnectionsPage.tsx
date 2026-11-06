import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { FiArrowRight, FiCalendar, FiRefreshCw, FiShield } from 'react-icons/fi';
import { MemberShell } from '../components/features/flows/FlowShell';
import { OrbitIllustration } from '../components/features/flows/OrbitIllustration';
import { StatusDot, TextLink } from '../components/features/flows/FlowPrimitives';
import { ProfileIdentity, ProfileTabs } from '../components/features/profile/ProfileParts';
import { ConnectionDialogs } from '../components/features/connections/ConnectionDialogs';
import { LinkedAccountsSection } from '../components/features/connections/LinkedAccountsSection';
import { GithubConnectionPanel } from '../features/github/GithubConnectionPanel';
import { Alert, Button, ProviderIcon, SectionHeading } from '../components/ui';
import { paths } from '../constants/paths';
import { useGoogleCalendar } from '../hooks/useGoogleCalendar';

export default function ConnectionsPage() {
  const [query, setQuery] = useSearchParams();
  const calendar = useGoogleCalendar();
  const [oauthError, setOauthError] = useState('');

  const calendarAuthorized = calendar.status.status === 'connected';
  const connectedGoogle =
    calendarAuthorized && Boolean(calendar.status.calendarId);
  const reconnectGoogle = calendar.status.status === 'expired';
  const chosen = calendar.status.calendarName ?? 'Sin elegir';

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
        insufficient_scope: 'No se concedieron todos los permisos de Calendar.',
        account_conflict: 'Esta cuenta de Google ya está vinculada a otra cuenta de Orbitia.'
      };

      setOauthError(
        messages[result] ??
        'No se pudo completar la conexión con Google Calendar.'
      );
    }

    setQuery(next, { replace: true });
  }, [query, setQuery]);

  return (
    <MemberShell>
      <SectionHeading
        title="Tus conexiones"
        eyebrow="MI CUENTA / PERFIL"
        accentPeriod
        actions={
          <span className="connections-heading-note">
            Google Calendar · GitHub
          </span>
        }
      />

      {calendar.loading && (
        <p className="flow-copy">
          Consultando conexión de Google Calendar...
        </p>
      )}

      {calendar.error && (
        <Alert tone="danger">{calendar.error}</Alert>
      )}

      {oauthError && (
        <Alert tone="warning">{oauthError}</Alert>
      )}

      <ProfileIdentity />
      <ProfileTabs connections />

      <div className="connections-columns">
        <section className="connections-provider-list">
          <LinkedAccountsSection />

          <article className="connection-provider">
            <ProviderIcon provider="google" />

            <div>
              <header>
                <h2>Google Calendar</h2>

                <StatusDot
                  tone={
                    reconnectGoogle
                      ? 'warning'
                      : connectedGoogle
                        ? 'success'
                        : 'muted'
                  }
                >
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
                      <span>Calendario seleccionado</span>
                      <strong>{chosen}</strong>
                      <span className="text-xs font-medium text-orbita-accent">
                        Selección permanente
                      </span>
                    </div>
                  ) : (
                    <p className="connection-provider-note">
                      Ya autorizaste Google Calendar. Puedes elegir uno de
                      tus calendarios existentes o crear uno nuevo. Una vez
                      seleccionado, no podrás cambiarlo.
                    </p>
                  )}

                  <p className="connection-identity-note">
                    La autorización de Calendar es independiente de las
                    cuentas que utilizas para iniciar sesión.
                  </p>

                  <div className="connection-actions">
                    {connectedGoogle ? (
                      <button
                        type="button"
                        className="flow-link"
                        onClick={() => openModal('reconectar-google')}
                      >
                        <FiRefreshCw />
                        Reconectar
                      </button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => openModal('calendario')}
                      >
                        Seleccionar calendario
                      </Button>
                    )}

                    <div className="connection-separation-actions">
                      <button
                        type="button"
                        className="flow-link connection-unlink"
                        onClick={() => openModal('desconectar-calendar')}
                      >
                        Desconectar Calendar
                      </button>
                    </div>
                  </div>
                </>
              ) : reconnectGoogle ? (
                <>
                  <p>Google Calendar requiere una nueva autorización.</p>

                  <p className="connection-provider-note">
                    Renueva los permisos de Calendar para volver a sincronizar
                    eventos. {chosen} sigue seleccionado.
                  </p>

                  <p className="connection-identity-note">
                    La autorización de Calendar es independiente de las
                    cuentas que utilizas para iniciar sesión.
                  </p>

                  <div className="connection-actions">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => openModal('reconectar-google')}
                    >
                      Volver a autorizar
                    </Button>

                    <div className="connection-separation-actions">
                      <button
                        type="button"
                        className="flow-link connection-unlink"
                        onClick={() => openModal('desconectar-calendar')}
                      >
                        Desconectar Calendar
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    Tu calendario personal, conectado a tu disponibilidad
                    y reuniones.
                  </p>

                  <p className="connection-provider-note">
                    Consulta tus calendarios y sincroniza sus eventos.
                  </p>

                  <p className="connection-identity-note">
                    Puedes administrar tus cuentas de acceso en la sección
                    correspondiente.
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
                  </div>
                </>
              )}
            </div>
          </article>

          <GithubConnectionPanel />

          <p className="flow-note">
            <FiShield />
            Puedes conectar, volver a autorizar o desvincular cada servicio
            desde aquí.
          </p>
        </section>

        <aside className="connections-aside">
          <OrbitIllustration services />

          <p className="ui-eyebrow">EN LA MISMA ÓRBITA</p>

          <h2>
            Tus herramientas.
            <br />
            Tu espacio.
          </h2>

          <p>
            Conecta cada servicio con tu propia cuenta y elige qué
            información usar en Orbitia.
          </p>

          <section>
            <h3>Conectar y publicar son decisiones distintas.</h3>

            <p>
              La información que compartes en tu perfil se configura
              en Visibilidad.
            </p>

            <TextLink to={paths.visibility}>
              Configurar visibilidad
            </TextLink>
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

import { useEffect, useState } from 'react';
import {
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiLink,
} from 'react-icons/fi';

import { MemberShell } from '../components/features/flows/FlowShell';
import {
  TextLink,
  StatusDot,
} from '../components/features/flows/FlowPrimitives';

import {
  Alert,
  Button,
  ProviderIcon,
  SectionHeading,
} from '../components/ui';

import { useUI } from '../contexts/UIContext';
import { useMemberIdentity } from '../features/github/MemberIdentityContext';
import { useGoogleCalendar } from '../hooks/useGoogleCalendar';

import { getCalendarEvents } from '../api/calendarEventsApi';
import { getMeetingRequests } from '../api/meetingRequestsApi';

import type { CalendarEventItem } from '../types/calendarEvents';
import type { MeetingRequestItem } from '../types/meetingRequests';

import {
  dateKey,
  dateLabel,
  rangeLabel,
  shiftDate,
} from '../utils/calendar';

import {
  paths,
  flowPaths,
  publicProfilePath,
} from '../constants/paths';

interface DashboardEvent extends CalendarEventItem {
  start: string;
  end: string;
}

export default function DashboardPage() {
  const member = useMemberIdentity();
  const calendar = useGoogleCalendar();
  const { notify } = useUI();

  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [requests, setRequests] = useState<MeetingRequestItem[]>([]);

  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const [eventsError, setEventsError] = useState('');
  const [requestsError, setRequestsError] = useState('');

  const profile = member?.profile;

  const today = dateKey(new Date().toISOString());
  const endDate = shiftDate(today, 30);

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      if (calendar.loading) return;

      if (calendar.status.status !== 'connected') {
        setEvents([]);
        setEventsError(
          calendar.status.status === 'expired'
            ? 'Google Calendar requiere una nueva autorización.'
            : 'Conecta Google Calendar para consultar tus eventos.',
        );
        setLoadingEvents(false);
        return;
      }

      setLoadingEvents(true);
      setEventsError('');

      try {
        const result = await getCalendarEvents({
          from: `${today}T00:00:00-04:00`,
          to: `${endDate}T00:00:00-04:00`,
          limit: 100,
        });

        if (!active) return;

        setEvents(
          result
            .filter(event => event.eventStatus !== 'cancelled')
            .map(event => ({
              ...event,
              start: event.startsAt,
              end: event.endsAt,
            })),
        );
      } catch (failure) {
        if (!active) return;

        setEvents([]);
        setEventsError(
          failure instanceof Error
            ? failure.message
            : 'No se pudieron consultar los eventos.',
        );
      } finally {
        if (active) setLoadingEvents(false);
      }
    }

    void loadEvents();

    return () => {
      active = false;
    };
  }, [
    calendar.loading,
    calendar.status.status,
    today,
    endDate,
  ]);

  useEffect(() => {
    let active = true;

    async function loadRequests() {
      setLoadingRequests(true);
      setRequestsError('');

      try {
        const result = await getMeetingRequests('received', {
          status: 'pending',
          limit: 100,
        });

        if (!active) return;

        setRequests(result);
      } catch (failure) {
        if (!active) return;

        setRequests([]);
        setRequestsError(
          failure instanceof Error
            ? failure.message
            : 'No se pudieron consultar las solicitudes.',
        );
      } finally {
        if (active) setLoadingRequests(false);
      }
    }

    void loadRequests();

    return () => {
      active = false;
    };
  }, []);

  const todayEvents = events
    .filter(event => dateKey(event.startsAt) === today)
    .sort(
      (a, b) =>
        Date.parse(a.startsAt) - Date.parse(b.startsAt),
    );

  const upcoming = events
    .filter(event => dateKey(event.startsAt) > today)
    .sort(
      (a, b) =>
        Date.parse(a.startsAt) - Date.parse(b.startsAt),
    );

  const nextEvent = [...todayEvents, ...upcoming]
    .filter(event => Date.parse(event.endsAt) > Date.now())
    .sort(
      (a, b) =>
        Date.parse(a.startsAt) - Date.parse(b.startsAt),
    )[0];

  const pendingCount = requests.length;
  const calendarConnected =
    calendar.status.status === 'connected';

  async function shareProfile() {
    if (!profile) return;

    const url = `${window.location.origin}${publicProfilePath(
      profile.handleName,
    )}`;

    try {
      await navigator.clipboard.writeText(url);
      notify('Enlace copiado.', 'success');
    } catch {
      notify('No se pudo copiar el enlace.', 'warning');
    }
  }

  const greeting = profile
    ? `Hola, ${profile.name}`
    : 'Mi espacio';

  return (
    <MemberShell>
      <SectionHeading
        title={greeting}
        eyebrow={`${dateLabel(today).toUpperCase()} · UTC−4 · LA PAZ`}
        accentPeriod
        actions={
          <Button
            variant="secondary"
            onClick={shareProfile}
            disabled={!profile}
            trailingIcon={<FiArrowRight />}
          >
            Compartir mi perfil
          </Button>
        }
      />

      <div className="dashboard-summary dashboard-summary--today">
        <div>
          <span>HOY</span>

          <strong>
            {loadingEvents
              ? 'Consultando agenda…'
              : todayEvents.length > 0
                ? `${todayEvents.length} evento${todayEvents.length === 1 ? '' : 's'}`
                : 'Sin eventos'}
          </strong>

          {todayEvents[0] && (
            <small>{todayEvents[0].title}</small>
          )}
        </div>

        <div>
          <span>PRÓXIMO EVENTO</span>

          <strong>
            {nextEvent
              ? dateLabel(nextEvent.startsAt, {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                  year: undefined,
                })
              : loadingEvents
                ? 'Consultando…'
                : 'Sin eventos próximos'}
          </strong>

          {nextEvent && (
            <small>
              {nextEvent.title} · {rangeLabel(nextEvent)}
            </small>
          )}
        </div>

        <div>
          <span>POR RESOLVER</span>

          <strong>
            {loadingRequests ? '…' : pendingCount}

            <small>
              solicitud{pendingCount === 1 ? '' : 'es'} pendiente
              {pendingCount === 1 ? '' : 's'}
            </small>
          </strong>
        </div>
      </div>

      <div className="dashboard-columns">
        <section>
          <div className="flow-section-heading">
            <h2>En tu agenda</h2>
            <TextLink to={paths.agenda}>
              Ver calendario
            </TextLink>
          </div>

          {eventsError && (
            <Alert tone="warning">{eventsError}</Alert>
          )}

          {loadingEvents && (
            <p role="status">
              Consultando eventos de Google Calendar…
            </p>
          )}

          {!loadingEvents && !eventsError && (
            <>
              {upcoming.slice(0, 5).map(event => (
                <article
                  className="dashboard-event"
                  key={event.id}
                >
                  <div className="dashboard-date">
                    <strong>
                      {dateKey(event.startsAt).slice(-2)}
                    </strong>

                    <span>
                      {dateLabel(event.startsAt, {
                        weekday: 'short',
                        month: 'short',
                        day: undefined,
                        year: undefined,
                      })}
                    </span>
                  </div>

                  <div>
                    <h3>{event.title}</h3>

                    <p>
                      {rangeLabel(event)} · Google Calendar
                    </p>
                  </div>

                  <TextLink
                    to={`${paths.agenda}?dia=${dateKey(event.startsAt)}&evento=${encodeURIComponent(event.id)}`}
                    aria-label={`Ver ${event.title}`}
                  >
                    {null}
                  </TextLink>
                </article>
              ))}

              {todayEvents.map(event => (
                <article
                  className="dashboard-event"
                  key={event.id}
                >
                  <div className="dashboard-date">
                    <strong>HOY</strong>
                    <span>{rangeLabel(event)}</span>
                  </div>

                  <div>
                    <h3>{event.title}</h3>
                    <p>Google Calendar</p>
                  </div>

                  <TextLink
                    to={`${paths.agenda}?dia=${today}&evento=${encodeURIComponent(event.id)}`}
                  >
                    {null}
                  </TextLink>
                </article>
              ))}

              {todayEvents.length === 0 &&
                upcoming.length === 0 && (
                  <p className="flow-copy">
                    No hay eventos próximos en tu calendario.
                  </p>
                )}
            </>
          )}

          <p className="flow-note">
            <FiCalendar />
            Fechas y horarios obtenidos directamente de Google Calendar.
          </p>
        </section>

        <aside className="dashboard-pending">
          <div className="flow-section-heading">
            <h2>Por resolver</h2>

            <small>
              {pendingCount} pendiente
              {pendingCount === 1 ? '' : 's'}
            </small>
          </div>

          {requestsError && (
            <Alert tone="danger">{requestsError}</Alert>
          )}

          {loadingRequests && (
            <p role="status">
              Consultando solicitudes recibidas…
            </p>
          )}

          {!loadingRequests && requests.length > 0 && (
            <>
              {requests.slice(0, 3).map(request => (
                <article
                  className="dashboard-pending-item"
                  key={request.id}
                >
                  <p className="dashboard-change-tag">
                    <FiCalendar />
                    SOLICITUD DE REUNIÓN
                  </p>

                  <h3>
                    {request.name} {request.firstSurname} quiere
                    coordinar una reunión.
                  </h3>

                  <p>{request.title}</p>

                  <div className="flow-top-rule">
                    <strong>
                      {dateLabel(request.startsAt)}
                    </strong>

                    <p>
                      {rangeLabel({
                        start: request.startsAt,
                        end: request.endsAt,
                      })}
                    </p>
                  </div>

                  <TextLink
                    className="ui-button ui-button--primary"
                    to={flowPaths.reviewRequest(request.id)}
                  >
                    Revisar solicitud
                  </TextLink>
                </article>
              ))}

              <TextLink to={paths.requests}>
                Ver todas las solicitudes
              </TextLink>
            </>
          )}

          {!loadingRequests &&
            !requestsError &&
            requests.length === 0 && (
              <>
                <StatusDot tone="success">
                  Todo al día
                </StatusDot>

                <h3>No tienes solicitudes pendientes.</h3>

                <p>
                  Cuando alguien solicite una reunión, aparecerá aquí.
                </p>

                <TextLink to={paths.requests}>
                  Ver solicitudes
                </TextLink>
              </>
            )}

          <section className="dashboard-services">
            <div className="flow-section-heading">
              <h2>Servicios</h2>

              <TextLink to={paths.connections}>
                Gestionar
              </TextLink>
            </div>

            <div>
              <ProviderIcon provider="google" />

              <strong>Google Calendar</strong>

              <StatusDot
                tone={calendarConnected ? 'success' : 'warning'}
              >
                {calendarConnected
                  ? 'Conectado'
                  : calendar.status.status === 'expired'
                    ? 'Requiere autorización'
                    : 'Sin conectar'}
              </StatusDot>

              <TextLink to={paths.connections} icon={null}>
                {calendarConnected ? 'Ver' : 'Conectar'}
              </TextLink>
            </div>

            <div>
              <ProviderIcon provider="github" />

              <strong>GitHub</strong>

              <TextLink to={paths.githubInfo} icon={null}>
                Ver integración
              </TextLink>
            </div>
          </section>
        </aside>
      </div>

      <div className="dashboard-bottom">
        <div>
          <FiLink />

          <div>
            <h3>Tu perfil, listo para compartir.</h3>

            <p>
              Revisa tu información pública y los horarios que pueden
              consultar.
            </p>
          </div>

          <TextLink to={paths.profileLink}>
            Gestionar enlace
          </TextLink>
        </div>

        <div>
          <ProviderIcon provider="google" />
          <ProviderIcon provider="github" />

          <p>
            Consulta los proyectos y la actividad que integraste
            en tu perfil.
          </p>

          <TextLink to={paths.githubInfo}>
            Ver datos de GitHub
          </TextLink>
        </div>
      </div>
    </MemberShell>
  );
}
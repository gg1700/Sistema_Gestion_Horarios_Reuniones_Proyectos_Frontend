
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import {
  FiArrowRight,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiShield,
} from 'react-icons/fi';
import { MemberShell } from '../components/features/flows/FlowShell';
import {
  TextLink,
  StatusDot,
} from '../components/features/flows/FlowPrimitives';
import {
  CalendarEventDetails,
  CalendarEventEditor,
  DeleteCalendarEvent,
} from '../components/features/calendar/CalendarEventDialogs';
import { Dialog } from '../components/modals';
import {
  Alert,
  Button,
  ProviderIcon,
  SectionHeading,
  Spinner,
} from '../components/ui';
import { paths } from '../constants/paths';
import {
  getCalendarEvents,
} from '../api/calendarEventsApi';
import type {
  CalendarEventItem,
} from '../types/calendarEvents';
import {
  useGoogleCalendar,
} from '../hooks/useGoogleCalendar';
import {
  calendarDaySegments,
  dateKey,
  dateLabel,
  isDateKey,
  rangeLabel,
  shiftDate,
  weekStart,
} from '../utils/calendar';

type AgendaEvent = CalendarEventItem & {
  start: string;
  end: string;
};

export default function AgendaPage() {
  const [query, setQuery] = useSearchParams();

  const calendar = useGoogleCalendar();

  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const today = dateKey(new Date().toISOString());

  const selectedDay = isDateKey(query.get('dia'))
    ? query.get('dia')!
    : today;

  const week = weekStart(selectedDay);

  const days = Array.from(
    { length: 7 },
    (_, index) => shiftDate(week, index),
  );

  const calendarName =
    calendar.status.calendarName ?? 'Calendario seleccionado';

  const connected = calendar.status.status === 'connected';

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      if (calendar.loading) return;

      if (!connected) {
        setEvents([]);
        setLoadingEvents(false);
        setError(
          calendar.status.status === 'expired'
            ? 'Google Calendar necesita una nueva autorización.'
            : 'Conecta Google Calendar para consultar tu agenda.',
        );
        return;
      }

      setLoadingEvents(true);
      setError('');

      try {
        const result = await getCalendarEvents({
          from: `${week}T00:00:00-04:00`,
          to: `${shiftDate(week, 7)}T00:00:00-04:00`,
          limit: 100,
        });

        if (!active) return;

        const mappedEvents: AgendaEvent[] = result
          .filter(event => event.eventStatus !== 'cancelled')
          .map(event => ({
            ...event,
            start: event.startsAt,
            end: event.endsAt,
          }));

        setEvents(mappedEvents);
      } catch (failure) {
        if (!active) return;

        setEvents([]);
        setError(
          failure instanceof Error
            ? failure.message
            : 'No se pudieron cargar los eventos del calendario.',
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
    connected,
    week,
    refreshKey,
  ]);

  const daySegments = days.map(day =>
    calendarDaySegments(events, day),
  );

  const allSegments = daySegments.flat();

  const firstHour = Math.floor(
    Math.min(
      9 * 60,
      ...allSegments.map(segment => segment.startMinute),
    ) / 60,
  );

  const lastHour = Math.ceil(
    Math.max(
      18 * 60,
      ...allSegments.map(segment => segment.endMinute),
    ) / 60,
  );

  const rowHeight = 44;

  const selectedEvents = calendarDaySegments(
    events,
    selectedDay,
  ).map(item => item.event);

  const selectedId =
    query.get('seleccion') ?? query.get('evento');

  const focused =
    selectedEvents.find(item => item.id === selectedId) ??
    selectedEvents[0];

  const openedEvent = events.find(
    item => item.id === query.get('evento'),
  );

  const action = query.get('accion');
  const result = query.get('resultado');

  function closeModal() {
    setQuery({
      dia: selectedDay,
      ...(focused ? { seleccion: focused.id } : {}),
    });
  }

  function openEvent(event: AgendaEvent) {
    setQuery({
      dia: selectedDay,
      evento: event.id,
    });
  }

  function eventAction(value: string) {
    setQuery({
      dia: selectedDay,
      ...(openedEvent ? { evento: openedEvent.id } : {}),
      accion: value,
    });
  }

  function saved(event: CalendarEventItem, created: boolean) {
    setRefreshKey(value => value + 1);

    setQuery({
      dia: dateKey(event.startsAt),
      seleccion: event.id,
      resultado: created ? 'creado' : 'actualizado',
    });
  }

  function deleted() {
    setRefreshKey(value => value + 1);

    setQuery({
      dia: selectedDay,
      resultado: 'eliminado',
    });
  }

  return (
    <MemberShell>
      <SectionHeading
        title="Tu tiempo, en una órbita"
        eyebrow="MI ESPACIO / AGENDA"
        accentPeriod
        actions={
          <>
            <TextLink to={paths.profileLink}>
              Gestionar enlace público
            </TextLink>

            <Button
              onClick={() => eventAction('crear')}
              disabled={!connected || loadingEvents}
              trailingIcon={<FiArrowRight />}
            >
              Crear evento
            </Button>
          </>
        }
      />

      <div className="agenda-context-line">
        {result ? (
          <p className="agenda-event-feedback" role="status">
            <FiCheck />
            {result === 'eliminado'
              ? 'Evento eliminado. La disponibilidad se ha actualizado.'
              : result === 'creado'
                ? 'El evento se creó en Google Calendar.'
                : 'El evento se actualizó en Google Calendar.'}
          </p>
        ) : (
          <p className="agenda-calendar-label">
            <ProviderIcon provider="google" />
            Google Calendar · {calendarName}
          </p>
        )}
      </div>

      {!connected && (
        <Alert tone="warning">
          {error || 'Google Calendar no está conectado.'}
          <TextLink to={paths.connections}>
            Configurar conexión
          </TextLink>
        </Alert>
      )}

      {error && connected && (
        <Alert tone="danger">{error}</Alert>
      )}

      <div className="agenda-layout agenda-layout--managed">
        <section className="agenda-week">
          <div className="agenda-toolbar">
            <button
              type="button"
              className="flow-arrow-button"
              aria-label="Semana anterior"
              onClick={() =>
                setQuery({ dia: shiftDate(week, -7) })
              }
            >
              <FiChevronLeft />
            </button>

            <button
              type="button"
              className="flow-arrow-button"
              aria-label="Semana siguiente"
              onClick={() =>
                setQuery({ dia: shiftDate(week, 7) })
              }
            >
              <FiChevronRight />
            </button>

            <strong>
              {dateLabel(week, {
                weekday: undefined,
                year: undefined,
              })}
              {' — '}
              {dateLabel(days[6], {
                weekday: undefined,
              })}
            </strong>

            <span>Semana</span>
          </div>

          {loadingEvents ? (
            <div className="flow-surface" role="status">
              <Spinner />
              <p>Consultando eventos de Google Calendar…</p>
            </div>
          ) : (
            <div className="agenda-scroll">
              <div className="agenda-canvas">
                <div className="agenda-days">
                  <span>UTC−4</span>

                  {days.map((day, index) => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => setQuery({ dia: day })}
                      className={`
                        ${selectedDay === day ? 'is-selected' : ''}
                        ${index > 4 ? 'is-weekend' : ''}
                      `}
                      aria-pressed={selectedDay === day}
                    >
                      <span>
                        {dateLabel(day, {
                          weekday: 'short',
                          day: undefined,
                          month: undefined,
                          year: undefined,
                        }).toUpperCase()}
                      </span>

                      <strong>{Number(day.slice(-2))}</strong>
                    </button>
                  ))}
                </div>

                <div
                  className="agenda-grid"
                  style={{
                    height: (lastHour - firstHour) * rowHeight,
                  }}
                >
                  <div className="agenda-time-labels">
                    {Array.from(
                      { length: lastHour - firstHour + 1 },
                      (_, hour) => (
                        <span
                          key={hour}
                          style={{ top: hour * rowHeight }}
                        >
                          {String(hour + firstHour).padStart(2, '0')}:00
                        </span>
                      ),
                    )}
                  </div>

                  {days.map((day, index) => (
                    <div
                      className="agenda-day-column"
                      key={day}
                    >
                      {Array.from(
                        { length: lastHour - firstHour + 1 },
                        (_, hour) => (
                          <span
                            className="agenda-hour-rule"
                            key={hour}
                            style={{ top: hour * rowHeight }}
                          />
                        ),
                      )}

                      {daySegments[index].map(
                        ({
                          event,
                          startMinute,
                          endMinute,
                          column,
                          columns,
                        }) => {
                          const height =
                            ((endMinute - startMinute) / 60) *
                            rowHeight;

                          return (
                            <button
                              type="button"
                              className="agenda-event"
                              key={event.id}
                              style={{
                                top:
                                  ((startMinute - firstHour * 60) /
                                    60) *
                                  rowHeight,
                                height: Math.max(height, 20),
                                left: `calc(${column * 100 / columns}% + 4px)`,
                                width: `calc(${100 / columns}% - 8px)`,
                              }}
                              aria-label={`${event.title}, ${rangeLabel({
                                start: event.start,
                                end: event.end,
                              })}`}
                              onClick={() => {
                                setQuery({
                                  dia: day,
                                  evento: event.id,
                                });
                              }}
                            >
                              <strong>{event.title}</strong>

                              {height >= 40 && (
                                <small>
                                  {rangeLabel({
                                    start: event.start,
                                    end: event.end,
                                  })}
                                </small>
                              )}
                            </button>
                          );
                        },
                      )}
                    </div>
                  ))}
                </div>

                <div className="agenda-legend">
                  <span>
                    <i />
                    Evento de Google Calendar
                  </span>

                  <small>America/La_Paz · UTC−4</small>
                </div>
              </div>
            </div>
          )}
        </section>

        <aside className="agenda-aside">
          <p className="ui-eyebrow">DÍA SELECCIONADO</p>

          <h2>
            {dateLabel(selectedDay, {
              month: undefined,
              year: undefined,
            })}
            .
          </h2>

          <span className="agenda-month">
            {dateLabel(selectedDay, {
              weekday: undefined,
              day: undefined,
            })}
          </span>

          <section>
            {focused ? (
              <>
                <StatusDot
                  tone={
                    focused.syncStatus === 'synced'
                      ? 'success'
                      : focused.syncStatus === 'sync_error'
                        ? 'danger'
                        : 'warning'
                  }
                >
                  {focused.syncStatus === 'synced'
                    ? 'Sincronizado'
                    : focused.syncStatus === 'sync_error'
                      ? 'Error de sincronización'
                      : 'Sincronización pendiente'}
                </StatusDot>

                <time>
                  {rangeLabel({
                    start: focused.start,
                    end: focused.end,
                  })}
                </time>

                <h3>{focused.title}</h3>

                {focused.description && (
                  <p>{focused.description}</p>
                )}

                {focused.location && (
                  <p>{focused.location}</p>
                )}

                <button
                  type="button"
                  className="flow-link"
                  onClick={() => openEvent(focused)}
                >
                  Ver y editar evento
                  <FiArrowRight />
                </button>
              </>
            ) : (
              <>
                <StatusDot tone="muted">Tu agenda</StatusDot>

                <h3>
                  {loadingEvents
                    ? 'Cargando agenda.'
                    : 'Tiempo disponible.'}
                </h3>

                <p>
                  {loadingEvents
                    ? 'Estamos consultando tus eventos.'
                    : 'No hay eventos para este día.'}
                </p>
              </>
            )}
          </section>

          {selectedEvents
            .filter(item => item.id !== focused?.id)
            .map(item => (
              <button
                type="button"
                className="agenda-other-event"
                key={item.id}
                onClick={() => openEvent(item)}
              >
                <time>
                  {rangeLabel({
                    start: item.startsAt,
                    end: item.endsAt,
                  })}
                </time>

                <strong>{item.title}</strong>

                <FiChevronRight />
              </button>
            ))}

          <div className="agenda-source">
            <ProviderIcon provider="google" />

            <div>
              Google Calendar
              <small>{calendarName}</small>
            </div>
          </div>

          {!connected && (
            <TextLink to={paths.connections}>
              Restablecer sincronización
            </TextLink>
          )}

          <p className="flow-note">
            <FiShield />
            Estás en tu agenda privada. Los cambios se guardan
            directamente en Google Calendar.
          </p>

          <TextLink to={paths.requests}>
            Ver solicitudes
          </TextLink>
        </aside>
      </div>

      {action === 'crear' && (
        <CalendarEventEditor
          initialDate={selectedDay}
          calendarName={calendarName}
          onClose={closeModal}
          onSaved={saved}
        />
      )}

      {openedEvent && action === 'editar' && (
        <CalendarEventEditor
          key={openedEvent.id}
          event={openedEvent}
          initialDate={selectedDay}
          calendarName={calendarName}
          onClose={() =>
            setQuery({
              dia: selectedDay,
              evento: openedEvent.id,
            })
          }
          onSaved={saved}
        />
      )}

      {openedEvent && action === 'eliminar' && (
        <DeleteCalendarEvent
          event={openedEvent}
          onClose={() =>
            setQuery({
              dia: selectedDay,
              evento: openedEvent.id,
            })
          }
          onDeleted={deleted}
        />
      )}

      {openedEvent && !action && (
        <CalendarEventDetails
          event={openedEvent}
          calendarName={calendarName}
          onClose={closeModal}
          onEdit={() => eventAction('editar')}
          onDelete={() => eventAction('eliminar')}
        />
      )}

      {query.has('evento') && !openedEvent && !action && (
        <Dialog
          open
          onOpenChange={closeModal}
          title="Evento no disponible"
          footer={
            <Button onClick={closeModal}>
              Volver a la agenda
            </Button>
          }
        >
          <p>
            El evento ya no está disponible en el calendario
            seleccionado.
          </p>
        </Dialog>
      )}
    </MemberShell>
  );
}
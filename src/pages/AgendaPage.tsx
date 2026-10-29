import { useSearchParams } from 'react-router';
import { FiArrowRight, FiCheck, FiChevronLeft, FiChevronRight, FiShield, FiVideo } from 'react-icons/fi';
import { MemberShell } from '../components/features/flows/FlowShell';
import { TextLink, StatusDot } from '../components/features/flows/FlowPrimitives';
import { MeetingDetails } from '../components/features/flows/MeetingDetails';
import { CalendarEventDetails, CalendarEventEditor, DeleteCalendarEvent } from '../components/features/calendar/CalendarEventDialogs';
import { Dialog } from '../components/modals';
import { Button, SectionHeading, ProviderIcon } from '../components/ui';
import { useMockFlow } from '../contexts/MockFlowContext';
import { paths, flowPaths } from '../constants/paths';
import { DEMO_TODAY, calendarMeetings, type CalendarEvent } from '../mocks/flow';
import { calendarDaySegments, dateKey, dateLabel, isDateKey, rangeLabel, shiftDate, weekStart } from '../utils/calendar';
import { calendars } from '../mocks/account';

/*
CONTRATO BACKEND PROPUESTO — AGENDA PRIVADA
Proteger /agenda con sesión. El calendario debe pertenecer al usuario autenticado.
GET /api/v1/calendar/events?calendarId=personal&from=2026-10-26T04:00:00Z&to=2026-11-02T04:00:00Z
Body: ninguno. from incluido, to excluido, ambos ISO 8601.
Respuesta JSON 200:
{
  "data": {
    "timeZone": "America/La_Paz", "calendar": { "id": "personal", "name": "Personal" },
    "events": [{ "id": "personal-work", "calendarId": "personal", "title": "Trabajo personal", "description": "Organizar el trabajo individual.", "start": "2026-10-26T09:00:00-04:00", "end": "2026-10-26T10:00:00-04:00", "canEdit": true, "meetUrl": null, "version": 1 }],
    "meetings": [{ "id": "meeting-review", "calendarId": "personal", "title": "Revisión de arquitectura", "description": "Revisar la integración de servicios.", "guestName": "Elena Vega", "guestEmail": "elena.vega@correo.com", "start": "2026-10-28T10:30:00-04:00", "end": "2026-10-28T11:00:00-04:00", "participantToken": "invitacion-opaca", "meetUrl": "https://meet.google.com/abc-defg-hij" }]
  }
}
Llenado: events -> bloques de Google y modales de crear/editar/eliminar;
meetings -> reuniones de Orbitia y su detalle. No mezclar calendarios ni tratar una
reunión como evento propio editable. canEdit decide si mostrar editar/eliminar.
Inicio/fin contienen zona; dibujar en timeZone y calcular duración con ambos valores.
Errores: 401 sin sesión; 403 calendario ajeno; 409 CALENDAR_AUTH_REQUIRED -> reconectar.
El CRUD de eventos se detalla en CalendarEventDialogs.tsx; no se llama a Google aquí.
*/
export default function AgendaPage() {
  const { state } = useMockFlow();
  const [query, setQuery] = useSearchParams();
  const latestAccepted = state.changes.find(change => change.status === 'accepted');
  const resourceId = query.get('evento') ?? query.get('reunion') ?? query.get('seleccion');
  const selectedResource = [...state.calendarEvents, ...state.meetings].find(item => item.id === resourceId);
  const selectedDay = isDateKey(query.get('dia')) ? query.get('dia')! : selectedResource ? dateKey(selectedResource.start) : latestAccepted ? dateKey(latestAccepted.start) : DEMO_TODAY;
  const week = weekStart(selectedDay);
  const days = Array.from({ length: 7 }, (_, index) => shiftDate(week, index));
  const calendarName = calendars.find(calendar => calendar.id === state.account.google.calendarId)?.name ?? 'Sin elegir';
  const personal = state.calendarEvents.filter(event => event.calendarId === state.account.google.calendarId);
  const events = [...personal.map(event => ({ ...event, kind: 'calendar' as const })), ...calendarMeetings(state).map(event => ({ ...event, kind: 'meeting' as const }))];
  const daySegments = days.map(day => calendarDaySegments(events, day));
  const allSegments = daySegments.flat();
  const firstHour = Math.floor(Math.min(9 * 60, ...allSegments.map(segment => segment.startMinute)) / 60);
  const lastHour = Math.ceil(Math.max(18 * 60, ...allSegments.map(segment => segment.endMinute)) / 60);
  const rowHeight = 44;
  const selectedEvents = calendarDaySegments(events, selectedDay).map(item => item.event);
  const focused = selectedEvents.find(item => item.id === (query.get('seleccion') ?? query.get('evento') ?? query.get('reunion'))) ?? selectedEvents[0];
  const openedMeeting = state.meetings.find(item => item.id === query.get('reunion'));
  const openedEvent = personal.find(item => item.id === query.get('evento'));
  const action = query.get('accion');
  const result = query.get('resultado');
  function closeModal() { setQuery({ dia: selectedDay, ...(focused ? { seleccion: focused.id } : {}) }); }
  function openEvent(event: typeof events[number]) { setQuery({ dia: selectedDay, [event.kind === 'meeting' ? 'reunion' : 'evento']: event.id }); }
  function eventAction(value: string) { setQuery({ dia: selectedDay, ...(openedEvent ? { evento: openedEvent.id } : {}), accion: value }); }
  function saved(event: CalendarEvent, created: boolean) { setQuery({ dia: dateKey(event.start), seleccion: event.id, resultado: created ? 'creado' : 'actualizado' }); }

  return <MemberShell><SectionHeading title="Tu tiempo, en una órbita" eyebrow="MI ESPACIO / AGENDA" accentPeriod actions={<><TextLink to={state.account.publicLinkEnabled ? flowPaths.availability(state.profile.handle) : paths.profileLink}>{state.account.publicLinkEnabled ? 'Ver disponibilidad pública' : 'Gestionar enlace público'}</TextLink><Button onClick={() => eventAction('crear')} trailingIcon={<FiArrowRight />}>Crear evento</Button></>} />
    
    <div className="agenda-context-line">{result ? <p className="agenda-event-feedback" role="status"><FiCheck />{result === 'eliminado' ? 'Evento eliminado. La disponibilidad se ha actualizado.' : focused ? `${focused.title} ${result === 'creado' ? 'se creó' : 'se actualizó'} en Google Calendar · ${dateLabel(focused.start, { weekday: 'long', day: 'numeric', month: undefined, year: undefined })}, ${rangeLabel(focused)}.` : 'Agenda actualizada.'}</p> : <p className="agenda-calendar-label"><ProviderIcon provider="google" />Google Calendar · {calendarName}</p>}</div>
    <div className="agenda-layout agenda-layout--managed"><section className="agenda-week"><div className="agenda-toolbar"><button type="button" className="flow-arrow-button" aria-label="Semana anterior" onClick={() => setQuery({ dia: shiftDate(week, -7) })}><FiChevronLeft /></button><button type="button" className="flow-arrow-button" aria-label="Semana siguiente" onClick={() => setQuery({ dia: shiftDate(week, 7) })}><FiChevronRight /></button><strong>{dateLabel(week, { weekday: undefined, year: undefined })} — {dateLabel(days[6], { weekday: undefined })}</strong><span>Semana</span></div>
      <div className="agenda-scroll"><div className="agenda-canvas"><div className="agenda-days"><span>UTC−4</span>{days.map((day, index) => <button type="button" key={day} onClick={() => setQuery({ dia: day })} className={`${selectedDay === day ? 'is-selected' : ''} ${index > 4 ? 'is-weekend' : ''}`} aria-pressed={selectedDay === day}><span>{dateLabel(day, { weekday: 'short', day: undefined, month: undefined, year: undefined }).toUpperCase()}</span><strong>{Number(day.slice(-2))}</strong></button>)}</div>
        <div className="agenda-grid" style={{ height: (lastHour - firstHour) * rowHeight }}><div className="agenda-time-labels">{Array.from({ length: lastHour - firstHour + 1 }, (_, hour) => <span key={hour} style={{ top: hour * rowHeight }}>{String(hour + firstHour).padStart(2, '0')}:00</span>)}</div>
          {days.map((day, index) => <div className="agenda-day-column" key={day}>{Array.from({ length: lastHour - firstHour + 1 }, (_, hour) => <span className="agenda-hour-rule" key={hour} style={{ top: hour * rowHeight }} />)}{daySegments[index].map(({ event, startMinute, endMinute, column, columns }) => {
            const height = (endMinute - startMinute) / 60 * rowHeight;
            return <button type="button" className={`agenda-event ${event.kind === 'meeting' ? 'agenda-event--meeting' : ''}`} key={event.id} style={{ top: (startMinute - firstHour * 60) / 60 * rowHeight, height: Math.max(height, 20), left: `calc(${column * 100 / columns}% + 4px)`, width: `calc(${100 / columns}% - 8px)` }} aria-label={`${event.title}, ${dateLabel(event.start)}, ${rangeLabel(event)}`} onClick={() => setQuery({ dia: day, [event.kind === 'meeting' ? 'reunion' : 'evento']: event.id })}><strong>{event.title}</strong>{height >= 40 && <small>{rangeLabel(event)}</small>}</button>;
          })}</div>)}
        </div><div className="agenda-legend"><span><i />Reunión en Orbitia</span><span><i />Evento de Google Calendar</span><small>America/La_Paz · UTC−4</small></div>
      </div></div>
    </section><aside className="agenda-aside"><p className="ui-eyebrow">DÍA SELECCIONADO</p><h2>{dateLabel(selectedDay, { month: undefined, year: undefined })}.</h2><span className="agenda-month">{dateLabel(selectedDay, { weekday: undefined, day: undefined })}</span>
      <section>{focused ? <><StatusDot>{focused.kind === 'meeting' ? latestAccepted?.meetingId === focused.id ? 'Cambio aceptado' : 'Reunión confirmada' : focused.canEdit ? 'Evento propio' : 'Evento de Google Calendar'}</StatusDot><time>{rangeLabel(focused)}</time><h3>{focused.title}</h3><p>{focused.kind === 'meeting' ? `Con ${focused.guestName}` : `Organizador: ${state.profile.name} ${state.profile.firstSurname}`}</p>{focused.kind === 'meeting' ? <p><FiVideo />Google Meet</p> : result && focused.description ? <p>{focused.description}</p> : null}<button type="button" className="flow-link" onClick={() => openEvent(focused)}>{focused.kind === 'meeting' ? 'Ver reunión' : focused.canEdit ? 'Ver y editar evento' : 'Ver evento'}<FiArrowRight /></button></> : <><StatusDot tone="muted">Tu agenda</StatusDot><h3>Tiempo disponible.</h3><p>No hay eventos para este día.</p></>}</section>
      {selectedEvents.filter(item => item.id !== focused?.id).map(item => <button type="button" className="agenda-other-event" key={item.id} onClick={() => openEvent(item)}><time>{rangeLabel(item)}</time><strong>{item.title}</strong><FiChevronRight /></button>)}
      <div className="agenda-source"><ProviderIcon provider="google" /><div>Google Calendar<small>Calendario {calendarName}</small></div></div>{state.account.google.calendarStatus !== 'connected' && <TextLink to={`${paths.connections}?modal=${state.account.google.calendarStatus === 'reconnect' ? 'reconectar-google' : 'conectar-google'}`}>Restablecer sincronización</TextLink>}<p className="flow-note"><FiShield />Estás en tu agenda privada. Solo puedes modificar o eliminar los eventos para los que tienes permisos.</p><TextLink to={paths.requests}>Ver solicitudes</TextLink>
    </aside></div>
    {openedMeeting && <MeetingDetails meeting={openedMeeting} onClose={closeModal} />}
    {action === 'crear' && <CalendarEventEditor initialDate={selectedDay === DEMO_TODAY ? shiftDate(selectedDay, 1) : selectedDay} onClose={closeModal} onSaved={saved} />}
    {openedEvent && action === 'editar' && <CalendarEventEditor key={openedEvent.id} event={openedEvent} initialDate={selectedDay} onClose={() => setQuery({ dia: selectedDay, evento: openedEvent.id })} onSaved={saved} />}
    {openedEvent && action === 'eliminar' && <DeleteCalendarEvent event={openedEvent} onClose={() => setQuery({ dia: selectedDay, evento: openedEvent.id })} onDeleted={() => setQuery({ dia: selectedDay, resultado: 'eliminado' })} />}
    {openedEvent && !action && <CalendarEventDetails event={openedEvent} onClose={closeModal} onEdit={() => eventAction('editar')} onDelete={() => eventAction('eliminar')} />}
    {query.has('evento') && !openedEvent && <Dialog open onOpenChange={closeModal} title="Evento no disponible" footer={<Button onClick={closeModal}>Volver a la agenda</Button>}><p>El evento ya no está disponible en el calendario seleccionado.</p></Dialog>}
  </MemberShell>;
}

import { FiArrowRight, FiCalendar, FiClock, FiLink, FiRepeat, FiVideo } from 'react-icons/fi';
import { useNavigate } from 'react-router';
import { MemberShell } from '../components/features/flows/FlowShell';
import { TextLink, Person, StatusDot } from '../components/features/flows/FlowPrimitives';
import { Button, ProviderIcon, SectionHeading } from '../components/ui';
import { useMockFlow } from '../contexts/MockFlowContext';
import { useUI } from '../contexts/UIContext';
import { flowPaths, paths, publicProfilePath } from '../constants/paths';
import { dateKey, dateLabel, rangeLabel } from '../utils/calendar';
import { DEMO_TODAY, calendarMeetings } from '../mocks/flow';
import { calendars } from '../mocks/account';

/*
CONTRATO BACKEND PROPUESTO — PANEL PRINCIPAL
GET /api/v1/dashboard?timeZone=America%2FLa_Paz — sesión del titular; sin body.
Respuesta JSON 200:
{
  "data": {
    "date": "2026-10-26", "timeZone": "America/La_Paz", "calendarId": "personal", "calendarName": "Personal",
    "events": [{ "id": "event-1", "calendarId": "personal", "title": "Trabajo personal", "description": "Trabajo individual.", "start": "2026-10-26T09:00:00-04:00", "end": "2026-10-26T10:00:00-04:00", "canEdit": true, "meetUrl": null }],
    "meetings": [{ "id": "meeting-1", "calendarId": "personal", "title": "Revisión de arquitectura", "description": "Revisar la integración.", "guestName": "Elena Vega", "guestEmail": "elena.vega@correo.com", "start": "2026-10-28T10:30:00-04:00", "end": "2026-10-28T11:00:00-04:00", "meetUrl": "https://meet.google.com/abc-defg-hij", "participantToken": "invitacion-opaca" }],
    "requests": [{ "id": "request-1", "calendarId": "personal", "guestName": "Elena Vega", "guestEmail": "elena.vega@correo.com", "title": "Otra revisión", "message": "Coordinar avances.", "start": "2026-10-29T09:00:00-04:00", "end": "2026-10-29T09:30:00-04:00", "status": "pending" }],
    "changes": [{ "id": "change-1", "meetingId": "meeting-1", "originalStart": "2026-10-28T10:30:00-04:00", "originalEnd": "2026-10-28T11:00:00-04:00", "start": "2026-10-29T15:00:00-04:00", "end": "2026-10-29T15:30:00-04:00", "message": "Mover la revisión.", "status": "pending" }],
    "connections": { "google": { "calendarStatus": "connected" }, "github": { "dataConnected": true } },
    "publicLinkEnabled": true
  }
}
Llenado: saludo usa GET /profile; fecha usa date/timeZone, nunca una fecha fija.
Agenda filtra events/meetings por calendarId; incluir meetings referidas por changes
aunque sean de otro calendario para poder mostrar nombre y título de la pendiente.
Por resolver = requests pending + changes pending. Si no hay cambios pero sí solicitudes,
mostrar la primera solicitud y su enlace; "al día" solo cuando ambas listas estén vacías.
Nombre/título del cambio se obtienen de su meetingId, no de textos fijos.
Cada evento/reunión lleva a Agenda; cada pendiente a su revisión. 401 sin sesión.
Servicios desconectados se representan con sus estados, no como un error total del panel.
*/
export default function DashboardPage() {
  const { state } = useMockFlow();
  const { notify } = useUI();
  const navigate = useNavigate();
  const visibleMeetings = calendarMeetings(state).filter(item => dateKey(item.start) >= DEMO_TODAY).sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  const meeting = visibleMeetings[0];
  const changes = state.changes.filter(change => change.status === 'pending');
  const pendingRequests = state.requests.filter(request => request.status === 'pending');
  const pending = changes[0];
  const pendingMeeting = state.meetings.find(item => item.id === pending?.meetingId);
  const pendingBooking = pendingRequests[0];
  const pendingCount = changes.length + pendingRequests.length;
  const { google, github } = state.account;
  const calendarName = calendars.find(calendar => calendar.id === google.calendarId)?.name ?? 'Sin elegir';
  const calendarEvents = state.calendarEvents.filter(event => event.calendarId === google.calendarId).sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  const today = calendarEvents.find(event => dateKey(event.start) === DEMO_TODAY);
  const upcoming = calendarEvents.filter(event => dateKey(event.start) > DEMO_TODAY);
  const next = [...upcoming, ...visibleMeetings].sort((a, b) => Date.parse(a.start) - Date.parse(b.start))[0];
  async function share() {
    if (!state.account.publicLinkEnabled) { navigate(paths.profileLink); return; }
    try { await navigator.clipboard.writeText(`${window.location.origin}${publicProfilePath(state.profile.handle)}`); notify('Enlace copiado.', 'success'); }
    catch { notify('No se pudo copiar el enlace.', 'warning'); }
  }
  return <MemberShell><SectionHeading title={`Hola, ${state.profile.name}`} eyebrow="LUNES, 26 DE OCTUBRE DE 2026 · UTC−4" accentPeriod
    actions={<Button variant="secondary" onClick={share} trailingIcon={<FiArrowRight />}>Compartir mi perfil</Button>} />
    
    <div className="dashboard-summary dashboard-summary--today"><div><span>HOY · LUNES 26</span><strong>{today?.title ?? 'Sin eventos'} {today && <small>{rangeLabel(today)}</small>}</strong></div><div><span>PRÓXIMO EVENTO</span><strong>{next ? dateLabel(next.start, { day: 'numeric', weekday: 'long', month: undefined, year: undefined }) : 'Sin eventos próximos'} {next && <small>{rangeLabel(next)}</small>}</strong></div><div><span>POR RESOLVER</span><strong>{pendingCount} <small>solicitud{pendingCount === 1 ? '' : 'es'} pendiente{pendingCount === 1 ? '' : 's'}</small></strong></div></div>
    <div className="dashboard-columns"><section><div className="flow-section-heading"><h2>En tu agenda</h2><TextLink to={paths.agenda}>Ver calendario</TextLink></div>
      {upcoming[0] && <article className="dashboard-event dashboard-next-event"><div className="dashboard-date"><strong>{dateKey(upcoming[0].start).slice(-2)}</strong><span>{dateLabel(upcoming[0].start, { weekday: 'short', month: 'short', day: undefined, year: undefined })}</span></div><div>{next?.id === upcoming[0].id && <span className="dashboard-next-label">PRÓXIMO EVENTO</span>}<h3>{upcoming[0].title}</h3><p>{rangeLabel(upcoming[0])} &nbsp; · &nbsp; Google Calendar</p></div><TextLink to={`${paths.agenda}?dia=${dateKey(upcoming[0].start)}&evento=${encodeURIComponent(upcoming[0].id)}`} aria-label={`Ver ${upcoming[0].title}`}>{null}</TextLink></article>}
      {meeting && <article className="dashboard-featured"><div className="dashboard-date"><strong>{dateKey(meeting.start).slice(-2)}</strong><span>{dateLabel(meeting.start, { weekday: 'short', month: 'short', day: undefined, year: undefined })}</span></div><div><div className="flow-inline"><StatusDot>Confirmada</StatusDot><span><FiClock />{rangeLabel(meeting)}</span></div><h3>{meeting.title}</h3><p>{meeting.description}</p><div className="dashboard-attendees"><Person name={meeting.guestName} detail="" /><span>Con {meeting.guestName}</span><span><FiVideo />Google Meet</span></div></div><TextLink to={`${paths.agenda}?reunion=${meeting.id}`}>Ver reunión</TextLink></article>}
      {visibleMeetings.slice(1).map(item => <article className="dashboard-event" key={item.id}><div className="dashboard-date"><strong>{dateKey(item.start).slice(-2)}</strong><span>{dateLabel(item.start, { weekday: 'short', month: 'short', day: undefined, year: undefined })}</span></div><div><h3>{item.title}</h3><p>{rangeLabel(item)} · Con {item.guestName}</p></div><TextLink to={`${paths.agenda}?reunion=${item.id}`}>Ver reunión</TextLink></article>)}
      {upcoming.slice(1).map(event => <article className="dashboard-event" key={event.id}><div className="dashboard-date"><strong>{dateKey(event.start).slice(-2)}</strong><span>{dateLabel(event.start, { weekday: 'short', month: 'short', day: undefined, year: undefined })}</span></div><div><h3>{event.title}</h3><p>{rangeLabel(event)} &nbsp; · &nbsp; Google Calendar</p></div><TextLink to={`${paths.agenda}?dia=${dateKey(event.start)}&evento=${encodeURIComponent(event.id)}`} aria-label={`Ver ${event.title}`}>{null}</TextLink></article>)}
      <p className="flow-note"><FiCalendar />Fechas y horarios del calendario {calendarName} de Google.{google.calendarStatus !== 'connected' && ' La sincronización requiere autorización.'}</p>
    </section><aside className="dashboard-pending"><div className="flow-section-heading"><h2>Por resolver</h2><small>{changes.length + pendingRequests.length} pendiente{changes.length + pendingRequests.length === 1 ? '' : 's'}</small></div>
      {pending && pendingMeeting ? <><p className="dashboard-change-tag"><FiRepeat />CAMBIO DE HORARIO</p><h3>{pendingMeeting.guestName.split(' ')[0]} propone otro momento.</h3><p>{pendingMeeting.title}</p><div className="dashboard-compare"><div><span>HORARIO ACTUAL</span><strong>{dateLabel(pending.originalStart, { weekday: 'short', day: 'numeric', month: 'short', year: undefined })} · {rangeLabel({ start: pending.originalStart, end: pending.originalEnd })}</strong></div><FiArrowRight /><div><span>HORARIO PROPUESTO</span><strong>{dateLabel(pending.start, { weekday: 'short', day: 'numeric', month: 'short', year: undefined })} · {rangeLabel(pending)}</strong></div></div><p className="flow-note">El horario actual se mantiene hasta que aceptes el cambio.</p><TextLink className="ui-button ui-button--primary" to={flowPaths.reviewChange(pending.id)}>Revisar propuesta</TextLink><TextLink to={paths.changes}>Ver solicitudes de cambio</TextLink></> : pendingBooking ? <><p className="dashboard-change-tag"><FiCalendar />SOLICITUD DE REUNIÓN</p><h3>{pendingBooking.guestName.split(' ')[0]} quiere coordinar una reunión.</h3><p>{pendingBooking.title}</p><div className="flow-top-rule"><strong>{dateLabel(pendingBooking.start)}</strong><p>{rangeLabel(pendingBooking)}</p></div><TextLink className="ui-button ui-button--primary" to={flowPaths.reviewRequest(pendingBooking.id)}>Revisar solicitud</TextLink><TextLink to={paths.requests}>Ver solicitudes de reunión</TextLink></> : <><h3>Tu agenda está al día.</h3><p>No hay solicitudes ni cambios de horario pendientes.</p><TextLink to={paths.requests}>Ver solicitudes de reunión</TextLink></>}
      {pending && pendingRequests.length > 0 && <TextLink to={paths.requests}>{pendingRequests.length} solicitud{pendingRequests.length === 1 ? '' : 'es'} de reunión por revisar</TextLink>}
      <section className="dashboard-services"><div className="flow-section-heading"><h2>Servicios</h2><TextLink to={paths.connections}>Gestionar</TextLink></div><div><ProviderIcon provider="google" /><strong>Google Calendar</strong><span className={google.calendarStatus !== 'connected' ? 'needs-attention' : ''}>{google.calendarStatus === 'connected' ? 'Conectado' : google.calendarStatus === 'reconnect' ? 'Requiere reconexión' : 'Sin conectar'}</span><TextLink to={google.calendarStatus === 'connected' ? paths.connections : `${paths.connections}?modal=${google.calendarStatus === 'reconnect' ? 'reconectar-google' : 'conectar-google'}`} icon={null}>{google.calendarStatus === 'connected' ? 'Ver' : google.calendarStatus === 'reconnect' ? 'Reconectar' : 'Conectar'}</TextLink></div><div><ProviderIcon provider="github" /><strong>GitHub</strong><StatusDot tone={github.dataConnected ? 'success' : 'muted'}>{github.dataConnected ? 'Conectado' : 'Sin conectar'}</StatusDot>{!github.dataConnected && <TextLink to={`${paths.connections}?modal=conectar-github`} icon={null}>Conectar</TextLink>}</div></section>
    </aside></div><div className="dashboard-bottom"><div><FiLink /><div><h3>Tu perfil, listo para compartir.</h3><p>Revisa tu información pública y los horarios que pueden consultar.</p></div><TextLink to={publicProfilePath(state.profile.handle)}>Ver perfil público</TextLink></div><div><ProviderIcon provider="google" /><ProviderIcon provider="github" /><p>Consulta los proyectos y la actividad<br />que integraste en tu perfil.</p><TextLink to={github.dataConnected ? paths.githubInfo : paths.connections}>Ver datos de GitHub</TextLink></div></div>
  </MemberShell>;
}

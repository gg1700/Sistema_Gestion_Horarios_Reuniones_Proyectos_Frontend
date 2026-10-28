import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { FiArrowRight, FiClock, FiShield } from 'react-icons/fi';
import { MemberShell } from '../components/features/flows/FlowShell';
import { Person, StatusDot, TextLink, TimeSummary } from '../components/features/flows/FlowPrimitives';
import { Alert, Button, DataTable, EmptyState, SectionHeading } from '../components/ui';
import { Dialog } from '../components/modals';
import { ConnectionDialogs } from '../components/features/connections/ConnectionDialogs';
import { useMockFlow } from '../contexts/MockFlowContext';
import { paths, flowPaths } from '../constants/paths';
import { dateLabel, newMockId, rangeLabel } from '../utils/calendar';
import { calendarReady, type BookingRequest, type ScheduleChange } from '../mocks/flow';
import { calendars } from '../mocks/account';

/*
CONTRATO BACKEND PROPUESTO — SOLICITUDES DEL PROPIETARIO
Proteger /solicitudes y sus rutas hijas con sesión. No aceptar userId en el body.
GET /api/v1/meeting-requests — sin body; devolver también aceptadas y rechazadas.
Respuesta JSON 200:
{ "data": [{ "id": "request-1", "calendarId": "personal", "title": "Revisión de arquitectura", "message": "Revisar la integración.", "guestName": "Elena Vega", "guestEmail": "elena.vega@correo.com", "start": "2026-10-28T14:00:00-04:00", "end": "2026-10-28T14:30:00-04:00", "status": "pending", "meetingId": null, "version": 1 }] }
GET /api/v1/meeting-requests/request-1 devuelve ese mismo objeto dentro de data.
Llenado: una fila por id; pending -> Revisar; accepted -> Ver reunión con meetingId;
rejected -> Ver detalle. Seleccionar una resuelta no vuelve a habilitar decisiones.

PATCH /api/v1/meeting-requests/request-1
Request JSON:
{ "decision": "accepted", "version": 1 }
Respuesta JSON 200:
{ "data": { "requestId": "request-1", "status": "accepted", "version": 2, "meetingId": "meeting-1", "participantUrl": "/reuniones/invitacion-opaca" } }
decision solo accepted o rejected. Para rejected: meetingId y participantUrl son null.
Al aceptar, cargar GET /api/v1/meetings/meeting-1 y abrir el detalle en Agenda.
El servidor genera id, invitación y Meet; no recibirlos del cliente. Confirmación atómica:
estado pendiente, mismo calendario seleccionado, autorización Google y bloque libre.
Rechazar no requiere conexión Calendar. 401 sin sesión; 404 recurso ajeno/inexistente;
409 CALENDAR_AUTH_REQUIRED -> modal autorizar; CALENDAR_SELECTION_CHANGED -> elegir
calendario; SLOT_UNAVAILABLE -> mantener solicitud y permitir rechazar; NOT_PENDING ->
recargar detalle. 422 decision inválida. No cerrar modal si falla.

GET /api/v1/schedule-changes — sin body; solicitudes de cambio del propietario.
Respuesta JSON 200:
{ "data": [{ "id": "change-1", "meetingId": "meeting-1", "originalStart": "2026-10-28T10:30:00-04:00", "originalEnd": "2026-10-28T11:00:00-04:00", "start": "2026-10-29T15:00:00-04:00", "end": "2026-10-29T15:30:00-04:00", "message": "¿Podemos mover la revisión?", "status": "pending", "version": 1, "meeting": { "id": "meeting-1", "calendarId": "personal", "title": "Revisión de arquitectura", "guestName": "Elena Vega", "guestEmail": "elena.vega@correo.com", "start": "2026-10-28T10:30:00-04:00", "end": "2026-10-28T11:00:00-04:00" } }] }
Usar meeting para nombre, correo, título, calendario y horario vigente; originalStart/
originalEnd son la fotografía de cuando se propuso, no valores a sobrescribir.
PATCH /api/v1/schedule-changes/change-1
Request JSON:
{ "decision": "rejected", "version": 1 }
Respuesta JSON 200:
{ "data": { "changeId": "change-1", "status": "rejected", "version": 2, "meetingId": "meeting-1" } }
Después abrir el resultado y cargar su GET, documentado en ChangeResultPage.tsx.
Aceptar reemplaza horario; rechazar lo conserva. Mismas validaciones/errores que arriba.
*/
export default function RequestsPage() {
  const { state, dispatch } = useMockFlow();
  const { pathname } = useLocation();
  const { requestId, changeId } = useParams();
  const [query] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [connectionModal, setConnectionModal] = useState<string | null>(null);
  const isChanges = pathname.startsWith(paths.changes);
  const requests = isChanges ? state.changes : state.requests;
  const focusedId = requestId ?? changeId ?? query.get('resuelta');
  const focused = requests.find(item => item.id === focusedId) ?? requests.find(item => item.status === 'pending') ?? requests[0];
  const meeting = isChanges ? state.meetings.find(item => item.id === (focused as ScheduleChange)?.meetingId) : undefined;
  const booking = focused as BookingRequest | undefined;
  const change = focused as ScheduleChange | undefined;
  const guestName = isChanges ? meeting?.guestName ?? 'Participante' : booking?.guestName ?? '';
  const guestEmail = isChanges ? meeting?.guestEmail ?? '' : booking?.guestEmail ?? '';
  const title = isChanges ? meeting?.title ?? '' : booking?.title ?? '';
  const dialogOpen = Boolean((requestId || changeId) && focused?.id === focusedId && focused.status === 'pending');
  const listPath = isChanges ? paths.changes : paths.requests;
  const targetCalendarId = isChanges ? meeting?.calendarId : booking?.calendarId;
  const targetCalendarName = calendars.find(item => item.id === targetCalendarId)?.name ?? targetCalendarId;
  const connected = calendarReady(state);
  const correctCalendar = targetCalendarId === state.account.google.calendarId;
  const canAccept = connected && correctCalendar;
  const explanationNote = isChanges
    ? focused?.status === 'pending' ? 'El horario confirmado se conserva hasta que aceptes el cambio.' : focused?.status === 'accepted' ? 'La propuesta se aceptó. Aquí se conserva el horario resultante de esa decisión.' : 'La propuesta se rechazó y se conservó el horario confirmado de aquel momento.'
    : focused?.status === 'rejected' ? 'La solicitud se rechazó. No se creó una reunión para este horario.' : focused?.status === 'accepted' ? 'La solicitud se aceptó y se creó su reunión.' : 'La solicitud se convierte en una reunión cuando la aceptas.';
  const explanationRange = isChanges && change ? focused?.status === 'pending' ? meeting ?? change : focused?.status === 'accepted' ? change : { start: change.originalStart, end: change.originalEnd } : focused;
  useEffect(() => { setError(''); }, [focused?.id, isChanges]);

  function decide(decision: 'accepted' | 'rejected') {
    if (!focused) return;
    try {

      if (isChanges) {
        dispatch({ type: 'decide-change', id: focused.id, decision });
        navigate(flowPaths.changeResult(focused.id));
      } else {
        const meetingId = newMockId('meeting');
        dispatch({ type: 'decide-booking', id: focused.id, decision, meetingId, participantToken: newMockId('mock-invitacion') });
        navigate(decision === 'accepted' ? `${paths.agenda}?reunion=${meetingId}` : `${paths.requests}?resuelta=${focused.id}`);
      }
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'No se pudo resolver la solicitud.'); }
  }

  return <MemberShell><SectionHeading title={isChanges ? 'Cambios de horario' : 'Solicitudes de reunión'} eyebrow="MI ESPACIO / SOLICITUDES" accentPeriod actions={<TextLink to={paths.agenda}>Ver agenda</TextLink>} />
    <nav className="requests-tabs" aria-label="Tipo de solicitudes"><NavLink to={paths.requests} end>Agendado</NavLink><NavLink to={paths.changes}>Cambios de horario</NavLink></nav>
    {focused?.status === 'rejected' && query.has('resuelta') && <p className="requests-notice"><FiShield />Solicitud rechazada. El horario no se ha añadido a tu agenda.</p>}
    <DataTable<BookingRequest | ScheduleChange> caption={isChanges ? 'Solicitudes de cambio de horario' : 'Solicitudes de reunión'} rows={requests} getRowKey={item => item.id} columns={[
      { id: 'person', heading: 'Persona', cell: item => {
        const person = 'guestName' in item ? { name: item.guestName, email: item.guestEmail } : state.meetings.find(event => event.id === item.meetingId);
        return <Person name={person && 'name' in person ? person.name : person && 'guestName' in person ? person.guestName : 'Participante'} detail={person && 'email' in person ? person.email : person && 'guestEmail' in person ? person.guestEmail : ''} />;
      } },
      { id: 'title', heading: 'Reunión', cell: item => <div className="requests-table-title"><strong>{'title' in item ? item.title : state.meetings.find(event => event.id === item.meetingId)?.title}</strong><small>{isChanges ? 'Cambio sobre una reunión confirmada' : 'Solicitud enviada desde tu disponibilidad pública'}</small></div> },
      { id: 'time', heading: isChanges ? 'Horario propuesto' : 'Horario solicitado', cell: item => <div className="requests-table-time">{dateLabel(item.start, { weekday: 'short', day: 'numeric', month: 'short', year: undefined })} · {rangeLabel(item)}<small>UTC−4 · La Paz</small></div> },
      { id: 'status', heading: 'Estado', cell: item => <StatusDot tone={item.status === 'pending' ? 'warning' : item.status === 'rejected' ? 'danger' : 'success'}>{item.status === 'pending' ? 'Pendiente' : item.status === 'rejected' ? 'Rechazada' : 'Aceptada'}</StatusDot> },
      { id: 'action', heading: <span className="ui-sr-only">Acción</span>, cell: item => item.status === 'pending' ? <TextLink to={isChanges ? flowPaths.reviewChange(item.id) : flowPaths.reviewRequest(item.id)}>Revisar</TextLink> : isChanges ? <TextLink to={flowPaths.changeResult(item.id)}>Ver resultado</TextLink> : 'meetingId' in item && item.meetingId ? <TextLink to={`${paths.agenda}?reunion=${item.meetingId}`}>Ver reunión</TextLink> : <TextLink to={`${paths.requests}?resuelta=${encodeURIComponent(item.id)}`}>Ver detalle</TextLink> },
    ]} />
    {focused ? <div className="requests-explanation"><section><p className="ui-eyebrow">{isChanges ? `LA PROPUESTA DE ${guestName.split(' ')[0].toUpperCase()}` : 'SOBRE ESTA SOLICITUD'}</p><h2>{isChanges ? `${guestName.split(' ')[0]} ${focused.status === 'pending' ? 'propone' : 'propuso'} un nuevo horario para una reunión confirmada.` : `${guestName.split(' ')[0]} ${focused.status === 'pending' ? 'quiere' : 'quiso'} coordinar una reunión contigo.`}</h2><blockquote>“{focused.message}”</blockquote><p className="flow-note flow-top-rule"><FiShield />{explanationNote}</p></section>
      <aside><TimeSummary range={explanationRange ?? focused} label={isChanges ? focused.status === 'pending' ? 'La reunión sigue confirmada para' : 'Horario resultante de esta decisión' : `Horario solicitado por ${guestName.split(' ')[0]}`} />
        {focused.status === 'pending' ? <TextLink to={isChanges ? flowPaths.reviewChange(focused.id) : flowPaths.reviewRequest(focused.id)}>{isChanges ? 'Revisar el cambio' : 'Revisar la solicitud'}</TextLink> : <TextLink to={paths.agenda}>Ver mi agenda</TextLink>}
      </aside></div> : <EmptyState title="Todo está al día" description="No hay solicitudes pendientes." />}
    {(requestId || changeId) && focused?.id !== focusedId && <Alert tone="warning">La solicitud ya no está disponible. Vuelve al listado.</Alert>}
    <Dialog open={dialogOpen} onOpenChange={open => { if (!open) navigate(listPath); }} title={isChanges ? `${guestName.split(' ')[0]} propone un cambio.` : 'Una nueva conexión.'} eyebrow={isChanges ? 'CAMBIO DE HORARIO' : 'SOLICITUD DE REUNIÓN'} size={isChanges ? 'large' : 'medium'} className={isChanges ? 'review-change-dialog' : 'review-request-dialog'}
      footer={<><Button variant="ghost" onClick={() => decide('rejected')}>{isChanges ? 'Rechazar cambio' : 'Rechazar'}</Button><Button variant="secondary" onClick={() => navigate(listPath)}>Volver</Button><Button disabled={!canAccept} onClick={() => decide('accepted')} trailingIcon={<FiArrowRight />}>{isChanges ? 'Aceptar cambio' : 'Aceptar solicitud'}</Button></>}>
      {focused && <>{error && <Alert tone="danger">{error}</Alert>}<StatusDot tone="warning">Pendiente de tu decisión</StatusDot><h3 className="request-dialog-title">{title}</h3><Person name={guestName} detail={guestEmail} />
        {!canAccept && <Alert tone="warning">{!connected ? 'Autoriza Google Calendar antes de aceptar. La solicitud seguirá pendiente.' : `Esta solicitud corresponde al calendario ${targetCalendarName}. Selecciónalo antes de aceptar.`}<Button size="small" variant="ghost" onClick={() => setConnectionModal(!connected ? state.account.google.calendarStatus === 'reconnect' ? 'reconectar-google' : 'conectar-google' : 'calendario')}>{!connected ? 'Autorizar calendario' : 'Elegir calendario'}</Button></Alert>}
        <div className={isChanges ? 'request-time-comparison' : 'request-single-time'}>{isChanges && change ? <><TimeSummary range={{ start: change.originalStart, end: change.originalEnd }} label="Horario confirmado" /><TimeSummary range={change} label="Horario propuesto" accent /></> : <TimeSummary range={focused} label="Horario solicitado" />}</div>
        <section className="request-message"><h4>Mensaje de {guestName.split(' ')[0]}</h4><p>{focused.message}</p></section><p className="flow-note"><FiClock />{isChanges ? 'Rechazar conserva el horario confirmado. Aceptar lo sustituye por la propuesta.' : 'Al aceptar, la reunión quedará confirmada en tu agenda.'}</p>
      </>}
    </Dialog>
    <ConnectionDialogs modal={connectionModal} onClose={() => setConnectionModal(null)} onNext={setConnectionModal} />
  </MemberShell>;
}

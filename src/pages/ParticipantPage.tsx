import { useState, type FormEvent } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { FiArrowLeft, FiArrowRight, FiCalendar, FiClock, FiRepeat } from 'react-icons/fi';
import { VisitorShell } from '../components/features/flows/FlowShell';
import { Person, StatusDot, TextLink, TimeSummary } from '../components/features/flows/FlowPrimitives';
import { MeetingDetails } from '../components/features/flows/MeetingDetails';
import { Dialog } from '../components/modals';
import { Alert, Button, ButtonLink, EmptyState, Input, SectionHeading, Textarea } from '../components/ui';
import { useMockFlow } from '../contexts/MockFlowContext';
import { paths, flowPaths } from '../constants/paths';
import { dateLabel, newMockId, rangeLabel, shiftDate } from '../utils/calendar';
import AvailabilityPage from './AvailabilityPage';

/*
CONTRATO BACKEND PROPUESTO — REUNIÓN Y CAMBIO DEL PARTICIPANTE
No requiere sesión del dueño. La autorización es el token opaco de esta invitación;
debe tener caducidad y permitir solo consultar esta reunión y proponer su cambio.
GET /api/v1/invitations/invitacion-opaca — sin body.
Respuesta JSON 200:
{ "data": { "meeting": { "id": "meeting-1", "title": "Revisión de arquitectura", "description": "Revisar servicios.", "ownerName": "Mateo Silva", "ownerHandle": "mateo-silva", "guestName": "Elena Vega", "guestEmail": "elena.vega@correo.com", "start": "2026-10-28T10:30:00-04:00", "end": "2026-10-28T11:00:00-04:00", "timeZone": "America/La_Paz", "meetUrl": "https://meet.google.com/abc-defg-hij" }, "changes": [{ "id": "change-1", "meetingId": "meeting-1", "originalStart": "2026-10-28T10:30:00-04:00", "originalEnd": "2026-10-28T11:00:00-04:00", "start": "2026-10-29T15:00:00-04:00", "end": "2026-10-29T15:30:00-04:00", "message": "¿Podemos mover la revisión?", "status": "pending" }] } }
Llenado: meeting -> detalle y Meet. Si changes tiene pending, "Ver propuesta pendiente"
abre ese resultado; no abre otro formulario. Sin pending, habilitar proponer horario.
No usar el id de reunión como sustituto del token ni devolver otras reuniones del dueño.

POST /api/v1/invitations/invitacion-opaca/schedule-changes
Request JSON:
{ "start": "2026-10-29T15:00:00-04:00", "end": "2026-10-29T15:30:00-04:00", "timeZone": "America/La_Paz", "message": "¿Podemos mover la revisión?" }
Respuesta JSON 201:
{ "data": { "id": "change-1", "meetingId": "meeting-1", "originalStart": "2026-10-28T10:30:00-04:00", "originalEnd": "2026-10-28T11:00:00-04:00", "start": "2026-10-29T15:00:00-04:00", "end": "2026-10-29T15:30:00-04:00", "message": "¿Podemos mover la revisión?", "status": "pending" } }
start/end obligatorios, distintos del horario vigente, fin posterior al inicio; message
opcional, hasta 1000 caracteres. El servidor toma originalStart/End de la reunión.
Proponer no mueve el evento. 409 si hay propuesta pendiente o bloque ocupado; conservar
formulario o abrir la propuesta ya existente. 404 token inválido/caducado; no revelar causas
privadas. Aceptar/rechazar pertenece al organizador, documentado en RequestsPage.tsx.
*/
export default function ParticipantPage() {
  const { state, dispatch } = useMockFlow();
  const { token } = useParams();
  const [query, setQuery] = useSearchParams();
  const navigate = useNavigate();
  const meeting = state.meetings.find(item => item.participantToken === token);
  const changes = state.changes.filter(change => change.meetingId === meeting?.id);
  const pending = changes.find(change => change.status === 'pending');
  const proposal = changes.find(change => change.id === query.get('propuesta')) ?? pending ?? changes[changes.length - 1];
  const [date, setDate] = useState(pending?.start.slice(0, 10) ?? (meeting ? shiftDate(meeting.start.slice(0, 10), 1) : '2026-10-29'));
  const [start, setStart] = useState(pending?.start.slice(11, 16) ?? '15:00');
  const [end, setEnd] = useState(pending?.end.slice(11, 16) ?? '15:30');
  const [message, setMessage] = useState(pending?.message ?? '¿Podemos mover la revisión al jueves por la tarde? Mantendríamos la misma duración y los mismos temas.');
  const [error, setError] = useState('');
  const proposing = query.has('proponer');


  function sendProposal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!meeting) return;
    const proposed = { start: `${date}T${start}:00-04:00`, end: `${date}T${end}:00-04:00` };
    try {
      // Un reenvío idéntico es idempotente. Otro cambio pendiente requiere 409,
      // no dos propuestas simultáneas que puedan aplicarse sobre el mismo horario.
      if (pending && pending.start === proposed.start && pending.end === proposed.end && pending.message === message.trim()) {
        setQuery({ propuesta: pending.id }); return;
      }
      const id = newMockId('change');
      dispatch({ type: 'propose-change', change: { id, meetingId: meeting.id, ...proposed, originalStart: meeting.start, originalEnd: meeting.end, message: message.trim(), status: 'pending' } });
      setQuery({ propuesta: id });
      setError('');
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Revisa el horario propuesto.'); }
  }
  if (!meeting) return <VisitorShell><EmptyState title="Reunión no disponible" description="Revisa el enlace personal de tu invitación." actions={<ButtonLink to={paths.home}>Volver a Orbitia</ButtonLink>} /></VisitorShell>;

  if (query.has('propuesta') && proposal) {
    const unresolved = proposal.status === 'pending';
    return <VisitorShell><SectionHeading title={unresolved ? 'Tu propuesta ya está enviada' : 'Tu propuesta ya fue revisada'} eyebrow="CAMBIO DE HORARIO" accentPeriod actions={<TextLink to={flowPaths.participant(token!)} icon={<FiArrowLeft />}>Volver a la reunión</TextLink>} />
      <section className="proposal-result"><span className="flow-outcome-icon"><FiRepeat /></span><StatusDot tone={unresolved ? 'warning' : proposal.status === 'accepted' ? 'success' : 'danger'}>{unresolved ? `Pendiente de ${state.profile.name}` : proposal.status === 'accepted' ? 'Cambio aceptado' : 'Cambio rechazado'}</StatusDot>
        <h2>{unresolved ? 'El cambio todavía no está confirmado.' : proposal.status === 'accepted' ? 'Tu nuevo horario está confirmado.' : 'El horario original sigue vigente.'}</h2><p>{unresolved ? `${state.profile.name} revisará tu propuesta. Hasta que la acepte, la reunión mantiene su horario original.` : 'Consulta el horario vigente en los datos de tu reunión.'}</p>
        <div className="proposal-result-comparison"><TimeSummary range={unresolved ? { start: proposal.originalStart, end: proposal.originalEnd } : meeting} label="Horario que sigue vigente" /><TimeSummary range={proposal} label="Tu propuesta" accent /></div>
        <p className="proposal-result-people"><strong>{meeting.title}</strong><span>{meeting.guestName} con {state.profile.name} {state.profile.firstSurname}</span></p><ButtonLink variant="secondary" to={flowPaths.participant(token!)}>Volver a mi reunión</ButtonLink>
      </section></VisitorShell>;
  }

  if (!proposing) return <AvailabilityPage overlay={<MeetingDetails meeting={meeting} participant onClose={() => navigate(flowPaths.availability(state.profile.handle))} onPropose={() => setQuery(pending ? { propuesta: pending.id } : { proponer: '1' })} />} />;

  return <VisitorShell><SectionHeading title={`Tu reunión con ${state.profile.name}`} eyebrow="REUNIÓN CONFIRMADA" accentPeriod actions={<TextLink to={flowPaths.participant(token!)} icon={<FiArrowLeft />}>Volver a la reunión</TextLink>} />
    <div className="participant-identity"><Person name={`${state.profile.name} ${state.profile.firstSurname}`} detail={`@${state.profile.handle}`} /></div><div className="participant-summary"><h2>{meeting.title}</h2><TimeSummary range={meeting} label="Horario confirmado" /><p>{meeting.guestName} · {meeting.guestEmail}</p></div>
    <Dialog open onOpenChange={open => { if (!open) setQuery({}); }} title="Propón otro horario." eyebrow="SOLICITAR CAMBIO DE HORARIO" size="large" className="propose-change-dialog"
      footer={<><Button variant="secondary" onClick={() => setQuery({})}>Cancelar</Button><Button type="submit" form="propose-form" trailingIcon={<FiArrowRight />}>Enviar propuesta</Button></>}>
      <p className="proposal-people">Solicita <strong>{meeting.guestName}</strong> a <strong>{state.profile.name} {state.profile.firstSurname}</strong></p>
      <div className="proposal-current"><FiCalendar /><div><span>Horario confirmado</span><strong>{dateLabel(meeting.start, { weekday: 'short', day: 'numeric', month: 'short', year: undefined })} · {rangeLabel(meeting)}</strong></div></div>
      <form id="propose-form" className="flow-form" onSubmit={sendProposal}>{error && <Alert tone="danger">{error}</Alert>}<div className="flow-fields flow-fields--three"><Input label="Nueva fecha" type="date" required autoFocus min="2026-10-26" value={date} onChange={event => setDate(event.target.value)} /><Input label="Inicio" type="time" required min="09:00" max="17:30" step={1800} value={start} onChange={event => setStart(event.target.value)} /><Input label="Fin" type="time" required min="09:30" max="18:00" step={1800} value={end} onChange={event => setEnd(event.target.value)} /></div>
        <Textarea label={`Mensaje para ${state.profile.name} (opcional)`} rows={3} maxLength={1000} value={message} onChange={event => setMessage(event.target.value)} />
      </form><p className="flow-note"><FiClock />Zona horaria: UTC−4 · La Paz. El horario actual se mantiene hasta que {state.profile.name} acepte.</p>
    </Dialog>
  </VisitorShell>;
}

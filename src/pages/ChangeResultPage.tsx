import { useParams } from 'react-router';
import { FiArrowRight, FiCheck, FiVideo, FiX } from 'react-icons/fi';
import { MemberShell } from '../components/features/flows/FlowShell';
import { Person, StatusDot, TimeSummary } from '../components/features/flows/FlowPrimitives';
import { ButtonLink, EmptyState, SectionHeading } from '../components/ui';
import { useMockFlow } from '../contexts/MockFlowContext';
import { flowPaths, paths } from '../constants/paths';
import { dateLabel, rangeLabel } from '../utils/calendar';

/*
CONTRATO BACKEND PROPUESTO — RESULTADO HISTÓRICO DE UN CAMBIO
GET /api/v1/schedule-changes/change-1 — sesión del organizador, sin body.
Respuesta JSON 200:
{ "data": { "change": { "id": "change-1", "meetingId": "meeting-1", "originalStart": "2026-10-28T10:30:00-04:00", "originalEnd": "2026-10-28T11:00:00-04:00", "start": "2026-10-29T15:00:00-04:00", "end": "2026-10-29T15:30:00-04:00", "message": "Mover la revisión.", "status": "accepted", "version": 2 }, "meeting": { "id": "meeting-1", "calendarId": "personal", "title": "Revisión de arquitectura", "description": "Revisar servicios.", "guestName": "Elena Vega", "guestEmail": "elena.vega@correo.com", "start": "2026-10-30T09:00:00-04:00", "end": "2026-10-30T10:00:00-04:00", "participantToken": "invitacion-opaca", "meetUrl": "https://meet.google.com/abc-defg-hij" } } }
Llenado: accepted -> horario histórico change.start/end; rejected -> originalStart/End.
meeting.start/end es el horario vigente, puede ser distinto por una decisión posterior.
En ese caso avisar y conservar ambos conceptos; el botón abre el horario vigente.
pending -> volver a revisar, no mostrar un resultado ficticio. 401 sin sesión;
404 cambio inexistente o de otro dueño. Los horarios de change son inmutables.
*/
export default function ChangeResultPage() {
  const { state } = useMockFlow();
  const { changeId } = useParams();
  const change = state.changes.find(item => item.id === changeId);
  const meeting = state.meetings.find(item => item.id === change?.meetingId);
  if (!change || !meeting || change.status === 'pending') return <MemberShell><EmptyState title="Revisa primero la propuesta" actions={<ButtonLink to={change ? flowPaths.reviewChange(change.id) : paths.changes}>Volver a cambios</ButtonLink>} /></MemberShell>;
  const accepted = change.status === 'accepted';
  const decidedRange = accepted ? { start: change.start, end: change.end } : { start: change.originalStart, end: change.originalEnd };
  const changedLater = decidedRange.start !== meeting.start || decidedRange.end !== meeting.end;
  return <MemberShell><SectionHeading title={changedLater ? 'Resultado del cambio de horario' : accepted ? 'El horario se ha actualizado' : 'El horario original se mantiene'} eyebrow="SOLICITUDES / CAMBIO DE HORARIO" accentPeriod />
    <div className="change-result-columns"><section><span className={`flow-outcome-icon ${accepted ? '' : 'flow-outcome-icon--declined'}`}>{accepted ? <FiCheck /> : <FiX />}</span><StatusDot tone={accepted ? 'success' : 'danger'}>{accepted ? 'Cambio aceptado' : 'Cambio rechazado'}</StatusDot><h2>{meeting.title}</h2><p>{changedLater ? accepted ? 'Esta propuesta fue aceptada. Aquí se conserva el horario resultante de aquella decisión.' : 'Esta propuesta fue rechazada. Aquí se conserva el horario que seguía confirmado en aquel momento.' : accepted ? `La reunión pasa al horario propuesto por ${meeting.guestName.split(' ')[0]}. El nuevo horario ya sustituye al anterior.` : `La propuesta de ${meeting.guestName.split(' ')[0]} se ha rechazado. La reunión sigue confirmada en su fecha y hora originales.`}</p><Person name={meeting.guestName} detail={meeting.guestEmail} /><ButtonLink to={`${paths.agenda}?reunion=${meeting.id}`} trailingIcon={<FiArrowRight />}>{changedLater ? 'Ver horario vigente' : accepted ? 'Ver agenda actualizada' : 'Ver reunión confirmada'}</ButtonLink></section>
      <aside><TimeSummary range={decidedRange} label={changedLater ? 'Horario resultante de esta decisión' : accepted ? 'Nuevo horario confirmado' : 'Horario confirmado'} accent={accepted} />{changedLater && <p className="flow-note">La reunión tuvo cambios posteriores. Consulta su horario vigente en la agenda.</p>}<p className="change-result-previous">{accepted ? 'Antes: ' : 'Propuesta no aplicada: '}<s>{dateLabel(accepted ? change.originalStart : change.start, { weekday: 'short', day: 'numeric', month: 'short', year: undefined })} · {rangeLabel(accepted ? { start: change.originalStart, end: change.originalEnd } : change)}</s></p><div className="change-result-meet"><FiVideo /><div><h3>Google Meet</h3><p>El enlace de la reunión sigue disponible.</p><a href={meeting.meetUrl} target="_blank" rel="noopener noreferrer">{meeting.meetUrl.replace('https://', '')}</a></div></div></aside>
    </div>
  </MemberShell>;
}

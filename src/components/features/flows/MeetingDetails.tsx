import { FiArrowRight, FiCalendar, FiClock, FiVideo } from 'react-icons/fi';
import { Dialog } from '../../modals';
import { Button, ButtonLink } from '../../ui';
import { Person, StatusDot } from './FlowPrimitives';
import { useMockFlow } from '../../../contexts/MockFlowContext';
import { flowPaths } from '../../../constants/paths';
import { dateLabel, rangeLabel } from '../../../utils/calendar';
import type { Meeting } from '../../../mocks/flow';
import { calendars } from '../../../mocks/account';

/*
CONTRATO BACKEND PROPUESTO — DETALLE PRIVADO DE REUNIÓN
GET /api/v1/meetings/meeting-1 — sesión del organizador; sin body.
Respuesta JSON 200:
{ "data": { "id": "meeting-1", "calendarId": "personal", "title": "Revisión de arquitectura", "description": "Revisar servicios.", "guestName": "Elena Vega", "guestEmail": "elena.vega@correo.com", "start": "2026-10-28T10:30:00-04:00", "end": "2026-10-28T11:00:00-04:00", "participantToken": "invitacion-opaca", "meetUrl": "https://meet.google.com/abc-defg-hij" } }
Llenado: título/descripción, invitados, intervalo y enlace. Duración = diferencia entre
end y start en minutos; no fijarla a 30. calendarId identifica su calendario real.
401 sin sesión; 404 reunión ajena/inexistente. La variante del participante NO usa este
endpoint privado: usa el GET por invitación comentado en ParticipantPage.tsx.
*/
export function MeetingDetails({ meeting, onClose, participant = false, onPropose }: {
  meeting: Meeting; onClose: () => void; participant?: boolean; onPropose?: () => void;
}) {
  const { state } = useMockFlow();
  const pendingChange = state.changes.find(change => change.meetingId === meeting.id && change.status === 'pending');
  const durationMinutes = Math.round((Date.parse(meeting.end) - Date.parse(meeting.start)) / 60_000);
  return <Dialog open onOpenChange={value => { if (!value) onClose(); }} title={`${meeting.title}.`} eyebrow="REUNIÓN / DETALLE" size="large" className="meeting-dialog"
    footer={<><Button variant="ghost" onClick={onClose}>{participant ? 'Ver disponibilidad' : 'Volver a la agenda'}</Button>{participant ?
      <Button variant="secondary" onClick={onPropose}>{pendingChange ? 'Ver propuesta pendiente' : 'Proponer cambio de horario'}</Button> :
      <ButtonLink variant="secondary" to={flowPaths.participant(meeting.participantToken)}>Vista del participante</ButtonLink>}</>}>
    <div className="flow-row-between"><StatusDot>Reunión confirmada</StatusDot><small>{durationMinutes} minutos</small></div>
    <div className="meeting-date"><p><FiCalendar />{dateLabel(meeting.start)}</p><p><FiClock />{rangeLabel(meeting)}<small>La Paz · UTC−4</small></p></div>
    <div className="meeting-people"><Person name={`${state.profile.name} ${state.profile.firstSurname}`} detail="Organizador" /><Person name={meeting.guestName} detail={participant ? 'Tu participación' : 'Participante'} /></div>
    <section className="meeting-description"><h3>Sobre la reunión</h3><p>{meeting.description}</p></section>
    {!participant && <p className="flow-note"><FiCalendar />Calendario {calendars.find(item => item.id === meeting.calendarId)?.name ?? meeting.calendarId}</p>}
    <div className="meeting-call"><div><span><FiVideo />Google Meet</span><small>{meeting.meetUrl.replace('https://', '')}</small></div>
      <a className="ui-button ui-button--primary ui-button--small" href={meeting.meetUrl} target="_blank" rel="noopener noreferrer">Unirse a la reunión<FiArrowRight /></a></div>
  </Dialog>;
}

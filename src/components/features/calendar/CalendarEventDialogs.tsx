import { useState, type FormEvent } from 'react';
import { FiArrowRight, FiCalendar, FiClock, FiLock, FiTrash2, FiVideo } from 'react-icons/fi';
import { Dialog } from '../../modals';
import { Alert, Button, Checkbox, Input, ProviderIcon, Textarea } from '../../ui';
import { StatusDot } from '../flows/FlowPrimitives';
import { useMockFlow } from '../../../contexts/MockFlowContext';
import { calendars } from '../../../mocks/account';
import { isRangeFree, type CalendarEvent } from '../../../mocks/flow';
import { dateKey, dateLabel, newMockId, rangeLabel, timeLabel } from '../../../utils/calendar';
import { ConnectionDialogs } from '../connections/ConnectionDialogs';

function CalendarIdentity({ calendarId }: { calendarId: string }) {
  const { state } = useMockFlow();
  return <div className="event-calendar-identity"><ProviderIcon provider="google" /><span>Google Calendar</span><strong>{calendars.find(item => item.id === calendarId)?.name ?? 'Sin elegir'}</strong><small>{state.profile.name} {state.profile.firstSurname}</small></div>;
}
function ConnectionRequired() {
  const { state } = useMockFlow();
  const [modal, setModal] = useState<string | null>(null);
  return <><Alert tone="warning">Autoriza Google Calendar para guardar los cambios. Tu borrador se conserva.<Button size="small" variant="ghost" onClick={() => setModal(state.account.google.calendarStatus === 'reconnect' ? 'reconectar-google' : 'conectar-google')}>Autorizar calendario</Button></Alert><ConnectionDialogs modal={modal} onClose={() => setModal(null)} onNext={setModal} /></>;
}

/*
CONTRATO BACKEND PROPUESTO — CREAR / EDITAR EVENTO
Sesión y permiso de escritura en el calendario. No admitir editar reuniones por esta vía.
POST /api/v1/calendar/events
Request JSON:
{ "calendarId": "personal", "title": "Preparar integración", "start": "2026-10-27T09:00:00-04:00", "end": "2026-10-27T10:00:00-04:00", "timeZone": "America/La_Paz", "description": "Revisar puntos pendientes.", "createMeet": false, "idempotencyKey": "operacion-unica" }
Respuesta JSON 201:
{ "data": { "id": "event-1", "calendarId": "personal", "title": "Preparar integración", "start": "2026-10-27T09:00:00-04:00", "end": "2026-10-27T10:00:00-04:00", "description": "Revisar puntos pendientes.", "canEdit": true, "meetUrl": null, "version": 1 } }

PATCH /api/v1/calendar/events/event-1
Request JSON:
{ "title": "Preparar integración", "start": "2026-10-27T09:30:00-04:00", "end": "2026-10-27T10:30:00-04:00", "description": "Revisar puntos pendientes.", "createMeet": true, "version": 1 }
Respuesta JSON 200:
{ "data": { "id": "event-1", "calendarId": "personal", "title": "Preparar integración", "start": "2026-10-27T09:30:00-04:00", "end": "2026-10-27T10:30:00-04:00", "description": "Revisar puntos pendientes.", "canEdit": true, "meetUrl": "https://meet.google.com/abc-defg-hij", "version": 2 } }
Llenado: usar el objeto devuelto para sustituir/agregar el bloque y seleccionar su día.
Obligatorios al crear: calendarId, title, start, end, timeZone, createMeet e idempotencyKey.
Fin posterior a inicio; título no vacío, hasta 150 caracteres. description es opcional.
En PATCH, omitidos se conservan. createMeet true crea/reutiliza Meet en servidor; false
quita la videollamada del evento. No construir URL Meet ni enviar canEdit desde frontend.
Errores: 401 sin sesión; 403 sin permiso; 404 evento inexistente; 409 si falta autorización
o cambió version; 422 campos inválidos. Mantener borrador/modal abierto ante un error.
*/
export function CalendarEventEditor({ event, initialDate, onClose, onSaved }: { event?: CalendarEvent; initialDate: string; onClose: () => void; onSaved: (event: CalendarEvent, created: boolean) => void }) {
  const { state, dispatch } = useMockFlow();
  const [title, setTitle] = useState(event?.title ?? 'Preparar integración');
  const [start, setStart] = useState(event ? `${dateKey(event.start)}T${timeLabel(event.start)}` : `${initialDate}T09:00`);
  const [end, setEnd] = useState(event ? `${dateKey(event.end)}T${timeLabel(event.end)}` : `${initialDate}T10:00`);
  const [description, setDescription] = useState(event?.description ?? 'Revisar los puntos pendientes de integración de servicios.');
  const [meet, setMeet] = useState(Boolean(event?.meetUrl));
  const [error, setError] = useState('');
  const calendarId = event?.calendarId ?? state.account.google.calendarId ?? '';
  const writable = state.account.google.calendarStatus === 'connected' && Boolean(calendarId) && (!event || event.canEdit);
  function save(submit: FormEvent<HTMLFormElement>) {
    submit.preventDefault();
    const value: CalendarEvent = { id: event?.id ?? newMockId('event'), title, start: `${start}:00-04:00`, end: `${end}:00-04:00`, description, calendarId, canEdit: event?.canEdit ?? true, ...(meet ? { meetUrl: event?.meetUrl ?? 'https://meet.google.com/abc-defg-hij' } : {}) };
    try { dispatch({ type: 'save-calendar-event', event: value, create: !event }); onSaved(value, !event); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Revisa los datos del evento.'); }
  }
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }} title={event ? 'Editar evento.' : 'Crea un espacio en tu agenda.'} eyebrow={event ? 'GOOGLE CALENDAR / EDICIÓN' : 'GOOGLE CALENDAR / NUEVO EVENTO'} className="calendar-event-editor"
    footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button type="submit" form="calendar-event-form" disabled={!writable} trailingIcon={<FiArrowRight />}>{event ? 'Guardar cambios' : 'Crear evento'}</Button></>}>
    <CalendarIdentity calendarId={calendarId} />{event && !event.canEdit ? <Alert tone="warning">Este evento solo se puede consultar. No tienes permiso para modificarlo.</Alert> : !writable && <ConnectionRequired />}
    
    <form id="calendar-event-form" className="flow-form event-editor-form" onSubmit={save}>{error && <Alert tone="danger">{error}</Alert>}<Input label="Título del evento" required autoFocus maxLength={150} value={title} onChange={input => setTitle(input.target.value)} /><div className="flow-fields"><Input label="Inicio" type="datetime-local" required value={start} onChange={input => setStart(input.target.value)} /><Input label="Fin" type="datetime-local" required min={start} value={end} onChange={input => setEnd(input.target.value)} /></div><p className="event-timezone">America/La_Paz · UTC−4</p><Textarea label="Descripción (opcional)" rows={3} value={description} maxLength={4000} onChange={input => setDescription(input.target.value)} /><div className="event-meet-option"><Checkbox label={<><strong>Añadir enlace de Google Meet</strong><small>Para realizar este evento como reunión virtual.</small></>} checked={meet} onChange={input => setMeet(input.target.checked)} /><FiVideo /></div></form>
  </Dialog>;
}

/*
CONTRATO BACKEND — DETALLE DEL EVENTO
Usa el objeto events del GET documentado en AgendaPage.tsx. Para abrir un id directamente:
GET /api/v1/calendar/events/event-1 — sesión, sin body.
Respuesta JSON 200:
{ "data": { "id": "event-1", "calendarId": "personal", "title": "Trabajo personal", "description": "Organizar el trabajo individual.", "start": "2026-10-26T09:00:00-04:00", "end": "2026-10-26T10:00:00-04:00", "canEdit": true, "meetUrl": null, "version": 1 } }
canEdit false permite ver el detalle pero oculta editar y eliminar. 401 sin sesión;
404 si no existe o no es accesible para el usuario. No incluir este detalle en el GET público.
*/
export function CalendarEventDetails({ event, onClose, onEdit, onDelete }: { event: CalendarEvent; onClose: () => void; onEdit: () => void; onDelete: () => void }) {
  const { state } = useMockFlow();
  const calendar = calendars.find(item => item.id === event.calendarId)?.name ?? 'Personal';
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }} title={`${event.title.replace(/\.$/, '')}.`} eyebrow="GOOGLE CALENDAR / EVENTO" className="calendar-event-detail"
    footer={<>{event.canEdit && <Button variant="ghost" trailingIcon={<FiTrash2 />} onClick={onDelete}>Eliminar evento</Button>}<Button variant="secondary" onClick={onClose}>Volver</Button>{event.canEdit && <Button onClick={onEdit} trailingIcon={<FiArrowRight />}>Editar evento</Button>}</>}>
    <div className="event-detail-status"><StatusDot>{event.canEdit ? 'Evento propio' : 'Evento de Google Calendar'}</StatusDot><span><ProviderIcon provider="google" />Google Calendar · {calendar}</span></div>
    <dl className="event-detail-fields"><div><dt>Inicio</dt><dd>{dateLabel(event.start)}<br />{timeLabel(event.start)} · La Paz (UTC−4)</dd></div><div><dt>Fin</dt><dd>{dateLabel(event.end)}<br />{timeLabel(event.end)} · La Paz (UTC−4)</dd></div><div><dt>Organizador</dt><dd>{state.profile.name} {state.profile.firstSurname}</dd></div><div><dt>Calendario</dt><dd>{calendar}</dd></div></dl><section className="event-detail-description"><h3>Descripción</h3><p>{event.description || 'Sin descripción.'}</p></section>
    {event.meetUrl && <div className="event-detail-meet"><FiVideo /><span>Google Meet</span><a href={event.meetUrl} target="_blank" rel="noopener noreferrer">Unirse a la reunión <FiArrowRight /></a></div>}<p className="flow-note"><FiLock />Los detalles de este evento no se publican en tu disponibilidad.</p>
  </Dialog>;
}

/*
CONTRATO BACKEND PROPUESTO — ELIMINAR EVENTO
DELETE /api/v1/calendar/events/event-1 — sesión y permiso de escritura.
Request JSON:
{ "version": 2 }
Respuesta 204: sin cuerpo. Entonces quitar el bloque y recalcular disponibilidad.
El servidor elimina el evento de Google antes de confirmar. No borrar localmente si
falla: 401 sin sesión; 403 sin permiso; 404 ya no existe; 409 cambió version o requiere
autorizar Calendar. Los otros eventos del mismo horario se conservan.
*/
export function DeleteCalendarEvent({ event, onClose, onDeleted }: { event: CalendarEvent; onClose: () => void; onDeleted: () => void }) {
  const { state, dispatch } = useMockFlow();
  const [error, setError] = useState('');
  const calendar = calendars.find(item => item.id === event.calendarId)?.name ?? 'Personal';
  const writable = state.account.google.calendarStatus === 'connected' && event.canEdit;
  const releasesSlot = isRangeFree({ ...state, calendarEvents: state.calendarEvents.filter(item => item.id !== event.id) }, event);
  function remove() {
    try { dispatch({ type: 'delete-calendar-event', id: event.id }); onDeleted(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'No se pudo eliminar el evento.'); }

  }
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }} title="¿Eliminar este evento?" eyebrow="EVENTO PROPIO / ELIMINACIÓN" className="delete-event-dialog"
    footer={<><Button variant="secondary" onClick={onClose}>Conservar evento</Button><Button variant="danger" disabled={!writable} onClick={remove}>Eliminar evento</Button></>}>
    {error && <Alert tone="danger">{error}</Alert>}{!writable && <ConnectionRequired />}<p className="flow-copy">Este evento es tuyo y se eliminará del calendario <strong>{calendar}</strong> de Google Calendar.</p><section className="delete-event-summary"><h3>{event.title}</h3><p><FiCalendar />{dateLabel(event.start)}</p><p><FiClock />{rangeLabel(event)} · La Paz (UTC−4)</p></section><p className="flow-copy">{releasesSlot ? 'Ese bloque volverá a estar libre.' : 'Los otros eventos que coinciden con este horario se conservarán.'} La eliminación se aplicará también en Google Calendar.</p>
  </Dialog>;
}

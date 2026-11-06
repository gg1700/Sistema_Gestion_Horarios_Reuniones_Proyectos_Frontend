import { useState, type FormEvent, type ReactNode } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { FiArrowRight, FiCalendar, FiCheck, FiChevronLeft, FiChevronRight, FiClock, FiExternalLink, FiShield } from 'react-icons/fi';
import { VisitorShell } from '../components/features/flows/FlowShell';
import { Person, StatusDot, TextLink } from '../components/features/flows/FlowPrimitives';
import { Dialog } from '../components/modals';
import { Alert, Button, Input, SectionHeading, Textarea } from '../components/ui';
import { useMockFlow } from '../contexts/MockFlowContext';
import { OWNER_TIME_ZONE, isRangeFree, publicProfileAvailable, calendarReady } from '../mocks/flow';
import { PublicProfileUnavailable } from '../components/features/profile/PublicProfileUnavailable';
import { dateLabel, dateKey, isDateKey, rangeLabel, shiftDate } from '../utils/calendar';
import { createMeetingRequest } from '../api/meetingRequestsApi';
import { useMemberIdentity } from '../features/github/MemberIdentityContext';
import type { CreateMeetingRequestPayload, CreatedMeetingRequest } from '../types/meetingRequests';

const slotTimes = [['09:00', '09:30'], ['10:30', '11:00'], ['14:00', '14:30'], ['16:00', '16:30']];
/*
CONTRATO BACKEND PROPUESTO — DISPONIBILIDAD Y SOLICITUD DEL VISITANTE
Ruta pública, sin sesión. No exponer títulos, descripciones ni invitados de la agenda.
GET /api/v1/public/profiles/mateo-silva/availability?from=2026-10-01&to=2026-11-01
Body: ninguno; from incluido y to excluido son días en la zona del propietario.
Respuesta JSON 200:
{ "data": { "name": "Mateo Silva", "handle": "mateo-silva", "timeZone": "America/La_Paz", "available": true, "slots": [{ "start": "2026-10-28T09:00:00-04:00", "end": "2026-10-28T09:30:00-04:00", "available": true }, { "start": "2026-10-28T10:30:00-04:00", "end": "2026-10-28T11:00:00-04:00", "available": false }] } }
Llenado: agrupar slots por fecha para los puntos del mes; available del bloque controla
su selección. available general false -> slots [], aviso temporal y botón deshabilitado.
404 si perfil inexistente, eliminado o enlace inactivo; mismo mensaje para esos casos.

POST /api/v1/public/profiles/mateo-silva/meeting-requests
Request JSON:
{ "guestName": "Elena Vega", "guestEmail": "elena.vega@correo.com", "title": "Revisión de arquitectura", "message": "Revisar la integración.", "start": "2026-10-28T09:00:00-04:00", "end": "2026-10-28T09:30:00-04:00", "timeZone": "America/La_Paz" }
Respuesta JSON 201:
{ "data": { "id": "request-1", "receiptToken": "recibo-opaco", "title": "Revisión de arquitectura", "guestName": "Elena Vega", "guestEmail": "elena.vega@correo.com", "message": "Revisar la integración.", "start": "2026-10-28T09:00:00-04:00", "end": "2026-10-28T09:30:00-04:00", "status": "pending", "meeting": null } }
Nombre, correo válido, asunto e intervalo son obligatorios; message es opcional.
El servidor determina el calendario del dueño; no confiar en un calendarId del visitante.
Revalidar bloque libre/enlace activo/autorización, limitar abuso y no reservar el bloque
hasta que el dueño acepte. 409 bloque ocupado o duplicado; 422 validación; 429 exceso.

GET /api/v1/public/meeting-requests/recibo-opaco — sin body, protegido por receiptToken.
Respuesta JSON 200, por ejemplo después de aceptar:
{ "data": { "id": "request-1", "title": "Revisión de arquitectura", "guestName": "Elena Vega", "guestEmail": "elena.vega@correo.com", "start": "2026-10-28T09:00:00-04:00", "end": "2026-10-28T09:30:00-04:00", "status": "accepted", "meeting": { "participantUrl": "/reuniones/invitacion-opaca" } } }
Usar receiptToken en el enlace de seguimiento, nunca un id enumerable. Solo devuelve
esta solicitud; 404 token inválido/caducado. pending -> sin reunión; rejected -> sin
reunión; accepted -> habilitar "Ver mi reunión" con participantUrl devuelto.
*/
export default function AvailabilityPage({ overlay }: { overlay?: ReactNode }) {
  const { state } = useMockFlow();
  const member = useMemberIdentity();
  const { publicHandle } = useParams();
  const [query, setQuery] = useSearchParams();
  const today = dateKey(new Date().toISOString());
  const [selectedDate, setSelectedDate] = useState(
    isDateKey(query.get('fecha')) && query.get('fecha')! >= today
      ? query.get('fecha')!
      : today
  );
  const [month, setMonth] = useState(`${selectedDate.slice(0, 7)}-01`);
  const [chosenTime, setChosenTime] = useState('10:30');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [createdRequest, setCreatedRequest] =
    useState<CreatedMeetingRequest | null>(null);
  const [error, setError] = useState('');
  const first = new Date(`${month}T12:00:00Z`);
  const firstWeekDay = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0, 12)).getUTCDate();
  const gridDays = Array.from({ length: Math.ceil((daysInMonth + firstWeekDay) / 7) * 7 }, (_, index) => shiftDate(month, index - firstWeekDay));
  const isWeekday = (date: string) => ![0, 6].includes(new Date(`${date}T12:00:00Z`).getUTCDay());
  const slots = slotTimes.map(([start, end]) => ({ start: `${selectedDate}T${start}:00-04:00`, end: `${selectedDate}T${end}:00-04:00` }));
  const availabilityEnabled = calendarReady(state);
  const availableSlots = availabilityEnabled && isWeekday(selectedDate) && selectedDate >= today ? slots.filter(slot => isRangeFree(state, slot)) : [];
  const selected = availableSlots.find(slot => slot.start.includes(`T${chosenTime}:`)) ?? availableSlots[0];
  const ownerName = `${state.profile.name} ${state.profile.firstSurname}`;
  const isGuest = member?.error === 'Sesion no proporcionada';
  const identityReady =
    Boolean(member?.profile) || isGuest;

  function closeDialog() {
    setCreatedRequest(null);
    setQuery(current => {
      const next = new URLSearchParams(current);
      next.delete('solicitar');
      next.delete('solicitud');
      return next;
    });
  }
  function moveMonth(offset: number) { setMonth(new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + offset, 1, 12)).toISOString().slice(0, 10)); }
  async function sendRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !publicHandle || !identityReady || sending)
      return;

    try {
      setSending(true);
      setError('');
      const payload: CreateMeetingRequestPayload = {
        recipientHandle: publicHandle.replace(/^@/, ''),
        title: title.trim(),
        startsAt: new Date(selected.start).toISOString(),
        endsAt: new Date(selected.end).toISOString(),
        timeZone: OWNER_TIME_ZONE,
        ...(isGuest ? { guestName: name.trim(), guestEmail: email.trim(), } : {}),
        ...(message.trim() ? { message: message.trim() } : {}),
      };

      const result = await createMeetingRequest(payload);
      setCreatedRequest(result);
      setQuery({ fecha: selectedDate });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'No se pudo enviar la solicitud.');
    } finally {
      setSending(false);
    }
  }

  if (state.account.deleted || (!overlay && !publicProfileAvailable(state, publicHandle))) return <VisitorShell><PublicProfileUnavailable /></VisitorShell>;
  return <VisitorShell><SectionHeading title="Encuentra un momento para conectar" eyebrow="DISPONIBILIDAD PÚBLICA" accentPeriod />
    <div className="availability-identity"><Person name={ownerName} detail={`@${state.profile.handle}`} /><TextLink to={`/${encodeURIComponent(state.profile.handle)}`} icon={<FiExternalLink />}>Ver perfil</TextLink></div>
    {!availabilityEnabled && <Alert tone="info">Por ahora no se pueden solicitar horarios. Vuelve a consultar más tarde.</Alert>}
    <div className="availability-columns"><section className="availability-month"><header><h2>{dateLabel(month, { weekday: undefined, day: undefined })}</h2><div><button type="button" className="flow-arrow-button" aria-label="Mes anterior" onClick={() => moveMonth(-1)}><FiChevronLeft /></button><button type="button" className="flow-arrow-button" aria-label="Mes siguiente" onClick={() => moveMonth(1)}><FiChevronRight /></button></div></header>
      <div className="availability-calendar" aria-label="Elegir fecha"><div className="availability-weekdays">{['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map(day => <span key={day}>{day}</span>)}</div><div className="availability-days">
        {gridDays.map(day => {
          const currentMonth = day.slice(0, 7) === month.slice(0, 7);
          const selectable = currentMonth && day >= today;
          const hasAvailability = availabilityEnabled && selectable && isWeekday(day) && slotTimes.some(([start, end]) => isRangeFree(state, { start: `${day}T${start}:00-04:00`, end: `${day}T${end}:00-04:00` }));
          return <button type="button" key={day} className={`${selectedDate === day ? 'is-selected' : ''} ${day === today ? 'is-today' : ''}`} disabled={!selectable}
            aria-pressed={selectedDate === day} aria-label={dateLabel(day)} onClick={() => { setSelectedDate(day); setQuery({ fecha: day }); setError(''); }}>
            {Number(day.slice(-2))}{hasAvailability && <i aria-hidden="true" />}
          </button>;
        })}</div></div><div className="availability-calendar-legend"><span>• &nbsp; Día con horarios disponibles</span><span>La Paz · UTC−4</span></div>
      <p className="flow-note"><FiClock /><span>Los horarios se muestran en la zona de {state.profile.name}.<br />America/La_Paz · UTC−4</span></p>
    </section><aside className="availability-slots"><p className="ui-eyebrow">ELIGE UN HORARIO</p><h2>{dateLabel(selectedDate, { year: undefined })}.</h2><p>Consulta los espacios de este día.</p>
        <div className="availability-slot-list">{availabilityEnabled && isWeekday(selectedDate) && selectedDate >= today ? slots.map(slot => {
          const free = isRangeFree(state, slot);
          const isSelected = selected?.start === slot.start;
          return <button type="button" key={slot.start} disabled={!free} aria-pressed={isSelected} className={isSelected ? 'is-selected' : ''} onClick={() => { setChosenTime(slot.start.slice(11, 16)); setError(''); }}>
            {isSelected ? <FiCheck /> : <FiClock />}<span>{rangeLabel(slot)}</span><small>{free ? 'Disponible' : 'Ocupado'}</small>
          </button>;
        }) : <p className="availability-no-slots">{availabilityEnabled ? 'No hay espacios publicados para este día. Elige otra fecha.' : 'La disponibilidad está temporalmente deshabilitada.'}</p>}</div>
        <Button disabled={!selected} onClick={() => setQuery(current => { const next = new URLSearchParams(current); next.set('solicitar', '1'); return next; })} trailingIcon={<FiArrowRight />}>Solicitar este horario</Button>
        <p className="flow-note"><FiShield />Solo se muestra disponibilidad. Los títulos y detalles de la agenda de {state.profile.name} son privados.</p>
      </aside></div>
    {query.has('solicitar') && selected && (
      <Dialog
        open
        onOpenChange={open => {
          if (!open) closeDialog();
        }}
        title="Da el primer paso."
        eyebrow="SOLICITUD DE REUNIÓN"
        size="large"
        className="booking-dialog"
        footer={
          <>
            <Button variant="ghost" onClick={closeDialog}>
              Volver a horarios
            </Button>

            <Button
              type="submit"
              form="booking-form"
              loading={sending}
              disabled={!identityReady}
              trailingIcon={<FiArrowRight />}
            >
              Enviar solicitud
            </Button>
          </>
        }
      >
        <Person
          name={ownerName}
          detail={`Reunión con ${ownerName} · @${state.profile.handle}`}
        />

        <div className="booking-slot-summary">
          <p>
            <FiCalendar />
            {dateLabel(selected.start)}
          </p>

          <p>
            <FiClock />
            {rangeLabel(selected)}
            <small>La Paz · UTC−4</small>
          </p>
        </div>

        <form
          id="booking-form"
          className="flow-form"
          onSubmit={sendRequest}
        >
          {error && <Alert tone="danger">{error}</Alert>}

          {member?.loading ? (
            <p role="status">Comprobando tu sesión...</p>
          ) : member?.profile ? (
            <>
              <p className="flow-copy">
                Estás enviando esta solicitud con tu cuenta.
              </p>

              <Person
                name={`${member.profile.name} ${member.profile.firstSurname}`}
                detail={member.profile.email}
              />
            </>
          ) : isGuest ? (
            <div className="flow-fields">
              <Input
                label="Nombre y apellido"
                required
                maxLength={100}
                autoComplete="name"
                value={name}
                onChange={event => setName(event.target.value)}
              />

              <Input
                label="Correo electrónico"
                type="email"
                required
                maxLength={200}
                autoComplete="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
              />
            </div>
          ) : (
            <Alert tone="warning">
              No se pudo comprobar tu sesión. Reintenta antes de enviar la solicitud.

              <Button
                size="small"
                variant="secondary"
                onClick={() => member?.retry()}
              >
                Reintentar
              </Button>
            </Alert>
          )}

          <Input
            label="Asunto"
            required
            maxLength={100}
            value={title}
            onChange={event => setTitle(event.target.value)}
          />

          <Textarea
            label="Mensaje (opcional)"
            minLength={10}
            maxLength={2000}
            rows={3}
            value={message}
            onChange={event => setMessage(event.target.value)}
          />
        </form>

        <p className="flow-note">
          <FiClock />
          La reunión quedará pendiente hasta que {state.profile.name} acepte tu solicitud.
        </p>
      </Dialog>
    )}
    {createdRequest && (
      <Dialog
        open
        onOpenChange={open => {
          if (!open) closeDialog();
        }}
        title="Solicitud enviada."
        eyebrow="REUNIÓN / SOLICITUD RECIBIDA"
        className="booking-receipt-dialog"
        footer={
          <Button
            variant="secondary"
            onClick={closeDialog}
          >
            Volver a disponibilidad
          </Button>
        }
      >
        <span className="flow-outcome-icon">
          <FiCheck />
        </span>

        <h3>Tu solicitud ha sido registrada.</h3>

        <p className="flow-copy">
          El propietario del calendario podrá revisar tu solicitud.
          El horario todavía no está confirmado.
        </p>

        <div className="booking-receipt-summary">
          <StatusDot tone="warning">
            Pendiente de respuesta
          </StatusDot>

          <h3>{createdRequest.title}</h3>

          <p>
            <FiCalendar />
            {dateLabel(createdRequest.startsAt)}
          </p>

          <p>
            <FiClock />
            {rangeLabel({
              start: createdRequest.startsAt,
              end: createdRequest.endsAt,
            })}
          </p>
        </div>
      </Dialog>
    )}
    {overlay}
  </VisitorShell>;
}

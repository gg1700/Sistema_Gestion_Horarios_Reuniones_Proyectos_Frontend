import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';

import { useParams, useSearchParams } from 'react-router';

import {
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiExternalLink,
  FiShield,
} from 'react-icons/fi';

import { VisitorShell } from '../components/features/flows/FlowShell';
import {
  Person,
  StatusDot,
  TextLink,
} from '../components/features/flows/FlowPrimitives';

import { Dialog } from '../components/modals';

import {
  Alert,
  Button,
  Input,
  SectionHeading,
  Textarea,
} from '../components/ui';

import { PublicProfileUnavailable } from '../components/features/profile/PublicProfileUnavailable';

import { getPublicAvailability } from '../api/calendarAvailabilityApi';
import { createMeetingRequest } from '../api/meetingRequestsApi';

import { useMemberIdentity } from '../features/github/MemberIdentityContext';

import type {
  CreateMeetingRequestPayload,
  CreatedMeetingRequest,
} from '../types/meetingRequests';

import type {
  PublicAvailabilityData,
  PublicAvailabilitySlot,
} from '../types/calendarAvailability';

import { ApiError } from '../types/api';
import { isDateKey, shiftDate } from '../utils/calendar';

interface AvailabilityPageProps {
  overlay?: ReactNode;
}

function dateKeyInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const values: Record<string, string> = {};

  for (const part of parts) {
    if (part.type !== 'literal') {
      values[part.type] = part.value;
    }
  }

  return `${values.year}-${values.month}-${values.day}`;
}

function formatCalendarDate(date: string): string {
  return new Intl.DateTimeFormat('es-BO', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00.000Z`));
}

function formatMonth(date: string): string {
  return new Intl.DateTimeFormat('es-BO', {
    timeZone: 'UTC',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00.000Z`));
}

function formatSlotTime(
  slot: PublicAvailabilitySlot,
  timeZone: string,
): string {
  const formatter = new Intl.DateTimeFormat('es-BO', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  return `${formatter.format(new Date(slot.startsAt))} — ${formatter.format(new Date(slot.endsAt))}`;
}

function formatSlotDate(
  slot: PublicAvailabilitySlot,
  timeZone: string,
): string {
  return new Intl.DateTimeFormat('es-BO', {
    timeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(slot.startsAt));
}

function getMonthDays(month: string): string[] {
  const first = new Date(`${month}T12:00:00.000Z`);

  const firstWeekDay = (first.getUTCDay() + 6) % 7;

  const daysInMonth = new Date(
    Date.UTC(
      first.getUTCFullYear(),
      first.getUTCMonth() + 1,
      0,
      12,
    ),
  ).getUTCDate();

  const totalDays =
    Math.ceil((daysInMonth + firstWeekDay) / 7) * 7;

  return Array.from(
    { length: totalDays },
    (_, index) => shiftDate(month, index - firstWeekDay),
  );
}

function getNextMonth(month: string, offset: number): string {
  const current = new Date(`${month}T12:00:00.000Z`);

  return new Date(
    Date.UTC(
      current.getUTCFullYear(),
      current.getUTCMonth() + offset,
      1,
      12,
    ),
  ).toISOString().slice(0, 10);
}

export default function AvailabilityPage({
  overlay,
}: AvailabilityPageProps) {
  const member = useMemberIdentity();

  const { publicHandle } = useParams();
  const [query, setQuery] = useSearchParams();

  const initialDate = isDateKey(query.get('fecha'))
    ? query.get('fecha')!
    : dateKeyInTimeZone(new Date(), 'America/La_Paz');

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [month, setMonth] = useState(
    `${initialDate.slice(0, 7)}-01`,
  );

  const [availability, setAvailability] =
    useState<PublicAvailabilityData | null>(null);

  const [loadingAvailability, setLoadingAvailability] =
    useState(true);

  const [notFound, setNotFound] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');

  const [chosenStart, setChosenStart] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const [sending, setSending] = useState(false);

  const [createdRequest, setCreatedRequest] =
    useState<CreatedMeetingRequest | null>(null);

  const [error, setError] = useState('');

  const [availabilityRevision, setAvailabilityRevision] = useState(0);

  const isGuest =
    member?.error === 'Sesion no proporcionada';

  const identityReady =
    Boolean(member?.profile) || isGuest;

  const timeZone =
    availability?.timeZone ?? 'America/La_Paz';

  const today = dateKeyInTimeZone(new Date(), timeZone);

  /*
   * Carga únicamente el mes visible.
   * La fecha final es exclusiva: primer día del siguiente mes.
   */
  useEffect(() => {
    let active = true;

    async function loadAvailability() {
      if (!publicHandle) {
        setNotFound(true);
        setLoadingAvailability(false);
        return;
      }

      setLoadingAvailability(true);
      setAvailabilityError('');
      setNotFound(false);

      const from = month;
      const to = getNextMonth(month, 1);

      try {
        const result = await getPublicAvailability(
          publicHandle.replace(/^@/, ''),
          from,
          to,
        );

        if (active) {
          setAvailability(result);
        }
      } catch (failure) {
        if (!active) {
          return;
        }

        setAvailability(null);

        if (
          failure instanceof ApiError &&
          failure.statusCode === 404
        ) {
          setNotFound(true);
        } else {
          setAvailabilityError(
            failure instanceof Error
              ? failure.message
              : 'No se pudo consultar la disponibilidad.',
          );
        }
      } finally {
        if (active) {
          setLoadingAvailability(false);
        }
      }
    }

    void loadAvailability();

    return () => {
      active = false;
    };
  }, [publicHandle, month, availabilityRevision]);

  /*
   * Si el visitante no seleccionó una fecha en la URL,
   * ajustamos la fecha inicial a la zona horaria del propietario.
   */
  useEffect(() => {
    if (!availability || query.has('fecha')) {
      return;
    }

    const ownerToday = dateKeyInTimeZone(
      new Date(),
      availability.timeZone,
    );

    setSelectedDate(ownerToday);

    const ownerMonth = `${ownerToday.slice(0, 7)}-01`;

    if (ownerMonth !== month) {
      setMonth(ownerMonth);
    }

    setQuery({ fecha: ownerToday });
  }, [availability]);

  const gridDays = getMonthDays(month);

  const availableDateKeys = new Set(
    (availability?.slots ?? []).map(slot =>
      dateKeyInTimeZone(
        new Date(slot.startsAt),
        timeZone,
      ),
    ),
  );

  const selectedSlots = (availability?.slots ?? [])
    .filter(
      slot =>
        dateKeyInTimeZone(
          new Date(slot.startsAt),
          timeZone,
        ) === selectedDate,
    )
    .sort(
      (first, second) =>
        Date.parse(first.startsAt) -
        Date.parse(second.startsAt),
    );

  const selectedSlot =
    selectedSlots.find(slot => slot.startsAt === chosenStart) ??
    selectedSlots[0];

  const ownerName = availability
    ? `${availability.name} ${availability.firstSurname}`.trim()
    : '';

  function selectDate(date: string) {
    setSelectedDate(date);
    setChosenStart('');
    setError('');
    setQuery({ fecha: date });
  }

  function moveMonth(offset: number) {
    const next = getNextMonth(month, offset);

    setMonth(next);
    selectDate(next);
  }

  function closeDialog() {
    setCreatedRequest(null);

    setQuery({
      fecha: selectedDate,
    });
  }

  async function sendRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !selectedSlot ||
      !publicHandle ||
      !availability ||
      !identityReady ||
      sending
    ) {
      return;
    }

    try {
      setSending(true);
      setError('');

      const payload: CreateMeetingRequestPayload = {
        recipientHandle: publicHandle.replace(/^@/, ''),
        title: title.trim(),
        startsAt: new Date(selectedSlot.startsAt).toISOString(),
        endsAt: new Date(selectedSlot.endsAt).toISOString(),
        timeZone: availability.timeZone,

        ...(isGuest
          ? {
            guestName: name.trim(),
            guestEmail: email.trim(),
          }
          : {}),

        ...(message.trim()
          ? { message: message.trim() }
          : {}),
      };

      const result = await createMeetingRequest(payload);

      setCreatedRequest(result);

      setQuery({
        fecha: selectedDate,
      });
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'No se pudo enviar la solicitud.',
      );

      /*
       * El horario pudo ocuparse mientras el visitante completaba
       * el formulario. Volvemos a consultar el mes.
       */
      if (
        failure instanceof ApiError &&
        failure.statusCode === 409
      ) {
        setAvailabilityRevision(current => current + 1);
      }
    } finally {
      setSending(false);
    }
  }

  if (notFound && !overlay) {
    return (
      <VisitorShell>
        <PublicProfileUnavailable />
      </VisitorShell>
    );
  }

  if (!availability && !loadingAvailability && !overlay) {
    return (
      <VisitorShell>
        <SectionHeading
          title="Disponibilidad pública"
          eyebrow="CALENDARIO"
          accentPeriod
        />

        <Alert tone="danger">
          {availabilityError || 'No se pudo cargar el calendario.'}
        </Alert>

        <Button
          variant="secondary"
          onClick={() =>
            setAvailabilityRevision(current => current + 1)
          }
        >
          Reintentar
        </Button>
      </VisitorShell>
    );
  }

  return (
    <VisitorShell>
      <SectionHeading
        title="Encuentra un momento para conectar"
        eyebrow="DISPONIBILIDAD PÚBLICA"
        accentPeriod
      />

      {availability && (
        <div className="availability-identity">
          <Person
            name={ownerName}
            detail={`@${availability.handleName}`}
          />

          <TextLink
            to={`/${encodeURIComponent(availability.handleName)}`}
            icon={<FiExternalLink />}
          >
            Ver perfil
          </TextLink>
        </div>
      )}

      {availabilityError && (
        <Alert tone="danger">
          {availabilityError}
        </Alert>
      )}

      {loadingAvailability && (
        <p className="flow-copy" role="status">
          Consultando horarios disponibles...
        </p>
      )}

      {availability && (
        <>
          <div className="availability-columns">
            <section className="availability-month">
              <header>
                <h2>{formatMonth(month)}.</h2>

                <div>
                  <button
                    type="button"
                    className="flow-arrow-button"
                    aria-label="Mes anterior"
                    onClick={() => moveMonth(-1)}
                  >
                    <FiChevronLeft />
                  </button>

                  <button
                    type="button"
                    className="flow-arrow-button"
                    aria-label="Mes siguiente"
                    onClick={() => moveMonth(1)}
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </header>

              <div
                className="availability-calendar"
                aria-label="Elegir fecha"
              >
                <div className="availability-weekdays">
                  {[
                    'LUN',
                    'MAR',
                    'MIÉ',
                    'JUE',
                    'VIE',
                    'SÁB',
                    'DOM',
                  ].map(day => (
                    <span key={day}>{day}</span>
                  ))}
                </div>

                <div className="availability-days">
                  {gridDays.map(day => {
                    const currentMonth =
                      day.slice(0, 7) === month.slice(0, 7);

                    const selectable =
                      currentMonth && day >= today;

                    const hasAvailability =
                      availableDateKeys.has(day);

                    return (
                      <button
                        type="button"
                        key={day}
                        disabled={!selectable}
                        className={[
                          selectedDate === day ? 'is-selected' : '',
                          day === today ? 'is-today' : '',
                        ].join(' ')}
                        aria-pressed={selectedDate === day}
                        aria-label={formatCalendarDate(day)}
                        onClick={() => selectDate(day)}
                      >
                        {Number(day.slice(-2))}
                        {hasAvailability && (
                          <i aria-hidden="true" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="availability-calendar-legend">
                <span>
                  • &nbsp; Día con horarios disponibles
                </span>

                <span>{availability.timeZone}</span>
              </div>

              <p className="flow-note">
                <FiClock />

                <span>
                  Los horarios se muestran en la zona horaria
                  de {availability.name}.
                  <br />
                  {availability.timeZone}
                </span>
              </p>
            </section>

            <aside className="availability-slots">
              <p className="ui-eyebrow">
                ELIGE UN HORARIO
              </p>

              <h2>
                {formatCalendarDate(selectedDate)}.
              </h2>

              <p>
                Consulta los espacios libres de este día.
              </p>

              <div className="availability-slot-list">
                {selectedSlots.length > 0 ? (
                  selectedSlots.map(slot => {
                    const selected =
                      selectedSlot?.startsAt === slot.startsAt;

                    return (
                      <button
                        type="button"
                        key={slot.startsAt}
                        aria-pressed={selected}
                        className={
                          selected ? 'is-selected' : ''
                        }
                        onClick={() => {
                          setChosenStart(slot.startsAt);
                          setError('');
                        }}
                      >
                        {selected ? <FiCheck /> : <FiClock />}

                        <span>
                          {formatSlotTime(
                            slot,
                            availability.timeZone,
                          )}
                        </span>

                        <small>Disponible</small>
                      </button>
                    );
                  })
                ) : (
                  <p className="availability-no-slots">
                    {loadingAvailability
                      ? 'Consultando horarios...'
                      : 'No hay espacios disponibles para este día. Elige otra fecha.'}
                  </p>
                )}
              </div>

              <Button
                disabled={!selectedSlot || loadingAvailability}
                trailingIcon={<FiArrowRight />}
                onClick={() =>
                  setQuery(current => {
                    const next = new URLSearchParams(current);
                    next.set('solicitar', '1');
                    return next;
                  })
                }
              >
                Solicitar este horario
              </Button>

              <p className="flow-note">
                <FiShield />

                Solo se muestra disponibilidad. Los títulos
                y detalles de la agenda de {availability.name}
                {' '}son privados.
              </p>
            </aside>
          </div>

          {query.has('solicitar') && selectedSlot && (
            <Dialog
              open
              onOpenChange={open => {
                if (!open) {
                  closeDialog();
                }
              }}
              title="Da el primer paso."
              eyebrow="SOLICITUD DE REUNIÓN"
              size="large"
              className="booking-dialog"
              footer={
                <>
                  <Button
                    variant="ghost"
                    onClick={closeDialog}
                  >
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
                detail={`Reunión con ${ownerName} · @${availability.handleName}`}
              />

              <div className="booking-slot-summary">
                <p>
                  <FiCalendar />
                  {formatSlotDate(
                    selectedSlot,
                    availability.timeZone,
                  )}
                </p>

                <p>
                  <FiClock />
                  {formatSlotTime(
                    selectedSlot,
                    availability.timeZone,
                  )}

                  <small>{availability.timeZone}</small>
                </p>
              </div>

              <form
                id="booking-form"
                className="flow-form"
                onSubmit={sendRequest}
              >
                {error && (
                  <Alert tone="danger">
                    {error}
                  </Alert>
                )}

                {member?.loading ? (
                  <p role="status">
                    Comprobando tu sesión...
                  </p>
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
                      onChange={event =>
                        setName(event.target.value)
                      }
                    />

                    <Input
                      label="Correo electrónico"
                      type="email"
                      required
                      maxLength={200}
                      autoComplete="email"
                      value={email}
                      onChange={event =>
                        setEmail(event.target.value)
                      }
                    />
                  </div>
                ) : (
                  <Alert tone="warning">
                    No se pudo comprobar tu sesión.
                    Reintenta antes de enviar la solicitud.

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
                  onChange={event =>
                    setTitle(event.target.value)
                  }
                />

                <Textarea
                  label="Mensaje (opcional)"
                  minLength={10}
                  maxLength={2000}
                  rows={3}
                  value={message}
                  onChange={event =>
                    setMessage(event.target.value)
                  }
                />
              </form>

              <p className="flow-note">
                <FiClock />

                La reunión quedará pendiente hasta que
                {' '}{availability.name} acepte tu solicitud.
              </p>
            </Dialog>
          )}
        </>
      )}

      {createdRequest && (
        <Dialog
          open
          onOpenChange={open => {
            if (!open) {
              closeDialog();
            }
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
            El propietario del calendario podrá revisar
            tu solicitud. El horario todavía no está confirmado.
          </p>

          <div className="booking-receipt-summary">
            <StatusDot tone="warning">
              Pendiente de respuesta
            </StatusDot>

            <h3>{createdRequest.title}</h3>

            <p>
              <FiCalendar />
              {new Intl.DateTimeFormat('es-BO', {
                timeZone: createdRequest.timeZone,
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }).format(new Date(createdRequest.startsAt))}
            </p>

            <p>
              <FiClock />

              {new Intl.DateTimeFormat('es-BO', {
                timeZone: createdRequest.timeZone,
                hour: '2-digit',
                minute: '2-digit',
                hourCycle: 'h23',
              }).format(new Date(createdRequest.startsAt))}

              {' — '}

              {new Intl.DateTimeFormat('es-BO', {
                timeZone: createdRequest.timeZone,
                hour: '2-digit',
                minute: '2-digit',
                hourCycle: 'h23',
              }).format(new Date(createdRequest.endsAt))}
            </p>
          </div>
        </Dialog>
      )}

      {overlay}
    </VisitorShell>
  );
}
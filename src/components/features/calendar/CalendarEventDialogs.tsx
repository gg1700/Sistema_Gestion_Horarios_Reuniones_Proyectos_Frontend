
import { useState, type FormEvent } from 'react';
import {
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiLock,
  FiMapPin,
  FiTrash2,
} from 'react-icons/fi';

import { Dialog } from '../../modals';
import {
  Alert,
  Button,
  Input,
  ProviderIcon,
  Textarea,
} from '../../ui';
import { StatusDot } from '../flows/FlowPrimitives';

import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '../../../api/calendarEventsApi';

import type { CalendarEventItem } from '../../../types/calendarEvents';

import {
  dateKey,
  dateLabel,
  rangeLabel,
  timeLabel,
} from '../../../utils/calendar';

const TIME_ZONE = 'America/La_Paz';

function toDateTimeInput(value: string) {
  return `${dateKey(value)}T${timeLabel(value)}`;
}

function toApiDateTime(value: string) {
  return new Date(`${value}:00-04:00`).toISOString();
}

function CalendarIdentity({ calendarName }: { calendarName: string }) {
  return (
    <div className="event-calendar-identity">
      <ProviderIcon provider="google" />
      <span>Google Calendar</span>
      <strong>{calendarName || 'Calendario seleccionado'}</strong>
    </div>
  );
}

export function CalendarEventEditor({
  event,
  initialDate,
  calendarName,
  onClose,
  onSaved,
}: {
  event?: CalendarEventItem;
  initialDate: string;
  calendarName: string;
  onClose: () => void;
  onSaved: (event: CalendarEventItem, created: boolean) => void;
}) {
  const [title, setTitle] = useState(event?.title ?? '');
  const [start, setStart] = useState(
    event
      ? toDateTimeInput(event.startsAt)
      : `${initialDate}T09:00`,
  );
  const [end, setEnd] = useState(
    event
      ? toDateTimeInput(event.endsAt)
      : `${initialDate}T10:00`,
  );
  const [description, setDescription] = useState(
    event?.description ?? '',
  );
  const [location, setLocation] = useState(
    event?.location ?? '',
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save(submit: FormEvent<HTMLFormElement>) {
    submit.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('El título del evento es obligatorio.');
      return;
    }

    const startsAt = toApiDateTime(start);
    const endsAt = toApiDateTime(end);

    if (Date.parse(startsAt) >= Date.parse(endsAt)) {
      setError('La hora de finalización debe ser posterior al inicio.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: title.trim(),
        startsAt,
        endsAt,
        timeZone: TIME_ZONE,
        description,
        location,
        ...(!event ? { isPublic: false } : {}),
      };

      const savedEvent = event
        ? await updateCalendarEvent(event.id, payload)
        : await createCalendarEvent(payload);

      onSaved(savedEvent, !event);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'No se pudo guardar el evento.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={open => {
        if (!open && !saving) onClose();
      }}
      title={event ? 'Editar evento.' : 'Crea un espacio en tu agenda.'}
      eyebrow={
        event
          ? 'GOOGLE CALENDAR / EDICIÓN'
          : 'GOOGLE CALENDAR / NUEVO EVENTO'
      }
      className="calendar-event-editor"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            form="calendar-event-form"
            loading={saving}
            trailingIcon={<FiArrowRight />}
          >
            {event ? 'Guardar cambios' : 'Crear evento'}
          </Button>
        </>
      }
    >
      <CalendarIdentity calendarName={calendarName} />

      <form
        id="calendar-event-form"
        className="flow-form event-editor-form"
        onSubmit={save}
      >
        {error && <Alert tone="danger">{error}</Alert>}

        <Input
          label="Título del evento"
          required
          autoFocus
          maxLength={200}
          value={title}
          onChange={input => setTitle(input.target.value)}
        />

        <div className="flow-fields">
          <Input
            label="Inicio"
            type="datetime-local"
            required
            value={start}
            onChange={input => setStart(input.target.value)}
          />

          <Input
            label="Fin"
            type="datetime-local"
            required
            min={start}
            value={end}
            onChange={input => setEnd(input.target.value)}
          />
        </div>

        <p className="event-timezone">
          America/La_Paz · UTC−4
        </p>

        <Textarea
          label="Descripción (opcional)"
          rows={3}
          value={description}
          maxLength={4000}
          onChange={input => setDescription(input.target.value)}
        />

        <Input
          label="Ubicación (opcional)"
          value={location}
          maxLength={300}
          onChange={input => setLocation(input.target.value)}
        />
      </form>
    </Dialog>
  );
}

export function CalendarEventDetails({
  event,
  calendarName,
  onClose,
  onEdit,
  onDelete,
}: {
  event: CalendarEventItem;
  calendarName: string;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const range = {
    start: event.startsAt,
    end: event.endsAt,
  };

  return (
    <Dialog
      open
      onOpenChange={open => {
        if (!open) onClose();
      }}
      title={`${event.title.replace(/\.$/, '')}.`}
      eyebrow="GOOGLE CALENDAR / EVENTO"
      className="calendar-event-detail"
      footer={
        <>
          <Button
            variant="ghost"
            trailingIcon={<FiTrash2 />}
            onClick={onDelete}
          >
            Eliminar evento
          </Button>

          <Button variant="secondary" onClick={onClose}>
            Volver
          </Button>

          <Button
            onClick={onEdit}
            trailingIcon={<FiArrowRight />}
          >
            Editar evento
          </Button>
        </>
      }
    >
      <div className="event-detail-status">
        <StatusDot
          tone={
            event.syncStatus === 'synced'
              ? 'success'
              : event.syncStatus === 'sync_error'
                ? 'danger'
                : 'warning'
          }
        >
          {event.syncStatus === 'synced'
            ? 'Sincronizado'
            : event.syncStatus === 'sync_error'
              ? 'Error de sincronización'
              : 'Sincronización pendiente'}
        </StatusDot>

        <span>
          <ProviderIcon provider="google" />
          Google Calendar · {calendarName}
        </span>
      </div>

      <dl className="event-detail-fields">
        <div>
          <dt>Inicio</dt>
          <dd>
            {dateLabel(event.startsAt)}
            <br />
            {timeLabel(event.startsAt)} · La Paz (UTC−4)
          </dd>
        </div>

        <div>
          <dt>Fin</dt>
          <dd>
            {dateLabel(event.endsAt)}
            <br />
            {timeLabel(event.endsAt)} · La Paz (UTC−4)
          </dd>
        </div>

        <div>
          <dt>Calendario</dt>
          <dd>{calendarName}</dd>
        </div>

        <div>
          <dt>Estado</dt>
          <dd>{event.eventStatus}</dd>
        </div>

        <div>
          <dt>Visibilidad</dt>
          <dd>{event.isPublic ? 'Público' : 'Privado'}</dd>
        </div>

        {event.location && (
          <div>
            <dt>Ubicación</dt>
            <dd>
              <FiMapPin /> {event.location}
            </dd>
          </div>
        )}
      </dl>

      <section className="event-detail-description">
        <h3>Descripción</h3>
        <p>{event.description || 'Sin descripción.'}</p>
      </section>

      <p className="flow-note">
        <FiLock />
        Los detalles de este evento no se publican automáticamente
        en tu disponibilidad.
      </p>
    </Dialog>
  );
}

export function DeleteCalendarEvent({
  event,
  onClose,
  onDeleted,
}: {
  event: CalendarEventItem;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    setError('');
    setDeleting(true);

    try {
      await deleteCalendarEvent(event.id);
      onDeleted();
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'No se pudo eliminar el evento.',
      );
    } finally {
      setDeleting(false);
    }
  }

  const range = {
    start: event.startsAt,
    end: event.endsAt,
  };

  return (
    <Dialog
      open
      onOpenChange={open => {
        if (!open && !deleting) onClose();
      }}
      title="¿Eliminar este evento?"
      eyebrow="GOOGLE CALENDAR / ELIMINACIÓN"
      className="delete-event-dialog"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={deleting}
          >
            Conservar evento
          </Button>

          <Button
            variant="danger"
            loading={deleting}
            onClick={remove}
          >
            Eliminar evento
          </Button>
        </>
      }
    >
      {error && <Alert tone="danger">{error}</Alert>}

      <p className="flow-copy">
        Este evento se eliminará de Google Calendar.
      </p>

      <section className="delete-event-summary">
        <h3>{event.title}</h3>

        <p>
          <FiCalendar />
          {dateLabel(event.startsAt)}
        </p>

        <p>
          <FiClock />
          {rangeLabel(range)} · La Paz (UTC−4)
        </p>
      </section>

      <p className="flow-copy">
        Esta operación no se puede deshacer.
      </p>
    </Dialog>
  );
}
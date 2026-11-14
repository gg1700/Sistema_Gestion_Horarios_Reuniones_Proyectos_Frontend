import { useEffect, useMemo, useState } from 'react';
import { Dialog } from '../../modals';
import { Alert, Button, Spinner, Textarea } from '../../ui';
import { getPublicAvailability } from '../../../api/calendarAvailabilityApi';
import type { PublicAvailabilitySlot } from '../../../types/calendarAvailability';
import { OWNER_TIME_ZONE } from '../../../types/calendar';
import { shiftDate, todayKey } from '../../../utils/calendar';

const SEARCH_DAYS = 28;

interface Option {
  startsAt: string;
  endsAt: string;
  day: string;
}

function dayKey(value: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: OWNER_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(value));
}

function dayLabel(day: string) {
  return new Intl.DateTimeFormat('es-BO', {
    timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short',
  }).format(new Date(`${day}T12:00:00Z`));
}

function timeLabel(value: string, timeZone = OWNER_TIME_ZONE) {
  return new Intl.DateTimeFormat('es-BO', {
    timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(new Date(value));
}

/**
 * Horarios de inicio en los que cabe la reunión completa: los espacios libres son
 * consecutivos, así que se encadenan hasta cubrir la duración original.
 */
function buildOptions(slots: PublicAvailabilitySlot[], durationMs: number, excludeStart?: string) {
  const ends = new Map(slots.map(slot => [Date.parse(slot.startsAt), Date.parse(slot.endsAt)]));
  const now = Date.now();
  const options: Option[] = [];
  for (const slot of slots) {
    const start = Date.parse(slot.startsAt);
    if (start <= now || slot.startsAt === excludeStart) continue;
    const target = start + durationMs;
    let cursor = start;
    while (cursor < target && ends.has(cursor)) cursor = ends.get(cursor)!;
    if (cursor < target) continue;
    const startsAt = new Date(start).toISOString();
    options.push({ startsAt, endsAt: new Date(target).toISOString(), day: dayKey(startsAt) });
  }
  return options.sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
}

export interface RescheduleSubmit {
  startsAt: string;
  endsAt: string;
  message?: string;
}

export function RescheduleDialog({
  handle,
  durationMs,
  currentStartsAt,
  title,
  description,
  note,
  submitLabel,
  onClose,
  onSubmit,
}: {
  handle: string;
  durationMs: number;
  currentStartsAt?: string;
  title: string;
  description: string;
  note?: string;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (choice: RescheduleSubmit) => Promise<void>;
}) {
  const [slots, setSlots] = useState<PublicAvailabilitySlot[]>([]);
  const [ownerTimeZone, setOwnerTimeZone] = useState(OWNER_TIME_ZONE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedStart, setSelectedStart] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const from = todayKey();
    getPublicAvailability(handle, from, shiftDate(from, SEARCH_DAYS))
      .then(result => {
        if (!active) return;
        setSlots(result.slots);
        setOwnerTimeZone(result.timeZone);
      })
      .catch(failure => {
        if (active) setError(failure instanceof Error ? failure.message : 'No se pudo consultar la disponibilidad.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [handle]);

  const options = useMemo(() => buildOptions(slots, durationMs, currentStartsAt), [slots, durationMs, currentStartsAt]);
  const days = useMemo(() => [...new Set(options.map(option => option.day))], [options]);
  const day = selectedDay || days[0] || '';
  const dayOptions = options.filter(option => option.day === day);
  const chosen = options.find(option => option.startsAt === selectedStart);
  const showsOwnerTime = ownerTimeZone !== OWNER_TIME_ZONE;

  async function submit() {
    if (!chosen) {
      setError('Elige un horario disponible.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const trimmed = message.trim().replace(/\s+/g, ' ');
      await onSubmit({ startsAt: chosen.startsAt, endsAt: chosen.endsAt, ...(trimmed ? { message: trimmed } : {}) });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'No se pudo guardar el nuevo horario.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={open => { if (!open && !saving) onClose(); }}
      title={title}
      eyebrow="SOLICITUD DE REUNIÓN / REPROGRAMAR"
      description={description}
      size="large"
      footer={
        <>
          <Button variant="ghost" disabled={saving} onClick={onClose}>Volver</Button>
          <Button loading={saving} disabled={!chosen} onClick={() => void submit()}>{submitLabel}</Button>
        </>
      }
    >
      <div className="flow-form reschedule-picker">
        {error && <Alert tone="danger">{error}</Alert>}

        {loading ? (
          <p className="flow-copy" role="status"><Spinner decorative /> Consultando horarios libres...</p>
        ) : days.length === 0 ? (
          <Alert tone="warning">No hay horarios libres en las próximas cuatro semanas para una reunión de esta duración.</Alert>
        ) : (
          <>
            <div>
              <p className="ui-eyebrow">DÍA</p>
              <div className="reschedule-days" role="group" aria-label="Elegir día">
                {days.map(option => (
                  <button
                    type="button"
                    key={option}
                    aria-pressed={option === day}
                    className={option === day ? 'is-selected' : ''}
                    onClick={() => { setSelectedDay(option); setSelectedStart(''); }}
                  >
                    {dayLabel(option)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="ui-eyebrow">HORA · TU ZONA HORARIA ({OWNER_TIME_ZONE.replace(/_/g, ' ')})</p>
              <div className="reschedule-slots" role="group" aria-label="Elegir hora">
                {dayOptions.map(option => (
                  <button
                    type="button"
                    key={option.startsAt}
                    aria-pressed={option.startsAt === selectedStart}
                    className={option.startsAt === selectedStart ? 'is-selected' : ''}
                    onClick={() => setSelectedStart(option.startsAt)}
                  >
                    {timeLabel(option.startsAt)} — {timeLabel(option.endsAt)}
                    {showsOwnerTime && (
                      <small>{timeLabel(option.startsAt, ownerTimeZone)} en {ownerTimeZone.replace(/_/g, ' ')}</small>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <Textarea
          label="Mensaje (opcional)"
          value={message}
          onChange={event => setMessage(event.target.value)}
          placeholder="Por ejemplo: ese día no puedo, ¿te sirve este horario?"
          rows={3}
          maxLength={2000}
          disabled={saving}
        />

        {note && <p className="flow-note">{note}</p>}
      </div>
    </Dialog>
  );
}

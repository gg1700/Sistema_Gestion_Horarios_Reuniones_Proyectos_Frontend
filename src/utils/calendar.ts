import { OWNER_TIME_ZONE, type TimeRange } from '../types/calendar';

const locale = 'es-BO';

function timeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(date);
  const value = (type: string) => Number(parts.find(part => part.type === type)?.value ?? 0);
  const asUtc = Date.UTC(value('year'), value('month') - 1, value('day'), value('hour') % 24, value('minute'), value('second'));
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** Convierte una fecha (YYYY-MM-DD) y hora (HH:mm) de una zona horaria en un instante UTC. */
export function zonedDateTime(day: string, time = '00:00', timeZone = OWNER_TIME_ZONE) {
  const guess = Date.parse(`${day}T${time}:00Z`);
  const firstOffset = timeZoneOffsetMs(new Date(guess), timeZone);
  const result = guess - firstOffset;
  const secondOffset = timeZoneOffsetMs(new Date(result), timeZone);
  return new Date(secondOffset === firstOffset ? result : guess - secondOffset);
}

export function zonedDateTimeIso(day: string, time = '00:00', timeZone = OWNER_TIME_ZONE) {
  return zonedDateTime(day, time, timeZone).toISOString();
}

/** Fecha de hoy (YYYY-MM-DD) en la zona horaria indicada. */
export function todayKey(timeZone = OWNER_TIME_ZONE) {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

/** Nombre corto de la zona horaria con su desfase, p. ej. "America/La Paz · UTC−4". */
export function timeZoneLabel(timeZone = OWNER_TIME_ZONE) {
  const offsetMinutes = Math.round(timeZoneOffsetMs(new Date(), timeZone) / 60_000);
  const sign = offsetMinutes < 0 ? '−' : '+';
  const hours = Math.floor(Math.abs(offsetMinutes) / 60);
  const minutes = Math.abs(offsetMinutes) % 60;
  return `${timeZone.replace(/_/g, ' ')} · UTC${sign}${hours}${minutes ? `:${String(minutes).padStart(2, '0')}` : ''}`;
}

export function dateLabel(value: string, options: Intl.DateTimeFormatOptions = {}) {
  const date = value.length === 10 ? zonedDateTime(value, '12:00') : new Date(value);
  return new Intl.DateTimeFormat(locale, { timeZone: OWNER_TIME_ZONE, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', ...options }).format(date);
}
export function timeLabel(value: string) { return new Intl.DateTimeFormat(locale, { timeZone: OWNER_TIME_ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(value)); }
export function rangeLabel(range: TimeRange) { return `${timeLabel(range.start)} — ${timeLabel(range.end)}`; }
export function dateKey(value: string) { return new Intl.DateTimeFormat('en-CA', { timeZone: OWNER_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value)); }
export function shiftDate(value: string, days: number) { const date = new Date(`${value}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10); }
export function isDateKey(value: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function weekStart(value: string) {
  const day = new Date(`${value}T12:00:00Z`).getUTCDay();
  return shiftDate(value, -((day + 6) % 7));
}

export function calendarDaySegments<T extends TimeRange>(events: T[], day: string) {
  const from = zonedDateTime(day).getTime();
  const to = zonedDateTime(shiftDate(day, 1)).getTime();
  const segments = events.filter(event => Date.parse(event.start) < to && Date.parse(event.end) > from).map(event => ({
    event, startMinute: (Math.max(Date.parse(event.start), from) - from) / 60_000,
    endMinute: (Math.min(Date.parse(event.end), to) - from) / 60_000, column: 0, columns: 1,
  })).sort((a, b) => a.startMinute - b.startMinute || b.endMinute - a.endMinute);
  let group: typeof segments = [];
  let laneEnds: number[] = [];
  let groupEnd = -1;
  function finish() { for (const segment of group) segment.columns = laneEnds.length; }
  for (const segment of segments) {
    if (segment.startMinute >= groupEnd) { finish(); group = []; laneEnds = []; }
    let lane = laneEnds.findIndex(end => end <= segment.startMinute);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = segment.endMinute;
    segment.column = lane;
    group.push(segment);
    groupEnd = Math.max(...laneEnds);
  }
  finish();
  return segments;
}

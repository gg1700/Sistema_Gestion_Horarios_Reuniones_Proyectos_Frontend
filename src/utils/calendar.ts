import { OWNER_TIME_ZONE, type TimeRange } from '../mocks/flow.ts';

const locale = 'es-BO';
export function dateLabel(value: string, options: Intl.DateTimeFormatOptions = {}) {
  const date = value.length === 10 ? new Date(`${value}T12:00:00-04:00`) : new Date(value);
  return new Intl.DateTimeFormat(locale, { timeZone: OWNER_TIME_ZONE, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', ...options }).format(date);
}
export function timeLabel(value: string) { return new Intl.DateTimeFormat(locale, { timeZone: OWNER_TIME_ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(value)); }
export function rangeLabel(range: TimeRange) { return `${timeLabel(range.start)} — ${timeLabel(range.end)}`; }
export function dateKey(value: string) { return new Intl.DateTimeFormat('en-CA', { timeZone: OWNER_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value)); }
export function shiftDate(value: string, days: number) { const date = new Date(`${value}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10); }
export function newMockId(prefix: string) { return `${prefix}-${crypto.randomUUID()}`; }
export function isDateKey(value: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function weekStart(value: string) {
  const day = new Date(`${value}T12:00:00Z`).getUTCDay();
  return shiftDate(value, -((day + 6) % 7));
}

/** Recorta eventos a un día y separa los que se solapan para que sigan siendo accesibles. */
export function calendarDaySegments<T extends TimeRange>(events: T[], day: string) {
  const from = Date.parse(`${day}T00:00:00-04:00`);
  const to = from + 86_400_000;
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

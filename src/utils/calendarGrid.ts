export interface CalendarDay {
  isoDate: string;
  dayNumber: number;
  isCurrentMonth: boolean;
}

export const weekDayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const monthFormatter = new Intl.DateTimeFormat('es', { month: 'long' });
const displayFormatter = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' });

function padNumber(value: number) {
  return String(value).padStart(2, '0');
}

export function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
}

export function parseIsoDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export function getTodayIsoDate() {
  return toIsoDate(new Date());
}

export function getMonthName(month: number) {
  const name = monthFormatter.format(new Date(2026, month, 1));
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function formatDisplayDate(value: string) {
  const date = parseIsoDate(value);
  return date ? displayFormatter.format(date) : '';
}

export function getCalendarDays(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const mondayBasedOffset = (firstDay.getDay() + 6) % 7;
  const days: CalendarDay[] = [];
  for (let index = 0; index < 42; index++) {
    const date = new Date(year, month, index - mondayBasedOffset + 1);
    days.push({ isoDate: toIsoDate(date), dayNumber: date.getDate(), isCurrentMonth: date.getMonth() === month });
  }
  return days;
}

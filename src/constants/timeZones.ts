import { resolveViewerTimeZone } from '../types/calendar';

export interface TimeZoneOption {
  value: string;
  label: string;
}

const COMMON_TIME_ZONES: TimeZoneOption[] = [
  { value: 'America/La_Paz', label: 'Bolivia (America/La_Paz)' },
  { value: 'America/Lima', label: 'Perú (America/Lima)' },
  { value: 'America/Bogota', label: 'Colombia (America/Bogota)' },
  { value: 'America/Guayaquil', label: 'Ecuador (America/Guayaquil)' },
  { value: 'America/Santiago', label: 'Chile (America/Santiago)' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Argentina (Buenos Aires)' },
  { value: 'America/Asuncion', label: 'Paraguay (America/Asuncion)' },
  { value: 'America/Montevideo', label: 'Uruguay (America/Montevideo)' },
  { value: 'America/Sao_Paulo', label: 'Brasil (America/Sao_Paulo)' },
  { value: 'America/Caracas', label: 'Venezuela (America/Caracas)' },
  { value: 'America/Mexico_City', label: 'México (America/Mexico_City)' },
  { value: 'America/New_York', label: 'EE. UU. Este (America/New_York)' },
  { value: 'America/Los_Angeles', label: 'EE. UU. Pacífico (America/Los_Angeles)' },
  { value: 'Europe/Madrid', label: 'España (Europe/Madrid)' },
  { value: 'Europe/London', label: 'Reino Unido (Europe/London)' },
  { value: 'Europe/Paris', label: 'Francia (Europe/Paris)' },
  { value: 'Europe/Berlin', label: 'Alemania (Europe/Berlin)' },
  { value: 'Asia/Tokyo', label: 'Japón (Asia/Tokyo)' },
  { value: 'Asia/Shanghai', label: 'China (Asia/Shanghai)' },
  { value: 'Asia/Dubai', label: 'Emiratos Árabes Unidos (Asia/Dubai)' },
  { value: 'Australia/Sydney', label: 'Australia (Australia/Sydney)' },
  { value: 'UTC', label: 'UTC (hora universal)' },
];

export function timeZoneOptions(current?: string): TimeZoneOption[] {
  const options = [...COMMON_TIME_ZONES];

  const extra = [resolveViewerTimeZone(), current].filter(
    (zone): zone is string =>
      Boolean(zone) &&
      !options.some(option => option.value === zone),
  );

  for (const zone of new Set(extra)) {
    options.unshift({
      value: zone,
      label: zone.replace(/_/g, ' '),
    });
  }

  return options;
}
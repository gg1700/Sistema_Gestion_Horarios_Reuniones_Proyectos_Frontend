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
  { value: 'UTC', label: 'UTC (hora universal, sin país)' },
];

/**
 * Opciones de zona horaria: las más comunes, más la zona del navegador y el
 * valor actual cuando no están en la lista, para no perder configuraciones.
 */
export function timeZoneOptions(current?: string): TimeZoneOption[] {
  const options = [...COMMON_TIME_ZONES];
  const extra = [resolveViewerTimeZone(), current].filter(
    (zone): zone is string => Boolean(zone) && !options.some(option => option.value === zone),
  );
  for (const zone of new Set(extra)) {
    options.unshift({ value: zone, label: zone.replace(/_/g, ' ') });
  }
  return options;
}

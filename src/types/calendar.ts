export interface TimeRange {
  start: string;
  end: string;
}

const FALLBACK_TIME_ZONE = 'America/La_Paz';

/** Zona horaria del navegador de quien usa la aplicación. */
export function resolveViewerTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || FALLBACK_TIME_ZONE;
  } catch {
    return FALLBACK_TIME_ZONE;
  }
}

/** Las fechas y horas de la agenda se muestran en la zona local del usuario. */
export const OWNER_TIME_ZONE = resolveViewerTimeZone();
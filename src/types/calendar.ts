export interface TimeRange {
  start: string;
  end: string;
}

const FALLBACK_TIME_ZONE = 'America/La_Paz';

export function resolveViewerTimeZone(): string {
  try {
    return (
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      FALLBACK_TIME_ZONE
    );
  } catch {
    return FALLBACK_TIME_ZONE;
  }
}

export const OWNER_TIME_ZONE = resolveViewerTimeZone();
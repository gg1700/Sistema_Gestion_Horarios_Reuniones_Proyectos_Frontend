import { useEffect, useState } from 'react';
import { getAvailabilityRules } from '../api/calendarAvailabilityApi';
import { resolveViewerTimeZone } from '../types/calendar';

export function useCalendarTimeZone(): string {
  const [timeZone, setTimeZone] = useState(resolveViewerTimeZone());

  useEffect(() => {
    let active = true;

    async function loadTimeZone() {
      try {
        const settings = await getAvailabilityRules();

        if (!active) return;

        const shouldUseBrowserTimeZone =
          settings.rules.length === 0 &&
          settings.timeZone === 'UTC';

        setTimeZone(
          shouldUseBrowserTimeZone
            ? resolveViewerTimeZone()
            : settings.timeZone,
        );
      } catch {
        //
      }
    }

    void loadTimeZone();

    return () => {
      active = false;
    };
  }, []);

  return timeZone;
}
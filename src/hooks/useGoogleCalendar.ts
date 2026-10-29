import { useCallback, useEffect, useState } from "react";
import {
  googleCalendarApi,
  CalendarApiError,
  type CalendarConnectionStatus,
  type CalendarListResponse
} from "../api/googleCalendar";

const initialStatus: CalendarConnectionStatus = {
  status: "disconnected",
  calendarId: null,
  calendarName: null,
  reconnectRequired: false
};

export function useGoogleCalendar() {
  const [status, setStatus] = useState<CalendarConnectionStatus>(initialStatus);
  const [calendarList, setCalendarList] = useState<CalendarListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const refreshStatus = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await googleCalendarApi.getStatus();
      setStatus(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo consultar la conexión.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCalendars = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await googleCalendarApi.getCalendars();
      setCalendarList(result);
      return result;
    } catch (err) {
      if (err instanceof CalendarApiError && err.code === "reconnection_required") {
        setStatus(prev => ({ ...prev, status: "expired", reconnectRequired: true }));
      }
      setError(err instanceof Error ? err.message : "No se pudieron cargar los calendarios.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const selectCalendar = useCallback(async (calendarId: string) => {
    setSaving(true);
    setError("");

    try {
      const result = await googleCalendarApi.selectCalendar(calendarId);
      setStatus({
        status: "connected",
        calendarId: result.calendarId,
        calendarName: result.calendarName,
        reconnectRequired: false
      });
      setCalendarList(prev => prev ? { ...prev, selectedCalendarId: calendarId } : prev);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el calendario.");
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setSaving(true);
    setError("");

    try {
      await googleCalendarApi.disconnect();
      setStatus(initialStatus);
      setCalendarList(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo desvincular Google Calendar.");
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    void refreshStatus().catch(() => {});
  }, [refreshStatus]);

  return {
    status,
    calendarList,
    loading,
    saving,
    error,
    refreshStatus,
    loadCalendars,
    selectCalendar,
    disconnect,
    connect: googleCalendarApi.connect
  };
}

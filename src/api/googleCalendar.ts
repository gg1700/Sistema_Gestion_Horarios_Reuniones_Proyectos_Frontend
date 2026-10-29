
const apiBase = (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(/\/+$/, "");
const baseUrl = `${apiBase}/api/v1/integrations/google-calendar`;

export interface GoogleCalendar {
  id: string;
  name: string;
  description: string;
  timezone: string;
  primary: boolean;
  canWrite: boolean;
  accessRole: string;
  color: string | null;
}

export interface CalendarConnectionStatus {
  status: "connected" | "expired" | "disconnected";
  calendarId: string | null;
  calendarName: string | null;
  reconnectRequired: boolean;
}

export interface CalendarListResponse {
  calendars: GoogleCalendar[];
  selectedCalendarId: string | null;
  connectionStatus: string | null;
}

export interface SelectedCalendar {
  calendarId: string;
  calendarName: string;
  timezone: string;
  status: "connected";
}

export interface DisconnectResult {
  status: "disconnected";
  message: string;
}

export class CalendarApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
    this.name = "CalendarApiError";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new CalendarApiError(
      result.message ?? "No se pudo completar la operación.",
      response.status,
      result.errorCode
    );
  }

  return result.data as T;
}

export const googleCalendarApi = {
  getStatus: () => request<CalendarConnectionStatus>("/status"),
  getCalendars: () => request<CalendarListResponse>("/calendars"),
  selectCalendar: (calendarId: string) =>
    request<SelectedCalendar>("/selected", {
      method: "PUT",
      body: JSON.stringify({ calendarId })
    }),
  disconnect: () => request<DisconnectResult>("", { method: "DELETE" }),
  connect: () => window.location.assign(`${baseUrl}/connect`)
};

export type CalendarEventStatus =
  | 'confirmed'
  | 'tentative'
  | 'cancelled';

export type CalendarEventSyncStatus =
  | 'synced'
  | 'pending_sync'
  | 'sync_error';

export type CalendarEventDateTime = string;

export interface CalendarEventItem {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: CalendarEventDateTime;
  endsAt: CalendarEventDateTime;
  timeZone: string;
  isPublic: boolean;
  eventStatus: CalendarEventStatus;
  syncStatus: CalendarEventSyncStatus;
}

export interface CalendarEventRangeQuery {
  from: CalendarEventDateTime;
  to: CalendarEventDateTime;
  limit?: number;
}

export interface CreateCalendarEventPayload {
  title: string;
  startsAt: CalendarEventDateTime;
  endsAt: CalendarEventDateTime;
  timeZone: string;
  description?: string;
  location?: string;
  isPublic?: boolean;
}

export type UpdateCalendarEventPayload =
  Partial<CreateCalendarEventPayload>;

export interface CalendarEventApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

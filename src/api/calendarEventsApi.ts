import { sendRequest } from './httpClient';

import type {
    CalendarEventItem,
    CalendarEventRangeQuery,
    CreateCalendarEventPayload,
    UpdateCalendarEventPayload,
    CalendarEventApiResponse,
} from '../types/calendarEvents';

export async function getCalendarEvents(query: CalendarEventRangeQuery): Promise<CalendarEventItem[]> {
    const params = new URLSearchParams();

    params.set('from', query.from);
    params.set('to', query.to);
    params.set('limit', String(query.limit ?? 100));

    const response = await sendRequest<
        CalendarEventApiResponse<CalendarEventItem[]>
    >(
        `/api/v1/calendar?${params.toString()}`,
        {
            method: 'GET',
        },
    );

    if (!response.success || !Array.isArray(response.data)) {
        throw new Error(
            response.message || 'No se pudieron consultar los eventos del calendario.',
        );
    }

    return response.data;
}

export async function createCalendarEvent(payload: CreateCalendarEventPayload): Promise<CalendarEventItem> {
    const response = await sendRequest<
        CalendarEventApiResponse<CalendarEventItem>
    >(
        '/api/v1/calendar',
        {
            method: 'POST',
            body: payload,
        },
    );

    if (!response.success || !response.data) {
        throw new Error(
            response.message || 'No se pudo crear el evento.',
        );
    }

    return response.data;
}

export async function updateCalendarEvent(
    eventId: string,
    payload: UpdateCalendarEventPayload): Promise<CalendarEventItem> {
    const response = await sendRequest<
        CalendarEventApiResponse<CalendarEventItem>
    >(
        `/api/v1/calendar/${encodeURIComponent(eventId)}`,
        {
            method: 'PATCH',
            body: payload,
        },
    );

    if (!response.success || !response.data) {
        throw new Error(
            response.message || 'No se pudo actualizar el evento.',
        );
    }

    return response.data;
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
    await sendRequest<void>(
        `/api/v1/calendar/${encodeURIComponent(eventId)}`,
        {
            method: 'DELETE',
        },
    );
}
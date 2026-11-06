import { sendRequest } from './httpClient';

import type {
  AvailabilityRulesResponse,
  ReplaceAvailabilityRulesPayload,
  PublicCalendarLink,
  PublicAvailabilityData,
} from '../types/calendarAvailability';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

function unwrapResponse<T>(
  response: ApiResponse<T>,
  defaultMessage: string,
): T {
  if (!response.success || response.data === undefined) {
    throw new Error(response.message || defaultMessage);
  }

  return response.data;
}

export async function getAvailabilityRules(): Promise<AvailabilityRulesResponse> {
  const response = await sendRequest<ApiResponse<AvailabilityRulesResponse>>(
    '/api/v1/calendar/availability-rules',
    { method: 'GET' },
  );

  return unwrapResponse(
    response,
    'No se pudo consultar la disponibilidad.',
  );
}

export async function replaceAvailabilityRules(
  payload: ReplaceAvailabilityRulesPayload,
): Promise<AvailabilityRulesResponse> {
  const response = await sendRequest<ApiResponse<AvailabilityRulesResponse>>(
    '/api/v1/calendar/availability-rules',
    {
      method: 'PUT',
      body: payload,
    },
  );

  return unwrapResponse(
    response,
    'No se pudo guardar la disponibilidad.',
  );
}

export async function getPublicCalendarLink(): Promise<PublicCalendarLink> {
  const response = await sendRequest<ApiResponse<PublicCalendarLink>>(
    '/api/v1/calendar/public-link',
    { method: 'GET' },
  );

  return unwrapResponse(
    response,
    'No se pudo consultar el enlace del calendario.',
  );
}

export async function updatePublicCalendarLink(
  active: boolean,
): Promise<PublicCalendarLink> {
  const response = await sendRequest<ApiResponse<PublicCalendarLink>>(
    '/api/v1/calendar/public-link',
    {
      method: 'PATCH',
      body: { active },
    },
  );

  return unwrapResponse(
    response,
    'No se pudo actualizar el enlace público.',
  );
}

export async function getPublicAvailability(
  handle: string,
  from: string,
  to: string,
): Promise<PublicAvailabilityData> {
  const params = new URLSearchParams({ from, to });

  const response = await sendRequest<ApiResponse<PublicAvailabilityData>>(
    `/api/v1/public/calendars/${encodeURIComponent(handle)}/availability?${params.toString()}`,
    { method: 'GET' },
  );

  return unwrapResponse(
    response,
    'No se pudo consultar la disponibilidad de este calendario.',
  );
}
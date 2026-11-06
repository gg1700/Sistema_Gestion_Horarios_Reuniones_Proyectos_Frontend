
import { sendRequest } from './httpClient';
import type {
  MeetingRequestAction,
  MeetingRequestItem,
  MeetingRequestsQuery,
  MeetingRequestsResponse,
  CreateMeetingRequestPayload,
  CreatedMeetingRequest,
  MeetingRequestDecisionPayload,
} from '../types/meetingRequests';

export async function getMeetingRequests(
  action: MeetingRequestAction,
  query: MeetingRequestsQuery = {}
): Promise<MeetingRequestItem[]> {
  const params = new URLSearchParams();

  if (query.status) {
    params.set('status', query.status);
  }

  if (query.page !== undefined) {
    params.set('page', String(query.page));
  }

  if (query.limit !== undefined) {
    params.set('limit', String(query.limit));
  }

  const queryString = params.toString();
  const endpoint = `/api/v1/meeting-requests/${action}${
    queryString ? `?${queryString}` : ''
  }`;

  const response = await sendRequest<MeetingRequestsResponse>(
    endpoint,
    { method: 'GET' }
  );

  if (!response.success || !Array.isArray(response.data)) {
    throw new Error(
      response.message || 'No se pudieron obtener las solicitudes.'
    );
  }

  return response.data;
}

interface CreateMeetingRequestApiResponse {
  success: boolean;
  message: string;
  data?: CreatedMeetingRequest;
}

export async function createMeetingRequest(
  payload: CreateMeetingRequestPayload): Promise<CreatedMeetingRequest> {
  const response = await sendRequest<CreateMeetingRequestApiResponse>(
    '/api/v1/meeting-requests/',
    {
      method: 'POST',
      body: payload,
    }
  );

  if (!response.success || !response.data) {
    throw new Error(
      response.message || 'No se pudo enviar la solicitud.'
    );
  }

  return response.data;
}

interface MeetingRequestDecisionApiResponse {
  success: boolean;
  message: string;
  data?: CreatedMeetingRequest;
}

export async function decideMeetingRequest(
  requestId: string,
  payload: MeetingRequestDecisionPayload,
): Promise<CreatedMeetingRequest> {
  const response =
    await sendRequest<MeetingRequestDecisionApiResponse>(
      `/api/v1/meeting-requests/received/${encodeURIComponent(requestId)}/decision`,
      {
        method: 'PATCH',
        body: payload,
      },
    );

  if (!response.success || !response.data) {
    throw new Error(
      response.message || 'No se pudo resolver la solicitud.',
    );
  }

  return response.data;
}
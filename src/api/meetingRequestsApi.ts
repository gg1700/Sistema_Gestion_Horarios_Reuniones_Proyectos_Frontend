
import { sendRequest } from './httpClient';
import type {
  MeetingRequestAction,
  MeetingRequestItem,
  MeetingRequestsQuery,
  MeetingRequestsResponse,
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
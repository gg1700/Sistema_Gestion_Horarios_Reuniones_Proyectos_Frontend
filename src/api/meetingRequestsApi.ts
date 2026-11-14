
import { sendRequest } from './httpClient';
import type {
  MeetingRequestAction,
  MeetingRequestItem,
  MeetingRequestsQuery,
  MeetingRequestsResponse,
  CreateMeetingRequestPayload,
  CreatedMeetingRequest,
  MeetingRequestDecisionPayload,
  UpdateMeetingRequestPayload,
  RescheduleProposalPayload,
  ProposalResponsePayload,
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
    '/api/v1/meeting-requests',
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

interface UpdateMeetingRequestApiResponse {
  success: boolean;
  message: string;
  data?: CreatedMeetingRequest;
}

export async function updateMeetingRequest(
  requestId: string,
  payload: UpdateMeetingRequestPayload): Promise<CreatedMeetingRequest> {
  const response = await sendRequest<UpdateMeetingRequestApiResponse>(
      `/api/v1/meeting-requests/${encodeURIComponent(requestId)}`,
      {
        method: 'PATCH',
        body: payload,
      },
    );

  if (!response.success || !response.data)
    throw new Error(response.message || 'No se pudo actualizar la solicitud.');

  return response.data;
}

interface CancelMeetingRequestApiResponse {
  success: boolean;
  message: string;
  data?: CreatedMeetingRequest;
}

export async function cancelMeetingRequest(
  requestId: string,
  reason: string): Promise<CreatedMeetingRequest> {
  const response = await sendRequest<CancelMeetingRequestApiResponse>(
    `/api/v1/meeting-requests/${encodeURIComponent(requestId)}`,
    {
      method: 'DELETE',
      body: { reason },
    },
  );

  if (!response.success || !response.data)
    throw new Error(response.message || 'No se pudo cancelar la solicitud.');

  return response.data;
}

interface MeetingRequestActionResponse {
  success: boolean;
  message: string;
  data?: CreatedMeetingRequest;
}

/** El anfitrión propone otro horario (o, con un visitante, confirma directamente el nuevo horario). */
export async function proposeMeetingReschedule(
  requestId: string,
  payload: RescheduleProposalPayload,
): Promise<{ message: string; data: CreatedMeetingRequest }> {
  const response = await sendRequest<MeetingRequestActionResponse>(
    `/api/v1/meeting-requests/received/${encodeURIComponent(requestId)}/reschedule`,
    { method: 'PATCH', body: payload },
  );
  if (!response.success || !response.data)
    throw new Error(response.message || 'No se pudo proponer el nuevo horario.');
  return { message: response.message, data: response.data };
}

/** El solicitante acepta el horario propuesto o responde con otro. */
export async function respondToMeetingProposal(
  requestId: string,
  payload: ProposalResponsePayload,
): Promise<{ message: string; data: CreatedMeetingRequest }> {
  const response = await sendRequest<MeetingRequestActionResponse>(
    `/api/v1/meeting-requests/sent/${encodeURIComponent(requestId)}/proposal`,
    { method: 'PATCH', body: payload },
  );
  if (!response.success || !response.data)
    throw new Error(response.message || 'No se pudo responder a la propuesta.');
  return { message: response.message, data: response.data };
}

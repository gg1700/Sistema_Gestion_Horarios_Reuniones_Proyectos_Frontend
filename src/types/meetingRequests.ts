
export type MeetingRequestAction = 'sent' | 'received';

export type MeetingRequestStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled';

export interface MeetingRequestItem {
  id: string;
  handleName: string | null;
  name: string;
  firstSurname: string;
  title: string;
  message: string | null;
  startsAt: string;
  endsAt: string;
  timeZone: string;
  status: MeetingRequestStatus;
  createdAt: string;
  resolvedAt: string | null;
  ownerResponseMessage: string | null;
  guestEmail: string | null;
}

export interface MeetingRequestsResponse {
  success: boolean;
  message: string;
  data: MeetingRequestItem[];
}

export interface MeetingRequestsQuery {
  status?: MeetingRequestStatus;
  page?: number;
  limit?: number;
}

export interface CreateMeetingRequestPayload {
  recipientHandle: string;
  guestName?: string;
  guestEmail?: string;
  title: string;
  message?: string;
  startsAt: string;
  endsAt: string;
  timeZone: string;
}

export interface CreatedMeetingRequest {
  id: string;
  title: string;
  message: string | null;
  startsAt: string;
  endsAt: string;
  timeZone: string;
  status: MeetingRequestStatus;
  createdAt: string;
  resolvedAt: string | null;
  ownerResponseMessage: string | null;
  guestName: string | null;
  guestEmail: string | null;
}

export type MeetingRequestDecision = 'accepted' | 'rejected';

export interface MeetingRequestDecisionPayload {
  decision: MeetingRequestDecision;
  responseMessage?: string;
}
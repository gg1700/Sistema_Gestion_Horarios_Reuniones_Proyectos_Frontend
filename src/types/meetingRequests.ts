
export type MeetingRequestAction = 'sent' | 'received';

export type MeetingRequestStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'reschedule_proposed';

export interface MeetingRequestItem {
  id: string;
  handleName: string | null;
  name: string;
  firstSurname: string;
  profilePicture: string | null;
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
  meetUrl?: string | null;
  cancellationReason?: string | null;
  proposedStartsAt?: string | null;
  proposedEndsAt?: string | null;
  proposalMessage?: string | null;
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
  meetUrl?: string | null;
  cancellationReason?: string | null;
  proposedStartsAt?: string | null;
  proposedEndsAt?: string | null;
  proposalMessage?: string | null;
}

export type MeetingRequestDecision = 'accepted' | 'rejected';

export interface MeetingRequestDecisionPayload {
  decision: MeetingRequestDecision;
  responseMessage?: string;
}

export interface UpdateMeetingRequestPayload {
  title?: string;
  message?: string;
  startsAt?: string;
  endsAt?: string;
  timeZone?: string;
}
export interface RescheduleProposalPayload {
  startsAt: string;
  endsAt: string;
  message?: string;
}

export type ProposalResponsePayload =
  | { decision: 'accepted'; message?: string }
  | { decision: 'counter'; startsAt: string; endsAt: string; timeZone?: string; message?: string };


export type MeetingRequestAction = 'sent' | 'received';

export type MeetingRequestStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled';

export interface MeetingRequestItem {
  id: string;
  handleName: string;
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
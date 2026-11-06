export interface AvailabilityRule {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
}

export interface AvailabilityRulesResponse {
  timeZone: string;
  rules: AvailabilityRule[];
}

export interface ReplaceAvailabilityRulesPayload {
  timeZone: string;
  rules: AvailabilityRule[];
}

export interface PublicCalendarLink {
  handleName: string;
  active: boolean;
  url: string;
  publicApiPath: string;
}

export interface PublicAvailabilitySlot {
  startsAt: string;
  endsAt: string;
}

export interface PublicAvailabilityData {
  handleName: string;
  name: string;
  firstSurname: string;
  timeZone: string;
  slots: PublicAvailabilitySlot[];
}
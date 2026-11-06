export interface PublicLink {
  handleName: string;
  url: string;
  publicLinkActive: boolean;
  allOptionalFieldsPrivate: boolean;
}

export type HandleAvailability =
  | 'unchanged'
  | 'checking'
  | 'available'
  | 'taken'
  | 'invalid'
  | 'reserved'
  | 'error';

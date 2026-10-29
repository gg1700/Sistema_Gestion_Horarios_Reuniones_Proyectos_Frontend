import type { WorkExperience } from '../mocks/account';

export interface PublicSnapshot {
  name: string; firstSurname: string; handle: string; image: string | null;
  secondSurname?: string; country?: string; address?: string; contactEmails?: string[]; phones?: string[];
  experiences?: WorkExperience[];
  links?: { id: string; label: string; url: string }[];
  repositories?: { id: string; name: string; description: string | null; language: string | null; stars: number; url: string }[];
  activity?: { id: string; date: string; when: string; title: string; detail: string }[];
}

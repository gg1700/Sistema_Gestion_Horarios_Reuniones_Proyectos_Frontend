import type { ProfileWorkExperience } from './profile-response.types';

export interface PublicSnapshot {
  name: string; firstSurname: string; handle: string; image: string | null;
  secondSurname?: string; country?: string; address?: string; contactEmails?: string[]; phones?: string[];
  experiences?: ProfileWorkExperience[];
  links?: { id: string; label: string; url: string }[];
  repositories?: { id: string; name: string; description: string | null; language: string | null; stars: number; url: string }[];
  activity?: { id: string; date: string; when: string; title: string; detail: string }[];
}
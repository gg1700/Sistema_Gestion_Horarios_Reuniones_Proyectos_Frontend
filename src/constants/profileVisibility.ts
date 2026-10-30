import type { ProfileVisibility } from '../types/profileVisibility';

export const defaultProfileVisibility: ProfileVisibility = {
  secondLastName: false,
  email: false,
  phone: false,
  country: true,
  address: false,
  workExperience: true,
  professionalLinks: true,
  repositories: false,
  githubActivity: false,
};
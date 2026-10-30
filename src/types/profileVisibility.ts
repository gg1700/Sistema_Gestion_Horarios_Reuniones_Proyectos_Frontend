export type VisibilityFieldKey =
  | 'secondLastName'
  | 'email'
  | 'phone'
  | 'country'
  | 'address'
  | 'workExperience'
  | 'professionalLinks'
  | 'repositories'
  | 'githubActivity';

export type ProfileVisibility = Record<VisibilityFieldKey, boolean>;
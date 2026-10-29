export const visibilityTypes = ['surname', 'email', 'phone', 'address', 'country', 'workExperience', 'link', 'repository', 'githubActivityList', 'githubActivityGrid'] as const;
export type VisibilityType = typeof visibilityTypes[number];
export interface VisibilityRecord {
  type: VisibilityType;
  id: string;
  visible: boolean;
}
export interface VisibilityProfile {
  handleName: string;
  name: string;
  firstSurname: string;
  profilePicture: string | null;
  surname: { surname: string | null } | null;
  contactEmails: { id: string; email: string }[];
  phones: { id: string; countryCode: string; phoneNumber: string }[];
  addresses: { id: string; address: string }[];
  countries: { id: string; countryName: string }[];
  workExperiences: { id: string; title: string; companyName: string | null }[];
  links: { id: string; text: string; url: string }[];
}

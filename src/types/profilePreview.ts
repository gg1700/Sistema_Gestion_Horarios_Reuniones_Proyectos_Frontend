
export type PublicProfile = {
  handleName: string;
  name: string;
  firstLastName: string;
  firstSurname?: string;
  profilePicture: string | null;
  secondLastName?: string;
  email?: string;
  phone?: string;
  country?: string;
  address?: string;
  surname?: string | null;
  phones?: { phoneNumber: string; countryCode: string }[];
  contactEmails?: { email: string }[];
  addresses?: { address: string }[];
  countries?: { countryName: string; countryCode: string }[];
  workExperiences?: { title: string; companyName: string | null; description: string | null; startDate: string; endDate: string | null }[];
  links?: { text: string; url: string }[];
  workExperience?: string[];
  professionalLinks?: {
    label: string;
    url: string;
  }[];
  repositories?: {
    name: string;
    description: string | null;
    language?: string | null;
    stars?: number;
    url: string;
  }[];
  githubActivity?: string[];
  
  githubActivityList?: {
  activity: string;
  }[];

  githubActivityGrid?: {
  activity: string;
  }[];
};

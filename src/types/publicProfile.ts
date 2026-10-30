
export interface PublicProfilePreview {
  handleName: string;
  name: string;
  firstSurname: string;
  profilePicture: string | null;
  surname: string | null;
  phones: { phoneNumber: string; countryCode: string; countryName: string }[];
  contactEmails: { email: string }[];
  addresses: { address: string }[];
  countries: { countryName: string; countryCode: string }[];
  workExperiences: {
    title: string;
    description: string | null;
    companyName: string | null;
    startDate: string;
    endDate: string | null;
  }[];
  links: { text: string; url: string }[];
  repositories: {
    name: string;
    description: string | null;
    language: string | null;
    stars: number;
    url: string;
  }[];
  githubActivityList: { activity: string }[];
  githubActivityGrid: { activity: string }[];
}


export interface PublicProfileViewData {
  name: string;
  firstSurname: string;
  handle: string;
  image: string | null;
  secondSurname?: string;
  country?: string;
  address?: string;
  contactEmails?: string[];
  phones?: string[];
  experiences?: {
    id: string;
    title: string;
    company: string;
    startDate: string;
    endDate: string | null;
    description: string;
  }[];
  links?: { id: string; label: string; url: string }[];
  repositories?: {
    id: string;
    name: string;
    description: string;
    language: string;
    stars: number;
    url: string;
  }[];
  activity?: { id: string; date: string; when: string; title: string; detail: string }[];
}


export type PublicProfile = {
  handleName: string;
  name: string;
  firstLastName: string;
  profilePicture: string | null;
  secondLastName?: string;
  email?: string;
  phone?: string;
  country?: string;
  address?: string;
  workExperience?: string[];
  professionalLinks?: {
    label: string;
    url: string;
  }[];
  repositories?: {
    name: string;
    description: string;
    url: string;
  }[];
  githubActivity?: string[];
};

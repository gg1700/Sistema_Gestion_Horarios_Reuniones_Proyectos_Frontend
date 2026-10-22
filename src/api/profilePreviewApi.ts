
import { getProfileVisibility } from "./profileVisibilityApi";
import type { PublicProfile } from "../types/profilePreview";

const mockProfile = {
  handleName: "msilva-dev",
  name: "Mateo",
  firstLastName: "Silva",
  profilePicture: null,
  secondLastName: "González",
  email: "mateo.silva@telematics.edu",
  phone: "+56 9 1234 5678",
  country: "Chile",
  address: "Santiago, Chile",
  workExperience: [
    "Ingeniero de Software y Redes Telemáticas",
    "Especialista en arquitecturas de microservicios",
  ],
  professionalLinks: [
    {
      label: "GitHub",
      url: "https://github.com/",
    },
    {
      label: "LinkedIn",
      url: "https://www.linkedin.com/",
    },
  ],
  repositories: [
    {
      name: "telemetry-platform",
      description: "Plataforma de monitoreo de sistemas distribuidos.",
      url: "https://github.com/",
    },
  ],
  githubActivity: [
    "Contribuciones recientes a proyectos de software.",
  ],
};

export async function getProfilePreview(): Promise<PublicProfile> {
  const visibility = await getProfileVisibility();

  const profile: PublicProfile = {
    handleName: mockProfile.handleName,
    name: mockProfile.name,
    firstLastName: mockProfile.firstLastName,
    profilePicture: mockProfile.profilePicture,
  };

  if (visibility.secondLastName) {
    profile.secondLastName = mockProfile.secondLastName;
  }

  if (visibility.email) {
    profile.email = mockProfile.email;
  }

  if (visibility.phone) {
    profile.phone = mockProfile.phone;
  }

  if (visibility.country) {
    profile.country = mockProfile.country;
  }

  if (visibility.address) {
    profile.address = mockProfile.address;
  }

  if (visibility.workExperience) {
    profile.workExperience = mockProfile.workExperience;
  }

  if (visibility.professionalLinks) {
    profile.professionalLinks = mockProfile.professionalLinks;
  }

  if (visibility.repositories) {
    profile.repositories = mockProfile.repositories;
  }

  if (visibility.githubActivity) {
    profile.githubActivity = mockProfile.githubActivity;
  }

  return profile;
}

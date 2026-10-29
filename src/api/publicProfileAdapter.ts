import type { PublicProfile } from '../types/profilePreview';
import type { PublicSnapshot } from '../types/publicSnapshot';

// Adapta los nombres del contrato real sin perder país, fechas, enlaces ni métricas.
// Recibe únicamente datos previamente filtrados por el servidor.
export function toPublicSnapshot(profile: PublicProfile): PublicSnapshot {
  return {
    name: profile.name, firstSurname: profile.firstSurname ?? profile.firstLastName,
    handle: profile.handleName, image: profile.profilePicture,
    secondSurname: profile.surname ?? profile.secondLastName,
    country: profile.countries?.map(item => item.countryName).join(' · ') || profile.country,
    address: profile.addresses?.map(item => item.address).join(' · ') || profile.address,
    contactEmails: profile.contactEmails?.map(item => item.email) ?? (profile.email ? [profile.email] : []),
    phones: profile.phones?.map(item => `${item.countryCode} ${item.phoneNumber}`) ?? (profile.phone ? [profile.phone] : []),
    experiences: profile.workExperiences?.map((item, index) => ({ id: `work-${index}`, title: item.title, company: item.companyName ?? '', description: item.description ?? '', startDate: item.startDate.slice(0, 10), endDate: item.endDate?.slice(0, 10) ?? null })),
    links: (profile.links ?? profile.professionalLinks?.map(item => ({ text: item.label, url: item.url })))?.map((item, index) => ({ id: `link-${index}`, label: item.text, url: item.url })),
    repositories: profile.repositories?.map(item => ({ id: item.url, name: item.name, description: item.description, language: item.language ?? null, stars: item.stars ?? 0, url: item.url })),
  };
}

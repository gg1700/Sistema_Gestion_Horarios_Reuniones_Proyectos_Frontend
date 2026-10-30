import type { PublicProfilePreview, PublicProfileViewData } from '../types/publicProfile';

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const isText = (value: unknown): value is string => typeof value === 'string';
const isNullableText = (value: unknown): value is string | null =>
  value === null || isText(value);

function hasList(
  value: unknown,
  validate: (record: JsonRecord) => boolean,
): boolean {
  return Array.isArray(value) && value.every(item => isRecord(item) && validate(item));
}

function isDate(value: unknown): value is string {
  if (!isText(value) || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isPublicProfilePreview(value: unknown): value is PublicProfilePreview {
  if (!isRecord(value)) return false;

  return isText(value.handleName) && isText(value.name) &&
    isText(value.firstSurname) && isNullableText(value.profilePicture) &&
    isNullableText(value.surname) &&
    hasList(value.phones, item => isText(item.phoneNumber) &&
      isText(item.countryCode) && isText(item.countryName)) &&
    hasList(value.contactEmails, item => isText(item.email)) &&
    hasList(value.addresses, item => isText(item.address)) &&
    hasList(value.countries, item => isText(item.countryName) && isText(item.countryCode)) &&
    hasList(value.workExperiences, item => isText(item.title) &&
      isNullableText(item.description) && isNullableText(item.companyName) &&
      isDate(item.startDate) && (item.endDate === null || isDate(item.endDate))) &&
    hasList(value.links, item => isText(item.text) && isText(item.url)) &&
    hasList(value.repositories, item => isText(item.name) &&
      isNullableText(item.description) && isNullableText(item.language) &&
      typeof item.stars === 'number' && Number.isInteger(item.stars) &&
      item.stars >= 0 && isText(item.url)) &&
    hasList(value.githubActivityList, item => isText(item.activity)) &&
    hasList(value.githubActivityGrid, item => isText(item.activity));
}

export function toPublicProfileView(profile: PublicProfilePreview): PublicProfileViewData {
  // Adaptar solo la respuesta pública; nunca completar campos con el perfil privado.
  return {
    name: profile.name,
    firstSurname: profile.firstSurname,
    handle: profile.handleName,
    image: profile.profilePicture,
    secondSurname: profile.surname || undefined,
    country: profile.countries.map(item => item.countryName).join(' · ') || undefined,
    address: profile.addresses.map(item => item.address).join(' · ') || undefined,
    contactEmails: profile.contactEmails.map(item => item.email),
    phones: profile.phones.map(item =>
      `${item.countryCode ? `+${item.countryCode.replace(/^\+/, '')} ` : ''}${item.phoneNumber}`,
    ),
    experiences: profile.workExperiences.map((item, index) => ({
      id: `experience-${index}`,
      title: item.title,
      company: item.companyName ?? '',
      startDate: item.startDate,
      endDate: item.endDate,
      description: item.description ?? '',
    })),
    links: profile.links.map((item, index) => ({
      id: `link-${index}`,
      label: item.text,
      url: item.url,
    })),
    repositories: profile.repositories.map((item, index) => ({
      id: `repository-${index}`,
      name: item.name,
      description: item.description || 'Sin descripción.',
      language: item.language || 'Sin especificar',
      stars: item.stars,
      url: item.url,
    })),
  };
}

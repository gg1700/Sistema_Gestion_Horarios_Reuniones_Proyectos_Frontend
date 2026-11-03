import type { PublicProfile } from '../types/profilePreview';
import type { PublicSnapshot } from '../types/publicSnapshot';

function toRecentActivities(
  entries: PublicProfile['githubActivityList']
): NonNullable<PublicSnapshot['activity']> {
  return (entries ?? []).flatMap((entry, index) => {
    try {
      const parsed: unknown = JSON.parse(entry.activity);

      if (
        !parsed ||
        typeof parsed !== 'object' ||
        Array.isArray(parsed)
      ) {
        return [];
      }

      const event = parsed as Record<string, unknown>;

      if (typeof event.type !== 'string') {
        return [];
      }

      const date =
        typeof event.date === 'string' &&
        /^\d{4}-\d{2}-\d{2}/.test(event.date)
          ? event.date.slice(0, 10)
          : '';

      const repository =
        typeof event.repository === 'string'
          ? event.repository
          : '';

      return [{
        id: `activity-${index}`,
        date,
        when: date || 'Fecha no disponible',
        title: event.type,
        detail: repository
          ? `Repositorio: ${repository}`
          : 'Actividad de GitHub'
      }];
    } catch {
      return [];
    }
  });
}

export function toPublicSnapshot(
  profile: PublicProfile
): PublicSnapshot {
  return {
    name: profile.name,
    firstSurname:
      profile.firstSurname ?? profile.firstLastName,
    handle: profile.handleName,
    image: profile.profilePicture,

    secondSurname:
      profile.surname ?? profile.secondLastName,

    country:
      profile.countries
        ?.map(item => item.countryName)
        .join(' · ') || profile.country,

    address:
      profile.addresses
        ?.map(item => item.address)
        .join(' · ') || profile.address,

    contactEmails:
      profile.contactEmails?.map(item => item.email) ?? [],

    phones:
      profile.phones?.map(
        item => `${item.countryCode} ${item.phoneNumber}`
      ) ?? [],

    experiences: profile.workExperiences?.map(
      (item, index) => ({
        id: `work-${index}`,
        title: item.title,
        company: item.companyName ?? '',
        description: item.description ?? '',
        startDate: item.startDate.slice(0, 10),
        endDate: item.endDate?.slice(0, 10) ?? null
      })
    ),

    links: (
      profile.links ??
      profile.professionalLinks?.map(item => ({
        text: item.label,
        url: item.url
      }))
    )?.map((item, index) => ({
      id: `link-${index}`,
      label: item.text,
      url: item.url
    })),

    repositories: profile.repositories?.map(item => ({
      id: item.url,
      name: item.name,
      description: item.description,
      language: item.language ?? null,
      stars: item.stars ?? 0,
      url: item.url
    })),

    activity: toRecentActivities(
      profile.githubActivityList
    )
  };
}

import type {
  VisibilityProfile,
  VisibilityRecord,
} from '../types/visibility';

export function visibilityKey(record: VisibilityRecord): string {
  if (
    record.type === 'repositories' ||
    record.type === 'githubActivity'
  ) {
    return record.type;
  }

  return `${record.type}:${record.id}`;
}

export function visibilityChanges(
  saved: VisibilityRecord[],
  draft: VisibilityRecord[],
): VisibilityRecord[] {
  const previous = new Map(
    saved.map(record => [visibilityKey(record), record.visible]),
  );

  return draft.filter(record =>
    previous.has(visibilityKey(record)) &&
    previous.get(visibilityKey(record)) !== record.visible,
  );
}

export function visibilityIsPublic(
  record: VisibilityRecord,
  records: VisibilityRecord[],
): boolean {
  if (!record.visible) return false;

  const generalType =
    record.type === 'repository'
      ? 'repositories'
      : record.type === 'githubActivityList' ||
          record.type === 'githubActivityGrid'
        ? 'githubActivity'
        : null;

  return generalType === null || records.some(
    item => item.type === generalType && item.visible === true,
  );
}

export function visibilityValue(
  record: VisibilityRecord,
  profile: VisibilityProfile,
): string {
  switch (record.type) {
    case 'surname':
      return profile.surname?.surname || 'Sin especificar';

    case 'email':
      return profile.contactEmails.find(
        item => item.id === record.id,
      )?.email || 'Correo de contacto';

    case 'phone': {
      const phone = profile.phones.find(item => item.id === record.id);
      return phone
        ? `+${phone.countryCode} ${phone.phoneNumber}`
        : 'Teléfono';
    }

    case 'address':
      return profile.addresses.find(
        item => item.id === record.id,
      )?.address || 'Dirección';

    case 'country':
      return profile.countries.find(
        item => item.id === record.id,
      )?.countryName || 'País';

    case 'workExperience': {
      const work = profile.workExperiences.find(
        item => item.id === record.id,
      );

      return work
        ? [work.title, work.companyName].filter(Boolean).join(' · ')
        : 'Experiencia laboral';
    }

    case 'link':
      return profile.links.find(
        item => item.id === record.id,
      )?.text || 'Enlace personal';

    case 'repositories':
      return 'Permite publicar los repositorios que marques individualmente.';

    case 'repository':
      return `Repositorio ${record.id}`;

    case 'githubActivity':
      return 'Permite publicar los elementos de actividad que marques individualmente.';

    case 'githubActivityList':
      return 'Lista de actividad de GitHub';

    case 'githubActivityGrid':
      return 'Cuadrícula de actividad de GitHub';
  }
}

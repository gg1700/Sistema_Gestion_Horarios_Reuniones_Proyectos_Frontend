import type { PublicProfile } from '../types/profilePreview';

interface MockPublicProfile {
  active: boolean;
  profile: PublicProfile;
}

export const mockPublicProfiles: Record<string, MockPublicProfile> = {
  'fav-2026': {
    active: true,
    profile: {
      handleName: 'fav-2026',
      name: 'Fav',
      firstLastName: 'Demo',
      profilePicture: null,
      email: 'fabio.demo@example.com',
      country: 'Bolivia',
      workExperience: [
        'Desarrollador de aplicaciones web.',
        'Participación en proyectos de desarrollo de software.',
      ],
      professionalLinks: [
        {
          label: 'Portafolio',
          url: 'https://example.com',
        },
      ],
      repositories: [
        {
          name: 'proyecto-demo',
          description: 'Repositorio de demostración de una aplicación web.',
          url: 'https://github.com',
        },
      ],
      githubActivity: [
        'Actualización de un repositorio de prueba.',
        'Participación en un proyecto colaborativo.',
      ],
    },
  },

  'perfil-basico': {
    active: true,
    profile: {
      handleName: 'perfil-basico',
      name: 'Ana',
      firstLastName: 'Demo',
      profilePicture: null,
    },
  },

  'enlace-inactivo': {
    active: false,
    profile: {
      handleName: 'enlace-inactivo',
      name: 'Usuario',
      firstLastName: 'Demo',
      profilePicture: null,
    },
  },
};

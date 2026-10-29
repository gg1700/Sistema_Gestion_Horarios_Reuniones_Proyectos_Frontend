export const paths = {
  home: '/',
  access: '/acceso',
  welcome: '/bienvenida',
  dashboard: '/panel',
  agenda: '/agenda',
  requests: '/solicitudes',
  changes: '/solicitudes/cambios',
  requestReview: '/solicitudes/:requestId/revisar',
  changeReview: '/solicitudes/cambios/:changeId/revisar',
  changeResult: '/solicitudes/cambios/:changeId/resultado',
  availability: '/:publicHandle/disponibilidad',
  participant: '/reuniones/:token',
  profile: '/perfil',
  profileSetup: '/perfil/completar',
  profileOrigins: '/perfil/procedencia',
  profileLink: '/perfil/enlace',
  visibility: '/perfil/visibilidad',
  connections: '/perfil/conexiones',
  githubInfo: '/perfil/conexiones/github',
  accessIssue: '/acceso/no-completado',
  publicProfile: '/:publicHandle',
} as const;

export function publicProfilePath(handle: string): string {
  return `/${encodeURIComponent(handle.replace(/^@/, ''))}`;
}

export const flowPaths = {
  availability: (handle: string) => `${publicProfilePath(handle)}/disponibilidad`,
  participant: (token: string) => `/reuniones/${encodeURIComponent(token)}`,
  reviewRequest: (id: string) => `/solicitudes/${encodeURIComponent(id)}/revisar`,
  reviewChange: (id: string) => `/solicitudes/cambios/${encodeURIComponent(id)}/revisar`,
  changeResult: (id: string) => `/solicitudes/cambios/${encodeURIComponent(id)}/resultado`,
};

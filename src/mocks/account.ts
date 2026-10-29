/** Datos y transiciones de interfaz. Ningún permiso o token real se guarda aquí. */
export type Provider = 'google' | 'github';
export interface ContactEmail { id: string; value: string }
export interface ContactPhone { id: string; code: string; number: string }
export interface PersonalLink { id: string; label: string; url: string }
export interface ProfileDetails {
  secondSurname: string; country: string; address: string; image: string | null;
  contactEmails: ContactEmail[]; phones: ContactPhone[]; links: PersonalLink[];
}
export interface WorkExperience { id: string; title: string; company: string; startDate: string; endDate: string | null; description: string }
export interface VisibilitySettings {
  secondSurname: boolean; country: boolean; address: boolean; contactEmail: boolean;
  phone: boolean; experience: boolean; links: boolean; repositories: boolean; githubActivity: boolean;
}
export interface AccountState {
  deleted: boolean; additionalInfoCompleted: boolean; details: ProfileDetails;
  experiences: WorkExperience[]; visibility: VisibilitySettings;
  publicLinkEnabled: boolean;
  fieldOrigins: Partial<Record<'name' | 'firstSurname' | 'secondSurname' | 'country' | 'contactEmail', { provider: Provider; originalValue: string }>>;
  google: { identityLinked: boolean; calendarStatus: 'connected' | 'reconnect' | 'disconnected'; calendarId: string | null };
  github: { identityLinked: boolean; dataConnected: boolean; selectedRepositories: string[]; refreshedAt: string | null };
}
export const calendars = [
  { id: 'personal', name: 'Personal', description: 'Calendario principal', color: '#a3f5ce', primary: true },
  { id: 'trabajo', name: 'Trabajo', description: 'Calendario de trabajo', color: '#8ab4e8', primary: false },
  { id: 'universidad', name: 'Universidad', description: 'Calendario académico', color: '#c8a6d9', primary: false },
];
export const repositories = [
  { id: 'orbitia-web', name: 'orbitia-web', description: 'Interfaz web para coordinar perfiles, calendarios y reuniones.', language: 'TypeScript', stars: 24, forks: 4, url: 'https://github.com/mateosilva/orbitia-web' },
  { id: 'telematics-api', name: 'telematics-api', description: 'Servicios de integración para herramientas de trabajo.', language: 'TypeScript', stars: 18, forks: 3, url: 'https://github.com/mateosilva/telematics-api' },
  { id: 'network-lab', name: 'network-lab', description: 'Ejercicios y herramientas de análisis de redes.', language: 'Python', stars: 12, forks: 2, url: 'https://github.com/mateosilva/network-lab' },
  { id: 'ui-experiments', name: 'ui-experiments', description: 'Exploraciones de interfaces y componentes.', language: 'JavaScript', stars: 7, forks: 1, url: 'https://github.com/mateosilva/ui-experiments' },
  { id: 'study-notes', name: 'study-notes', description: 'Apuntes y recursos de desarrollo.', language: 'Markdown', stars: 3, forks: 0, url: 'https://github.com/mateosilva/study-notes' },
];
export const githubActivity = [
  { id: 'activity-1', date: '2026-10-26T10:42:00-04:00', when: 'Hoy · 10:42', title: 'Actualizó orbitia-web', detail: 'Push · 3 commits en main' },
  { id: 'activity-2', date: '2026-10-25T16:18:00-04:00', when: 'Ayer · 16:18', title: 'Abrió una incidencia en telematics-api', detail: 'Issue #24 · Ajustar normalización de eventos' },
  { id: 'activity-3', date: '2026-10-24T09:30:00-04:00', when: '24 oct · 09:30', title: 'Publicó cambios en network-lab', detail: 'Push · 2 commits en main' },
];

export function createInitialAccount(): AccountState {
  return {
    deleted: false, additionalInfoCompleted: false, publicLinkEnabled: true,
    fieldOrigins: { name: { provider: 'github', originalValue: 'Mateo' } },
    details: { secondSurname: 'Gutiérrez', country: 'Bolivia', address: 'Av. 6 de Agosto, La Paz', image: null,
      contactEmails: [{ id: 'email-contact', value: 'contacto@mateosilva.dev' }],
      phones: [{ id: 'phone-contact', code: '+591', number: '70123456' }],
      links: [{ id: 'portfolio', label: 'Portafolio', url: 'https://mateosilva.dev' }] },
    experiences: [
      { id: 'work-frontend', title: 'Desarrollador frontend', company: 'Nexo Digital', startDate: '2024-03-01', endDate: '2025-12-31', description: 'Desarrollo de interfaces web y componentes reutilizables para herramientas de colaboración.' },
      { id: 'work-assistant', title: 'Asistente de desarrollo', company: 'Estudio Nodo', startDate: '2023-01-01', endDate: '2024-02-29', description: 'Apoyo en interfaces web, documentación y pruebas de componentes.' },
    ],
    visibility: { secondSurname: false, country: true, address: false, contactEmail: false, phone: false, experience: true, links: true, repositories: false, githubActivity: false },
    google: { identityLinked: true, calendarStatus: 'reconnect', calendarId: 'personal' },
    github: { identityLinked: true, dataConnected: true, selectedRepositories: ['orbitia-web', 'telematics-api', 'network-lab'], refreshedAt: null },
  };
}

export function normalizeLink(value: string): string {
  const input = value.trim();
  if (/^[a-z][a-z0-9+.-]*:/i.test(input) && !/^https?:\/\//i.test(input)) throw new Error('Usa un enlace HTTP o HTTPS.');
  try {
    const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || !url.hostname.includes('.')) throw new Error();
    return url.toString();
  } catch { throw new Error('Revisa la dirección del enlace.'); }
}

export function validateDetails(details: ProfileDetails): ProfileDetails {
  if (details.links.length > 5) throw new Error('Puedes agregar hasta 5 enlaces personales.');
  if (details.contactEmails.some(email => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))) throw new Error('Revisa los correos de contacto.');
  if (details.phones.some(phone => !/^\+\d{1,3}$/.test(phone.code) || !/^\d{6,15}$/.test(phone.number))) throw new Error('Revisa el código y el número de teléfono.');
  return { ...details, secondSurname: details.secondSurname.trim(), country: details.country.trim(), address: details.address.trim(),
    contactEmails: details.contactEmails.map(email => ({ ...email, value: email.value.trim() })),
    links: details.links.map(link => { if (!link.label.trim()) throw new Error('Agrega un nombre a cada enlace.'); return { ...link, label: link.label.trim(), url: normalizeLink(link.url) }; }) };
}
function validDate(value: string) { const parsed = new Date(`${value}T12:00:00Z`); return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(parsed.getTime()) && parsed.toISOString().startsWith(value); }

export type AccountAction =
  | { type: 'save-details'; details: ProfileDetails }
  | { type: 'save-experience'; experience: WorkExperience }
  | { type: 'remove-experience'; id: string }
  | { type: 'save-visibility'; visibility: VisibilitySettings }
  | { type: 'set-public-link'; enabled: boolean }
  | { type: 'authorize-provider'; provider: Provider }
  | { type: 'select-calendar'; id: string }
  | { type: 'stop-calendar' }
  | { type: 'stop-github-data' }
  | { type: 'unlink-provider'; provider: Provider }
  | { type: 'select-repositories'; ids: string[] }
  | { type: 'refresh-github'; at: string }
  | { type: 'delete-account'; confirmation: string };

export function transitionAccount(state: AccountState, action: AccountAction): AccountState {
  switch (action.type) {
    case 'save-details': return { ...state, details: validateDetails(action.details), additionalInfoCompleted: true };
    case 'save-experience': {
      const experience = action.experience;
      if (!experience.title.trim() || !validDate(experience.startDate)) throw new Error('Completa el cargo y una fecha de inicio válida.');
      if (experience.endDate && (!validDate(experience.endDate) || experience.endDate < experience.startDate)) throw new Error('La fecha de fin debe ser posterior o igual a la de inicio.');
      if (experience.description.length > 200) throw new Error('La descripción admite hasta 200 caracteres.');
      const exists = state.experiences.some(item => item.id === experience.id);
      if (!exists && state.experiences.length >= 10) throw new Error('Puedes agregar hasta 10 experiencias.');
      return { ...state, experiences: exists ? state.experiences.map(item => item.id === experience.id ? { ...experience, title: experience.title.trim() } : item) : [...state.experiences, { ...experience, title: experience.title.trim() }] };
    }
    case 'remove-experience': return { ...state, experiences: state.experiences.filter(item => item.id !== action.id) };
    case 'save-visibility': return { ...state, visibility: { ...action.visibility } };
    case 'set-public-link': return { ...state, publicLinkEnabled: action.enabled };
    case 'authorize-provider': return action.provider === 'google' ? { ...state, google: { ...state.google, identityLinked: true, calendarStatus: 'connected' } } : { ...state, github: { ...state.github, identityLinked: true, dataConnected: true } };
    case 'select-calendar': {
      if (!state.google.identityLinked || state.google.calendarStatus !== 'connected') throw new Error('Autoriza Google antes de elegir un calendario.');
      if (!calendars.some(calendar => calendar.id === action.id)) throw new Error('Selecciona un calendario disponible.');
      return { ...state, google: { ...state.google, calendarId: action.id, calendarStatus: 'connected' } };
    }
    case 'stop-calendar': return { ...state, google: { ...state.google, calendarStatus: 'disconnected' } };
    case 'stop-github-data': return { ...state, github: { ...state.github, dataConnected: false } };
    case 'unlink-provider': {
      const other = action.provider === 'google' ? state.github.identityLinked : state.google.identityLinked;
      if (!other) throw new Error('Vincula otra cuenta antes de quitar tu única forma de entrar.');
      return action.provider === 'google' ? { ...state, google: { ...state.google, identityLinked: false, calendarStatus: 'disconnected' } } : { ...state, github: { ...state.github, identityLinked: false, dataConnected: false } };
    }
    case 'select-repositories': {
      if (!state.github.dataConnected) throw new Error('Conecta GitHub antes de seleccionar repositorios.');
      if (action.ids.length > 5 || new Set(action.ids).size !== action.ids.length || action.ids.some(id => !repositories.some(repo => repo.id === id))) throw new Error('Selecciona hasta 5 repositorios distintos y disponibles.');
      return { ...state, github: { ...state.github, selectedRepositories: [...action.ids] } };
    }
    case 'refresh-github': {
      if (!state.github.dataConnected) throw new Error('Vuelve a conectar GitHub para actualizar.');
      return { ...state, github: { ...state.github, refreshedAt: action.at } };
    }
    case 'delete-account': {
      if (action.confirmation !== 'ELIMINAR') throw new Error('Escribe ELIMINAR para confirmar.');
      return { ...createInitialAccount(), deleted: true, publicLinkEnabled: false, fieldOrigins: {}, details: { secondSurname: '', country: '', address: '', image: null, contactEmails: [], phones: [], links: [] }, experiences: [], google: { identityLinked: false, calendarId: null, calendarStatus: 'disconnected' }, github: { identityLinked: false, dataConnected: false, selectedRepositories: [], refreshedAt: null } };
    }
  }
}

/** Filtrar antes de mostrar: el correo de acceso nunca se incluye en el perfil público. */
export function publicProfileSnapshot(identity: { name: string; firstSurname: string; handle: string }, account: AccountState) {
  if (account.deleted) return null;
  const { details, visibility } = account;
  return {
    name: identity.name, firstSurname: identity.firstSurname, handle: identity.handle, image: details.image,
    ...(visibility.secondSurname && details.secondSurname ? { secondSurname: details.secondSurname } : {}),
    ...(visibility.country && details.country ? { country: details.country } : {}),
    ...(visibility.address && details.address ? { address: details.address } : {}),
    ...(visibility.contactEmail ? { contactEmails: details.contactEmails.map(email => email.value) } : {}),
    ...(visibility.phone ? { phones: details.phones.map(phone => `${phone.code} ${phone.number}`) } : {}),
    ...(visibility.experience ? { experiences: account.experiences } : {}),
    ...(visibility.links ? { links: details.links } : {}),
    ...(visibility.repositories && account.github.dataConnected ? { repositories: account.github.selectedRepositories.flatMap(id => repositories.find(repo => repo.id === id) ?? []) } : {}),
    ...(visibility.githubActivity && account.github.dataConnected ? { activity: githubActivity } : {}),
  };
}

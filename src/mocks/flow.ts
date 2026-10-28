/**
 * Estado exclusivo de la maqueta navegable. No representa una sesión autenticada.
 * Al integrar, sustituir estas transiciones por las respuestas del servidor.
 * Los contratos con método, JSON y validaciones están comentados en cada pantalla.
 * sessionStorage y los ids de la URL no conceden permisos sobre datos reales.
 */
import { createInitialAccount, transitionAccount, type AccountAction, type AccountState, type ProfileDetails } from './account.ts';

export interface DemoProfile { name: string; firstSurname: string; handle: string; email: string }
export interface TimeRange { start: string; end: string }
export interface Meeting extends TimeRange {
  id: string; title: string; description: string; guestName: string; guestEmail: string;
  participantToken: string; meetUrl: string; calendarId: string;
}
export interface BookingRequest extends TimeRange {
  id: string; title: string; message: string; guestName: string; guestEmail: string;
  status: 'pending' | 'accepted' | 'rejected'; meetingId?: string; calendarId: string;
}
export interface ScheduleChange extends TimeRange {
  id: string; meetingId: string; message: string; originalStart: string; originalEnd: string;
  status: 'pending' | 'accepted' | 'rejected';
}
export interface CalendarEvent extends TimeRange {
  id: string; title: string; description: string; calendarId: string; canEdit: boolean; meetUrl?: string;
}
export interface FlowState {
  version: 1; profile: DemoProfile; profileCompleted: boolean; demoSignedIn: boolean;
  requests: BookingRequest[]; meetings: Meeting[]; changes: ScheduleChange[];
  account: AccountState;
  calendarEvents: CalendarEvent[];
}

export const OWNER_TIME_ZONE = 'America/La_Paz';
export const DEMO_TODAY = '2026-10-26';
export const initialProfile: DemoProfile = { name: 'Mateo', firstSurname: 'Silva', handle: 'mateo-silva', email: 'mateo.silva@correo.com' };
export const guest = { name: 'Elena Vega', email: 'elena.vega@correo.com' };
export const personalEvents: CalendarEvent[] = [
  { id: 'personal-work', title: 'Trabajo personal', description: 'Organizar el trabajo individual y revisar los temas pendientes.', calendarId: 'personal', canEdit: true, start: '2026-10-26T09:00:00-04:00', end: '2026-10-26T10:00:00-04:00' },
  { id: 'project-followup', title: 'Seguimiento de proyecto', description: 'Revisar los avances y coordinar las próximas tareas.', calendarId: 'personal', canEdit: true, start: '2026-10-27T14:00:00-04:00', end: '2026-10-27T15:00:00-04:00' },
  { id: 'deliverables', title: 'Revisión de entregables', description: 'Revisar los entregables del proyecto.', calendarId: 'personal', canEdit: true, start: '2026-10-30T11:30:00-04:00', end: '2026-10-30T12:30:00-04:00' },
  { id: 'private-commitment', title: 'Compromiso personal', description: '', calendarId: 'personal', canEdit: true, start: '2026-10-28T16:00:00-04:00', end: '2026-10-28T16:30:00-04:00' },
];

export function createInitialFlow(): FlowState {
  return {
    version: 1, profile: { ...initialProfile }, profileCompleted: false, demoSignedIn: false, account: createInitialAccount(), calendarEvents: personalEvents.map(event => ({ ...event })),
    // La solicitud pendiente usa otro bloque: no duplica la reunión ya confirmada.
    requests: [{ id: 'request-elena', calendarId: 'personal', title: 'Revisión de arquitectura', message: 'Me gustaría revisar la propuesta de integración de servicios y resolver algunas dudas sobre la arquitectura.', guestName: guest.name, guestEmail: guest.email, start: '2026-10-28T14:00:00-04:00', end: '2026-10-28T14:30:00-04:00', status: 'pending' }],
    meetings: [{ id: 'meeting-review', calendarId: 'personal', title: 'Revisión de arquitectura', description: 'Revisar la propuesta de integración de servicios y acordar los próximos pasos de arquitectura.', guestName: guest.name, guestEmail: guest.email, start: '2026-10-28T10:30:00-04:00', end: '2026-10-28T11:00:00-04:00', participantToken: 'mock-invitacion-arquitectura', meetUrl: 'https://meet.google.com/abc-defg-hij' }],
    changes: [{ id: 'change-elena', meetingId: 'meeting-review', start: '2026-10-29T15:00:00-04:00', end: '2026-10-29T15:30:00-04:00', originalStart: '2026-10-28T10:30:00-04:00', originalEnd: '2026-10-28T11:00:00-04:00', message: '¿Podemos mover la revisión al jueves por la tarde? Mantendríamos la misma duración y los mismos temas.', status: 'pending' }],
  };
}

export type FlowAction =
  | { type: 'complete-profile'; profile: DemoProfile; provider?: 'google' | 'github' }
  | { type: 'update-profile'; name: string; firstSurname: string; details: ProfileDetails }
  | { type: 'change-handle'; handle: string }
  | { type: 'save-calendar-event'; event: CalendarEvent; create: boolean }
  | { type: 'delete-calendar-event'; id: string }
  | { type: 'account'; action: AccountAction }
  | { type: 'sign-out' }
  | { type: 'request-booking'; request: BookingRequest }
  | { type: 'decide-booking'; id: string; decision: 'accepted' | 'rejected'; meetingId: string; participantToken: string }
  | { type: 'propose-change'; change: ScheduleChange }
  | { type: 'decide-change'; id: string; decision: 'accepted' | 'rejected' };

export function overlaps(a: TimeRange, b: TimeRange): boolean {
  return Date.parse(a.start) < Date.parse(b.end) && Date.parse(b.start) < Date.parse(a.end);
}

export function validateRange(range: TimeRange): void {
  if (!Number.isFinite(Date.parse(range.start)) || !Number.isFinite(Date.parse(range.end)) || Date.parse(range.end) <= Date.parse(range.start)) {
    throw new Error('El fin debe ser posterior al inicio.');
  }
  if (!/([+-]\d\d:\d\d|Z)$/.test(range.start) || !/([+-]\d\d:\d\d|Z)$/.test(range.end)) {
    throw new Error('El horario debe incluir su zona horaria.');
  }
}

export function calendarReady(state: FlowState): boolean {
  return !state.account.deleted && state.account.google.identityLinked && state.account.google.calendarStatus === 'connected' && Boolean(state.account.google.calendarId);
}
export function calendarMeetings(state: FlowState) {
  return state.meetings.filter(meeting => meeting.calendarId === state.account.google.calendarId);
}
export function isRangeFree(state: FlowState, range: TimeRange, exceptMeetingId?: string, calendarId = state.account.google.calendarId): boolean {
  return ![...state.calendarEvents.filter(event => event.calendarId === calendarId), ...state.meetings.filter(meeting => meeting.calendarId === calendarId && meeting.id !== exceptMeetingId)].some(event => overlaps(event, range));
}

const reservedHandles = ['admin', 'api', 'login', 'public', 'acceso', 'panel', 'agenda', 'solicitudes', 'perfil', 'bienvenida', 'reuniones'];
export function validateHandle(handle: string) {
  if (!/^[a-z0-9-]{3,50}$/.test(handle) || reservedHandles.includes(handle)) throw new Error('Usa entre 3 y 50 letras minúsculas, números o guiones y un identificador no reservado.');
}
export function publicProfileAvailable(state: FlowState, handle: string | undefined) {
  return !state.account.deleted && state.account.publicLinkEnabled && handle === state.profile.handle;
}
function assertCalendarWrite(state: FlowState, calendarId: string) {
  if (!calendarReady(state)) throw new Error('Vuelve a autorizar Google Calendar antes de guardar cambios.');
  if (calendarId !== state.account.google.calendarId) throw new Error('El calendario cambió. Vuelve a abrir el evento.');
}

export function transitionFlow(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case 'complete-profile': {
      const { profile } = action;
      if (!profile.name.trim() || !profile.firstSurname.trim()) {
        throw new Error('Completa tu nombre, apellido y un usuario válido de 3 a 50 caracteres.');
      }
      validateHandle(profile.handle);
      const fresh = state.account.deleted ? createInitialFlow() : state;
      return { ...fresh, profile: { ...profile, name: profile.name.trim(), firstSurname: profile.firstSurname.trim() }, profileCompleted: true, demoSignedIn: true, account: state.account.deleted ? transitionAccount(fresh.account, { type: 'authorize-provider', provider: action.provider ?? 'google' }) : fresh.account };
    }
    case 'update-profile': {
      if (!action.name.trim() || !action.firstSurname.trim()) throw new Error('El nombre y primer apellido son obligatorios.');
      return { ...state, profile: { ...state.profile, name: action.name.trim(), firstSurname: action.firstSurname.trim() }, account: transitionAccount(state.account, { type: 'save-details', details: action.details }) };
    }
    case 'change-handle': {
      validateHandle(action.handle);
      if (state.account.deleted) throw new Error('Esta cuenta ya no está disponible.');
      if (action.handle === state.profile.handle) throw new Error('Elige un identificador diferente al actual.');

      return { ...state, profile: { ...state.profile, handle: action.handle } };
    }
    case 'save-calendar-event': {
      const event = action.event;
      const existing = state.calendarEvents.find(item => item.id === event.id);
      assertCalendarWrite(state, event.calendarId);
      validateRange(event);
      if (!event.title.trim()) throw new Error('Agrega un título al evento.');
      if (action.create && (existing || state.meetings.some(item => item.id === event.id))) throw new Error('Este evento ya existe.');
      if (!action.create && (!existing || !existing.canEdit)) throw new Error('No tienes permiso para modificar este evento.');
      if (existing && existing.calendarId !== event.calendarId) throw new Error('El evento pertenece a otro calendario.');
      const next = { ...event, title: event.title.trim(), canEdit: existing?.canEdit ?? true };
      return { ...state, calendarEvents: action.create ? [...state.calendarEvents, next] : state.calendarEvents.map(item => item.id === event.id ? next : item) };
    }
    case 'delete-calendar-event': {
      const event = state.calendarEvents.find(item => item.id === action.id);
      if (!event || !event.canEdit) throw new Error('No tienes permiso para eliminar este evento.');
      assertCalendarWrite(state, event.calendarId);
      return { ...state, calendarEvents: state.calendarEvents.filter(item => item.id !== action.id) };
    }
    case 'account': {
      const account = transitionAccount(state.account, action.action);
      return account.deleted ? { ...state, account, profileCompleted: false, demoSignedIn: false, requests: [], meetings: [], changes: [], calendarEvents: [] } : { ...state, account };
    }
    case 'sign-out': return { ...state, demoSignedIn: false };
    case 'request-booking': {
      const request = action.request;
      if (!state.account.publicLinkEnabled || !calendarReady(state)) throw new Error('Por ahora no se pueden solicitar horarios. Vuelve a consultar más tarde.');
      if (request.calendarId !== state.account.google.calendarId) throw new Error('La disponibilidad cambió. Vuelve a elegir un horario.');
      validateRange(request);
      if (!request.guestName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.guestEmail) || !request.title.trim()) throw new Error('Completa el nombre, correo y asunto de la solicitud.');
      if (!isRangeFree(state, request)) throw new Error('Ese horario ya está ocupado. Elige otro espacio.');
      if (state.requests.some(existing => existing.status === 'pending' && existing.guestEmail.toLowerCase() === request.guestEmail.toLowerCase() && existing.start === request.start)) throw new Error('Ya tienes una solicitud pendiente para ese horario.');
      return { ...state, requests: [...state.requests, { ...request, status: 'pending' }] };
    }
    case 'decide-booking': {
      const request = state.requests.find(item => item.id === action.id);
      if (!request || request.status !== 'pending') throw new Error('Esta solicitud ya no está pendiente.');
      if (action.decision === 'accepted') assertCalendarWrite(state, request.calendarId);
      if (action.decision === 'accepted' && !isRangeFree(state, request)) throw new Error('El horario ya no está libre. Conserva la solicitud o recházala.');
      const meetings = action.decision === 'accepted' ? [...state.meetings, { id: action.meetingId, calendarId: request.calendarId, title: request.title, description: request.message, guestName: request.guestName, guestEmail: request.guestEmail, start: request.start, end: request.end, participantToken: action.participantToken, meetUrl: 'https://meet.google.com/abc-defg-hij' }] : state.meetings;
      return { ...state, meetings, requests: state.requests.map(item => item.id === action.id ? { ...item, status: action.decision, meetingId: action.decision === 'accepted' ? action.meetingId : undefined } : item) };
    }
    case 'propose-change': {
      const meeting = state.meetings.find(item => item.id === action.change.meetingId);
      if (!meeting) throw new Error('La reunión no está disponible.');
      validateRange(action.change);
      if (action.change.start === meeting.start && action.change.end === meeting.end) throw new Error('Propón un horario diferente al actual.');
      if (state.changes.some(item => item.meetingId === meeting.id && item.status === 'pending')) throw new Error('Ya hay una propuesta pendiente para esta reunión.');
      if (!isRangeFree(state, action.change, meeting.id, meeting.calendarId)) throw new Error('Ese horario no está disponible.');
      return { ...state, changes: [...state.changes, { ...action.change, originalStart: meeting.start, originalEnd: meeting.end, status: 'pending' }] };
    }
    case 'decide-change': {
      const change = state.changes.find(item => item.id === action.id);
      const meeting = state.meetings.find(item => item.id === change?.meetingId);
      if (!change || !meeting || change.status !== 'pending') throw new Error('Esta propuesta ya no está pendiente.');
      if (action.decision === 'accepted') assertCalendarWrite(state, meeting.calendarId);
      if (action.decision === 'accepted' && !isRangeFree(state, change, meeting.id, meeting.calendarId)) throw new Error('El nuevo horario ya no está disponible.');
      return { ...state, meetings: action.decision === 'accepted' ? state.meetings.map(item => item.id === meeting.id ? { ...item, start: change.start, end: change.end } : item) : state.meetings, changes: state.changes.map(item => item.id === change.id ? { ...item, status: action.decision } : item) };
    }
  }
}

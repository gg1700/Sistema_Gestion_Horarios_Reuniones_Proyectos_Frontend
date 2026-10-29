import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialFlow, transitionFlow, isRangeFree, publicProfileAvailable, calendarMeetings } from '../flow.ts';
import { publicProfileSnapshot } from '../account.ts';
import { calendarDaySegments, weekStart } from '../../utils/calendar.ts';

function connectedFlow() {
  return transitionFlow(createInitialFlow(), { type: 'account', action: { type: 'authorize-provider', provider: 'google' } });
}
const event = { id: 'created-event', title: 'Preparar integración', description: 'Revisar los puntos pendientes.', calendarId: 'personal', canEdit: true, start: '2026-10-27T09:00:00-04:00', end: '2026-10-27T10:00:00-04:00' };

test('crear, mover y eliminar un evento actualiza los bloques públicos sin alterar reuniones', () => {
  const state = connectedFlow();
  assert.equal(isRangeFree(state, event), true);
  const created = transitionFlow(state, { type: 'save-calendar-event', event, create: true });
  assert.equal(isRangeFree(created, event), false);
  assert.equal(created.calendarEvents.length, state.calendarEvents.length + 1);
  const movedEvent = { ...event, start: '2026-10-27T11:00:00-04:00', end: '2026-10-27T12:00:00-04:00', meetUrl: 'https://meet.google.com/abc-defg-hij' };
  const edited = transitionFlow(created, { type: 'save-calendar-event', event: movedEvent, create: false });
  assert.equal(isRangeFree(edited, event), true);
  assert.equal(isRangeFree(edited, movedEvent), false);
  assert.equal(edited.calendarEvents.find(item => item.id === event.id).meetUrl, movedEvent.meetUrl);
  const deleted = transitionFlow(edited, { type: 'delete-calendar-event', id: event.id });
  assert.equal(isRangeFree(deleted, movedEvent), true);
  assert.deepEqual(deleted.meetings, state.meetings);
  assert.deepEqual(deleted.requests, state.requests);
  assert.deepEqual(deleted.changes, state.changes);
  assert.deepEqual(state.calendarEvents, createInitialFlow().calendarEvents);
});

test('escritura de eventos respeta autorización, permisos y calendario seleccionado', () => {
  const state = connectedFlow();
  assert.throws(() => transitionFlow(createInitialFlow(), { type: 'save-calendar-event', event, create: true }), /autorizar/);
  assert.throws(() => transitionFlow(state, { type: 'save-calendar-event', event: { ...event, calendarId: 'trabajo' }, create: true }), /calendario cambió/);
  assert.throws(() => transitionFlow(state, { type: 'save-calendar-event', event: { ...event, end: event.start }, create: true }), /posterior/);
  const readonly = { ...state, calendarEvents: [{ ...event, canEdit: false }] };
  assert.throws(() => transitionFlow(readonly, { type: 'save-calendar-event', event, create: false }), /permiso/);
  assert.throws(() => transitionFlow(readonly, { type: 'delete-calendar-event', id: event.id }), /permiso/);
  const stopped = transitionFlow(state, { type: 'account', action: { type: 'stop-calendar' } });
  assert.throws(() => transitionFlow(stopped, { type: 'delete-calendar-event', id: 'personal-work' }), /autorizar/);
});

test('las reservas y cambios vuelven a comprobar la disponibilidad tras crear un evento', () => {
  let state = connectedFlow();
  state = transitionFlow(state, { type: 'save-calendar-event', event: { ...event, start: state.requests[0].start, end: state.requests[0].end }, create: true });
  assert.throws(() => transitionFlow(state, { type: 'decide-booking', id: 'request-elena', decision: 'accepted', meetingId: 'new-meeting', participantToken: 'new-token' }), /ya no está libre/);
  state = transitionFlow(connectedFlow(), { type: 'save-calendar-event', event: { ...event, start: '2026-10-29T15:00:00-04:00', end: '2026-10-29T15:30:00-04:00' }, create: true });
  assert.throws(() => transitionFlow(state, { type: 'decide-change', id: 'change-elena', decision: 'accepted' }), /no está disponible/);
});

test('solapamientos y eventos de varios días permanecen visibles en el calendario', () => {
  const overlap = { ...event, id: 'overlap', start: '2026-10-27T09:30:00-04:00', end: '2026-10-27T10:30:00-04:00' };
  const adjacent = { ...event, id: 'adjacent', start: overlap.end, end: '2026-10-27T11:00:00-04:00' };
  const segments = calendarDaySegments([event, overlap, adjacent], '2026-10-27');
  assert.deepEqual(segments.map(item => [item.column, item.columns]), [[0, 2], [1, 2], [0, 1]]);
  const overnight = { ...event, start: '2026-10-27T23:00:00-04:00', end: '2026-10-28T02:00:00-04:00' };
  assert.equal(calendarDaySegments([overnight], '2026-10-27')[0].endMinute, 1440);
  assert.equal(calendarDaySegments([overnight], '2026-10-28')[0].startMinute, 0);
  assert.equal(calendarDaySegments([overnight], '2026-10-28')[0].endMinute, 120);
  assert.equal(weekStart('2026-11-03'), '2026-11-02');
});

test('cambiar identificador invalida la dirección anterior y conserva todos los datos', () => {
  const state = createInitialFlow();
  const next = transitionFlow(state, { type: 'change-handle', handle: 'mateo-silva-dev' });
  assert.equal(publicProfileAvailable(next, 'mateo-silva'), false);
  assert.equal(publicProfileAvailable(next, 'mateo-silva-dev'), true);
  assert.deepEqual(next.account, state.account);
  assert.deepEqual(next.calendarEvents, state.calendarEvents);
  assert.deepEqual(next.meetings, state.meetings);
  for (const handle of ['perfil', 'admin', 'ABCD', 'a b', 'ab', 'a'.repeat(51), state.profile.handle]) {
    assert.throws(() => transitionFlow(state, { type: 'change-handle', handle }));
  }
});

test('desactivar el enlace bloquea su consulta y conserva la vista previa privada', () => {
  const state = createInitialFlow();
  const disabled = transitionFlow(state, { type: 'account', action: { type: 'set-public-link', enabled: false } });
  assert.equal(publicProfileAvailable(disabled, state.profile.handle), false);
  assert.notEqual(publicProfileSnapshot(disabled.profile, disabled.account), null);
  const enabled = transitionFlow(disabled, { type: 'account', action: { type: 'set-public-link', enabled: true } });
  assert.equal(publicProfileAvailable(enabled, state.profile.handle), true);
  assert.deepEqual(enabled.account.visibility, state.account.visibility);
});

test('personalizar un dato importado y actualizar GitHub conserva la procedencia y el valor propio', () => {
  const state = createInitialFlow();
  const edited = transitionFlow(state, { type: 'update-profile', name: 'Mateo Ignacio', firstSurname: 'Silva', details: state.account.details });
  const refreshed = transitionFlow(edited, { type: 'account', action: { type: 'refresh-github', at: '2026-10-27T12:00:00-04:00' } });
  assert.equal(refreshed.profile.name, 'Mateo Ignacio');
  assert.deepEqual(refreshed.account.fieldOrigins.name, { provider: 'github', originalValue: 'Mateo' });
});

test('sin Calendar autorizado no se confirma una reunión ni se aplica una reprogramación', () => {
  const state = createInitialFlow();
  assert.throws(() => transitionFlow(state, { type: 'decide-booking', id: 'request-elena', decision: 'accepted', meetingId: 'new', participantToken: 'token' }), /autorizar/);
  assert.throws(() => transitionFlow(state, { type: 'decide-change', id: 'change-elena', decision: 'accepted' }), /autorizar/);
  const rejected = transitionFlow(state, { type: 'decide-booking', id: 'request-elena', decision: 'rejected', meetingId: '', participantToken: '' });
  assert.equal(rejected.requests[0].status, 'rejected');
  assert.deepEqual(rejected.meetings, state.meetings);
});

test('cambiar de calendario no traslada reuniones ni confirma solicitudes del calendario anterior', () => {
  const state = connectedFlow();
  const changed = transitionFlow(state, { type: 'account', action: { type: 'select-calendar', id: 'trabajo' } });
  assert.deepEqual(calendarMeetings(changed), []);
  assert.equal(isRangeFree(changed, state.meetings[0]), true);
  assert.equal(changed.meetings[0].calendarId, 'personal');
  assert.throws(() => transitionFlow(changed, { type: 'decide-booking', id: 'request-elena', decision: 'accepted', meetingId: 'new', participantToken: 'token' }), /calendario cambió/);
  const restored = transitionFlow(changed, { type: 'account', action: { type: 'select-calendar', id: 'personal' } });
  const accepted = transitionFlow(restored, { type: 'decide-booking', id: 'request-elena', decision: 'accepted', meetingId: 'new', participantToken: 'token' });
  assert.equal(accepted.meetings.at(-1).calendarId, 'personal');
});

test('las decisiones históricas conservan su horario tras una segunda reprogramación', () => {
  let state = transitionFlow(connectedFlow(), { type: 'decide-change', id: 'change-elena', decision: 'accepted' });
  const firstDecision = structuredClone(state.changes[0]);
  state = transitionFlow(state, { type: 'propose-change', change: { ...firstDecision, id: 'second', start: '2026-10-30T09:00:00-04:00', end: '2026-10-30T10:00:00-04:00', status: 'pending' } });
  state = transitionFlow(state, { type: 'decide-change', id: 'second', decision: 'accepted' });
  assert.deepEqual(state.changes[0], firstDecision);
  assert.notEqual(state.changes[0].start, state.meetings[0].start);
});

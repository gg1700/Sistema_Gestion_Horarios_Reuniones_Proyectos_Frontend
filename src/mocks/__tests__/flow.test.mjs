import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialFlow as initialFlow, transitionFlow, isRangeFree } from '../flow.ts';

// Los casos de escritura parten de un calendario autorizado. La desconexión se
// comprueba por separado para no confundir una validación de permisos con colisiones.
const createInitialFlow = () => transitionFlow(initialFlow(), { type: 'account', action: { type: 'authorize-provider', provider: 'google' } });

test('una solicitud enviada queda pendiente y no crea una reunión ni reserva el bloque', () => {
  const state = createInitialFlow();
  const request = { ...state.requests[0], id: 'new-request', start: '2026-10-28T09:00:00-04:00', end: '2026-10-28T09:30:00-04:00' };
  const next = transitionFlow(state, { type: 'request-booking', request });
  assert.equal(next.requests[1].status, 'pending');
  assert.equal(next.meetings.length, state.meetings.length);
  assert.equal(isRangeFree(next, request), true);
  assert.throws(() => transitionFlow(next, { type: 'request-booking', request }), /Ya tienes/);
});

test('aceptar crea una sola reunión y rechazar no añade eventos', () => {
  const state = createInitialFlow();
  const action = { type: 'decide-booking', id: 'request-elena', decision: 'accepted', meetingId: 'new-meeting', participantToken: 'mock-token' };
  const next = transitionFlow(state, action);
  assert.equal(next.requests[0].status, 'accepted');
  assert.equal(next.meetings.length, 2);
  assert.equal(next.meetings[1].start, state.requests[0].start);
  assert.equal(next.meetings[1].participantToken, 'mock-token');
  assert.throws(() => transitionFlow(next, action), /ya no está pendiente/);
  const rejected = transitionFlow(state, { ...action, decision: 'rejected' });
  assert.equal(rejected.requests[0].status, 'rejected');
  assert.deepEqual(rejected.meetings, state.meetings);
});

test('aceptar un cambio reemplaza el horario, libera el anterior y conserva Meet', () => {
  const state = createInitialFlow();
  const next = transitionFlow(state, { type: 'decide-change', id: 'change-elena', decision: 'accepted' });
  assert.equal(next.meetings.length, 1);
  assert.equal(next.meetings[0].start, state.changes[0].start);
  assert.equal(next.meetings[0].meetUrl, state.meetings[0].meetUrl);
  assert.equal(isRangeFree(next, state.meetings[0]), true);
  assert.equal(isRangeFree(next, state.changes[0]), false);
  assert.equal(state.meetings[0].start, '2026-10-28T10:30:00-04:00');
});

test('rechazar un cambio conserva íntegra la reunión original', () => {
  const state = createInitialFlow();
  const next = transitionFlow(state, { type: 'decide-change', id: 'change-elena', decision: 'rejected' });
  assert.deepEqual(next.meetings, state.meetings);
  assert.equal(next.changes[0].status, 'rejected');
});

test('las colisiones se revalidan al aceptar la solicitud y el cambio', () => {
  const state = createInitialFlow();
  const conflict = { ...state, requests: [{ ...state.requests[0], start: state.meetings[0].start, end: state.meetings[0].end }] };
  assert.throws(() => transitionFlow(conflict, { type: 'decide-booking', id: 'request-elena', decision: 'accepted', meetingId: 'duplicate', participantToken: 'mock-token' }), /ya no está libre/);
  const busy = { ...state, meetings: [...state.meetings, { ...state.meetings[0], id: 'other', start: state.changes[0].start, end: state.changes[0].end }] };
  assert.throws(() => transitionFlow(busy, { type: 'decide-change', id: 'change-elena', decision: 'accepted' }), /no está disponible/);
});

test('proponer no mueve el evento y no permite dos propuestas pendientes', () => {
  const state = transitionFlow(createInitialFlow(), { type: 'decide-change', id: 'change-elena', decision: 'rejected' });
  const change = { ...state.changes[0], id: 'new-change', status: 'pending' };
  const next = transitionFlow(state, { type: 'propose-change', change });
  assert.deepEqual(next.meetings, state.meetings);
  assert.equal(next.changes[1].status, 'pending');
  assert.throws(() => transitionFlow(next, { type: 'propose-change', change: { ...change, id: 'another' } }), /Ya hay una propuesta/);
  assert.throws(() => transitionFlow(state, { type: 'propose-change', change: { ...change, end: change.start } }), /posterior/);
});

test('cerrar la sesión visual conserva la agenda y las decisiones', () => {
  const state = createInitialFlow();
  const next = transitionFlow({ ...state, demoSignedIn: true }, { type: 'sign-out' });
  assert.equal(next.demoSignedIn, false);
  assert.deepEqual(next.meetings, state.meetings);
});

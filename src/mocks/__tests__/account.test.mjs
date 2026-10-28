import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialAccount, publicProfileSnapshot, transitionAccount, normalizeLink } from '../account.ts';
import { createInitialFlow, transitionFlow } from '../flow.ts';

const identity = { name: 'Mateo', firstSurname: 'Silva', handle: 'mateo-silva', email: 'identidad-privada@correo.com' };

test('el perfil público filtra datos privados y nunca publica el correo de acceso', () => {
  const account = createInitialAccount();
  const snapshot = publicProfileSnapshot(identity, account);
  assert.equal(snapshot.country, 'Bolivia');
  assert.equal(snapshot.experiences.length, 2);
  for (const key of ['email', 'secondSurname', 'address', 'contactEmails', 'phones', 'repositories', 'activity']) {
    assert.equal(Object.hasOwn(snapshot, key), false, key);
  }
  const allVisible = transitionAccount(account, { type: 'save-visibility', visibility: Object.fromEntries(Object.keys(account.visibility).map(key => [key, true])) });
  const visible = publicProfileSnapshot(identity, allVisible);
  assert.deepEqual(visible.contactEmails, ['contacto@mateosilva.dev']);
  assert.equal(JSON.stringify(visible).includes(identity.email), false);
  assert.equal(visible.repositories.length, 3);
  assert.equal(visible.activity.length, 3);
});

test('la vista previa puede usar el borrador sin cambiar la visibilidad guardada', () => {
  const account = createInitialAccount();
  const draft = { ...account, visibility: { ...account.visibility, address: true, country: false } };
  assert.equal(publicProfileSnapshot(identity, draft).address, account.details.address);
  const saved = publicProfileSnapshot(identity, account);
  assert.equal(Object.hasOwn(saved, 'address'), false);
  assert.equal(saved.country, 'Bolivia');
});

test('reconectar Google conserva el calendario y exige autorizar antes de cambiarlo', () => {
  const initial = createInitialAccount();
  assert.throws(() => transitionAccount(initial, { type: 'select-calendar', id: 'trabajo' }), /Autoriza/);
  const authorized = transitionAccount(initial, { type: 'authorize-provider', provider: 'google' });
  assert.equal(authorized.google.calendarId, 'personal');
  const selected = transitionAccount(authorized, { type: 'select-calendar', id: 'trabajo' });
  const stopped = transitionAccount(selected, { type: 'stop-calendar' });
  assert.equal(stopped.google.identityLinked, true);
  assert.equal(stopped.google.calendarId, 'trabajo');
  assert.equal(stopped.google.calendarStatus, 'disconnected');
  const reconnected = transitionAccount(stopped, { type: 'authorize-provider', provider: 'google' });
  assert.equal(reconnected.google.calendarId, 'trabajo');
  assert.equal(reconnected.google.calendarStatus, 'connected');
  assert.throws(() => transitionAccount(reconnected, { type: 'select-calendar', id: 'otro' }), /disponible/);
});

test('desvincular identidades conserva otro acceso y nunca quita el último', () => {
  const initial = createInitialAccount();
  for (const provider of ['google', 'github']) {
    const other = provider === 'google' ? 'github' : 'google';
    const next = transitionAccount(initial, { type: 'unlink-provider', provider });
    assert.equal(next[provider].identityLinked, false);
    assert.equal(next[other].identityLinked, true);
    assert.deepEqual(next.details, initial.details);
    assert.deepEqual(next.experiences, initial.experiences);
    assert.throws(() => transitionAccount(next, { type: 'unlink-provider', provider: other }), /única forma/);
  }
});

test('la selección conserva el orden y deja de publicarse al desconectar GitHub', () => {
  const initial = createInitialAccount();
  const selected = transitionAccount(initial, { type: 'select-repositories', ids: ['network-lab', 'orbitia-web'] });
  const visible = { ...selected, visibility: { ...selected.visibility, repositories: true, githubActivity: true } };
  assert.deepEqual(publicProfileSnapshot(identity, visible).repositories.map(repo => repo.id), ['network-lab', 'orbitia-web']);
  const stopped = transitionAccount(visible, { type: 'stop-github-data' });
  assert.equal(stopped.github.identityLinked, true);
  assert.deepEqual(stopped.github.selectedRepositories, ['network-lab', 'orbitia-web']);
  const snapshot = publicProfileSnapshot(identity, stopped);
  assert.equal(Object.hasOwn(snapshot, 'repositories'), false);
  assert.equal(Object.hasOwn(snapshot, 'activity'), false);
  assert.throws(() => transitionAccount(stopped, { type: 'select-repositories', ids: [] }), /Conecta/);
  for (const ids of [['orbitia-web', 'orbitia-web'], ['desconocido'], Array(6).fill('orbitia-web')]) {
    assert.throws(() => transitionAccount(initial, { type: 'select-repositories', ids }), /distintos/);
  }
});

test('editar datos y experiencia conserva las reuniones y las decisiones previas', () => {
  const initial = createInitialFlow();
  const details = { ...initial.account.details, secondSurname: 'Rojas' };
  const edited = transitionFlow(initial, { type: 'update-profile', name: ' Ana ', firstSurname: ' Torres ', details });
  assert.equal(edited.profile.name, 'Ana');
  assert.equal(edited.profile.firstSurname, 'Torres');
  assert.equal(edited.profile.handle, initial.profile.handle);
  assert.deepEqual(edited.meetings, initial.meetings);
  assert.deepEqual(edited.requests, initial.requests);
  assert.deepEqual(edited.changes, initial.changes);
  const experience = { ...edited.account.experiences[0], title: 'Ingeniera de software' };
  const updated = transitionAccount(edited.account, { type: 'save-experience', experience });
  assert.equal(updated.experiences.length, 2);
  assert.equal(updated.experiences[0].title, 'Ingeniera de software');
  assert.equal(edited.account.experiences[0].title, 'Desarrollador frontend');
  assert.throws(() => transitionAccount(updated, { type: 'save-experience', experience: { ...experience, startDate: '2026-02-30' } }), /válida/);
  assert.throws(() => transitionAccount(updated, { type: 'save-experience', experience: { ...experience, endDate: '2023-01-01' } }), /posterior/);
});

test('los enlaces personales aceptan HTTP(S) y rechazan esquemas ejecutables', () => {
  assert.equal(normalizeLink('mateosilva.dev'), 'https://mateosilva.dev/');
  for (const value of ['javascript:alert(1)', 'data:text/html,test', 'https://user:pass@example.com', 'enlace inválido']) {
    assert.throws(() => normalizeLink(value));
  }
});

test('eliminar requiere confirmación y retira el perfil público y sus datos de demostración', () => {
  const initial = createInitialFlow();
  assert.throws(() => transitionFlow(initial, { type: 'account', action: { type: 'delete-account', confirmation: '' } }), /ELIMINAR/);
  const deleted = transitionFlow(initial, { type: 'account', action: { type: 'delete-account', confirmation: 'ELIMINAR' } });
  assert.equal(publicProfileSnapshot(identity, deleted.account), null);
  assert.equal(deleted.demoSignedIn, false);
  assert.deepEqual(deleted.meetings, []);
  assert.deepEqual(deleted.requests, []);
  assert.deepEqual(deleted.changes, []);
  assert.deepEqual(deleted.account.details.links, []);
  assert.deepEqual(deleted.account.experiences, []);
  assert.equal(deleted.account.google.identityLinked, false);
  assert.equal(deleted.account.github.identityLinked, false);
});

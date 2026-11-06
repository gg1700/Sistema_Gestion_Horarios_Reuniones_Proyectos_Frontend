import assert from 'node:assert/strict';
import { test, before, after, afterEach } from 'node:test';
import { createServer } from 'vite';
import {
  visibilityChanges,
  visibilityIsPublic,
  visibilityKey,
  visibilityValue,
} from '../src/utils/visibility.ts';

let server;
let api;
const originalFetch = globalThis.fetch;

before(async () => {
  server = await createServer({
    server: { middlewareMode: true, hmr: false, watch: null },
    appType: 'custom',
  });
  api = await server.ssrLoadModule('/src/api/visibilityApi.ts');
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

after(async () => {
  await server?.close();
});

test('solo envía el correo modificado, sin alterar los otros elementos', () => {
  const saved = [
    { type: 'email', id: 'one', visible: false },
    { type: 'email', id: 'two', visible: true },
  ];

  assert.deepEqual(
    visibilityChanges(saved, [{ ...saved[0], visible: true }, saved[1]]),
    [{ ...saved[0], visible: true }],
  );
  assert.deepEqual(
    visibilityChanges(saved, saved.map(item => ({ ...item }))),
    [],
  );
});

test('identifica por tipo e id y excluye registros no cargados', () => {
  const saved = [
    { type: 'surname', id: 'user', visible: false },
    { type: 'githubActivityList', id: 'user', visible: true },
  ];

  assert.deepEqual(
    visibilityChanges(saved, [
      saved[0],
      { ...saved[1], visible: false },
      { type: 'email', id: 'unknown', visible: true },
    ]),
    [{ ...saved[1], visible: false }],
  );
});

test('muestra correo de contacto, sin utilizar el correo de acceso', () => {
  assert.equal(
    visibilityValue(
      { type: 'email', id: 'contact', visible: false },
      {
        email: 'private@example.test',
        contactEmails: [{ id: 'contact', email: 'public@example.test' }],
      },
    ),
    'public@example.test',
  );
});

test('PATCH usa la cookie de sesión y el contrato changes de T-15', async () => {
  const changes = [{ type: 'email', id: 'contact', visible: true }];

  globalThis.fetch = async (url, options) => {
    assert.ok(url.endsWith('/api/v1/profile/visibility'));
    assert.equal(options.credentials, 'include');
    assert.equal(options.method, 'PATCH');
    assert.deepEqual(JSON.parse(options.body), { changes });
    return Response.json({ success: true, message: 'Actualizado' });
  };

  await api.updateVisibility(changes);
});

test('sesión expirada y fallo del servidor se propagan sin simular éxito', async () => {
  globalThis.fetch = async () =>
    Response.json({ success: false }, { status: 401 });

  await assert.rejects(api.getVisibility(), /sesión/);

  globalThis.fetch = async () =>
    Response.json(
      { success: false, message: 'Error al actualizar' },
      { status: 500 },
    );

  await assert.rejects(
    api.updateVisibility([{ type: 'surname', id: 'user', visible: false }]),
    /Error al actualizar/,
  );
});

test('rechaza un contrato de visibilidad incompatible', async () => {
  globalThis.fetch = async () =>
    Response.json({ success: true, data: { country: true } });

  await assert.rejects(api.getVisibility(), /formato/);
});

test('GET acepta permisos generales sin id y registros individuales con id', async () => {
  const records = [
    { type: 'repositories', visible: true },
    { type: 'githubActivity', visible: false },
    { type: 'repository', id: 'repo-one', visible: true },
  ];

  globalThis.fetch = async (url, options) => {
    assert.ok(url.endsWith('/api/v1/profile/visibility'));
    assert.equal(options.credentials, 'include');
    return Response.json({ success: true, data: records });
  };

  assert.deepEqual(await api.getVisibility(), records);
});

test('las claves distinguen permisos generales e individuales', () => {
  const records = [
    { type: 'repositories', visible: true },
    { type: 'githubActivity', visible: true },
    { type: 'repository', id: 'one', visible: true },
    { type: 'githubActivityList', id: 'one', visible: true },
  ];

  assert.equal(new Set(records.map(visibilityKey)).size, records.length);
  assert.equal(visibilityKey(records[0]), 'repositories');
  assert.equal(visibilityKey(records[1]), 'githubActivity');
});

test('apagar el permiso general solo envía ese cambio y conserva el individual', () => {
  const saved = [
    { type: 'repositories', visible: true },
    { type: 'repository', id: 'one', visible: true },
  ];
  const draft = [
    { ...saved[0], visible: false },
    { ...saved[1] },
  ];

  assert.deepEqual(
    visibilityChanges(saved, draft),
    [{ type: 'repositories', visible: false }],
  );
  assert.equal(saved[1].visible, true);
  assert.equal(draft[1].visible, true);
});

test('PATCH envía ambos permisos generales sin identificadores', async () => {
  const changes = [
    { type: 'repositories', visible: true },
    { type: 'githubActivity', visible: false },
  ];

  globalThis.fetch = async (_url, options) => {
    assert.equal(options.method, 'PATCH');
    assert.equal(options.credentials, 'include');
    assert.deepEqual(JSON.parse(options.body), { changes });
    return Response.json({ success: true });
  };

  await api.updateVisibility(changes);
});

test('un repositorio solo se indica público con ambos permisos activos', () => {
  for (const general of [false, true]) {
    for (const individual of [false, true]) {
      const repository = {
        type: 'repository',
        id: 'one',
        visible: individual,
      };

      assert.equal(
        visibilityIsPublic(repository, [
          { type: 'repositories', visible: general },
          repository,
        ]),
        general && individual,
      );
    }
  }
});

test('la actividad usa su permiso general y es independiente de repositorios', () => {
  for (const type of ['githubActivityList', 'githubActivityGrid']) {
    for (const general of [false, true]) {
      for (const individual of [false, true]) {
        const activity = { type, id: 'user', visible: individual };

        assert.equal(
          visibilityIsPublic(activity, [
            { type: 'repositories', visible: !general },
            { type: 'githubActivity', visible: general },
            activity,
          ]),
          general && individual,
        );
      }
    }
  }
});

test('sin permiso general los datos de GitHub se indican ocultos', () => {
  for (const type of [
    'repository',
    'githubActivityList',
    'githubActivityGrid',
  ]) {
    const record = { type, id: 'one', visible: true };
    assert.equal(visibilityIsPublic(record, [record]), false);
  }

  const email = { type: 'email', id: 'one', visible: true };
  assert.equal(visibilityIsPublic(email, [email]), true);
});

test('GET sigue rechazando registros individuales sin id y valores inválidos', async () => {
  for (const invalid of [
    { type: 'repository', visible: true },
    { type: 'email', id: '', visible: true },
    { type: 'repositories', visible: 'true' },
    { type: 'unknown', id: 'one', visible: true },
  ]) {
    globalThis.fetch = async () =>
      Response.json({ success: true, data: [invalid] });

    await assert.rejects(api.getVisibility(), /formato/);
  }
});

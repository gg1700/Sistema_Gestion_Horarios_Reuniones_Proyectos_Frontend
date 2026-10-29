import assert from 'node:assert/strict';
import { test, before, after } from 'node:test';
import { createServer } from 'vite';
import { visibilityChanges, visibilityValue } from '../src/utils/visibility.ts';

let server;
let api;
const originalFetch = globalThis.fetch;
before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  api = await server.ssrLoadModule('/src/api/visibilityApi.ts');
});
after(async () => { globalThis.fetch = originalFetch; await server?.close(); });

test('solo envía el correo modificado, sin alterar los otros elementos', () => {
  const saved = [{ type: 'email', id: 'one', visible: false }, { type: 'email', id: 'two', visible: true }];
  assert.deepEqual(visibilityChanges(saved, [{ ...saved[0], visible: true }, saved[1]]), [{ ...saved[0], visible: true }]);
  assert.deepEqual(visibilityChanges(saved, saved.map(item => ({ ...item }))), []);
});

test('identifica un elemento por tipo e id y excluye registros no cargados', () => {
  const saved = [{ type: 'surname', id: 'user', visible: false }, { type: 'githubActivityList', id: 'user', visible: true }];
  assert.deepEqual(visibilityChanges(saved, [saved[0], { ...saved[1], visible: false }, { type: 'email', id: 'unknown', visible: true }]), [{ ...saved[1], visible: false }]);
});

test('muestra correo de contacto, sin utilizar el correo de acceso', () => {
  assert.equal(visibilityValue({ type: 'email', id: 'contact', visible: false }, { email: 'private@example.test', contactEmails: [{ id: 'contact', email: 'public@example.test' }] }), 'public@example.test');
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
  globalThis.fetch = async () => Response.json({ success: false }, { status: 401 });
  await assert.rejects(api.getVisibility(), /sesión/);
  globalThis.fetch = async () => Response.json({ success: false, message: 'Error al actualizar' }, { status: 500 });
  await assert.rejects(api.updateVisibility([{ type: 'surname', id: 'user', visible: false }]), /Error al actualizar/);
});

test('rechaza un contrato de visibilidad incompatible', async () => {
  globalThis.fetch = async () => Response.json({ success: true, data: { country: true } });
  await assert.rejects(api.getVisibility(), /formato/);
});

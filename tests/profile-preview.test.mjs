import assert from 'node:assert/strict';
import { after, afterEach, before, beforeEach, test } from 'node:test';
import { Window } from 'happy-dom';
import { createServer } from 'vite';
import { isPublicProfilePreview, toPublicProfileView } from '../src/utils/publicProfile.ts';

const originalFetch = globalThis.fetch;
const publicProfile = () => ({
  handleName: 'perfil-real', name: 'Ana', firstSurname: 'Pérez',
  profilePicture: null, surname: null,
  phones: [], addresses: [], countries: [], workExperiences: [], links: [],
  contactEmails: [{ email: 'publico@example.test' }],
  repositories: [{
    name: 'Proyecto real', description: null, language: null,
    stars: 3, url: 'https://github.com/example/project',
  }],
  githubActivityList: [], githubActivityGrid: [],
});
const response = data => Response.json({ success: true, data });
const deferred = () => {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
};

let dom, server, api, React, act, createRoot, MemoryRouter;
let ProfilePreviewDialog, VisibilityPage, AppProviders, MockFlowProvider;
let root, container;

before(async () => {
  dom = new Window({ url: 'http://localhost/' });
  for (const key of [
    'window', 'document', 'navigator', 'HTMLElement', 'HTMLDialogElement',
    'Element', 'Node', 'Event', 'MouseEvent', 'PointerEvent', 'FileReader',
    'sessionStorage', 'localStorage',
  ]) {
    Object.defineProperty(globalThis, key, {
      configurable: true, value: key === 'window' ? dom : dom[key],
    });
  }
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  dom.HTMLDialogElement.prototype.close = function () {
    if (!this.open) return;
    this.removeAttribute('open');
    this.dispatchEvent(new dom.Event('close'));
  };
  React = await import('react');
  act = React.act;
  ({ createRoot } = await import('react-dom/client'));
  ({ MemoryRouter } = await import('react-router'));
  server = await createServer({
    server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom',
  });
  api = await server.ssrLoadModule('/src/api/publicProfilePreviewApi.ts');
  ({ ProfilePreviewDialog } = await server.ssrLoadModule('/src/components/features/profile/ProfilePreviewDialog.tsx'));
  ({ default: VisibilityPage } = await server.ssrLoadModule('/src/pages/VisibilityPage.tsx'));
  ({ AppProviders } = await server.ssrLoadModule('/src/contexts/AppProviders.tsx'));
  ({ MockFlowProvider } = await server.ssrLoadModule('/src/contexts/MockFlowContext.tsx'));
});

beforeEach(() => {
  dom.sessionStorage.clear();
  container = dom.document.createElement('div');
  dom.document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(() => root.unmount());
  dom.document.body.replaceChildren();
  globalThis.fetch = originalFetch;
});

after(async () => {
  await server?.close();
  await dom?.happyDOM.abort();
});

async function renderPreview(props = {}) {
  await act(() => root.render(React.createElement(ProfilePreviewDialog, {
    open: true, onOpenChange() {}, ...props,
  })));
}

const dialog = () => dom.document.querySelector('dialog[open]');
const button = (label, scope = dom.document) => {
  const element = [...scope.querySelectorAll('button')]
    .find(item => item.textContent.trim() === label);
  assert.ok(element, `botón disponible: ${label}`);
  return element;
};
const click = async element => { await act(() => element.click()); };

test('adapta solo campos públicos y no recupera el correo de acceso ni identificadores internos', () => {
  const profile = {
    ...publicProfile(), email: 'acceso-privado@example.test', id: 'private-user-id',
    externalAccounts: [{ accessToken: 'private-token' }],
  };
  const view = toPublicProfileView(profile);
  assert.equal(view.handle, 'perfil-real');
  assert.deepEqual(view.contactEmails, ['publico@example.test']);
  assert.equal(view.secondSurname, undefined);
  assert.doesNotMatch(JSON.stringify(view), /acceso-privado|private-user-id|private-token/);
});

test('conserva contactos y experiencia públicos y admite repositorios sin descripción o lenguaje', () => {
  const profile = {
    ...publicProfile(), surname: 'López',
    countries: [{ countryName: 'Bolivia', countryCode: '591' }],
    phones: [{ phoneNumber: '70000000', countryCode: '+591', countryName: 'Bolivia' }],
    workExperiences: [{ title: 'Desarrollo', companyName: null, description: null, startDate: '2024-01-01', endDate: null }],
    links: [{ text: 'Sitio', url: 'https://example.test/' }],
  };
  assert.equal(isPublicProfilePreview(profile), true);
  const view = toPublicProfileView(profile);
  assert.equal(view.secondSurname, 'López');
  assert.deepEqual(view.phones, ['+591 70000000']);
  assert.equal(view.country, 'Bolivia');
  assert.equal(view.links[0].label, 'Sitio');
  assert.equal(view.experiences[0].company, '');
  assert.equal(view.repositories[0].description, 'Sin descripción.');
  assert.equal(view.repositories[0].language, 'Sin especificar');
});

test('GET usa la cookie, no almacena la respuesta y no envía identidad del cliente', async () => {
  const controller = new AbortController();
  globalThis.fetch = async (url, options) => {
    assert.ok(url.endsWith('/api/v1/profile/preview'));
    assert.equal(options.method, 'GET');
    assert.equal(options.credentials, 'include');
    assert.equal(options.cache, 'no-store');
    assert.equal(options.body, undefined);
    assert.equal(options.signal, controller.signal);
    return response(publicProfile());
  };
  assert.equal((await api.getPublicProfilePreview(controller.signal)).handleName, 'perfil-real');
});

test('sesión expirada, límite y errores del servidor no se convierten en una vista simulada', async () => {
  for (const [status, message] of [
    [401, /sesión/], [429, /Demasiadas solicitudes/], [500, /No se pudo cargar/],
  ]) {
    globalThis.fetch = async () => Response.json({ success: false, message: 'private SQL detail' }, { status });
    await assert.rejects(api.getPublicProfilePreview(), error => {
      assert.match(error.message, message);
      assert.doesNotMatch(error.message, /private SQL/);
      return true;
    });
  }
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch'); };
  await assert.rejects(api.getPublicProfilePreview(), /No se pudo conectar/);
});

test('rechaza respuestas incompatibles y fechas que romperían el componente público', async () => {
  for (const value of [
    {}, { ...publicProfile(), repositories: null },
    { ...publicProfile(), contactEmails: [{ email: 9 }] },
    { ...publicProfile(), workExperiences: [{ title: 'Desarrollo', companyName: null, description: null, startDate: '2024-02-31', endDate: null }] },
  ]) {
    globalThis.fetch = async () => response(value);
    await assert.rejects(api.getPublicProfilePreview(), /respuesta inválida/);
  }
});

test('el diálogo cerrado no consulta el endpoint', async () => {
  globalThis.fetch = async () => { assert.fail('no debe consultar mientras esté cerrado'); };
  await renderPreview({ open: false });
  assert.equal(dialog(), null);
});

test('la vista usa los datos del endpoint y el componente compartido, sin datos de la maqueta', async () => {
  globalThis.fetch = async () => response(publicProfile());
  await renderPreview();
  assert.match(dialog().textContent, /Ana Pérez/);
  assert.match(dialog().textContent, /@perfil-real/);
  assert.match(dialog().textContent, /publico@example.test/);
  assert.match(dialog().textContent, /Proyecto real/);
  assert.match(dialog().textContent, /Sin especificar/);
  assert.equal(dialog().querySelectorAll('.github-repository').length, 1);
  assert.equal(dialog().querySelector('a[href="https://github.com/example/project"]') !== null, true);
});

test('avisa que los cambios pendientes todavía no forman parte de la vista previa', async () => {
  globalThis.fetch = async () => response({ ...publicProfile(), contactEmails: [], repositories: [] });
  await renderPreview({ hasPendingChanges: true });
  assert.match(dialog().textContent, /Hay cambios pendientes/);
  assert.doesNotMatch(dialog().textContent, /publico@example.test|Proyecto real/);
});

test('un cambio guardado vuelve a consultar el endpoint y elimina el dato ocultado', async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return response({ ...publicProfile(), contactEmails: calls === 1 ? [{ email: 'publico@example.test' }] : [] });
  };
  await renderPreview({ revision: 0 });
  assert.match(dialog().textContent, /publico@example.test/);
  await renderPreview({ revision: 1 });
  assert.equal(calls, 2);
  assert.doesNotMatch(dialog().textContent, /publico@example.test/);
});

test('muestra el error de carga y permite reintentar sin conservar el perfil anterior', async () => {
  let fail = true;
  globalThis.fetch = async () => fail ? new Response(null, { status: 500 }) : response(publicProfile());
  await renderPreview();
  assert.match(dialog().textContent, /No se pudo cargar/);
  assert.equal(dialog().querySelector('.public-profile-view'), null);
  fail = false;
  await click(button('Reintentar', dialog()));
  assert.match(dialog().textContent, /Ana Pérez/);
  assert.equal(dialog().querySelector('[role="alert"]'), null);
});

test('cancelar una consulta impide que una respuesta atrasada sustituya el perfil reciente', async () => {
  const first = deferred();
  let calls = 0;
  let firstSignal;
  globalThis.fetch = async (_url, options) => {
    calls += 1;
    if (calls === 1) { firstSignal = options.signal; return first.promise; }
    return response({ ...publicProfile(), name: 'Perfil reciente' });
  };
  await renderPreview();
  await renderPreview({ open: false });
  assert.equal(firstSignal.aborted, true);
  await renderPreview();
  assert.match(dialog().textContent, /Perfil reciente/);
  await act(async () => { first.resolve(response({ ...publicProfile(), name: 'Perfil anterior' })); });
  assert.match(dialog().textContent, /Perfil reciente/);
  assert.doesNotMatch(dialog().textContent, /Perfil anterior/);
});

test('desde Visibilidad: abrir, cerrar, ocultar un contacto, guardar y volver a ver el perfil actualizado', async () => {
  let visible = true;
  let previewCalls = 0;
  globalThis.fetch = async (url, options) => {
    if (url.endsWith('/profile/preview')) {
      previewCalls += 1;
      return response({ ...publicProfile(), contactEmails: visible ? [{ email: 'publico@example.test' }] : [] });
    }
    if (url.endsWith('/profile/visibility')) {
      if (options.method === 'PATCH') {
        assert.deepEqual(JSON.parse(options.body), { changes: [{ type: 'email', id: 'contact-1', visible: false }] });
        visible = false;
        return Response.json({ success: true });
      }
      return response([{ type: 'email', id: 'contact-1', visible }]);
    }
    assert.ok(url.endsWith('/profile'));
    return response({
      ...publicProfile(), email: 'acceso@example.test',
      contactEmails: [{ id: 'contact-1', email: 'publico@example.test' }],
    });
  };
  await act(() => root.render(React.createElement(AppProviders, null,
    React.createElement(MemoryRouter, { initialEntries: ['/perfil/visibilidad'] },
      React.createElement(MockFlowProvider, null, React.createElement(VisibilityPage))))));
  await click(button('Vista previa'));
  assert.match(dialog().textContent, /publico@example.test/);
  await click(button('Volver a visibilidad', dialog()));
  await click(container.querySelector('input[role="switch"]'));
  await click(button('Guardar cambios'));
  assert.equal(visible, false);
  await click(button('Vista previa'));
  assert.equal(previewCalls, 2);
  assert.doesNotMatch(dialog().textContent, /publico@example.test|acceso@example.test/);
  assert.match(dialog().textContent, /Ana Pérez/);
});

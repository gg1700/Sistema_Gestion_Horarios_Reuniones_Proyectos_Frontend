import { test, before, beforeEach, afterEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { createServer } from 'vite';

let dom, server, React, act, createRoot, MemoryRouter, AppProviders, MockFlowProvider, MemberIdentityProvider, ProfilePage;
let root, container, requests, responder;
const originalFetch = globalThis.fetch;
const json = (data, status = 200) => Response.json(data, { status });
const incomplete = () => ({
  id: 'user-1', handleName: 'ana-perez', name: 'Ana', firstSurname: 'Pérez',
  email: 'login@example.test', profilePicture: null, surname: null,
  phones: [], contactEmails: [], addresses: [], countries: [], workExperiences: [], links: [],
  requiresProfileCompletion: false,
});
const complete = () => ({
  ...incomplete(), profilePicture: 'https://example.test/avatar.png', surname: { surname: 'López', visible: false },
  phones: [{ id: 'p1', phoneNumber: '71234567', countryCode: '591', countryName: 'Bolivia', visible: false }],
  contactEmails: [{ id: 'e1', email: 'contact@example.test', visible: false }],
  countries: [{ id: 'c1', countryName: 'Bolivia', countryCode: '591', visible: false }, { id: 'c2', countryName: 'Perú', countryCode: '51', visible: true }],
  addresses: [{ id: 'a1', address: 'Calle real 123', visible: false }, { id: 'a2', address: 'Otra dirección', visible: true }],
  links: [{ id: 'l1', text: 'Portafolio real', url: 'https://ana.example.test', visible: false }],
  workExperiences: [
    { id: 'w1', title: 'Trabajo actual', description: null, companyName: null, startDate: '2025-01-01', endDate: null, visible: false },
    { id: 'w2', title: 'Trabajo anterior', description: 'Descripción real', companyName: 'Empresa real', startDate: '2023-01-01', endDate: '2024-12-31', visible: true },
  ],
});

before(async () => {
  dom = new Window({ url: 'http://localhost/' });
  for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'HTMLDialogElement', 'Element', 'Node', 'Event', 'MouseEvent', 'sessionStorage']) {
    Object.defineProperty(globalThis, key, { configurable: true, value: key === 'window' ? dom : dom[key] });
  }
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  React = await import('react'); act = React.act;
  ({ createRoot } = await import('react-dom/client'));
  ({ MemoryRouter } = await import('react-router'));
  server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' });
  ({ AppProviders } = await server.ssrLoadModule('/src/contexts/AppProviders.tsx'));
  ({ MockFlowProvider } = await server.ssrLoadModule('/src/contexts/MockFlowContext.tsx'));
  ({ MemberIdentityProvider } = await server.ssrLoadModule('/src/features/github/MemberIdentityContext.tsx'));
  ({ default: ProfilePage } = await server.ssrLoadModule('/src/pages/ProfilePage.tsx'));
});
beforeEach(() => {
  dom.sessionStorage.clear(); requests = [];
  responder = () => json({ success: true, data: complete() });
  globalThis.fetch = async (url, init = {}) => {
    requests.push({ url: String(url), ...init });
    return responder(String(url), init);
  };
  container = dom.document.createElement('div'); dom.document.body.append(container); root = createRoot(container);
});
afterEach(async () => { await act(() => root.unmount()); container.remove(); });
after(async () => { globalThis.fetch = originalFetch; await server?.close(); await dom.happyDOM.close(); });
async function mount() {
  await act(async () => root.render(React.createElement(AppProviders, null,
    React.createElement(MockFlowProvider, null, React.createElement(MemoryRouter, { initialEntries: ['/perfil?editar=1&experiencia=nueva'] },
      React.createElement(MemberIdentityProvider, null, React.createElement(ProfilePage)))))));
}
const text = () => container.textContent;
const button = label => [...container.querySelectorAll('button')].find(item => item.textContent.trim() === label);
function noMock() { assert.doesNotMatch(text(), /Mateo|Gutiérrez|mateosilva|Nexo Digital/); }

test('consulta una vez por sesión y muestra todos los datos propios, también los privados', async () => {
  await mount();
  for (const value of ['Ana Pérez López', 'login@example.test', 'contact@example.test', '+591 71234567', 'Bolivia', 'Perú', 'Calle real 123', 'Otra dirección', 'Trabajo actual', 'Trabajo anterior', 'Descripción real', 'Empresa real', 'Actualidad']) assert.ok(text().includes(value), value);
  assert.ok(text().indexOf('Trabajo actual') < text().indexOf('Trabajo anterior'));
  assert.ok(container.querySelector('img[src="https://example.test/avatar.png"]'));
  assert.ok(container.querySelector('a[href="https://ana.example.test"]'));
  noMock();
  assert.equal(requests.length, 1);
  assert.match(requests[0].url, /\/api\/v1\/profile$/);
  assert.equal(requests[0].method, 'GET'); assert.equal(requests[0].credentials, 'include');
  assert.equal(requests[0].cache, 'no-store'); assert.equal(requests[0].body, undefined);
});
test('perfil incompleto conserva vacíos, sin completar con el mock o el correo de login', async () => {
  responder = () => json({ success: true, data: incomplete() });
  await mount();
  assert.match(text(), /Sin especificar/);
  assert.match(text(), /Aún no agregaste enlaces personales/);
  assert.match(text(), /Aún no agregaste experiencia laboral/);
  const contact = container.querySelector('.profile-contact-section').textContent;
  assert.ok(!contact.includes('login@example.test')); noMock();
});
test('la consulta no abre editores mock ni envía escrituras', async () => {
  await mount();
  for (const label of ['Editar información', 'Agregar experiencia']) {
    assert.equal(button(label).disabled, true);
    await act(async () => button(label).click());
  }
  assert.equal(container.querySelectorAll('dialog').length, 0);
  assert.equal(requests.length, 1);
});
test('401 por sesión ausente o usuario eliminado retira el contenido privado', async () => {
  responder = () => json({ success: false, message: 'Usuario no disponible' }, 401);
  await mount();
  assert.match(text(), /Usuario no disponible/);
  assert.ok(container.querySelector('a[href="/acceso"]'));
  assert.ok(!text().includes('login@example.test'));
  assert.ok(!text().includes('Datos personales')); noMock();
});
test('un error de servidor permite reintentar y recuperar el perfil real', async () => {
  responder = () => json({ success: false, message: 'No se pudo consultar el perfil' }, 500);
  await mount(); assert.match(text(), /No se pudo consultar el perfil/); noMock();
  responder = () => json({ success: true, data: complete() });
  await act(async () => button('Reintentar').click());
  assert.match(text(), /Ana Pérez López/); assert.equal(requests.length, 2); noMock();
});
test('un fallo de red se comunica sin mostrar el perfil de demostración', async () => {
  responder = () => { throw new TypeError('Failed to fetch'); };
  await mount(); assert.match(text(), /No se pudo conectar con el servidor/); noMock();
});
test('mientras carga no muestra datos anteriores y cancela la lectura al salir', async () => {
  let resolve;
  responder = () => new Promise(done => { resolve = done; });
  await mount(); assert.match(text(), /Consultando tu sesión/); noMock();
  const signal = requests[0].signal;
  await act(() => root.render(null)); assert.equal(signal.aborted, true);
  await act(async () => resolve(json({ success: true, data: complete() })));
  assert.equal(text(), '');
});

import test, { before, beforeEach, afterEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { createServer } from 'vite';

let dom, server, React, createRoot, act, MemoryRouter, useLocation;
let AuthProvider, MockFlowProvider, AppProviders, RouterPage, authApi;
let container, root, calls, responder;
const nativeFetch = globalThis.fetch;
const session = {
  authenticated: true,
  profile: { id: 'real-user', handleName: 'ana-rios', name: 'Ana', firstSurname: 'Ríos', email: 'ana@example.test', profilePicture: null, requiresProfileCompletion: false },
  accounts: [{ provider: 'google', username: null, email: 'ana@gmail.test', state: 'active', scopes: ['openid'] }],
};
const github = { provider: 'github', username: 'ana-real', email: null, state: 'active', scopes: ['read:user'] };
const json = (data, status = 200) => new Response(JSON.stringify(status < 400 ? { success: true, data } : data), { status });
before(async () => {
  dom = new Window({ url: 'http://localhost:5173' });
  for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'HTMLDialogElement', 'Element', 'Node', 'Event', 'MouseEvent', 'PointerEvent', 'sessionStorage', 'localStorage', 'FileReader']) {
    Object.defineProperty(globalThis, key, { configurable: true, value: key === 'window' ? dom : dom[key] });
  }
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  React = await import('react'); act = React.act;
  ({ createRoot } = await import('react-dom/client'));
  ({ MemoryRouter, useLocation } = await import('react-router'));
  server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' });
  ({ AuthProvider } = await server.ssrLoadModule('/src/features/auth/AuthContext.tsx'));
  ({ MockFlowProvider } = await server.ssrLoadModule('/src/contexts/MockFlowContext.tsx'));
  ({ AppProviders } = await server.ssrLoadModule('/src/contexts/AppProviders.tsx'));
  ({ default: RouterPage } = await server.ssrLoadModule('/src/routes/Index.routes.tsx'));
  authApi = await server.ssrLoadModule('/src/features/auth/api.ts');
});
beforeEach(() => {
  dom.sessionStorage.clear(); dom.localStorage.clear(); calls = [];
  responder = async url => url.endsWith('/auth/session') ? json(session) :
    url.endsWith('/auth/logout') ? new Response(null, { status: 204 }) :
    json({ connected: true, username: 'ana-real', permissions: { canReadPublicRepositories: true, canReadPrivateRepositories: false }, checkedAt: '2026-10-28T12:00:00Z' });
  globalThis.fetch = async (url, options) => { calls.push({ url, options }); return responder(url, options); };
  container = dom.document.createElement('div'); dom.document.body.append(container); root = createRoot(container);
});
afterEach(async () => { await act(() => root.unmount()); dom.document.body.replaceChildren(); });
after(async () => { globalThis.fetch = nativeFetch; await server.close(); dom.happyDOM.abort(); });
function Location() { const value = useLocation(); return React.createElement('output', { 'data-location': true }, value.pathname + value.search); }
async function mount(url, initialSession) {
  await act(async () => root.render(React.createElement(React.StrictMode, null, React.createElement(AppProviders, null,
    React.createElement(MemoryRouter, { initialEntries: [url] }, React.createElement(AuthProvider, { initialSession },
      React.createElement(Location), React.createElement(MockFlowProvider, null, React.createElement(RouterPage))))))));
}
const location = () => container.querySelector('[data-location]').textContent;
async function click(element) { assert.ok(element); await act(() => element.click()); }
const button = label => [...dom.document.querySelectorAll('button')].find(element => element.textContent.trim() === label);

test('el guard real exige sesión aunque exista una demostración almacenada', async () => {
  dom.localStorage.setItem('orbitia-session', JSON.stringify({ token: 'invented' }));
  responder = async () => json({ success: false, message: 'Sin sesión' }, 401);
  await mount('/perfil/conexiones');
  assert.match(location(), /^\/acceso/);
  assert.ok(button('Continuar con GoogleUsa tu cuenta de Google'));
  assert.ok(button('Continuar con GitHubUsa tu cuenta de GitHub'));
  assert.equal(dom.document.querySelector('input[type=password]'), null);
});

test('entrar con Google no crea una conexión GitHub ficticia', async () => {
  await mount('/perfil/conexiones', session);
  assert.ok(button('Vincular GitHub'));
  assert.match(container.textContent, /ana@gmail.test/);
  assert.doesNotMatch(container.textContent, /@mateosilva|3 repositorios seleccionados/);
  assert.equal(calls.length, 0);
});

test('comprueba GitHub a través del backend usando la cookie de sesión', async () => {
  await mount('/perfil/conexiones', { ...session, accounts: [...session.accounts, github] });
  assert.match(container.textContent, /Conexión verificada/);
  assert.match(container.textContent, /@ana-real/);
  assert.ok(calls.every(call => call.url.startsWith('http://localhost:3000/api/v1/')));
  assert.ok(calls.every(call => call.options.credentials === 'include'));
  assert.ok(calls.every(call => !call.options.headers.Authorization));
});

test('un token rechazado ofrece volver a autorizar sin simular conexión', async () => {
  responder = async () => json({ success: false, code: 'GITHUB_REAUTH_REQUIRED', message: 'Vuelve a autorizar GitHub.' }, 409);
  await mount('/perfil/conexiones', { ...session, accounts: [github] });
  assert.ok(button('Volver a autorizar GitHub'));
  assert.doesNotMatch(container.textContent, /Conexión verificada/);
});

test('al recargar consulta la sesión del servidor y conserva ambas identidades', async () => {
  responder = async url => url.endsWith('/auth/session') ? json({ ...session, accounts: [...session.accounts, github] }) :
    json({ connected: true, username: 'ana-real', permissions: { canReadPublicRepositories: true, canReadPrivateRepositories: false }, checkedAt: '2026-10-28' });
  await mount('/perfil/conexiones');
  assert.match(container.textContent, /Ana Ríos/);
  assert.ok(calls.some(call => call.url.endsWith('/auth/session')));
  assert.equal(dom.localStorage.getItem('orbitia-session'), null);
});

test('si caduca la sesión al comprobar GitHub vuelve al acceso', async () => {
  responder = async () => json({ success: false, message: 'Sesión expirada.' }, 401);
  await mount('/perfil/conexiones', { ...session, accounts: [github] });
  assert.match(location(), /^\/acceso/);
  assert.ok(button('Continuar con GitHubUsa tu cuenta de GitHub'));
});

test('denegar una vinculación regresa al aviso con retorno a conexiones', async () => {
  await mount('/acceso?oauth=access_denied&provider=github&intent=link', session);
  assert.match(location(), /^\/acceso\/no-completado/);
  const retry = [...container.querySelectorAll('a')].find(element => element.textContent.includes('Reintentar acceso'));
  assert.equal(retry.getAttribute('href'), '/perfil/conexiones');
});

test('el primer acceso mantiene abierto el formulario bajo StrictMode', async () => {
  await mount('/acceso', { ...session, profile: { ...session.profile, firstSurname: 'Pendiente', requiresProfileCompletion: true } });
  assert.equal(dom.document.querySelectorAll('dialog[open]').length, 1);
  assert.match(dom.document.querySelector('dialog[open]').textContent, /ana@example.test/);
  assert.equal(location(), '/acceso');
});

test('cerrar sesión llama al servidor y retira el estado privado local', async () => {
  await mount('/perfil/conexiones', session);
  await click(container.querySelector('.ui-header__identity'));
  await click(button('Cerrar sesión'));
  assert.equal(location(), '/');
  assert.ok(calls.some(call => call.url.endsWith('/auth/logout') && call.options.method === 'POST'));
  assert.equal(dom.localStorage.getItem('orbitia-session'), null);
});

test('los retornos OAuth no aceptan sitios externos y vincular es distinto de entrar', () => {
  assert.equal(authApi.safeReturnTo('https://other.test'), '/panel');
  const url = new URL(authApi.authorizationUrl('github', 'link', '/perfil/conexiones'));
  assert.equal(url.pathname, '/api/v1/auth/github');
  assert.equal(url.searchParams.get('intent'), 'link');
  assert.equal(url.searchParams.get('returnTo'), '/perfil/conexiones');
});


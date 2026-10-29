import test, { before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { createServer } from 'vite';

let dom, server, React, act, createRoot, MemoryRouter, useLocation;
let Dialog, RouterPage, AppProviders, MockFlowProvider;
let root, container;
const nativeCloseEvents = [];

before(async () => {
  dom = new Window({ url: 'http://localhost/' });
  for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'HTMLDialogElement', 'Element', 'Node', 'Event', 'MouseEvent', 'PointerEvent', 'FileReader', 'sessionStorage']) {
    Object.defineProperty(globalThis, key, { configurable: true, value: key === 'window' ? dom : dom[key] });
  }
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  // El close nativo encola un evento. Mantener esa cola explícita permite probar
  // cleanup -> reapertura -> close atrasado, sin depender de tiempos arbitrarios.
  dom.HTMLDialogElement.prototype.close = function () {
    if (!this.open) return;
    this.removeAttribute('open');
    nativeCloseEvents.push(() => this.dispatchEvent(new dom.Event('close')));
  };
  dom.HTMLDialogElement.prototype.getBoundingClientRect = () => ({ left: 100, top: 100, right: 700, bottom: 600, width: 600, height: 500 });
  React = await import('react');
  act = React.act;
  ({ createRoot } = await import('react-dom/client'));
  ({ MemoryRouter, useLocation } = await import('react-router'));
  server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' });
  ({ Dialog } = await server.ssrLoadModule('/src/components/modals/Dialog.tsx'));
  ({ default: RouterPage } = await server.ssrLoadModule('/src/routes/Index.routes.tsx'));
  ({ AppProviders } = await server.ssrLoadModule('/src/contexts/AppProviders.tsx'));
  ({ MockFlowProvider } = await server.ssrLoadModule('/src/contexts/MockFlowContext.tsx'));
});

beforeEach(() => {
  dom.sessionStorage.clear();
  container = dom.document.createElement('div');
  dom.document.body.append(container);
  root = createRoot(container);
});

async function flushNativeCloseEvents() {
  let cycles = 0;
  while (nativeCloseEvents.length) {
    assert.ok(++cycles < 20, 'el cierre no debe provocar un bucle de navegación');
    const events = nativeCloseEvents.splice(0);
    await act(() => { events.forEach(deliver => deliver()); });
  }
}

afterEach(async () => {
  await act(() => root.unmount());
  await flushNativeCloseEvents();
  dom.document.body.replaceChildren();
});
after(async () => { await server?.close(); dom?.happyDOM.abort(); });

function Location() {
  const location = useLocation();
  return React.createElement('output', { 'data-location': true }, location.pathname + location.search);
}
async function mountPage(url) {
  await act(() => root.render(React.createElement(React.StrictMode, null,
    React.createElement(AppProviders, null, React.createElement(MemoryRouter, { initialEntries: [url] },
      React.createElement(Location), React.createElement(MockFlowProvider, null, React.createElement(RouterPage)))))));
  await flushNativeCloseEvents();
}
const location = () => container.querySelector('[data-location]').textContent;
const openDialogs = () => [...dom.document.querySelectorAll('dialog[open]')];
function button(label, scope = dom.document) {
  const found = [...scope.querySelectorAll('button')].find(item => item.textContent.trim() === label);
  assert.ok(found, `botón disponible: ${label}`);
  return found;
}
async function click(element) { await act(() => element.click()); await flushNativeCloseEvents(); }

test('StrictMode conserva abierto el primer ingreso y no navega al perfil por cleanup', async () => {
  await mountPage('/perfil/completar');
  assert.equal(location(), '/perfil/completar');
  assert.equal(openDialogs().length, 1);
  assert.match(openDialogs()[0].textContent, /Dale forma a tu perfil/);
});

test('editar perfil sigue abierto después del clic y conserva su URL', async () => {
  await mountPage('/perfil');
  await click(button('Editar información'));
  assert.equal(location(), '/perfil?editar=1');
  assert.equal(openDialogs().length, 1);
  assert.match(openDialogs()[0].textContent, /Mantén tu perfil al día/);
});

test('cerrar un modal hijo no cierra el asistente ni cambia de página', async () => {
  await mountPage('/perfil/completar?paso=experiencia');
  await click(button('Agregar experiencia'));
  assert.equal(openDialogs().length, 2);
  await click(button('Cancelar', openDialogs().at(-1)));
  assert.equal(location(), '/perfil/completar?paso=experiencia');
  assert.equal(openDialogs().length, 1);
  assert.match(openDialogs()[0].textContent, /Tu recorrido también conecta/);
});

test('Escape en un modal hijo cierra solo ese modal', async () => {
  await mountPage('/perfil/completar?paso=experiencia');
  await click(button('Agregar experiencia'));
  assert.equal(openDialogs().length, 2);
  const child = openDialogs().at(-1);
  await act(() => child.dispatchEvent(new dom.Event('cancel', { cancelable: true })));
  await flushNativeCloseEvents();
  assert.equal(location(), '/perfil/completar?paso=experiencia');
  assert.equal(openDialogs().length, 1);
});

test('detalle -> editar -> cancelar devuelve al detalle sin cerrarlo automáticamente', async () => {
  await mountPage('/agenda?dia=2026-10-26&evento=personal-work');
  await click(button('Editar evento', openDialogs().at(-1)));
  assert.equal(openDialogs().length, 1);
  assert.match(openDialogs()[0].textContent, /Editar evento/);
  await click(button('Cancelar', openDialogs()[0]));
  assert.equal(location(), '/agenda?dia=2026-10-26&evento=personal-work');
  assert.match(openDialogs()[0].textContent, /Trabajo personal/);
});

test('la revisión de una solicitud permanece abierta y Volver regresa al listado', async () => {
  await mountPage('/solicitudes/request-elena/revisar');
  assert.equal(openDialogs().length, 1);
  assert.match(openDialogs()[0].textContent, /Una nueva conexión/);
  await click(button('Volver', openDialogs()[0]));
  assert.equal(location(), '/solicitudes');
  assert.equal(openDialogs().length, 0);
});

test('autorizar Google abre el selector y cancelar solo cierra ese selector', async () => {
  await mountPage('/perfil/conexiones?modal=conectar-google');
  await click(button('Autorizar en Google', openDialogs().at(-1)));
  assert.equal(location(), '/perfil/conexiones?modal=calendario');
  assert.equal(openDialogs().length, 1);
  assert.match(openDialogs()[0].textContent, /Elige tu calendario/);
  await click(button('Volver', openDialogs()[0]));
  assert.equal(location(), '/perfil/conexiones');
  assert.equal(openDialogs().length, 0);
});

test('autorizar GitHub conserva abierto el selector de repositorios', async t => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ success: true, data: { username: 'ana', repositories: [], selectedIds: [], maxSelected: 5, warnings: [] } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  t.after(() => { globalThis.fetch = previousFetch; });
  await mountPage('/perfil/conexiones?modal=conectar-github');
  await click(button('Continuar con GitHub', openDialogs().at(-1)));
  assert.equal(location(), '/perfil/conexiones?modal=repositorios');
  assert.equal(openDialogs().length, 1);
  assert.match(openDialogs()[0].textContent, /Elige qué proyectos te representan/);
});

test('reconectar desde un evento vuelve al borrador sin cerrar el formulario padre', async () => {
  await mountPage('/agenda?dia=2026-10-26&accion=crear');
  const editor = openDialogs()[0];
  const input = editor.querySelector('#calendar-event-form input');
  await act(() => {
    Object.getOwnPropertyDescriptor(dom.HTMLInputElement.prototype, 'value').set.call(input, 'Borrador que debo conservar');
    input.dispatchEvent(new dom.Event('input', { bubbles: true }));
  });
  await click(button('Autorizar calendario', editor));
  assert.equal(openDialogs().length, 2);
  await click(button('Autorizar en Google', openDialogs().at(-1)));
  assert.equal(location(), '/agenda?dia=2026-10-26&accion=crear');
  assert.equal(openDialogs().length, 1);
  assert.equal(openDialogs()[0].querySelector('#calendar-event-form input').value, 'Borrador que debo conservar');
  assert.equal(button('Crear evento', openDialogs()[0]).disabled, false);
});

async function renderControlled(open, onOpenChange, child = 'Contenido') {
  await act(() => root.render(React.createElement(React.StrictMode, null,
    React.createElement(Dialog, { open, onOpenChange, title: 'Controlado' }, child))));
}

test('un close encolado de un cierre controlado no cancela una reapertura', async () => {
  const changes = [];
  await renderControlled(true, value => changes.push(value));
  await flushNativeCloseEvents();
  changes.length = 0;
  await renderControlled(false, value => changes.push(value));
  await renderControlled(true, value => changes.push(value));
  await flushNativeCloseEvents();
  assert.deepEqual(changes, []);
  assert.equal(openDialogs().length, 1);
});

test('un cierre nativo externo sí notifica una sola vez', async () => {
  const changes = [];
  await renderControlled(true, value => changes.push(value));
  await flushNativeCloseEvents();
  changes.length = 0;
  openDialogs()[0].close();
  await flushNativeCloseEvents();
  assert.deepEqual(changes, [false]);
});

test('un clic fuera sin pulsación en el fondo no descarta el modal recién abierto', async () => {
  const changes = [];
  await renderControlled(true, value => changes.push(value));
  await flushNativeCloseEvents();
  changes.length = 0;
  await act(() => openDialogs()[0].dispatchEvent(new dom.MouseEvent('click', { bubbles: true, clientX: 20, clientY: 20 })));
  assert.deepEqual(changes, []);
});

test('pulsar y soltar en el fondo solicita cerrar una sola vez', async () => {
  const changes = [];
  await renderControlled(true, value => changes.push(value));
  await flushNativeCloseEvents();
  changes.length = 0;
  const dialog = openDialogs()[0];
  await act(() => {
    dialog.dispatchEvent(new dom.PointerEvent('pointerdown', { bubbles: true, button: 0, clientX: 20, clientY: 20 }));
    dialog.dispatchEvent(new dom.MouseEvent('click', { bubbles: true, clientX: 20, clientY: 20 }));
  });
  assert.deepEqual(changes, [false]);
});

test('arrastrar desde el contenido hacia el fondo no cierra el modal', async () => {
  const changes = [];
  await renderControlled(true, value => changes.push(value));
  await flushNativeCloseEvents();
  changes.length = 0;
  const dialog = openDialogs()[0];
  await act(() => {
    dialog.dispatchEvent(new dom.PointerEvent('pointerdown', { bubbles: true, button: 0, clientX: 200, clientY: 200 }));
    dialog.dispatchEvent(new dom.MouseEvent('click', { bubbles: true, clientX: 20, clientY: 20 }));
  });
  assert.deepEqual(changes, []);
});


import test, { before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { createServer } from 'vite';

let dom, server, React, act, createRoot;
let Dialog;
let root, container;

const nativeCloseEvents = [];

before(async () => {
  dom = new Window({ url: 'http://localhost/' });

  for (const key of [
    'window', 'document', 'navigator', 'HTMLElement',
    'HTMLDialogElement', 'Element', 'Node', 'Event',
    'MouseEvent', 'PointerEvent'
  ]) {
    Object.defineProperty(globalThis, key, {
      configurable: true,
      value: key === 'window' ? dom : dom[key]
    });
  }

  globalThis.IS_REACT_ACT_ENVIRONMENT = true;

  dom.HTMLDialogElement.prototype.close = function () {
    if (!this.open) return;
    this.removeAttribute('open');
    nativeCloseEvents.push(() =>
      this.dispatchEvent(new dom.Event('close'))
    );
  };

  dom.HTMLDialogElement.prototype.getBoundingClientRect = () => ({
    left: 100,
    top: 100,
    right: 700,
    bottom: 600,
    width: 600,
    height: 500
  });

  React = await import('react');
  act = React.act;
  ({ createRoot } = await import('react-dom/client'));

  server = await createServer({
    server: { middlewareMode: true, hmr: false, watch: null },
    appType: 'custom'
  });

  ({ Dialog } = await server.ssrLoadModule(
    '/src/components/modals/Dialog.tsx'
  ));
});

beforeEach(() => {
  nativeCloseEvents.length = 0;
  container = dom.document.createElement('div');
  dom.document.body.append(container);
  root = createRoot(container);
});

async function flushNativeCloseEvents() {
  let cycles = 0;

  while (nativeCloseEvents.length) {
    assert.ok(++cycles < 20, 'el cierre no debe provocar un bucle');

    const events = nativeCloseEvents.splice(0);

    await act(() => {
      events.forEach(deliver => deliver());
    });
  }
}

afterEach(async () => {
  await act(() => root.unmount());
  await flushNativeCloseEvents();
  dom.document.body.replaceChildren();
});

after(async () => {
  await server?.close();
  dom?.happyDOM.abort();
});

const openDialogs = () =>
  [...dom.document.querySelectorAll('dialog[open]')];

async function renderControlled(
  open,
  onOpenChange,
  child = 'Contenido',
  dismissible = true,
  description
) {
  await act(() =>
    root.render(
      React.createElement(
        React.StrictMode,
        null,
        React.createElement(
          Dialog,
          {
            open,
            onOpenChange,
            title: 'Controlado',
            description,
            dismissible
          },
          child
        )
      )
    )
  );
}

test('muestra el diálogo cuando open es true', async () => {
  await renderControlled(true, () => { });

  assert.equal(openDialogs().length, 1);
  assert.match(openDialogs()[0].textContent, /Controlado/);
  assert.match(openDialogs()[0].textContent, /Contenido/);
});

test('cierra el diálogo cuando open cambia a false', async () => {
  await renderControlled(true, () => { });
  await flushNativeCloseEvents();

  await renderControlled(false, () => { });
  await flushNativeCloseEvents();

  assert.equal(openDialogs().length, 0);
});

test('asocia correctamente el título y la descripción accesibles', async () => {
  await renderControlled(
    true,
    () => { },
    'Contenido',
    true,
    'Descripción del diálogo'
  );

  const dialog = openDialogs()[0];
  const titleId = dialog.getAttribute('aria-labelledby');
  const descriptionId = dialog.getAttribute('aria-describedby');

  assert.ok(titleId);
  assert.ok(descriptionId);
  assert.equal(
    dialog.querySelector(`#${titleId}`)?.textContent,
    'Controlado'
  );
  assert.equal(
    dialog.querySelector(`#${descriptionId}`)?.textContent,
    'Descripción del diálogo'
  );
});

test('el botón de cerrar solicita cerrar el diálogo', async () => {
  const changes = [];

  await renderControlled(true, value => changes.push(value));

  const closeButton = openDialogs()[0].querySelector(
    'button[aria-label="Cerrar diálogo"]'
  );

  assert.ok(closeButton);

  await act(() => closeButton.click());

  assert.deepEqual(changes, [false]);
});

test('Escape solicita cerrar el diálogo', async () => {
  const changes = [];

  await renderControlled(true, value => changes.push(value));

  const dialog = openDialogs()[0];

  await act(() =>
    dialog.dispatchEvent(
      new dom.Event('cancel', { cancelable: true })
    )
  );

  assert.deepEqual(changes, [false]);
});

test('un diálogo no descartable no muestra el botón de cerrar', async () => {
  const changes = [];

  await renderControlled(true, value => changes.push(value), 'Contenido', false);

  const dialog = openDialogs()[0];

  assert.equal(
    dialog.querySelector('button[aria-label="Cerrar diálogo"]'),
    null
  );

  await act(() =>
    dialog.dispatchEvent(
      new dom.Event('cancel', { cancelable: true })
    )
  );

  assert.deepEqual(changes, []);
});

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

  await act(() =>
    openDialogs()[0].dispatchEvent(
      new dom.MouseEvent('click', {
        bubbles: true,
        clientX: 20,
        clientY: 20
      })
    )
  );

  assert.deepEqual(changes, []);
});

test('pulsar y soltar en el fondo solicita cerrar una sola vez', async () => {
  const changes = [];

  await renderControlled(true, value => changes.push(value));
  await flushNativeCloseEvents();

  changes.length = 0;

  const dialog = openDialogs()[0];

  await act(() => {
    dialog.dispatchEvent(
      new dom.PointerEvent('pointerdown', {
        bubbles: true,
        button: 0,
        clientX: 20,
        clientY: 20
      })
    );

    dialog.dispatchEvent(
      new dom.MouseEvent('click', {
        bubbles: true,
        clientX: 20,
        clientY: 20
      })
    );
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
    dialog.dispatchEvent(
      new dom.PointerEvent('pointerdown', {
        bubbles: true,
        button: 0,
        clientX: 200,
        clientY: 200
      })
    );

    dialog.dispatchEvent(
      new dom.MouseEvent('click', {
        bubbles: true,
        clientX: 20,
        clientY: 20
      })
    );
  });

  assert.deepEqual(changes, []);
});
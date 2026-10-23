import { useState } from 'react';
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiCopy,
  FiEdit3,
  FiLink2,
  FiShield,
} from 'react-icons/fi';
import usePublicLink from '../hooks/usePublicLink';

function PublicLinkPage() {
  const {
    publicLink,
    draftHandle,
    availability,
    isLoaded,
    isSaving,
    serverError,
    notice,
    updateDraftHandle,
    saveHandle,
    togglePublicLink,
    setOptionalFieldsPrivate,
  } = usePublicLink();

  const [showConfirmation, setShowConfirmation] =
    useState(false);

  const [copyMessage, setCopyMessage] = useState('');

  const availabilityMessages = {
    unchanged: 'Este es tu identificador actual.',
    checking: 'Verificando disponibilidad...',
    available: 'Identificador disponible.',
    taken: 'Este identificador ya está ocupado.',
    invalid: 'Usa entre 3 y 50 caracteres: minúsculas, números o guiones.',
    reserved: 'Este identificador está reservado.',
    error: 'No fue posible verificar la disponibilidad.',
  };

  const canSaveHandle =
    isLoaded && availability === 'available' && !isSaving;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicLink.url);
      setCopyMessage('Enlace copiado al portapapeles.');
    } catch {
      setCopyMessage(
        'No se pudo copiar. Selecciona la URL manualmente.',
      );
    }
  }

  async function confirmHandleChange() {
    const saved = await saveHandle();

    if (saved) {
      setShowConfirmation(false);
      setCopyMessage('');
    }
  }

  return (
    <main className="min-h-screen bg-[#111412] px-5 py-12 text-[#E1E4DF] md:px-12">
      <div className="mx-auto max-w-[1100px]">
        <header className="mb-10">
          <span className="inline-flex items-center gap-2 rounded-md bg-[#282B28] px-3 py-2 text-xs font-medium tracking-wider text-[#4EDEA3]">
            <FiLink2 aria-hidden="true" />
            GESTIÓN DE PERFIL PÚBLICO
          </span>

          <h1 className="mt-5 text-3xl font-semibold md:text-4xl">
            Enlace Publico
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#B9C8BF]">
            Configura el enlace de tu perfil profesional,
            administra su visibilidad y compártelo
            con otras personas.
          </p>
        </header>

        <div className="mb-7 rounded-lg border border-[#325448] bg-[#193126] px-5 py-4 text-sm text-[#4EDEA3]">
          La información del enlace se obtiene del servidor.
          El aviso de privacidad continúa en modo demostración.
        </div>

        {serverError && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-lg border border-[#8E3333] bg-[#3B2422] p-4 text-sm text-[#FFB4AB]"
          >
            <FiAlertTriangle
              className="mt-1 shrink-0"
              aria-hidden="true"
            />
            {serverError}
          </div>
        )}

        {notice && (
          <p
            role="status"
            className="mb-6 flex items-center gap-2 text-sm text-[#4EDEA3]"
          >
            <FiCheckCircle aria-hidden="true" />
            {notice}
          </p>
        )}

        <div className="grid gap-6">
          <section className="rounded-xl border border-[#2C312E] bg-[#191C1A] p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  Estado del enlace
                </h2>

                <p className="mt-2 text-sm text-[#B9C8BF]">
                  Decide si otras personas pueden
                  consultar tu perfil.
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-2 text-xs font-medium ${
                  publicLink.publicLinkActive
                    ? 'bg-[#20372D] text-[#4EDEA3]'
                    : 'bg-[#323533] text-[#B9C8BF]'
                }`}
              >
                {publicLink.publicLinkActive
                  ? 'Enlace activo'
                  : 'Enlace desactivado'}
              </span>
            </div>

            <div className="mt-8 flex items-center justify-between gap-5 rounded-lg bg-[#252A27] p-5">
              <div>
                <p className="font-medium">
                  Permitir acceso público
                </p>
                <p className="mt-2 text-xs leading-5 text-[#B9C8BF]">
                  {publicLink.publicLinkActive
                    ? 'Tu enlace está habilitado para compartir.'
                    : 'Tu perfil no está disponible públicamente.'}
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-label="Activar enlace público"
                aria-checked={publicLink.publicLinkActive}
                disabled={!isLoaded || isSaving}
                onClick={() => void togglePublicLink()}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4EDEA3] disabled:opacity-50 ${
                  publicLink.publicLinkActive
                    ? 'bg-[#10B981]'
                    : 'bg-[#64748B]'
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                    publicLink.publicLinkActive
                      ? 'left-1 translate-x-5'
                      : 'left-1'
                  }`}
                />
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-[#2C312E] bg-[#191C1A] p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <FiLink2 className="text-[#4EDEA3]" size={22} />
              <h2 className="text-xl font-semibold">
                Enlace para compartir
              </h2>
            </div>

            <label
              htmlFor="public-profile-url"
              className="text-xs uppercase tracking-widest text-[#B9C8BF]"
            >
              URL de tu perfil
            </label>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                id="public-profile-url"
                type="text"
                readOnly
                value={publicLink.url}
                className="min-w-0 flex-1 rounded-md border border-[#2C312E] bg-[#101312] px-4 py-3 font-mono text-sm text-[#E1E4DF]"
              />

              <button
                type="button"
                disabled={!isLoaded}
                onClick={() => void copyLink()}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#4EDEA3] px-5 py-3 text-sm font-semibold text-[#00291A] transition-colors hover:bg-[#69EABB]"
              >
                <FiCopy aria-hidden="true" />
                Copiar enlace
              </button>
            </div>

            {copyMessage && (
              <p
                role="status"
                className="mt-3 text-sm text-[#4EDEA3]"
              >
                {copyMessage}
              </p>
            )}

            <p className="mt-4 text-xs leading-5 text-[#B9C8BF]">
              En esta demostración, la dirección todavía no
              abre un perfil real. La vista pública se
              implementará en el issue #52.
            </p>
          </section>

          <section className="rounded-xl border border-[#2C312E] bg-[#191C1A] p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <FiEdit3 className="text-[#4EDEA3]" size={22} />
              <h2 className="text-xl font-semibold">
                Identificador público
              </h2>
            </div>

            <p className="mb-6 text-sm leading-6 text-[#B9C8BF]">
              Tu identificador forma parte de la URL.
              Puedes cambiarlo siempre que no esté ocupado.
            </p>

            <label
              htmlFor="public-handle"
              className="text-xs uppercase tracking-widest text-[#B9C8BF]"
            >
              Nombre del enlace
            </label>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                id="public-handle"
                type="text"
                disabled={!isLoaded || isSaving}
                value={draftHandle}
                onChange={event =>
                  updateDraftHandle(event.target.value)
                }
                maxLength={50}
                autoComplete="off"
                spellCheck={false}
                aria-describedby="handle-availability"
                className="min-w-0 flex-1 rounded-md border border-[#2C312E] bg-[#101312] px-4 py-3 font-mono text-sm text-[#E1E4DF] outline-none focus:border-[#4EDEA3]"
              />

              <button
                type="button"
                disabled={!canSaveHandle}
                onClick={() => setShowConfirmation(true)}
                className="rounded-md bg-[#4EDEA3] px-6 py-3 text-sm font-semibold text-[#00291A] transition-colors hover:bg-[#69EABB] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Cambiar identificador
              </button>
            </div>

            <p
              id="handle-availability"
              aria-live="polite"
              className={`mt-3 text-sm ${
                availability === 'available'
                  ? 'text-[#4EDEA3]'
                  : availability === 'unchanged' ||
                      availability === 'checking'
                    ? 'text-[#B9C8BF]'
                    : 'text-[#FFB4AB]'
              }`}
            >
              {availabilityMessages[availability]}
            </p>
          </section>

          {publicLink.publicLinkActive &&
            publicLink.allOptionalFieldsPrivate && (
              <aside
                role="status"
                className="flex gap-3 rounded-lg border border-[#756132] bg-[#302B20] p-5"
              >
                <FiAlertTriangle
                  className="mt-1 shrink-0 text-[#F9D17A]"
                  size={20}
                  aria-hidden="true"
                />

                <div>
                  <h2 className="font-semibold text-[#F9D17A]">
                    Tu enlace está activo, pero tu perfil tiene poca información visible
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#E1E4DF]">
                    Todos los datos opcionales del perfil
                    están configurados como privados.
                    Revisa su visibilidad antes de compartir
                    el enlace.
                  </p>
                </div>
              </aside>
            )}

          <section className="rounded-xl border border-[#2C312E] bg-[#191C1A] p-6">
            <h2 className="flex items-center gap-2 font-semibold">
              <FiShield className="text-[#4EDEA3]" />
              Controles de demostración
            </h2>

            <p className="mt-2 text-xs leading-5 text-[#B9C8BF]">
              Esta opción permite simular la privacidad de los datos
              opcionales mientras se integra su configuración real.
            </p>

            <div className="mt-5 flex flex-col gap-4">
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={publicLink.allOptionalFieldsPrivate}
                  onChange={event =>
                    setOptionalFieldsPrivate(
                      event.target.checked,
                    )
                  }
                  className="accent-[#10B981]"
                />
                Simular todos los datos opcionales privados
              </label>
            </div>
          </section>
        </div>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-handle-title"
            className="w-full max-w-md rounded-xl border border-[#2C312E] bg-[#1B1F1D] p-7 shadow-2xl"
          >
            <FiAlertTriangle
              className="mb-5 text-[#FFB4AB]"
              size={30}
              aria-hidden="true"
            />

            <h2
              id="confirm-handle-title"
              className="text-2xl font-semibold"
            >
              ¿Cambiar tu identificador?
            </h2>

            <p className="mt-4 text-sm leading-6 text-[#B9C8BF]">
              Tu enlace anterior dejará de funcionar.
              Las personas que lo tengan guardado
              necesitarán el nuevo.
            </p>

            <div className="mt-5 rounded-md bg-[#252A27] p-4 font-mono text-xs">
              <p className="text-[#B9C8BF]">
                Anterior: {publicLink.handleName}
              </p>
              <p className="mt-2 text-[#4EDEA3]">
                Nuevo: {draftHandle}
              </p>
            </div>

            {serverError && (
              <p role="alert" className="mt-4 text-sm text-[#FFB4AB]">
                {serverError}
              </p>
            )}

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                autoFocus
                disabled={isSaving}
                onClick={() => setShowConfirmation(false)}
                className="rounded-md bg-[#323533] px-4 py-3 text-sm"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => void confirmHandleChange()}
                className="rounded-md bg-[#4EDEA3] px-4 py-3 text-sm font-semibold text-[#00291A] disabled:opacity-50"
              >
                {isSaving ? 'Guardando...' : 'Confirmar cambio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default PublicLinkPage;

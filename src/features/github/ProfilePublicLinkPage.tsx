import { useState } from 'react';
import { FiCopy, FiExternalLink, FiLink } from 'react-icons/fi';
import { MemberShell } from '../../components/features/flows/FlowShell';
import { ProfileTabs } from '../../components/features/profile/ProfileParts';
import {
  Alert,
  Button,
  Input,
  SectionHeading,
  Switch,
} from '../../components/ui';
import { Dialog } from '../../components/modals';
import usePublicLink from '../../hooks/usePublicLink';

const availabilityMessages = {
  unchanged: 'Introduce un identificador diferente.',
  checking: 'Verificando disponibilidad...',
  available: 'Identificador disponible.',
  taken: 'Este identificador ya está ocupado.',
  invalid: 'Usa entre 3 y 50 letras minúsculas, números o guiones.',
  reserved: 'Este identificador está reservado.',
  error: 'No se pudo verificar la disponibilidad.',
};

export default function ProfilePublicLinkPage() {
  const {
    publicLink,
    draftHandle,
    availability,
    isLoaded,
    isSaving,
    serverError,
    notice,
    visibilityLoaded,
    visibilityError,
    updateDraftHandle,
    saveHandle,
    togglePublicLink,
  } = usePublicLink();

  const [editing, setEditing] = useState(false);
  const [confirmingChange, setConfirmingChange] = useState(false);
  const [copyNotice, setCopyNotice] = useState('');

  async function copy() {
    try {
      await navigator.clipboard.writeText(publicLink.url);
      setCopyNotice('Enlace copiado.');
    } catch {
      setCopyNotice(
        'Selecciona y copia la dirección del enlace.',
      );
    }
  }

  function closeEditor() {
    if (isSaving) return;
    setEditing(false);
    setConfirmingChange(false);
  }

  async function advanceHandleChange() {
    if (availability !== 'available' || isSaving) return;

    if (!confirmingChange) {
      setConfirmingChange(true);
      return;
    }

    if (await saveHandle()) {
      setEditing(false);
      setConfirmingChange(false);
      setCopyNotice('');
    }
  }

  return (
    <MemberShell>
      <SectionHeading
        title="Tu perfil tiene una dirección"
        eyebrow="MI CUENTA / PERFIL"
        accentPeriod
      />

      <ProfileTabs />

      {serverError && (
        <Alert tone="danger">{serverError}</Alert>
      )}

      {visibilityError && isLoaded && (
        <Alert tone="warning">
          No se pudo verificar qué información de tu perfil
          está pública. Revisa la pestaña Visibilidad.
        </Alert>
      )}

      {notice && (
        <Alert tone="success">{notice}</Alert>
      )}

      {copyNotice && (
        <p role="status">{copyNotice}</p>
      )}

      {!isLoaded && !serverError && (
        <p role="status">Cargando enlace público...</p>
      )}

      {isLoaded && (
        <>
          <div className="public-link-sharing">
            <div>
              <h2>Compartir mi perfil</h2>
              <p>
                Permite que otras personas consulten
                tu información pública.
              </p>
            </div>

            <span>
              {publicLink.publicLinkActive
                ? 'Enlace activo'
                : 'Enlace inactivo'}
            </span>

            <Switch
              label="Compartir mi perfil"
              checked={publicLink.publicLinkActive}
              disabled={isSaving}
              onChange={() => void togglePublicLink()}
            />
          </div>

          {publicLink.publicLinkActive &&
            visibilityLoaded &&
            publicLink.allOptionalFieldsPrivate && (
              <Alert tone="warning">
                Tu enlace está activo, pero todos los datos
                opcionales están privados. Las personas solo
                podrán consultar tu información básica.
                Puedes cambiarlo desde Visibilidad.
              </Alert>
            )}

          <section className="public-link-address">
            <p className="ui-eyebrow">TU ENLACE ACTUAL</p>

            <div>
              <FiLink />

              <p>{publicLink.url}</p>

              <Button
                variant="secondary"
                leadingIcon={<FiCopy />}
                disabled={!publicLink.publicLinkActive}
                onClick={() => void copy()}
              >
                Copiar enlace
              </Button>
            </div>

            {publicLink.publicLinkActive && (
              <a
                className="flow-link"
                href={publicLink.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver mi perfil público <FiExternalLink />
              </a>
            )}
          </section>

          <section className="public-link-identifier">
            <h2>Identificador del perfil</h2>

            <p>@{publicLink.handleName}</p>

            <Button
              variant="secondary"
              disabled={isSaving}
              onClick={() => {
                setConfirmingChange(false);
                setEditing(true);
              }}
            >
              Cambiar identificador
            </Button>
          </section>
        </>
      )}

      {editing && (
        <Dialog
          open
          title={
            confirmingChange
              ? '¿Confirmar cambio de enlace?'
              : 'Cambia tu dirección pública.'
          }
          onOpenChange={open => {
            if (!open) closeEditor();
          }}
          dismissible={!isSaving}
          footer={
            <>
              <Button
                variant="secondary"
                disabled={isSaving}
                onClick={() => {
                  if (confirmingChange) {
                    setConfirmingChange(false);
                  } else {
                    closeEditor();
                  }
                }}
              >
                {confirmingChange ? 'Volver' : 'Cancelar'}
              </Button>

              <Button
                loading={isSaving}
                disabled={availability !== 'available'}
                onClick={() => void advanceHandleChange()}
              >
                {confirmingChange
                  ? 'Confirmar cambio'
                  : 'Continuar'}
              </Button>
            </>
          }
        >
          {confirmingChange ? (
            <>
              <p className="flow-copy">
                Vas a reemplazar tu enlace público actual:
              </p>

              <p className="flow-copy">
                <strong>{publicLink.url}</strong>
              </p>

              <p className="flow-copy">
                Nuevo identificador:
                <strong> @{draftHandle}</strong>
              </p>

              <Alert tone="warning">
                El enlace anterior dejará de funcionar
                cuando confirmes el cambio.
              </Alert>
            </>
          ) : (
            <>
              <Input
                label="Nuevo identificador"
                value={draftHandle}
                onChange={event =>
                  updateDraftHandle(
                    event.target.value.toLowerCase(),
                  )
                }
                maxLength={50}
                minLength={3}
                pattern="[a-z0-9-]{3,50}"
                hint={availabilityMessages[availability]}
              />

              <p className="flow-copy">
                Al cambiarlo, la dirección anterior
                dejará de funcionar.
              </p>
            </>
          )}

          {serverError && (
            <Alert tone="danger">{serverError}</Alert>
          )}
        </Dialog>
      )}
    </MemberShell>
  );
}

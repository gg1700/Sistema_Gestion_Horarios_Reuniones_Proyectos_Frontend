import { useState } from 'react';
import { FiLink, FiShield } from 'react-icons/fi';
import { Dialog } from '../../modals';
import { Alert, Button, ProviderIcon } from '../../ui';
import { StatusDot } from '../flows/FlowPrimitives';
import { getProviderLinkUrl } from '../../../api/authApi';
import { useLinkedAccounts } from '../../../hooks/useLinkedAccounts';
import type { OAuthProvider } from '../../../types/auth';

const providers: OAuthProvider[] = ['google', 'github'];

function providerName(provider: OAuthProvider) {
  return provider === 'google' ? 'Google' : 'GitHub';
}

function connectionStatus(state?: string) {
  if (!state) return 'Sin vincular';
  if (state === 'active') return 'Conectado';
  return 'Requiere reconexión';
}

export function LinkedAccountsSection() {
  const { accounts, loading, error, refresh, unlink } =
    useLinkedAccounts();

  const [selectedProvider, setSelectedProvider] =
    useState<OAuthProvider | null>(null);

  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  function link(provider: OAuthProvider) {
    window.location.assign(getProviderLinkUrl(provider));
  }

  function askUnlink(provider: OAuthProvider) {
    setActionError('');
    setSuccessMessage('');
    setSelectedProvider(provider);
  }

  async function confirmUnlink() {
    if (!selectedProvider || saving) return;

    setSaving(true);
    setActionError('');

    try {
      await unlink(selectedProvider);

      setSuccessMessage(
        `Se desvinculó ${providerName(selectedProvider)} correctamente.`
      );

      setSelectedProvider(null);
    } catch (failure) {
      setActionError(
        failure instanceof Error
          ? failure.message
          : 'No se pudo desvincular la cuenta.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <p className="ui-eyebrow">
        CUENTAS PARA INICIAR SESIÓN
      </p>

      <p className="flow-copy">
        Administra las cuentas de Google y GitHub con las
        que puedes entrar a Orbitia.
      </p>

      {loading && (
        <p role="status" className="flow-copy">
          Consultando cuentas vinculadas...
        </p>
      )}

      {error && (
        <>
          <Alert tone="danger">{error}</Alert>
          <Button variant="secondary" size="small" onClick={refresh}>
            Reintentar
          </Button>
        </>
      )}

      {successMessage && (
        <Alert tone="success">{successMessage}</Alert>
      )}

      {!loading && !error && providers.map(provider => {
        const account = accounts.find(
          item => item.provider === provider
        );

        const connected = Boolean(account);
        const active = account?.state === 'active';

        const canUnlink = connected &&
          accounts.length > 1 &&
          (
            !active ||
            accounts.some(
              other =>
                other.provider !== provider &&
                other.state === 'active'
            )
          );

        const scopes = account?.scopes
          ?.split(/[\s,]+/)
          .filter(Boolean)
          .join(', ');

        return (
          <article className="connection-provider" key={provider}>
            <ProviderIcon provider={provider} />

            <div>
              <header>
                <h2>{providerName(provider)} · acceso</h2>

                <StatusDot
                  tone={
                    !connected
                      ? 'muted'
                      : active
                        ? 'success'
                        : 'warning'
                  }
                >
                  {connectionStatus(account?.state)}
                </StatusDot>
              </header>

              <p>
                {account
                  ? (
                    account.provider_username ||
                    account.provider_user_email ||
                    'Cuenta vinculada'
                  )
                  : 'No está vinculada como método de acceso.'}
              </p>

              {account && (
                <p className="connection-provider-note">
                  Permisos: {scopes || 'No informados'}
                </p>
              )}

              <div className="connection-actions">
                {!account ? (
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => link(provider)}
                  >
                    <FiLink /> Vincular {providerName(provider)}
                  </Button>
                ) : (
                  <>
                    {!active && (
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => link(provider)}
                      >
                        Volver a autorizar
                      </Button>
                    )}

                    <Button
                      variant="secondary"
                      size="small"
                      disabled={!canUnlink}
                      onClick={() => askUnlink(provider)}
                    >
                      Desvincular cuenta
                    </Button>
                  </>
                )}
              </div>

              {account && !canUnlink && (
                <p className="connection-provider-note">
                  No puedes desvincular tu único método
                  de acceso activo. Vincula otra cuenta primero.
                </p>
              )}
            </div>
          </article>
        );
      })}

      <p className="flow-note">
        <FiShield />
        Las cuentas de acceso son independientes de
        las configuraciones de calendario y publicación
        de repositorios.
      </p>

      <Dialog
        open={selectedProvider !== null}
        onOpenChange={open => {
          if (!open && !saving) {
            setSelectedProvider(null);
          }
        }}
        dismissible={!saving}
        title={`¿Desvincular ${selectedProvider
          ? providerName(selectedProvider)
          : 'esta cuenta'}?`}
        eyebrow="CUENTAS VINCULADAS"
        size="medium"
        footer={
          <>
            <Button
              variant="secondary"
              disabled={saving}
              onClick={() => setSelectedProvider(null)}
            >
              Cancelar
            </Button>

            <Button
              variant="danger"
              loading={saving}
              onClick={() => void confirmUnlink()}
            >
              Confirmar desvinculación
            </Button>
          </>
        }
      >
        <p className="flow-copy">
          Esta cuenta dejará de servir para iniciar sesión
          en Orbitia. También se revocará su autorización
          en el proveedor externo.
        </p>

        {actionError && (
          <Alert tone="danger">{actionError}</Alert>
        )}
      </Dialog>
    </>
  );
}

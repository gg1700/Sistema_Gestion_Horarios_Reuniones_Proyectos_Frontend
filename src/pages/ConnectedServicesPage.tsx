import { useState } from 'react';
import { FiShield, FiLock } from 'react-icons/fi';
import ConnectedServiceCard from '../components/features/ConnectedServiceCard';
import useConnectedAccounts from '../hooks/useConnectedAccounts';
import type { OAuthProvider } from '../types/connectedAccount';

function ConnectedServicesPage() {
  const {
    accounts,
    connectedCount,
    notice,
    simulateConnectAccount,
    simulateDisconnectAccount,
  } = useConnectedAccounts();

  const [pendingProvider, setPendingProvider] =
    useState<OAuthProvider | null>(null);

  const selectedAccount = accounts.find(
    account => account.provider === pendingProvider,
  );

  function confirmDisconnect() {
    if (pendingProvider) {
      simulateDisconnectAccount(pendingProvider);
    }

    setPendingProvider(null);
  }

  return (
    <main className="min-h-screen bg-[#111412] px-5 py-14 text-[#E1E4DF] md:px-12">
      <div className="mx-auto max-w-[1200px]">
        <header className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#282B28] px-4 py-2 text-xs tracking-widest text-[#4EDEA3]">
              <span className="h-2 w-2 rounded-full bg-[#4EDEA3]" />
              AUTENTICACIÓN OAUTH 2.0
            </span>

            <h1 className="mt-5 text-3xl font-semibold md:text-4xl">
              Servicios Conectados
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[#B9C8BF]">
              Gestiona las cuentas vinculadas mediante
              autenticación OAuth 2.0 segura.
            </p>
          </div>

          <div className="rounded-lg bg-[#1D201E] p-5">
            <p className="text-xs tracking-widest text-[#B9C8BF]">
              SERVICIOS ACTIVOS
            </p>

            <p className="mt-2 text-xl font-semibold">
              {connectedCount} / {accounts.length} vinculados
            </p>
          </div>
        </header>

        <div className="mt-8 rounded-lg border border-[#325448] bg-[#193126] px-5 py-3 text-sm text-[#4EDEA3]">
          VISTA DE PRUEBA · Datos simulados. No modifica cuentas reales.
        </div>

        <div className="mt-8 h-1 rounded-full bg-[#252A27]">
          <div
            className="h-full rounded-full bg-[#4EDEA3] transition-all"
            style={{
              width: `${
                accounts.length > 0
                  ? (connectedCount / accounts.length) * 100
                  : 0
              }%`,
            }}
          />
        </div>

        {notice && (
          <p
            aria-live="polite"
            className="mt-5 text-sm text-[#4EDEA3]"
          >
            {notice}
          </p>
        )}

        <section className="mt-12 grid grid-cols-1 gap-7 md:grid-cols-2">
          {accounts.map(account => (
            <ConnectedServiceCard
              key={account.provider}
              account={account}
              canDisconnect={connectedCount > 1}
              onConnect={() =>
                simulateConnectAccount(account.provider)
              }
              onDisconnect={() =>
                setPendingProvider(account.provider)
              }
            />
          ))}
        </section>

        <section className="mt-16 rounded-2xl border border-[#2C312E] bg-[#191C1A] p-8">
          <h2 className="flex items-center gap-3 text-lg font-semibold">
            <FiShield
              className="text-[#4EDEA3]"
              aria-hidden="true"
            />
            Privacidad y protección de acceso
          </h2>

          <div className="mt-6 grid gap-7 text-sm leading-7 text-[#B9C8BF] md:grid-cols-2">
            <p>
              Orbitia utiliza la autorización de proveedores externos.
              No necesita almacenar las contraseñas de Google o GitHub.
            </p>

            <p>
              Las conexiones deben gestionarse mediante permisos
              y tokens protegidos por el backend.
            </p>
          </div>
        </section>
      </div>

      {selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="disconnect-title"
            className="w-full max-w-md rounded-xl border border-[#2C312E] bg-[#1B1F1D] p-7 shadow-2xl"
          >
            <FiLock
              className="mb-5 text-[#FFB4AB]"
              size={30}
              aria-hidden="true"
            />

            <h2
              id="disconnect-title"
              className="text-2xl font-semibold"
            >
              ¿Desvincular{' '}
              {selectedAccount.provider === 'google'
                ? 'Google'
                : 'GitHub'}?
            </h2>

            <p className="mt-4 text-sm leading-6 text-[#B9C8BF]">
              Esta es una simulación local para comprobar
              la interfaz. No se revocará ningún acceso real.
            </p>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingProvider(null)}
                className="rounded-md bg-[#323533] px-4 py-3 text-sm"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmDisconnect}
                className="rounded-md bg-[#FFB4AB] px-4 py-3 text-sm font-semibold text-[#3B2422]"
              >
                Desvincular en demo
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ConnectedServicesPage;

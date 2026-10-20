import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import type { ConnectedAccount } from '../../types/connectedAccount';

interface ConnectedServiceCardProps {
  account: ConnectedAccount;
  canDisconnect: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

function ConnectedServiceCard({
  account,
  canDisconnect,
  onConnect,
  onDisconnect,
}: ConnectedServiceCardProps) {
  const isGoogle = account.provider === 'google';
  const isConnected = account.status === 'connected';

  const name = isGoogle ? 'Google' : 'GitHub';

  const description = isGoogle
    ? 'Accede de forma segura mediante tu cuenta de Google.'
    : 'Gestiona tu identidad vinculada de GitHub.';

  const statusLabel = isConnected
    ? 'Conectado'
    : account.status === 'reconnectRequired'
      ? 'Requiere reconexión'
      : 'Sin vincular';

  return (
    <article className="flex h-full flex-col rounded-2xl border border-[#2C312E] bg-[#191C1A] p-7 text-[#E1E4DF]">
      <div className="mb-8 flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#282B28]">
          {isGoogle ? (
            <FcGoogle size={25} aria-hidden="true" />
          ) : (
            <FaGithub size={25} aria-hidden="true" />
          )}
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            isConnected
              ? 'bg-[#20372D] text-[#4EDEA3]'
              : 'bg-[#323533] text-[#B9C8BF]'
          }`}
        >
          {statusLabel}
        </span>
      </div>

      <h2 className="text-2xl font-semibold">{name}</h2>

      <p className="mt-2 min-h-12 text-sm leading-6 text-[#B9C8BF]">
        {description}
      </p>

      <div className="mt-6 flex-1 rounded-lg bg-[#1D201E] p-5">
        <p className="text-xs uppercase tracking-widest text-[#B9C8BF]">
          Cuenta vinculada
        </p>

        <p className="mt-2 break-all text-sm font-medium">
          {account.username ?? 'Ninguna cuenta vinculada'}
        </p>

        <p className="mt-5 text-xs uppercase tracking-widest text-[#B9C8BF]">
          Permisos
        </p>

        <p className="mt-2 text-sm leading-6">
          {isConnected
            ? account.scopes.join(' · ')
            : 'Sin permisos activos'}
        </p>
      </div>

      <div className="mt-6">
        {isConnected ? (
          <button
            type="button"
            onClick={onDisconnect}
            disabled={!canDisconnect}
            className="w-full rounded-md bg-[#323533] px-4 py-3 text-sm font-semibold text-[#E1E4DF] transition-colors enabled:hover:bg-[#42302E] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Desvincular cuenta
          </button>
        ) : (
          <button
            type="button"
            onClick={onConnect}
            className="w-full rounded-md bg-[#4EDEA3] px-4 py-3 text-sm font-semibold text-[#00291A] transition-colors hover:bg-[#69EABB]"
          >
            {account.status === 'reconnectRequired'
              ? 'Simular reconexión'
              : 'Simular vinculación'}
          </button>
        )}

        {!canDisconnect && isConnected && (
          <p className="mt-3 text-center text-xs leading-5 text-[#B9C8BF]">
            No puedes quitar tu único método de acceso.
          </p>
        )}

        {!isConnected && (
          <p className="mt-3 text-center text-xs text-[#B9C8BF]">
            Acción de demostración. No autoriza cuentas reales.
          </p>
        )}
      </div>
    </article>
  );
}

export default ConnectedServiceCard;

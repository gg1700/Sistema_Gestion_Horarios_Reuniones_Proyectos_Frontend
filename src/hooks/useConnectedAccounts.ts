import { useState } from 'react';
import { mockConnectedAccounts } from '../mocks/connectedAccounts';
import type {
  ConnectedAccount,
  OAuthProvider,
} from '../types/connectedAccount';

function useConnectedAccounts() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>(
    () =>
      mockConnectedAccounts.map(account => ({
        ...account,
        scopes: [...account.scopes],
      })),
  );

  const [notice, setNotice] = useState('');

  const connectedCount = accounts.filter(
    account => account.status === 'connected',
  ).length;

  function simulateConnectAccount(provider: OAuthProvider) {
    const demoAccount = mockConnectedAccounts.find(
      account => account.provider === provider,
    );

    if (!demoAccount) return;

    setAccounts(current =>
      current.map(account =>
        account.provider === provider
          ? {
              ...demoAccount,
              scopes: [...demoAccount.scopes],
              status: 'connected',
            }
          : account,
      ),
    );

    setNotice(
      'Vinculación simulada. Ninguna cuenta real fue modificada.',
    );
  }

  function simulateDisconnectAccount(provider: OAuthProvider) {
    const isConnected = accounts.some(
      account =>
        account.provider === provider &&
        account.status === 'connected',
    );

    if (!isConnected) return;

    if (connectedCount <= 1) {
      setNotice(
        'No puedes desvincular tu único método de acceso.',
      );
      return;
    }

    setAccounts(current =>
      current.map(account =>
        account.provider === provider
          ? {
              ...account,
              status: 'disconnected',
              username: null,
              scopes: [],
            }
          : account,
      ),
    );

    setNotice(
      'Desvinculación simulada. Ninguna cuenta real fue modificada.',
    );
  }

  return {
    accounts,
    connectedCount,
    notice,
    simulateConnectAccount,
    simulateDisconnectAccount,
  };
}

export default useConnectedAccounts;

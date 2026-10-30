import { useCallback, useEffect, useState } from 'react';
import {
  getLinkedAccounts,
  unlinkLinkedAccount
} from '../api/authApi';
import type { LinkedAccount } from '../api/authApi';
import type { OAuthProvider } from '../types/auth';

export function useLinkedAccounts() {
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  const refresh = useCallback(() => {
    setRevision(value => value + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');

    getLinkedAccounts()
      .then(result => {
        if (!cancelled) {
          setAccounts(result);
        }
      })
      .catch(failure => {
        if (!cancelled) {
          setError(
            failure instanceof Error
              ? failure.message
              : 'No se pudieron consultar las cuentas.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [revision]);

  const unlink = useCallback(async (provider: OAuthProvider) => {
    await unlinkLinkedAccount(provider);
    setAccounts(current =>
      current.filter(account => account.provider !== provider)
    );
    refresh();
  }, [refresh]);

  return {
    accounts,
    loading,
    error,
    refresh,
    unlink
  };
}

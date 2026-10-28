import { useEffect, useState } from 'react';
import { AuthApiError, getGitHubConnection } from './api';
import type { GitHubConnection } from './types';

export function useGitHubConnection(userId: string, linked: boolean, state?: string) {
  const [data, setData] = useState<GitHubConnection | null>(null);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setData(null); setError(''); setCode(''); setSessionExpired(false);
    if (!linked || state !== 'active') { setLoading(false); return; }
    setLoading(true);
    getGitHubConnection(controller.signal).then(value => { if (!controller.signal.aborted) setData(value); })
      .catch(failure => { if (!controller.signal.aborted) {
        setError(failure instanceof Error ? failure.message : 'No se pudo comprobar GitHub.');
        setCode(failure instanceof AuthApiError ? failure.code ?? '' : '');
        setSessionExpired(failure instanceof AuthApiError && failure.status === 401);
      } }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [userId, linked, state, revision]);
  return { data, error, code, loading, sessionExpired, retry: () => setRevision(value => value + 1) };
}


import { useCallback, useEffect, useRef, useState } from 'react';
import { getRepositories, type RepositoryCatalogue } from './api';

export function useRepositories() {
  const [data, setData] = useState<RepositoryCatalogue | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const current = useRef<AbortController | null>(null);
  const reload = useCallback(async () => {
    current.current?.abort();
    const controller = new AbortController(); current.current = controller;
    setLoading(true); setError(null);
    try { const result = await getRepositories(controller.signal); if (!controller.signal.aborted) setData(result); }
    catch (failure) { if (!controller.signal.aborted) setError(failure instanceof Error ? failure : new Error('No se pudo consultar GitHub.')); }
    finally { if (!controller.signal.aborted) setLoading(false); }
  }, []);
  useEffect(() => { void reload(); return () => current.current?.abort(); }, [reload]);
  return { data, error, loading, reload };
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { getVisibility, getVisibilityProfile, updateVisibility } from '../api/visibilityApi';
import type { VisibilityProfile, VisibilityRecord } from '../types/visibility';
import { visibilityChanges, visibilityKey } from '../utils/visibility';

export function useVisibilitySettings() {
  const [profile, setProfile] = useState<VisibilityProfile | null>(null);
  const [saved, setSaved] = useState<VisibilityRecord[]>([]);
  const [draft, setDraft] = useState<VisibilityRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [attempt, setAttempt] = useState(0);
  const saving = useRef(false);
  const changes = visibilityChanges(saved, draft);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError('');
    Promise.all([getVisibilityProfile(controller.signal), getVisibility(controller.signal)])
      .then(([nextProfile, records]) => {
        if (controller.signal.aborted) return;
        setProfile(nextProfile);
        setSaved(records);
        setDraft(records);
      })
      .catch(failure => { if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'No se pudo cargar la configuración.'); })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  }, [attempt]);

  useEffect(() => {
    if (!changes.length) return;
    const preventClose = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', preventClose);
    return () => window.removeEventListener('beforeunload', preventClose);
  }, [changes.length]);

  const toggle = useCallback((key: string) => {
    if (saving.current) return;
    setDraft(current => current.map(record => visibilityKey(record) === key ? { ...record, visible: !record.visible } : record));
    setMessage('');
  }, []);

  async function save(): Promise<boolean> {
    if (!changes.length || saving.current) return false;
    saving.current = true;
    setIsSaving(true);
    setError('');
    setMessage('');
    try {
      await updateVisibility(changes);
      setSaved(draft.map(record => ({ ...record })));
      setMessage('Visibilidad guardada correctamente.');
      return true;
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'No se pudieron guardar los cambios.');
      return false;
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  }

  return { profile, draft, isLoading, isSaving, error, message, toggle, save,
    hasPendingChanges: changes.length > 0,
    retry: () => setAttempt(current => current + 1),
    discard: () => { if (!saving.current) { setDraft(saved); setError(''); setMessage(''); } },
  };
}

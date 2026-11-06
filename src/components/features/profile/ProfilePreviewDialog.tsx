import { useEffect, useState } from 'react';
import { FiEye } from 'react-icons/fi';
import { getPublicProfilePreview } from '../../../api/publicProfilePreviewApi';
import type { PublicProfileViewData } from '../../../types/publicProfile';
import { toPublicProfileView } from '../../../utils/publicProfile';
import { Dialog } from '../../modals/Dialog';
import { Alert, Button } from '../../ui';
import { PublicProfileView } from './PublicProfileView';

export function ProfilePreviewDialog({
  open,
  onOpenChange,
  hasPendingChanges = false,
  revision = 0,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasPendingChanges?: boolean;
  revision?: number;
}) {
  const [profile, setProfile] = useState<PublicProfileViewData | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    setProfile(null);
    setError('');
    setIsLoading(true);

    getPublicProfilePreview(controller.signal)
      .then(response => {
        if (!controller.signal.aborted) setProfile(toPublicProfileView(response));
      })
      .catch(failure => {
        if (!controller.signal.aborted) {
          setError(failure instanceof Error ? failure.message : 'No se pudo cargar la vista previa.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [open, revision, attempt]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Así te ven otras personas."
      eyebrow="VISTA PREVIA"
      description="Esta vista muestra tu configuración guardada, aunque tu enlace público esté desactivado."
      size="large"
      className="profile-preview-dialog"
      footer={(
        <>
          <span className="profile-dialog-note"><FiEye />Solo se muestra la información que permitiste publicar.</span>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Volver a visibilidad</Button>
        </>
      )}
    >
      {hasPendingChanges && (
        <Alert>Hay cambios pendientes. Guárdalos para verlos reflejados en la vista previa.</Alert>
      )}
      {isLoading && <p role="status">Cargando la vista previa…</p>}
      {error && (
        <>
          <Alert tone="danger">{error}</Alert>
          <Button variant="secondary" onClick={() => setAttempt(current => current + 1)}>Reintentar</Button>
        </>
      )}
      {!isLoading && !error && profile && <PublicProfileView profile={profile} />}
    </Dialog>
  );
}

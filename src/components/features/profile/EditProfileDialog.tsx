
import { useState } from 'react';
import { FiCheck, FiShield } from 'react-icons/fi';

import { Dialog } from '../../modals';
import { Button } from '../../ui';

import { useUI } from '../../../contexts/UIContext';
import { useMemberIdentity } from '../../../features/github/MemberIdentityContext';

import type { Profile } from '../../../types/profile-response.types';

import {
  updateOwnProfile,
  updateProfilePicture,
} from '../../../api/profileApi';

import { ProfileForm, type ProfileFormValue } from './ProfileForm';

interface EditProfileDialogProps {
  profile: Profile;
  onClose: () => void;
}

export function EditProfileDialog({
  profile,
  onClose,
}: EditProfileDialogProps) {
  const [saving, setSaving] = useState(false);

  const { notify } = useUI();
  const member = useMemberIdentity();

  async function handleSave(value: ProfileFormValue) {
    setSaving(true);

    try {
      // Primera petición: información personal en JSON.
      const result = await updateOwnProfile(value.personalInfo);

      // Segunda petición opcional: foto de perfil en multipart/form-data.
      let pictureError: unknown = null;

      if (value.profilePicture) {
        try {
          await updateProfilePicture(value.profilePicture);
        } catch (error) {
          pictureError = error;
        }
      }

      // Volvemos a consultar GET /api/v1/profile.
      member?.retry();

      onClose();

      if (pictureError) {
        const reason =
          pictureError instanceof Error
            ? pictureError.message
            : 'Error desconocido.';

        notify(
          `Tus datos se guardaron correctamente, pero no se pudo actualizar la foto: ${reason}`,
          'warning',
          8000
        );

        return;
      }

      notify(result.message || 'Información actualizada correctamente.', 'success');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={open => {
        if (!open && !saving) onClose();
      }}
      title="Mantén tu perfil al día."
      eyebrow="MI PERFIL / INFORMACIÓN"
      description="Actualiza tus datos personales y de contacto. Los elementos existentes conservan su configuración de visibilidad."
      size="large"
      className="edit-profile-dialog"
      dismissible={!saving}
      footer={
        <>
          <span className="profile-dialog-note">
            <FiShield />
            Tú decides qué información compartir.
          </span>

          <Button
            type="button"
            variant="secondary"
            disabled={saving}
            onClick={onClose}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            form="edit-personal-info"
            leadingIcon={<FiCheck />}
            loading={saving}
          >
            Guardar cambios
          </Button>
        </>
      }
    >
      <ProfileForm
        id="edit-personal-info"
        profile={profile}
        saving={saving}
        onSave={handleSave}
      />
    </Dialog>
  );
}

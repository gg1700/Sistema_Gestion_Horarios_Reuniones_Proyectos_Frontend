import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { FiAlertCircle, FiTrash2, FiUpload } from 'react-icons/fi';
import IconButton from '../../ui/IconButton';

interface ProfilePhotoPickerProps {
  photo: File | null;
  initials: string;
  error?: string;
  onChange: (photo: File | null) => void;
}

function ProfilePhotoPicker({ photo, initials, error, onChange }: ProfilePhotoPickerProps) {
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (!photo) {
      setPreviewUrl('');
      return;
    }
    const objectUrl = URL.createObjectURL(photo);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.files?.[0] ?? null);
    event.target.value = '';
  }

  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-ui-divider pb-6">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#41694D] bg-[#142C23] font-heading text-2xl text-ui-mint">
        {previewUrl ? (
          <img src={previewUrl} alt="Vista previa de la foto de perfil" className="h-full w-full object-cover" />
        ) : (
          <span aria-hidden="true">{initials}</span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="text-xs font-medium text-ui-text">Foto de perfil</p>
        <p className="text-[10px] text-ui-moss">JPG o PNG · máximo 2 MB</p>
        {error && (
          <p className="flex items-center gap-1 text-[11px] text-ui-danger">
            <FiAlertCircle aria-hidden="true" /> {error}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <label className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-control border border-ui-field-border px-4 text-xs font-semibold text-ui-text transition-colors focus-within:border-ui-mint hover:border-ui-mint/60 hover:bg-ui-hover">
          <FiUpload aria-hidden="true" />
          {photo ? 'Cambiar imagen' : 'Subir imagen'}
          <input type="file" accept="image/png,image/jpeg" onChange={handleFileChange} className="sr-only" />
        </label>
        {photo && <IconButton label="Quitar foto" icon={<FiTrash2 />} onClick={() => onChange(null)} variant="danger" />}
      </div>
    </div>
  );
}

export default ProfilePhotoPicker;

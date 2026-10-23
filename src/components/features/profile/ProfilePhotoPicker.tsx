import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { FiAlertCircle, FiCamera, FiX } from 'react-icons/fi';

interface ProfilePhotoPickerProps {
  photo: File | null;
  error?: string;
  onChange: (photo: File | null) => void;
}

function ProfilePhotoPicker({ photo, error, onChange }: ProfilePhotoPickerProps) {
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
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-dashed border-orbita-muted bg-orbita-surface">
        {previewUrl ? (
          <img src={previewUrl} alt="Vista previa de la foto de perfil" className="h-full w-full object-cover" />
        ) : (
          <FiCamera className="text-xl text-orbita-muted" aria-hidden="true" />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <label className="cursor-pointer text-sm font-medium text-orbita-accent hover:underline">
            {photo ? 'Cambiar foto' : 'Subir foto'}
            <input type="file" accept="image/png,image/jpeg" onChange={handleFileChange} className="hidden" />
          </label>
          {photo && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="flex items-center gap-1 text-xs text-orbita-muted hover:text-orbita-error"
            >
              <FiX aria-hidden="true" /> Quitar
            </button>
          )}
        </div>
        <p className="text-xs text-orbita-muted">PNG o JPG, máximo 2 MB.</p>
        {error && (
          <p className="flex items-center gap-1 text-xs text-orbita-error">
            <FiAlertCircle aria-hidden="true" /> {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default ProfilePhotoPicker;

import { FiEye, FiEyeOff } from 'react-icons/fi';

interface VisibilityToggleProps {
  isVisible: boolean;
  onToggle: () => void;
}

function VisibilityToggle({ isVisible, onToggle }: VisibilityToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isVisible}
      title="Visible en perfil público"
      className={`flex h-11 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-xs ${
        isVisible
          ? 'border-orbita-primary/50 bg-orbita-success text-orbita-accent'
          : 'border-orbita-outline bg-orbita-surface text-orbita-muted'
      }`}
    >
      {isVisible ? <FiEye aria-hidden="true" /> : <FiEyeOff aria-hidden="true" />}
      {isVisible ? 'Visible' : 'Oculto'}
    </button>
  );
}

export default VisibilityToggle;

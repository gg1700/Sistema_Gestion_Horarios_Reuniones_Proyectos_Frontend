import { FiEye, FiEyeOff } from 'react-icons/fi';

interface VisibilityToggleProps {
  isVisible: boolean;
  onToggle: () => void;
}

function VisibilityToggle({ isVisible, onToggle }: VisibilityToggleProps) {
  const label = isVisible ? 'Visible en tu perfil público' : 'Oculto en tu perfil público';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isVisible}
      aria-label={label}
      title={label}
      className={`flex h-[3.25rem] w-9 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-ui-hover ${
        isVisible ? 'text-ui-mint' : 'text-ui-soft'
      }`}
    >
      {isVisible ? <FiEye aria-hidden="true" /> : <FiEyeOff aria-hidden="true" />}
    </button>
  );
}

export default VisibilityToggle;

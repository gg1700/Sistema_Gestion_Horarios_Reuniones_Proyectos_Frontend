import type { ReactNode } from 'react';

type IconButtonVariant = 'default' | 'danger';

type IconButtonSize = 'small' | 'medium';

interface IconButtonProps {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
}

const variantClassNames: Record<IconButtonVariant, string> = {
  default: 'text-orbita-muted hover:border-orbita-muted hover:text-orbita-text',
  danger: 'text-orbita-muted hover:border-orbita-error hover:bg-orbita-error-tint hover:text-orbita-error',
};

const sizeClassNames: Record<IconButtonSize, string> = {
  small: 'h-8 w-8 rounded-md',
  medium: 'h-11 w-11 rounded-lg',
};

function IconButton({ label, icon, onClick, variant = 'default', size = 'small' }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex shrink-0 items-center justify-center border border-orbita-outline ${
        sizeClassNames[size]
      } ${variantClassNames[variant]}`}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}

export default IconButton;

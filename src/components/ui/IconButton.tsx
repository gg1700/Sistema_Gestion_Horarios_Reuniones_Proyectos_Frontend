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
  default: 'text-[#8FC5A6] hover:bg-ui-hover hover:text-ui-text',
  danger: 'text-[#8FC5A6] hover:bg-ui-danger-tint hover:text-ui-danger',
};

const sizeClassNames: Record<IconButtonSize, string> = {
  small: 'h-8 w-8 rounded-lg',
  medium: 'h-[3.25rem] w-9 rounded-lg',
};

function IconButton({ label, icon, onClick, variant = 'default', size = 'small' }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex shrink-0 items-center justify-center transition-colors ${
        sizeClassNames[size]
      } ${variantClassNames[variant]}`}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}

export default IconButton;

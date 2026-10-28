import type { ComponentProps, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
  isFullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantClassNames: Record<ButtonVariant, string> = {
  primary: 'min-h-[3.25rem] rounded-control bg-ui-mint px-5 font-semibold text-ui-ink hover:bg-ui-mint-strong',
  secondary:
    'min-h-[3.25rem] rounded-control border border-ui-field-border bg-ui-surface px-5 font-semibold text-ui-text hover:border-ui-soft',
  outline:
    'min-h-10 rounded-control border border-ui-field-border px-4 font-semibold text-ui-text hover:border-ui-mint/60 hover:bg-ui-hover',
  ghost: 'min-h-10 rounded-control font-semibold text-ui-mint hover:text-[#DEFFEB]',
  link: 'min-h-8 text-[11px] text-[#A3E6BE] hover:text-[#DEFFEB]',
};

function Button({
  variant = 'primary',
  isFullWidth = false,
  leftIcon,
  rightIcon,
  type = 'button',
  className = '',
  children,
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`flex items-center justify-center gap-2.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        variantClassNames[variant]
      } ${isFullWidth ? 'w-full' : 'w-fit'} ${className}`}
      {...buttonProps}
    >
      {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
      {children}
      {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
    </button>
  );
}

export default Button;

import type { ComponentProps, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'outline' | 'dashed' | 'ghost';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
  isFullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantClassNames: Record<ButtonVariant, string> = {
  primary: 'h-11 rounded-lg bg-orbita-accent px-5 font-medium text-orbita-on-primary hover:opacity-90',
  outline: 'h-10 rounded-lg border border-orbita-primary/60 px-4 text-orbita-accent hover:bg-orbita-success',
  dashed:
    'h-11 rounded-lg border border-dashed border-orbita-primary/60 text-orbita-accent hover:border-orbita-accent hover:bg-orbita-success/40',
  ghost: 'h-10 text-orbita-muted hover:text-orbita-text',
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
      className={`flex items-center justify-center gap-2 text-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-50 ${
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

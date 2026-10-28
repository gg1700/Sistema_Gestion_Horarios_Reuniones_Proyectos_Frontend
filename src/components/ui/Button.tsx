import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { classNames } from '../../utils/classNames';
import { Spinner } from './Spinner';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium';
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  variant = 'primary', size = 'medium', loading = false, disabled, type = 'button',
  leadingIcon, trailingIcon, className, children, ...props
}, ref) {
  return <button {...props} ref={ref} type={type} disabled={disabled || loading} aria-busy={loading || undefined}
    className={classNames('ui-button', `ui-button--${variant}`, `ui-button--${size}`, className)}>
    {loading ? <Spinner decorative /> : leadingIcon && <span aria-hidden="true">{leadingIcon}</span>}
    {children}
    {trailingIcon && <span aria-hidden="true">{trailingIcon}</span>}
  </button>;
});

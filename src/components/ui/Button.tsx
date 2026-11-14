import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { classNames } from '../../utils/classNames';
import { Spinner } from './Spinner';

/**
 * Botón con texto. Por consistencia visual los botones con texto no llevan
 * iconos; para acciones solo con icono usa IconButton.
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  variant = 'primary', size = 'medium', loading = false, disabled, type = 'button',
  className, children, ...props
}, ref) {
  return <button {...props} ref={ref} type={type} disabled={disabled || loading} aria-busy={loading || undefined}
    className={classNames('ui-button', `ui-button--${variant}`, `ui-button--${size}`, loading && 'is-loading', className)}>
    {loading && <Spinner decorative />}
    {children}
  </button>;
});

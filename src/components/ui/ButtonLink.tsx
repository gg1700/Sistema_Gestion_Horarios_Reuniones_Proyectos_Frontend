import { Link, type LinkProps } from 'react-router';
import { classNames } from '../../utils/classNames';

/** Enlace con apariencia de botón. Igual que Button, no lleva iconos junto al texto. */
export function ButtonLink({ variant = 'primary', size = 'medium', className, children, ...props }: LinkProps & {
  variant?: 'primary' | 'secondary' | 'ghost'; size?: 'small' | 'medium';
}) {
  return <Link {...props} className={classNames('ui-button', `ui-button--${variant}`, `ui-button--${size}`, className)}>{children}</Link>;
}

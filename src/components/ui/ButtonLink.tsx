import { Link, type LinkProps } from 'react-router';
import type { ReactNode } from 'react';
import { classNames } from '../../utils/classNames';

export function ButtonLink({ variant = 'primary', size = 'medium', trailingIcon, className, children, ...props }: LinkProps & {
  variant?: 'primary' | 'secondary' | 'ghost'; size?: 'small' | 'medium'; trailingIcon?: ReactNode;
}) {
  return <Link {...props} className={classNames('ui-button', `ui-button--${variant}`, `ui-button--${size}`, className)}>{children}{trailingIcon && <span aria-hidden="true">{trailingIcon}</span>}</Link>;
}

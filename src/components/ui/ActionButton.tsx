
import type { ComponentProps, ReactNode } from 'react';
import { classNames } from '../../utils/classNames';

type ActionButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';

interface ActionButtonProps extends ComponentProps<'button'> {
  variant?: ActionButtonVariant;
  isFullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantClassNames: Record<ActionButtonVariant, string> = {
  primary: 'ui-button ui-button--primary ui-button--medium',
  secondary: 'ui-button ui-button--secondary ui-button--medium',
  outline: 'ui-button ui-button--secondary ui-button--small',
  ghost: 'ui-button ui-button--ghost ui-button--small',
  link: 'ui-text-button',
};

function ActionButton({
  variant = 'primary',
  isFullWidth = false,
  leftIcon,
  rightIcon,
  type = 'button',
  className = '',
  children,
  ...buttonProps
}: ActionButtonProps) {
  return (
    <button
      type={type}
      className={classNames(
        variantClassNames[variant],
        isFullWidth ? 'w-full' : 'w-fit',
        className
      )}
      {...buttonProps}
    >
      {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
      {children}
      {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
    </button>
  );
}

export default ActionButton;
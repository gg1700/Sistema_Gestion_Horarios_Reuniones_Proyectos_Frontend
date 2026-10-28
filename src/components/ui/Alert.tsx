import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';
import type { PropsWithChildren } from 'react';
import type { FeedbackTone } from '../../types/ui';
import { classNames } from '../../utils/classNames';

const icons = { success: FiCheckCircle, info: FiInfo, warning: FiAlertCircle, danger: FiAlertCircle };

export function Alert({ children, tone = 'info', title, onDismiss, className }: PropsWithChildren<{
  tone?: FeedbackTone; title?: string; onDismiss?: () => void; className?: string;
}>) {
  const Icon = icons[tone];
  return <div className={classNames('ui-alert', `ui-tone--${tone}`, className)} role={tone === 'danger' ? 'alert' : 'status'}>
    <Icon aria-hidden="true" /><div>{title && <strong>{title}</strong>}<div>{children}</div></div>
    {onDismiss && <button type="button" className="ui-icon-button" aria-label="Cerrar aviso" onClick={onDismiss}><FiX aria-hidden="true" /></button>}
  </div>;
}

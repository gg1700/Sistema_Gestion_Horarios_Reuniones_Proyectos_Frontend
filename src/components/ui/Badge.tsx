import type { PropsWithChildren } from 'react';
import type { FeedbackTone } from '../../types/ui';
import { classNames } from '../../utils/classNames';

export function Badge({ children, tone = 'info', className }: PropsWithChildren<{ tone?: FeedbackTone | 'neutral'; className?: string }>) {
  return <span className={classNames('ui-badge', `ui-tone--${tone}`, className)}>{children}</span>;
}

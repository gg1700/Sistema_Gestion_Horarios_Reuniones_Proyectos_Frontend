import { useState } from 'react';
import { classNames } from '../../utils/classNames';

export function Avatar({ name, src, size = 'medium', className }: {
  name: string; src?: string | null; size?: 'small' | 'medium' | 'large'; className?: string;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const initials = name.trim().split(/\s+/).slice(0, 2).map(part => Array.from(part)[0]).join('').toUpperCase() || '?';
  return <span className={classNames('ui-avatar', `ui-avatar--${size}`, className)} aria-hidden="true">
    {src && src !== failedSource ? <img src={src} alt="" onError={() => setFailedSource(src)} /> : initials}
  </span>;
}

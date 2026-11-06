import type { ReactNode } from 'react';

export function EmptyState({ title, description, icon, actions }: {
  title: string; description?: string; icon?: ReactNode; actions?: ReactNode;
}) {
  return <div className="ui-empty-state">{icon && <span aria-hidden="true">{icon}</span>}<h2>{title}</h2>
    {description && <p>{description}</p>}{actions && <div className="ui-empty-state__actions">{actions}</div>}
  </div>;
}

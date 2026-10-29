import type { ReactNode } from 'react';

export function SectionHeading({ title, eyebrow, description, actions, level = 1, accentPeriod = false }: {
  title: string; eyebrow?: string; description?: string; actions?: ReactNode; level?: 1 | 2 | 3; accentPeriod?: boolean;
}) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3';
  return <header className="ui-section-heading"><div>
    {eyebrow && <p className="ui-eyebrow">{eyebrow}</p>}
    <Tag>{title}{accentPeriod && <span className="ui-heading-period">.</span>}</Tag>{description && <p className="ui-section-heading__description">{description}</p>}
  </div>{actions && <div className="ui-section-heading__actions">{actions}</div>}</header>;
}

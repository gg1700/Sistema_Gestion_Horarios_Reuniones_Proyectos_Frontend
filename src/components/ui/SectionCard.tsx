import type { ReactNode, Ref } from 'react';

interface SectionCardProps {
  title: string;
  children: ReactNode;
  headerRight?: ReactNode;
  description?: string;
  isHighlighted?: boolean;
  ref?: Ref<HTMLElement>;
}

function SectionCard({ title, children, headerRight, description, isHighlighted = false, ref }: SectionCardProps) {
  return (
    <section
      ref={ref}
      className={`flex flex-col gap-4 rounded-lg border bg-orbita-card p-4 ${
        isHighlighted ? 'border-orbita-accent' : 'border-orbita-outline'
      }`}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-heading text-base font-semibold text-orbita-text">{title}</h3>
          {headerRight}
        </div>
        {description && <p className="text-xs text-orbita-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default SectionCard;

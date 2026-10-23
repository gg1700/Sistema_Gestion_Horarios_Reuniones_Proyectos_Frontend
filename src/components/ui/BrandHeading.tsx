interface BrandHeadingProps {
  badge: string;
  title: string;
  description: string;
  isCompact?: boolean;
}

function BrandHeading({ badge, title, description, isCompact = false }: BrandHeadingProps) {
  return (
    <div className="text-center">
      {!isCompact && (
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-orbita-outline bg-orbita-card">
          <span className="h-4 w-4 rounded-full border-2 border-orbita-primary" />
        </div>
      )}
      <p className="mb-2 font-code text-xs uppercase tracking-[0.2em] text-orbita-accent">
        {badge} <span aria-hidden="true">•</span>
      </p>
      <h1
        className={`font-heading font-semibold text-orbita-text ${
          isCompact ? 'text-2xl' : 'text-3xl sm:text-4xl'
        }`}
      >
        {title}
      </h1>
      <p className={`mx-auto max-w-md text-sm text-orbita-muted ${isCompact ? 'mt-1' : 'mt-3 leading-6'}`}>
        {description}
      </p>
    </div>
  );
}

export default BrandHeading;

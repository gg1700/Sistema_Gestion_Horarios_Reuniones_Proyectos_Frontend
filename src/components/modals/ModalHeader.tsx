import { FiX } from 'react-icons/fi';

interface ModalHeaderProps {
  titleId: string;
  title: string;
  eyebrow?: string;
  description?: string;
  onClose?: () => void;
}

function ModalHeader({ titleId, title, eyebrow, description, onClose }: ModalHeaderProps) {
  return (
    <header className="relative shrink-0 border-b border-ui-border px-5 pt-6 pb-6 sm:px-8">
      <div className="pr-12">
        {eyebrow && (
          <p className="mt-1 mb-5 text-[9px] leading-[18px] font-semibold tracking-[0.15em] text-ui-mint uppercase">
            {eyebrow}
          </p>
        )}
        <h2 id={titleId} className="font-heading text-2xl font-medium tracking-tight text-ui-text sm:text-[29px] sm:leading-[37px]">
          {title}
        </h2>
        {description && <p className="mt-3 text-sm leading-6 text-ui-muted">{description}</p>}
      </div>
      {onClose && (
        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute top-6 right-5 flex h-10 w-10 items-center justify-center rounded-[10px] border border-ui-border text-ui-muted transition-colors hover:border-ui-mint/60 hover:bg-ui-raised hover:text-ui-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-mint sm:right-8"
        >
          <FiX aria-hidden="true" />
        </button>
      )}
    </header>
  );
}

export default ModalHeader;

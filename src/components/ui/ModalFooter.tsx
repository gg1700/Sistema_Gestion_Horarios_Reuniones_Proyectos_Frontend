import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import Button from './Button';

interface ModalFooterProps {
  skipLabel: string;
  confirmLabel: string;
  onSkip: () => void;
  onConfirm: () => void;
  onBack?: () => void;
  isLoading?: boolean;
}

function ModalFooter({ skipLabel, confirmLabel, onSkip, onConfirm, onBack, isLoading = false }: ModalFooterProps) {
  return (
    <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-ui-border px-5 py-[18px] sm:px-8">
      <div className="flex items-center gap-5">
        {onBack && (
          <Button variant="ghost" onClick={onBack} disabled={isLoading} leftIcon={<FiArrowLeft />}>
            Atrás
          </Button>
        )}
        <Button variant="ghost" onClick={onSkip} disabled={isLoading}>
          {skipLabel}
        </Button>
      </div>
      <Button onClick={onConfirm} disabled={isLoading} rightIcon={isLoading ? undefined : <FiArrowRight />}>
        {isLoading ? 'Guardando...' : confirmLabel}
      </Button>
    </footer>
  );
}

export default ModalFooter;

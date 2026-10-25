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
    <div className="flex items-center justify-between gap-3 border-t border-orbita-outline px-6 py-4 sm:px-8">
      <Button variant="secondary" onClick={onSkip} disabled={isLoading}>
        {skipLabel}
      </Button>
      <div className="flex items-center gap-3">
        {onBack && (
          <Button variant="secondary" onClick={onBack} disabled={isLoading} leftIcon={<FiArrowLeft />}>
            Atrás
          </Button>
        )}
        <Button onClick={onConfirm} disabled={isLoading} rightIcon={isLoading ? undefined : <FiArrowRight />}>
          {isLoading ? 'Guardando...' : confirmLabel}
        </Button>
      </div>
    </div>
  );
}

export default ModalFooter;

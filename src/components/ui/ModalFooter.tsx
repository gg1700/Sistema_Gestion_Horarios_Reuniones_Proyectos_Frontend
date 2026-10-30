import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import ActionButton from './ActionButton';

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
          <ActionButton variant="ghost" onClick={onBack} disabled={isLoading} leftIcon={<FiArrowLeft />}>
            Atrás
          </ActionButton>
        )}
        <ActionButton variant="ghost" onClick={onSkip} disabled={isLoading}>
          {skipLabel}
        </ActionButton>
      </div>
      <ActionButton onClick={onConfirm} disabled={isLoading} rightIcon={isLoading ? undefined : <FiArrowRight />}>
        {isLoading ? 'Guardando...' : confirmLabel}
      </ActionButton>
    </footer>
  );
}

export default ModalFooter;

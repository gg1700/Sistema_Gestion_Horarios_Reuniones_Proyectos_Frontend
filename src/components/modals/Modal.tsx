import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  titleId: string;
  children: ReactNode;
  onClose?: () => void;
  widthClassName?: string;
}

function Modal({ titleId, children, onClose, widthClassName = 'max-w-[44rem]' }: ModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (!onClose) return;
    const closeModal = onClose;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeModal();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const modalRoot = document.getElementById('modal-root') ?? document.body;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#040B0E]/85 p-4 font-body">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-dialog border border-ui-dialog-border bg-ui-dialog text-ui-sage shadow-[0_2rem_5.5rem_#00000088] ${widthClassName}`}
      >
        {children}
      </div>
    </div>,
    modalRoot
  );
}

export default Modal;

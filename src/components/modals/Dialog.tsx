import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import { classNames } from '../../utils/classNames';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  eyebrow?: string;
  headerLeading?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'small' | 'medium' | 'large';
  dismissible?: boolean;
  className?: string;
}

export function Dialog({ open, onOpenChange, title, description, eyebrow, headerLeading, children, footer,
  size = 'medium', dismissible = true, className }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const internalCloseEvents = useRef(0);
  const backdropPressed = useRef(false);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) {
      internalCloseEvents.current += 1;
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    return () => {
      // close() encola un evento incluso cuando el cierre es solo limpieza de React.
      // StrictMode puede volver a abrir este mismo nodo antes de entregar ese evento.
      if (dialog?.open) {
        internalCloseEvents.current += 1;
        dialog.close();
      }
    };
  }, []);

  function outsideDialog(dialog: HTMLDialogElement, x: number, y: number) {
    const rect = dialog.getBoundingClientRect();
    return x < rect.left || x > rect.right || y < rect.top || y > rect.bottom;
  }

  if (typeof document === 'undefined') return null;
  return createPortal(<dialog ref={dialogRef} aria-labelledby={titleId}
    aria-describedby={description ? descriptionId : undefined}
    className={classNames('ui-dialog', `ui-dialog--${size}`, className)}
    onCancel={event => {
      // Los eventos de un portal hijo también recorren el árbol de React.
      if (event.target !== event.currentTarget) return;
      event.preventDefault();
      event.stopPropagation();
      if (dismissible) onOpenChange(false);
    }}
    onClose={event => {
      if (event.target !== event.currentTarget) return;
      event.stopPropagation();
      if (internalCloseEvents.current > 0) {
        internalCloseEvents.current -= 1;
        return;
      }
      if (open && !event.currentTarget.open) onOpenChange(false);
    }}
    onPointerDown={event => {
      backdropPressed.current = event.button === 0 && event.target === event.currentTarget && outsideDialog(event.currentTarget, event.clientX, event.clientY);
    }}
    onPointerCancel={() => { backdropPressed.current = false; }}
    onClick={event => {
      const pressedOutside = backdropPressed.current;
      backdropPressed.current = false;
      if (!dismissible || !pressedOutside || event.target !== event.currentTarget) return;
      if (outsideDialog(event.currentTarget, event.clientX, event.clientY)) onOpenChange(false);
    }}>
    {headerLeading && <div className="ui-dialog__leading">{headerLeading}</div>}
    <header className="ui-dialog__header"><div>{eyebrow && <p className="ui-eyebrow">{eyebrow}</p>}<h2 id={titleId}>{title}</h2>
      {description && <p id={descriptionId}>{description}</p>}</div>
      {dismissible && <button type="button" className="ui-icon-button" aria-label="Cerrar diálogo" onClick={() => onOpenChange(false)}><FiX aria-hidden="true" /></button>}
    </header>
    <div className="ui-dialog__body">{children}</div>
    {footer && <footer className="ui-dialog__footer">{footer}</footer>}
  </dialog>, document.body);
}

import { createPortal } from 'react-dom';
import { useUI } from '../../contexts/UIContext';
import { Alert } from '../ui/Alert';

export function ToastViewport() {
  const { toasts, dismissToast } = useUI();
  if (typeof document === 'undefined' || !toasts.length) return null;
  return createPortal(<div className="ui-toasts" aria-label="Avisos">
    {toasts.map(toast => <Alert key={toast.id} tone={toast.tone} onDismiss={() => dismissToast(toast.id)}>{toast.message}</Alert>)}
  </div>, document.body);
}

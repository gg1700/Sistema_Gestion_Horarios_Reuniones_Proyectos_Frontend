import type { ReactNode } from 'react';
import { Button } from '../ui/Button';
import { Dialog } from './Dialog';

export function ConfirmDialog({ open, onOpenChange, title, children, onConfirm,
  confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', destructive = false, pending = false }: {
  open: boolean; onOpenChange: (open: boolean) => void; title: string; children: ReactNode;
  onConfirm: () => void; confirmLabel?: string; cancelLabel?: string; destructive?: boolean; pending?: boolean;
}) {
  return <Dialog open={open} onOpenChange={onOpenChange} title={title} size="small" dismissible={!pending}
    footer={<><Button variant="secondary" disabled={pending} onClick={() => onOpenChange(false)}>{cancelLabel}</Button>
      <Button variant={destructive ? 'danger' : 'primary'} loading={pending} onClick={onConfirm}>{confirmLabel}</Button></>}>
    {children}
  </Dialog>;
}

import { FiCheckCircle, FiMail } from 'react-icons/fi';

interface VerifiedAccountProps {
  email: string;
}

function VerifiedAccount({ email }: VerifiedAccountProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-orbita-primary/40 bg-orbita-surface px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-orbita-background text-orbita-accent">
        <FiMail aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-orbita-muted">Correo verificado</p>
        <p className="truncate text-sm font-medium text-orbita-text">{email}</p>
      </div>
      <FiCheckCircle className="shrink-0 text-orbita-primary" aria-hidden="true" />
    </div>
  );
}

export default VerifiedAccount;

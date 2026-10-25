import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { FiCheckCircle } from 'react-icons/fi';
import type { OAuthProvider } from '../../../types/auth';

interface VerifiedAccountProps {
  email: string;
  provider: OAuthProvider;
}

const providerNames: Record<OAuthProvider, string> = {
  google: 'Google',
  github: 'GitHub',
};

function VerifiedAccount({ email, provider }: VerifiedAccountProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-orbita-primary/40 bg-orbita-surface px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-orbita-background">
        {provider === 'google' ? <FcGoogle aria-hidden="true" /> : <FaGithub aria-hidden="true" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-orbita-muted">Cuenta verificada con {providerNames[provider]}</p>
        <p className="truncate text-sm font-medium text-orbita-text">{email}</p>
      </div>
      <FiCheckCircle className="shrink-0 text-orbita-primary" aria-hidden="true" />
    </div>
  );
}

export default VerifiedAccount;

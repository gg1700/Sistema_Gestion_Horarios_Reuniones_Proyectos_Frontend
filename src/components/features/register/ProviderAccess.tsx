import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { getProviderAuthorizationUrl } from '../../../api/authApi';

const providerLinkClassName =
  'flex h-11 items-center justify-center gap-2 rounded-lg border border-orbita-outline bg-orbita-surface text-sm font-medium hover:border-orbita-muted';

function ProviderAccess() {
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-orbita-outline bg-orbita-card p-6 text-center sm:p-8">
      <p className="text-sm text-orbita-muted">
        Para crear tu cuenta, primero verifica tu correo con Google o GitHub.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <a href={getProviderAuthorizationUrl('google')} className={providerLinkClassName}>
          <FcGoogle aria-hidden="true" /> Continuar con Google
        </a>
        <a href={getProviderAuthorizationUrl('github')} className={providerLinkClassName}>
          <FaGithub aria-hidden="true" /> Continuar con GitHub
        </a>
      </div>
    </div>
  );
}

export default ProviderAccess;

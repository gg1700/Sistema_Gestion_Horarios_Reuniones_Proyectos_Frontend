
import { Link } from 'react-router';
import { FiAlertCircle, FiArrowLeft, FiShield } from 'react-icons/fi';
import useOAuthCallback from '../hooks/useOAuthCallback';

function OAuthCallbackPage() {
  const result = useOAuthCallback();
  const hasError = result.status === 'error';

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#101312] px-4 py-10 text-[#E1E4DF]">
      <section
        aria-live="polite"
        className="w-full max-w-[480px] rounded-lg border border-[#2C312E] bg-[#1B1F1D] p-8 text-center shadow-2xl sm:p-10"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-[#101312]">
          {hasError ? (
            <FiAlertCircle
              className="text-[#FFB4AB]"
              size={32}
              aria-hidden="true"
            />
          ) : (
            <div
              className="h-9 w-9 animate-spin rounded-full border-4 border-[#4EDEA3] border-t-transparent"
              role="status"
              aria-label="Procesando autenticación"
            />
          )}
        </div>

        <h1 className="text-2xl font-semibold sm:text-3xl">
          {hasError
            ? result.title
            : 'Verificando tu acceso'}
        </h1>

        <p className="mt-4 text-sm leading-6 text-[#B9C8BF]">
          {hasError
            ? result.message
            : 'Estamos esperando la confirmación de tu sesión con Google o GitHub.'}
        </p>

        {hasError && (
          <Link
            to="/login"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-md bg-[#10B981] px-6 py-3 font-semibold text-[#00291A] transition-colors hover:bg-[#4EDEA3]"
          >
            <FiArrowLeft aria-hidden="true" />
            Volver a intentar
          </Link>
        )}

        <div className="mt-8 border-t border-[#2C312E] pt-5">
          <p className="flex items-center justify-center gap-2 text-xs text-[#B9C8BF]">
            <FiShield className="text-[#4EDEA3]" aria-hidden="true" />
            Autenticación protegida mediante OAuth 2.0
          </p>
        </div>
      </section>
    </main>
  );
}

export default OAuthCallbackPage;

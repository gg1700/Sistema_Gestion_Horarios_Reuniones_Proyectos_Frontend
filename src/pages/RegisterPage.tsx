import { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router';
import AuthLayout from '../components/layouts/AuthLayout';
import AccessStory from '../components/features/register/AccessStory';
import ProviderAccess from '../components/features/register/ProviderAccess';
import CompleteRegistrationModal from '../components/modals/CompleteRegistrationModal';
import useRegistrationStatus from '../hooks/useRegistrationStatus';
import { routePaths } from '../constants/routes';
import { defaultOAuthErrorMessage, oauthErrorMessages } from '../constants/oauth';
import { paths } from '../constants/paths';

const connectionErrorMessage = 'No se pudo conectar con el servidor. Intenta nuevamente.';

function getOAuthErrorMessage(oauthResult: string | null) {
  if (!oauthResult || oauthResult === 'success') return undefined;
  return oauthErrorMessages[oauthResult] ?? defaultOAuthErrorMessage;
}

function RegisterPage() {
  const [searchParams] = useSearchParams();
  const { status, user } = useRegistrationStatus();
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(true);
  const oauthErrorMessage = getOAuthErrorMessage(searchParams.get('oauth'));

  if (status === 'completed' && !oauthErrorMessage) {
    return <Navigate to={paths.profile} replace />;
  }

  return (
    <AuthLayout
      headerContent={
        <span className="hidden text-[8px] tracking-[0.18em] text-[#608875] uppercase sm:block">Google + GitHub</span>
      }
    >
      <div className="grid gap-10 lg:grid-cols-[1.16fr_1fr] lg:gap-20">
        <AccessStory />
        <ProviderAccess
          errorMessage={oauthErrorMessage ?? (status === 'error' ? connectionErrorMessage : undefined)}
        />
      </div>
      
      {status === 'loading' && (
        <p role="status" className="mt-4 text-xs text-[#A7C4B1]">
          Verificando tu acceso...
         </p>
      )}

      {status === 'pending' && user && isRegistrationModalOpen && (
        <CompleteRegistrationModal user={user} onClose={() => setIsRegistrationModalOpen(false)} />
      )}
    </AuthLayout>
  );
}

export default RegisterPage;

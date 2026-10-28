import { Navigate, useSearchParams } from 'react-router';
import AuthLayout from '../components/layouts/AuthLayout';
import AccessStory from '../components/features/register/AccessStory';
import ProviderAccess from '../components/features/register/ProviderAccess';
import RegisterForm from '../components/features/register/RegisterForm';
import useRegistrationStatus from '../hooks/useRegistrationStatus';
import { routePaths } from '../constants/routes';
import { defaultOAuthErrorMessage, oauthErrorMessages } from '../constants/oauth';

const connectionErrorMessage = 'No se pudo conectar con el servidor. Intenta nuevamente.';

function getOAuthErrorMessage(oauthResult: string | null) {
  if (!oauthResult || oauthResult === 'success') return undefined;
  return oauthErrorMessages[oauthResult] ?? defaultOAuthErrorMessage;
}

function RegisterPage() {
  const [searchParams] = useSearchParams();
  const { status, user } = useRegistrationStatus();
  const oauthErrorMessage = getOAuthErrorMessage(searchParams.get('oauth'));

  if (status === 'completed') {
    return <Navigate to={routePaths.home} replace />;
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
      {status === 'pending' && user && <RegisterForm user={user} />}
    </AuthLayout>
  );
}

export default RegisterPage;

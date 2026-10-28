import { Navigate, useSearchParams } from 'react-router';
import AuthLayout from '../components/layouts/AuthLayout';
import BrandHeading from '../components/ui/BrandHeading';
import RegisterForm from '../components/features/register/RegisterForm';
import ProviderAccess from '../components/features/register/ProviderAccess';
import SecurityNotice from '../components/features/register/SecurityNotice';
import useRegistrationStatus from '../hooks/useRegistrationStatus';
import { routePaths } from '../constants/routes';
import { defaultOAuthErrorMessage, oauthErrorMessages } from '../constants/oauth';

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
    <AuthLayout>
      <div className="mb-8">
        <BrandHeading
          badge="Registro seguro"
          title="Crea tu cuenta en Orbitia"
          description="Conecta tus reuniones, horarios y proyectos en un único espacio sincronizado."
        />
      </div>
      {status === 'loading' && (
        <p className="rounded-xl border border-orbita-outline bg-orbita-card p-6 text-center text-sm text-orbita-muted">
          Verificando tu sesión...
        </p>
      )}
      {status === 'pending' && user && <RegisterForm user={user} />}
      {(status === 'unauthenticated' || status === 'error') && (
        <ProviderAccess
          errorMessage={
            oauthErrorMessage ??
            (status === 'error' ? 'No se pudo conectar con el servidor. Intenta nuevamente.' : undefined)
          }
        />
      )}
      <SecurityNotice />
      <p className="mt-6 text-center text-xs text-orbita-muted">
        Términos del servicio · Política de privacidad · Centro de ayuda
      </p>
    </AuthLayout>
  );
}

export default RegisterPage;

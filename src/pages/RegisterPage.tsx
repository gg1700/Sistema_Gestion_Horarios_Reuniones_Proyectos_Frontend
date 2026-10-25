import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import AuthLayout from '../components/layouts/AuthLayout';
import BrandHeading from '../components/ui/BrandHeading';
import RegisterForm from '../components/features/register/RegisterForm';
import ProviderAccess from '../components/features/register/ProviderAccess';
import SecurityNotice from '../components/features/register/SecurityNotice';
import {
  getPendingRegistration,
  readPendingRegistration,
  savePendingRegistration,
} from '../utils/pendingRegistration';

function RegisterPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  const [pendingRegistration] = useState(() => {
    const registrationFromUrl = tokenFromUrl ? readPendingRegistration(tokenFromUrl) : null;
    if (registrationFromUrl) savePendingRegistration(registrationFromUrl.token);
    return registrationFromUrl ?? getPendingRegistration();
  });

  useEffect(() => {
    if (tokenFromUrl) setSearchParams({}, { replace: true });
  }, [tokenFromUrl, setSearchParams]);

  return (
    <AuthLayout>
      <div className="mb-8">
        <BrandHeading
          badge="Registro seguro"
          title="Crea tu cuenta en Orbitia"
          description="Conecta tus reuniones, horarios y proyectos en un único espacio sincronizado."
        />
      </div>
      {pendingRegistration ? (
        <RegisterForm pendingRegistration={pendingRegistration} />
      ) : (
        <ProviderAccess />
      )}
      <SecurityNotice />
      <p className="mt-6 text-center text-xs text-orbita-muted">
        Términos del servicio · Política de privacidad · Centro de ayuda
      </p>
    </AuthLayout>
  );
}

export default RegisterPage;

import { Navigate } from 'react-router';
import AuthLayout from '../components/layouts/AuthLayout';
import BrandHeading from '../components/ui/BrandHeading';
import CompleteProfileModal from '../components/modals/CompleteProfileModal';
import useRegistrationStatus from '../hooks/useRegistrationStatus';
import { routePaths } from '../constants/routes';

function CompleteProfilePage() {
  const { status, user } = useRegistrationStatus();

  if (status === 'unauthenticated' || status === 'pending') {
    return <Navigate to={routePaths.register} replace />;
  }

  return (
    <AuthLayout>
      <BrandHeading
        badge="Cuenta creada"
        title={user ? `¡Bienvenido, ${user.name}!` : '¡Bienvenido!'}
        description="Tu cuenta ya está lista. Completa tu perfil para que tu equipo te conozca mejor."
      />
      {status === 'completed' && <CompleteProfileModal />}
    </AuthLayout>
  );
}

export default CompleteProfilePage;

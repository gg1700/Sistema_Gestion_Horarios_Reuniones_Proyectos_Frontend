import { Navigate } from 'react-router';
import AuthLayout from '../components/layouts/AuthLayout';
import BrandHeading from '../components/ui/BrandHeading';
import CompleteProfileModal from '../components/modals/CompleteProfileModal';
import { routePaths } from '../constants/routes';
import { getStoredSession } from '../utils/session';

function CompleteProfilePage() {
  const session = getStoredSession();

  if (!session) {
    return <Navigate to={routePaths.register} replace />;
  }

  return (
    <AuthLayout>
      <BrandHeading
        badge="Cuenta creada"
        title={`¡Bienvenido, ${session.user.name}!`}
        description="Tu cuenta ya está lista. Completa tu perfil para que tu equipo te conozca mejor."
      />
      <CompleteProfileModal />
    </AuthLayout>
  );
}

export default CompleteProfilePage;

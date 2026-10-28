import { Navigate } from 'react-router';
import AuthLayout from '../components/layouts/AuthLayout';
import CompleteProfileModal from '../components/modals/CompleteProfileModal';
import useRegistrationStatus from '../hooks/useRegistrationStatus';
import { routePaths } from '../constants/routes';
import type { RegisteredUser } from '../types/auth';

function getInitials(user: RegisteredUser | null) {
  if (!user) return '';
  return `${user.name.charAt(0)}${user.firstSurname.charAt(0)}`.toUpperCase();
}

function CompleteProfilePage() {
  const { status, user } = useRegistrationStatus();
  const initials = getInitials(user);

  if (status === 'unauthenticated' || status === 'pending') {
    return <Navigate to={routePaths.register} replace />;
  }

  return (
    <AuthLayout
      headerContent={
        user && (
          <span className="flex items-center gap-3 text-xs text-ui-text">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#41694D] bg-[#142C23] font-heading text-[11px] text-ui-mint">
              {initials}
            </span>
            <span className="hidden sm:inline">
              {user.name} {user.firstSurname}
            </span>
          </span>
        )
      }
    >
      <section className="max-w-xl pt-10">
        <p className="text-[9px] font-semibold tracking-[0.18em] text-ui-mint uppercase">Tu cuenta ya está lista</p>
        <h1 className="mt-6 font-heading text-4xl leading-[1.13] font-medium tracking-[-0.04em] text-ui-text sm:text-[56px]">
          Un lugar para
          <br />
          todo lo que eres.
        </h1>
        <p className="mt-6 text-sm leading-6 text-[#AFC5BB]">
          Tu perfil es el punto de encuentro entre tú y tus próximas conexiones.
        </p>
      </section>
      {status === 'completed' && <CompleteProfileModal initials={initials} />}
    </AuthLayout>
  );
}

export default CompleteProfilePage;

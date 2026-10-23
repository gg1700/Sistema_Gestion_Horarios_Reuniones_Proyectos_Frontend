import AuthLayout from '../components/layouts/AuthLayout';
import BrandHeading from '../components/ui/BrandHeading';
import RegisterForm from '../components/features/register/RegisterForm';
import SecurityNotice from '../components/features/register/SecurityNotice';

function RegisterPage() {
  return (
    <AuthLayout>
      <div className="mb-8">
        <BrandHeading
          badge="Registro seguro"
          title="Crea tu cuenta en Orbitia"
          description="Conecta tus reuniones, horarios y proyectos en un único espacio sincronizado."
        />
      </div>
      <RegisterForm />
      <SecurityNotice />
      <p className="mt-6 text-center text-xs text-orbita-muted">
        Términos del servicio · Política de privacidad · Centro de ayuda
      </p>
    </AuthLayout>
  );
}

export default RegisterPage;

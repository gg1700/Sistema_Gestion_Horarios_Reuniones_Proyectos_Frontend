import { Link } from 'react-router';
import { FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import TextField from '../../ui/TextField';
import RequiredFieldsNote from '../../ui/RequiredFieldsNote';
import VerifiedAccount from './VerifiedAccount';
import useRegisterForm from '../../../hooks/useRegisterForm';
import { routePaths } from '../../../constants/routes';
import type { PendingRegistration } from '../../../types/auth';

interface RegisterFormProps {
  pendingRegistration: PendingRegistration;
}

function RegisterForm({ pendingRegistration }: RegisterFormProps) {
  const {
    values,
    isSubmitting,
    generalError,
    getFieldError,
    isFieldValid,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useRegisterForm(pendingRegistration);

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5 rounded-xl border border-orbita-outline bg-orbita-card p-6 sm:p-8"
    >
      <VerifiedAccount email={pendingRegistration.email} provider={pendingRegistration.provider} />

      <RequiredFieldsNote />

      <TextField
        label="Nombre de usuario"
        name="handleName"
        value={values.handleName}
        onChange={handleChange}
        onBlur={handleBlur}
        prefix="orbitia.app/"
        placeholder="tu-usuario"
        autoComplete="nickname"
        maxLength={50}
        helperText="Minúsculas, números y guiones (3 a 50)."
        error={getFieldError('handleName')}
        isValid={isFieldValid('handleName')}
        labelHint={isFieldValid('handleName') ? 'Formato válido' : undefined}
        isRequired
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Nombre"
          name="name"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Marcos"
          autoComplete="given-name"
          maxLength={100}
          error={getFieldError('name')}
          isValid={isFieldValid('name')}
          isRequired
        />
        <TextField
          label="Primer apellido"
          name="firstSurname"
          value={values.firstSurname}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Morales"
          autoComplete="family-name"
          maxLength={100}
          error={getFieldError('firstSurname')}
          isValid={isFieldValid('firstSurname')}
          isRequired
        />
      </div>

      {generalError && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-lg bg-orbita-error-tint px-3 py-2 text-sm text-orbita-error"
        >
          <FiAlertCircle aria-hidden="true" />
          {generalError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-11 items-center justify-center gap-2 rounded-lg bg-orbita-accent font-medium text-orbita-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
        {!isSubmitting && <FiArrowRight aria-hidden="true" />}
      </button>

      <p className="text-center text-sm text-orbita-muted">
        ¿Ya tienes cuenta?{' '}
        <Link to={routePaths.login} className="font-medium text-orbita-accent hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}

export default RegisterForm;

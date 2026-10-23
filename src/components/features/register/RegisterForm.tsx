import { useState } from 'react';
import { Link } from 'react-router';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { FiAlertCircle, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import TextField from '../../ui/TextField';
import Button from '../../ui/Button';
import PasswordRequirements from './PasswordRequirements';
import useRegisterForm from '../../../hooks/useRegisterForm';
import { routePaths } from '../../../constants/routes';

function RegisterForm() {
  const {
    values,
    isSubmitting,
    generalError,
    getFieldError,
    isFieldValid,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useRegisterForm();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5 rounded-xl border border-orbita-outline bg-orbita-card p-6 sm:p-8"
    >
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
        />
      </div>

      <TextField
        label="Correo electrónico"
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="nombre@correo.com"
        autoComplete="email"
        maxLength={200}
        error={getFieldError('email')}
        isValid={isFieldValid('email')}
      />

      <div className="flex flex-col gap-3">
        <TextField
          label="Contraseña"
          name="password"
          type={isPasswordVisible ? 'text' : 'password'}
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          maxLength={72}
          error={getFieldError('password')}
          isValid={isFieldValid('password')}
          labelHint={isFieldValid('password') ? 'Contraseña segura' : undefined}
          rightElement={
            <button
              type="button"
              onClick={() => setIsPasswordVisible((previousValue) => !previousValue)}
              className="text-orbita-muted hover:text-orbita-text"
              aria-label={isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {isPasswordVisible ? <FiEyeOff /> : <FiEye />}
            </button>
          }
        />
        <PasswordRequirements password={values.password} />
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

      <Button
        type="submit"
        disabled={isSubmitting}
        isFullWidth
        rightIcon={isSubmitting ? undefined : <FiArrowRight />}
      >
        {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
      </Button>

      <div className="flex items-center gap-3 font-code text-[11px] uppercase tracking-widest text-orbita-muted">
        <span className="h-px flex-1 bg-orbita-outline" />
        o continúa con
        <span className="h-px flex-1 bg-orbita-outline" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          to={routePaths.login}
          className="flex h-10 items-center justify-center gap-2 rounded-lg border border-orbita-outline bg-orbita-surface text-sm hover:border-orbita-muted"
        >
          <FcGoogle aria-hidden="true" /> Google
        </Link>
        <Link
          to={routePaths.login}
          className="flex h-10 items-center justify-center gap-2 rounded-lg border border-orbita-outline bg-orbita-surface text-sm hover:border-orbita-muted"
        >
          <FaGithub aria-hidden="true" /> GitHub
        </Link>
      </div>

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

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { completeRegistration } from '../api/authApi';
import { routePaths } from '../constants/routes';
import { ApiError } from '../types/api';
import type { RegisteredUser, RegisterField, RegisterFormErrors, RegisterFormValues } from '../types/auth';
import { validateRegisterForm } from '../utils/registerValidations';

const provisionalName = 'Usuario';
const provisionalSurname = 'Pendiente';

type TouchedFields = Partial<Record<RegisterField, boolean>>;

function buildInitialValues(user: RegisteredUser): RegisterFormValues {
  return {
    handleName: user.handleName,
    name: user.name === provisionalName ? '' : user.name,
    firstSurname: user.firstSurname === provisionalSurname ? '' : user.firstSurname,
  };
}

function useRegisterForm(user: RegisteredUser) {
  const navigate = useNavigate();
  const [values, setValues] = useState<RegisterFormValues>(() => buildInitialValues(user));
  const [touchedFields, setTouchedFields] = useState<TouchedFields>({});
  const [serverErrors, setServerErrors] = useState<RegisterFormErrors>({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationErrors = validateRegisterForm(values);

  function getFieldError(field: RegisterField) {
    if (serverErrors[field]) return serverErrors[field];
    if (!touchedFields[field]) return '';
    return validationErrors[field] ?? '';
  }

  function isFieldValid(field: RegisterField) {
    return Boolean(touchedFields[field]) && !validationErrors[field] && !serverErrors[field];
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const field = event.target.name as RegisterField;
    setValues((previousValues) => ({ ...previousValues, [field]: event.target.value }));
    setTouchedFields((previousTouched) => ({ ...previousTouched, [field]: true }));
    setServerErrors((previousErrors) => ({ ...previousErrors, [field]: undefined }));
    setGeneralError('');
  }

  function handleBlur(event: ChangeEvent<HTMLInputElement>) {
    const field = event.target.name as RegisterField;
    setTouchedFields((previousTouched) => ({ ...previousTouched, [field]: true }));
  }

  function markAllFieldsAsTouched() {
    setTouchedFields({ handleName: true, name: true, firstSurname: true });
  }

  function handleRegisterError(error: unknown) {
    if (!(error instanceof ApiError)) {
      setGeneralError('Ocurrió un error inesperado. Intenta nuevamente.');
      return;
    }
    if (error.statusCode === 401) {
      setGeneralError('Tu sesión expiró. Vuelve a continuar con Google o GitHub.');
      return;
    }
    if (error.statusCode === 409 && error.message.toLowerCase().includes('completado')) {
      navigate(routePaths.completeProfile);
      return;
    }
    if (error.statusCode === 409) {
      setServerErrors({ handleName: 'Este nombre de usuario ya está en uso.' });
      return;
    }
    setGeneralError(error.message);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    markAllFieldsAsTouched();
    if (Object.keys(validationErrors).length > 0 || isSubmitting) return;

    setIsSubmitting(true);
    setGeneralError('');
    try {
      await completeRegistration(values);
      navigate(routePaths.completeProfile);
    } catch (error) {
      handleRegisterError(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    values,
    isSubmitting,
    generalError,
    getFieldError,
    isFieldValid,
    handleChange,
    handleBlur,
    handleSubmit,
  };
}

export default useRegisterForm;

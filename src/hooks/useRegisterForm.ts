import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { registerUser } from '../api/authApi';
import { routePaths } from '../constants/routes';
import { ApiError } from '../types/api';
import type { RegisterField, RegisterFormErrors, RegisterFormValues } from '../types/auth';
import { saveSession } from '../utils/session';
import { validateRegisterForm } from '../utils/registerValidations';

const emptyValues: RegisterFormValues = {
  handleName: '',
  name: '',
  firstSurname: '',
  email: '',
  password: '',
};

type TouchedFields = Partial<Record<RegisterField, boolean>>;

function buildConflictErrors(message: string): RegisterFormErrors {
  if (message.toLowerCase().includes('correo')) {
    return { email: 'Este correo ya está registrado.' };
  }
  return { handleName: 'Este nombre de usuario ya está en uso.' };
}

function useRegisterForm() {
  const navigate = useNavigate();
  const [values, setValues] = useState<RegisterFormValues>(emptyValues);
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
    setTouchedFields({
      handleName: true,
      name: true,
      firstSurname: true,
      email: true,
      password: true,
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    markAllFieldsAsTouched();
    if (Object.keys(validationErrors).length > 0 || isSubmitting) return;

    setIsSubmitting(true);
    setGeneralError('');
    try {
      const response = await registerUser(values);
      saveSession(response.data.session, response.data.user);
      navigate(routePaths.completeProfile);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 409) {
        setServerErrors(buildConflictErrors(error.message));
      } else if (error instanceof ApiError) {
        setGeneralError(error.message);
      } else {
        setGeneralError('Ocurrió un error inesperado. Intenta nuevamente.');
      }
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

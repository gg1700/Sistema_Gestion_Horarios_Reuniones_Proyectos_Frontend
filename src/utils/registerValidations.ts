import { handleNamePattern, properNounPattern } from '../constants/validation';
import type { RegisterFormErrors, RegisterFormValues } from '../types/auth';

export function normalizeHandleName(value: string) {
  return value.trim().toLowerCase();
}

export function validateHandleName(value: string) {
  const handleName = normalizeHandleName(value);
  if (handleName.length === 0) return 'El nombre de usuario es obligatorio.';
  if (!handleNamePattern.test(handleName)) {
    return 'Usa de 3 a 50 minúsculas, números o guiones.';
  }
  return '';
}

export function validateProperNoun(value: string, fieldName: string) {
  const text = value.trim();
  if (text.length === 0) return `${fieldName} es obligatorio.`;
  if (!properNounPattern.test(text)) {
    return `${fieldName} solo puede tener letras, espacios, apóstrofes o guiones.`;
  }
  return '';
}

export function validateRegisterForm(values: RegisterFormValues): RegisterFormErrors {
  const errors: RegisterFormErrors = {
    handleName: validateHandleName(values.handleName),
    name: validateProperNoun(values.name, 'El nombre'),
    firstSurname: validateProperNoun(values.firstSurname, 'El primer apellido'),
  };
  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => message !== '')
  ) as RegisterFormErrors;
}

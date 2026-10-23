import {
  emailPattern,
  handleNamePattern,
  letterPattern,
  numberPattern,
  passwordMaximumLength,
  passwordMinimumLength,
  properNounPattern,
} from '../constants/validation';
import type { RegisterFormErrors, RegisterFormValues } from '../types/auth';

export interface PasswordRequirement {
  label: string;
  isMet: boolean;
}

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

export function validateEmail(value: string) {
  const email = value.trim();
  if (email.length === 0) return 'El correo electrónico es obligatorio.';
  if (email.length > 200 || !emailPattern.test(email)) {
    return 'Ingresa un correo electrónico válido.';
  }
  return '';
}

export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    {
      label: `${passwordMinimumLength} o más caracteres`,
      isMet: password.length >= passwordMinimumLength && password.length <= passwordMaximumLength,
    },
    { label: 'Una letra', isMet: letterPattern.test(password) },
    { label: 'Un número', isMet: numberPattern.test(password) },
  ];
}

export function validatePassword(value: string) {
  if (value.length === 0) return 'La contraseña es obligatoria.';
  if (/\s/.test(value)) return 'La contraseña no puede tener espacios.';
  const allRequirementsMet = getPasswordRequirements(value).every(
    (requirement) => requirement.isMet
  );
  if (!allRequirementsMet) return 'La contraseña no cumple los requisitos.';
  return '';
}

export function validateRegisterForm(values: RegisterFormValues): RegisterFormErrors {
  const errors: RegisterFormErrors = {
    handleName: validateHandleName(values.handleName),
    name: validateProperNoun(values.name, 'El nombre'),
    firstSurname: validateProperNoun(values.firstSurname, 'El primer apellido'),
    email: validateEmail(values.email),
    password: validatePassword(values.password),
  };
  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => message !== '')
  ) as RegisterFormErrors;
}

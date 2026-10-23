import { emailPattern, properNounPattern } from '../constants/validation';
import {
  allowedPhotoTypes,
  descriptionMaximumLength,
  phoneNumberPattern,
  photoMaximumBytes,
} from '../constants/profile';
import type {
  AdditionalInfoErrors,
  AdditionalInfoValues,
  LinkErrors,
  LinkFormItem,
  WorkExperienceErrors,
  WorkExperienceValues,
} from '../types/profile';

export function normalizeUrl(url: string) {
  const trimmedUrl = url.trim();
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmedUrl)) return trimmedUrl;
  return `https://${trimmedUrl}`;
}

function isValidUrl(url: string) {
  try {
    const parsedUrl = new URL(normalizeUrl(url));
    const hasValidProtocol = parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    return hasValidProtocol && parsedUrl.hostname.includes('.');
  } catch {
    return false;
  }
}

function validateLink(link: LinkFormItem): LinkErrors {
  const errors: LinkErrors = {};
  if (link.text.trim().length === 0) errors.text = 'Escribe una etiqueta.';
  if (link.text.trim().length > 150) errors.text = 'Máximo 150 caracteres.';
  if (link.url.trim().length === 0) errors.url = 'Escribe la URL.';
  else if (link.url.trim().length > 300 || !isValidUrl(link.url)) errors.url = 'URL inválida.';
  return errors;
}

export function validateAdditionalInfo(values: AdditionalInfoValues): AdditionalInfoErrors {
  const errors: AdditionalInfoErrors = {};
  const surname = values.surname.trim();
  if (surname.length > 0 && !properNounPattern.test(surname)) {
    errors.surname = 'Solo letras, espacios, apóstrofes o guiones.';
  }
  const phoneNumber = values.phoneNumber.trim();
  if (phoneNumber.length > 0 && !phoneNumberPattern.test(phoneNumber)) {
    errors.phoneNumber = 'Usa solo números, de 6 a 15 dígitos.';
  }
  const contactEmail = values.contactEmail.trim();
  if (contactEmail.length > 0 && !emailPattern.test(contactEmail)) {
    errors.contactEmail = 'Ingresa un correo válido.';
  }
  if (values.address.trim().length > 300) {
    errors.address = 'Máximo 300 caracteres.';
  }
  if (values.photo) {
    if (!allowedPhotoTypes.includes(values.photo.type)) errors.photo = 'Solo se permiten imágenes PNG o JPG.';
    else if (values.photo.size > photoMaximumBytes) errors.photo = 'La imagen no puede superar los 2 MB.';
  }
  const linkErrors: Record<string, LinkErrors> = {};
  for (const link of values.links) {
    const currentLinkErrors = validateLink(link);
    if (Object.keys(currentLinkErrors).length > 0) linkErrors[link.id] = currentLinkErrors;
  }
  if (Object.keys(linkErrors).length > 0) errors.links = linkErrors;
  return errors;
}

export function validateWorkExperience(values: WorkExperienceValues): WorkExperienceErrors {
  const errors: WorkExperienceErrors = {};
  const today = new Date().toISOString().slice(0, 10);
  if (values.title.trim().length === 0) errors.title = 'El cargo es obligatorio.';
  if (values.title.trim().length > 150) errors.title = 'Máximo 150 caracteres.';
  if (values.companyName.trim().length > 200) errors.companyName = 'Máximo 200 caracteres.';
  if (values.startDate.length === 0) errors.startDate = 'La fecha de inicio es obligatoria.';
  else if (values.startDate > today) errors.startDate = 'No puede ser una fecha futura.';
  if (!values.isCurrentJob && values.endDate.length > 0) {
    if (values.endDate > today) errors.endDate = 'No puede ser una fecha futura.';
    else if (values.startDate && values.endDate < values.startDate) {
      errors.endDate = 'Debe ser posterior a la fecha de inicio.';
    }
  }
  if (values.description.trim().length > descriptionMaximumLength) {
    errors.description = `Máximo ${descriptionMaximumLength} caracteres.`;
  }
  return errors;
}

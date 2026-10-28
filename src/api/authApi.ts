import { sendRequest } from './httpClient';
import type { OAuthProvider, RegisterFormValues, RegistrationResponse } from '../types/auth';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export function getProviderAuthorizationUrl(provider: OAuthProvider) {
  return new URL(`/api/v1/auth/${provider}`, apiUrl).toString();
}

export async function getRegistrationStatus() {
  return sendRequest<RegistrationResponse>('/api/v1/auth/register', { method: 'GET' });
}

export async function completeRegistration(values: RegisterFormValues) {
  return sendRequest<RegistrationResponse>('/api/v1/auth/register', {
    method: 'PATCH',
    body: {
      handleName: values.handleName.trim().toLowerCase(),
      name: values.name.trim(),
      firstSurname: values.firstSurname.trim(),
    },
  });
}

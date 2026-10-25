import { sendRequest } from './httpClient';
import type { OAuthProvider, RegisterFormValues, RegisterResponse } from '../types/auth';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export function getProviderAuthorizationUrl(provider: OAuthProvider) {
  return new URL(`/api/v1/auth/${provider}`, apiUrl).toString();
}

export async function registerUser(values: RegisterFormValues, registrationToken: string) {
  return sendRequest<RegisterResponse>('/api/v1/auth/register', {
    method: 'POST',
    token: registrationToken,
    body: {
      handleName: values.handleName.trim().toLowerCase(),
      name: values.name.trim(),
      firstSurname: values.firstSurname.trim(),
    },
  });
}

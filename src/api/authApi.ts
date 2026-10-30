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

export interface LinkedAccount {
  provider: OAuthProvider;
  provider_username: string | null;
  provider_user_email: string | null;
  scopes: string | null;
  state: string;
}

interface LinkedAccountsResponse {
  success: boolean;
  message?: string;
  data?: LinkedAccount[];
}

export async function getLinkedAccounts(): Promise<LinkedAccount[]> {
  const response = await sendRequest<LinkedAccountsResponse>(
    '/api/v1/auth/accounts',
    { method: 'GET' }
  );

  return response.data ?? [];
}

export function getProviderLinkUrl(provider: OAuthProvider): string {
  const url = new URL(getProviderAuthorizationUrl(provider));
  url.searchParams.set('intent', 'link');
  return url.toString();
}

export async function unlinkLinkedAccount(
  provider: OAuthProvider
): Promise<void> {
  await sendRequest<{ success: boolean; message?: string }>(
    `/api/v1/auth/accounts/${provider}`,
    { method: 'DELETE' }
  );
}

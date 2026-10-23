import { sendRequest } from './httpClient';
import type { RegisterFormValues, RegisterResponse } from '../types/auth';

export async function registerUser(values: RegisterFormValues) {
  return sendRequest<RegisterResponse>('/api/v1/auth/register', {
    method: 'POST',
    body: {
      handleName: values.handleName.trim().toLowerCase(),
      name: values.name.trim(),
      firstSurname: values.firstSurname.trim(),
      email: values.email.trim().toLowerCase(),
      password: values.password,
    },
  });
}

import { sendRequest } from './httpClient';
import type { CreateAdditionalInfoResponse } from '../types/profile';

export async function createAdditionalInfo(formData: FormData) {
  return sendRequest<CreateAdditionalInfoResponse>('/api/v1/profile', {
    method: 'POST',
    body: formData,
  });
}

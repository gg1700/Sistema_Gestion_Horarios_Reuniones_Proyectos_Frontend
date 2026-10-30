import { sendRequest } from './httpClient';
import type { CreateAdditionalInfoResponse } from '../types/profile';
import type { Profile, ProfileResponse } from '../types/profile-response.types';
import { ApiError } from '../types/api';

export async function getOwnProfile(signal?: AbortSignal): Promise<Profile> {
  const baseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/v1/profile`, {
      method: 'GET', credentials: 'include', cache: 'no-store', signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError('No se pudo conectar con el servidor. Inténtalo nuevamente.', 0);
  }
  if (response.status === 401) {
    const error = await response.json().catch(() => null);
    throw new ApiError(typeof error?.message === 'string' ? error.message : 'Tu sesión no está disponible o expiró. Inicia sesión para consultar tu perfil.', 401);
  }
  const result: ProfileResponse = await response.json().catch(() => {
    throw new ApiError('El servidor devolvió una respuesta inválida.', response.status);
  });
  if (!response.ok || !result || result.success !== true) {
    throw new ApiError(result?.success === false ? result.message : 'No se pudo consultar el perfil.', response.status);
  }
  return result.data;
}

export async function createAdditionalInfo(formData: FormData) {
  return sendRequest<CreateAdditionalInfoResponse>('/api/v1/profile', {
    method: 'POST',
    body: formData,
  });
}

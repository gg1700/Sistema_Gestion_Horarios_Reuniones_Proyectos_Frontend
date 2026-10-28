import type { PublicProfile } from '../types/profilePreview';

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function getPublicProfile(
  handle: string,
  signal?: AbortSignal,
): Promise<PublicProfile | null> {
  const response = await fetch(
    `${apiUrl.replace(/\/+$/, '')}/api/v1/public/profiles/${encodeURIComponent(handle)}`,
    { signal },
  );

  if (response.status === 404) {
    return null;
  }

  const result = (await response.json()) as ApiResponse<PublicProfile>;

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message ?? 'No se pudo consultar el perfil.');
  }

  return result.data;
}

import type { PublicProfilePreview } from '../types/publicProfile';
import { isPublicProfilePreview } from '../utils/publicProfile';

const apiUrl = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
).replace(/\/+$/, '');

export async function getPublicProfilePreview(signal?: AbortSignal): Promise<PublicProfilePreview> {
  let response: Response;

  try {
    response = await fetch(`${apiUrl}/api/v1/profile/preview`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error('No se pudo conectar con el servidor para cargar la vista previa.');
  }

  if (response.status === 401) {
    throw new Error('Tu sesión no está disponible o expiró. Inicia sesión para ver tu perfil.');
  }

  if (response.status === 429) {
    throw new Error('Demasiadas solicitudes. Espera un momento antes de reintentar.');
  }

  if (!response.ok) {
    throw new Error('No se pudo cargar la vista previa del perfil. Inténtalo nuevamente.');
  }

  const result = await response.json().catch(() => {
    throw new Error('El servidor devolvió una respuesta inválida para la vista previa.');
  });

  if (result?.success !== true || !isPublicProfilePreview(result.data)) {
    throw new Error('El servidor devolvió una respuesta inválida para la vista previa.');
  }

  return result.data;
}

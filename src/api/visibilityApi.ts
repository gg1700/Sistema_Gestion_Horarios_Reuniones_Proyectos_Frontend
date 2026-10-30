import {
  visibilityTypes,
  type VisibilityProfile,
  type VisibilityRecord,
} from '../types/visibility';

const apiUrl = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
).replace(/\/+$/, '');

async function request(path: string, options: RequestInit = {}) {
  let response: Response;

  try {
    response = await fetch(`${apiUrl}/api/v1/profile${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;

    throw new Error(
      'No se pudo conectar con el servidor. Inténtalo nuevamente.',
    );
  }

  if (response.status === 401) {
    throw new Error(
      'Tu sesión no está disponible o expiró. Inicia sesión para configurar la visibilidad.',
    );
  }

  if (response.status === 429) {
    throw new Error(
      'Demasiadas solicitudes. Espera un momento antes de reintentar.',
    );
  }

  const result = await response.json().catch(() => {
    throw new Error('El servidor devolvió una respuesta inválida.');
  });

  if (!response.ok || result?.success !== true) {
    throw new Error(
      result?.message || 'No se pudo completar la solicitud.',
    );
  }

  return result.data;
}

function isVisibilityRecord(value: unknown): value is VisibilityRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;

  if (
    !visibilityTypes.some(type => type === record.type) ||
    typeof record.visible !== 'boolean'
  ) {
    return false;
  }

  if (
    record.type === 'repositories' ||
    record.type === 'githubActivity'
  ) {
    return record.id === undefined;
  }

  return typeof record.id === 'string' && record.id.trim().length > 0;
}

export async function getVisibility(
  signal?: AbortSignal,
): Promise<VisibilityRecord[]> {
  const data: unknown = await request('/visibility', { signal });

  if (!Array.isArray(data) || !data.every(isVisibilityRecord)) {
    throw new Error(
      'La configuración recibida no tiene el formato esperado.',
    );
  }

  return data;
}

export async function getVisibilityProfile(
  signal?: AbortSignal,
): Promise<VisibilityProfile> {
  const data = await request('', { signal });

  if (
    !data ||
    typeof data.name !== 'string' ||
    typeof data.firstSurname !== 'string' ||
    typeof data.handleName !== 'string' ||
    ![
      'contactEmails',
      'phones',
      'addresses',
      'countries',
      'workExperiences',
      'links',
    ].every(key => Array.isArray(data[key]))
  ) {
    throw new Error('El perfil recibido no tiene el formato esperado.');
  }

  return data;
}

export async function updateVisibility(
  changes: VisibilityRecord[],
): Promise<void> {
  await request('/visibility', {
    method: 'PATCH',
    body: JSON.stringify({ changes }),
  });
}

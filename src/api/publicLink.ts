import type { PublicLink } from '../types/publicLink';

type PublicLinkDetails = Pick<
  PublicLink,
  'handleName' | 'url' | 'publicLinkActive'
>;

type HandleAvailabilityResult = {
  handleName: string;
  available: boolean;
};

type PublicLinkChanges = Partial<
  Pick<PublicLinkDetails, 'handleName' | 'publicLinkActive'>
>;

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const headers = new Headers(options?.headers);

  if (options?.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(
    `${apiUrl.replace(/\/+$/, '')}/api/v1/profile/public-link${path}`,
    {
      ...options,
      headers,
      credentials: 'include',
    },
  );

  let result: ApiResponse<T>;

  try {
    result = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new Error('Respuesta inválida del servidor.');
  }

  if (!response.ok || !result.success || result.data === undefined) {
    throw new Error(
      result.message ?? 'No se pudo completar la solicitud.',
    );
  }

  return result.data;
}

export function getPublicLink() {
  return request<PublicLinkDetails>('');
}

export function checkPublicHandle(handleName: string) {
  return request<HandleAvailabilityResult>(
    `/availability?handle=${encodeURIComponent(handleName)}`,
  );
}

export function updatePublicLink(changes: PublicLinkChanges) {
  return request<PublicLinkDetails>('', {
    method: 'PATCH',
    body: JSON.stringify(changes),
  });
}

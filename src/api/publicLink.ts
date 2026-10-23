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

function getToken(): string {
  try {
    const stored = localStorage.getItem('orbitia-session');

    if (stored) {
      const session: unknown = JSON.parse(stored);

      if (
        typeof session === 'object' &&
        session !== null &&
        'token' in session &&
        typeof session.token === 'string' &&
        session.token.length > 0
      ) {
        return session.token;
      }
    }
  } catch {
    throw new Error('No se pudo recuperar la sesión.');
  }

  throw new Error('Debes iniciar sesión para gestionar tu enlace público.');
}

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const headers = new Headers(options?.headers);

  headers.set('Authorization', `Bearer ${getToken()}`);

  if (options?.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(
    `${apiUrl.replace(/\/+$/, '')}/api/v1/profile/public-link${path}`,
    {
      ...options,
      headers,
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

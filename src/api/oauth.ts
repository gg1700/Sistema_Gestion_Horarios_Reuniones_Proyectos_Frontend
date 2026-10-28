export type OAuthProvider = 'google' | 'github';

export interface AuthenticatedProfile {
  handleName: string;
  name: string;
  firstSurname: string;
  email: string;
  requiresProfileCompletion: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

const apiUrl = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
).replace(/\/+$/, '');

export function getOAuthStartUrl(provider: OAuthProvider): string {
  return `${apiUrl}/api/v1/auth/${provider}?intent=login`;
}

export function getOAuthErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    access_denied: 'Cancelaste la autorización. Puedes intentarlo nuevamente.',
    invalid_state: 'La solicitud de acceso no pudo verificarse. Inténtalo otra vez.',
    invalid_code: 'El código de autorización es inválido o ha expirado.',
    invalid_session: 'La sesión no es válida. Vuelve a iniciar sesión.',
    email_conflict: 'Este correo ya está registrado con otra cuenta.',
    account_conflict: 'Esta cuenta externa ya está vinculada a otro usuario.',
    additional_info_required: 'No se pudo obtener el correo verificado del proveedor.',
    provider_unavailable: 'Google o GitHub no está disponible en este momento.',
    invalid_provider: 'El proveedor seleccionado no es válido.',
    internal_error: 'Ocurrió un error al procesar la autenticación.'
  };

  return messages[code] ?? 'No se pudo completar el acceso. Inténtalo nuevamente.';
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers,
    credentials: 'include'
  });

  const result = await response.json().catch(() => null) as ApiResponse<T> | null;

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message ?? 'No se pudo completar la solicitud.'
    );
  }

  return result.data as T;
}

export async function getAuthenticatedProfile(
  signal?: AbortSignal
): Promise<AuthenticatedProfile> {
  const profile = await request<AuthenticatedProfile>(
    '/api/v1/profile',
    { signal, cache: 'no-store' }
  );

  if (!profile) {
    throw new Error('El servidor no devolvió el perfil del usuario.');
  }

  return profile;
}

export async function checkHandleAvailability(
  handleName: string
): Promise<boolean> {
  const result = await request<{ available: boolean }>(
    `/api/v1/profile/public-link/availability?handle=${encodeURIComponent(handleName)}`
  );

  return result.available;
}

export async function updateInitialProfile(
  name: string,
  firstSurname: string
): Promise<void> {
  await request<void>('/api/v1/profile', {
    method: 'PATCH',
    body: JSON.stringify({ name, firstSurname })
  });
}

export async function updateInitialHandle(
  handleName: string
): Promise<void> {
  await request<void>('/api/v1/profile/public-link', {
    method: 'PATCH',
    body: JSON.stringify({ handleName })
  });
}

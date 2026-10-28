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

export async function getAuthenticatedProfile(
  signal?: AbortSignal
): Promise<AuthenticatedProfile> {
  const response = await fetch(`${apiUrl}/api/v1/profile`, {
    credentials: 'include',
    cache: 'no-store',
    signal
  });

  const result = await response.json().catch(() => null) as ApiResponse<AuthenticatedProfile> | null;

  if (!response.ok || !result?.success || !result.data) {
    throw new Error(
      result?.message ?? 'No se pudo consultar el perfil autenticado.'
    );
  }

  return result.data;
}

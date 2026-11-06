export const oauthErrorMessages: Record<string, string> = {
  access_denied: 'Cancelaste la autorización. Puedes intentarlo nuevamente.',
  invalid_state: 'La solicitud de acceso expiró o no es válida. Inicia el proceso nuevamente.',
  invalid_code: 'No se pudo validar el acceso. Intenta nuevamente.',
  provider_unavailable: 'El proveedor no está disponible en este momento. Intenta más tarde.',
  email_conflict: 'Este correo ya pertenece a otra cuenta. Ingresa con el método que usaste antes.',
  account_conflict: 'Esta cuenta externa ya está vinculada a otro usuario.',
  additional_info_required: 'El proveedor no compartió tu correo. Usa otra cuenta o revisa tus permisos.',
  handle_unavailable: 'No se pudo crear tu nombre de usuario. Intenta nuevamente.',
};

export const defaultOAuthErrorMessage = 'No se pudo completar el acceso. Intenta nuevamente.';

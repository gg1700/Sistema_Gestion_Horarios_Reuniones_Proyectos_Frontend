
import { useSearchParams } from 'react-router';

const callbackErrors: Record<string, {
  title: string;
  message: string;
}> = {
  access_denied: {
    title: 'Autorización cancelada',
    message: 'No autorizaste el acceso. Puedes intentarlo nuevamente.',
  },
  invalid_state: {
    title: 'Solicitud de acceso inválida',
    message: 'No se pudo verificar la solicitud de autenticación. Inicia el proceso nuevamente.',
  },
  email_conflict: {
    title: 'Correo electrónico ya registrado',
    message: 'Este correo está asociado a otra cuenta. Utiliza tu método de acceso anterior.',
  },
  provider_unavailable: {
    title: 'Servicio no disponible',
    message: 'El proveedor de autenticación no está disponible. Inténtalo más tarde.',
  },
  expired_code: {
    title: 'Solicitud expirada',
    message: 'El tiempo para completar la autenticación ha terminado. Vuelve a intentarlo.',
  },
};

function useOAuthCallback() {
  const [searchParams] = useSearchParams();
  const errorCode = searchParams.get('error');

  if (!errorCode) {
    return {
      status: 'pending' as const,
    };
  }

  const error = callbackErrors[errorCode] ?? {
    title: 'No se pudo iniciar sesión',
    message: 'Ocurrió un problema durante la autenticación. Inténtalo nuevamente.',
  };

  return {
    status: 'error' as const,
    ...error,
  };
}

export default useOAuthCallback;

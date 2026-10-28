import { useEffect, useState } from 'react';
import { getRegistrationStatus } from '../api/authApi';
import { ApiError } from '../types/api';
import type { RegisteredUser } from '../types/auth';

export type RegistrationStatus = 'loading' | 'unauthenticated' | 'pending' | 'completed' | 'error';

function useRegistrationStatus() {
  const [status, setStatus] = useState<RegistrationStatus>('loading');
  const [user, setUser] = useState<RegisteredUser | null>(null);

  useEffect(() => {
    let isActive = true;

    getRegistrationStatus()
      .then((response) => {
        if (!isActive) return;
        setUser(response.data.user);
        setStatus(response.data.user.registrationCompleted ? 'completed' : 'pending');
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        const isUnauthenticated = error instanceof ApiError && (error.statusCode === 401 || error.statusCode === 404);
        setStatus(isUnauthenticated ? 'unauthenticated' : 'error');
      });

    return () => {
      isActive = false;
    };
  }, []);

  return { status, user };
}

export default useRegistrationStatus;
